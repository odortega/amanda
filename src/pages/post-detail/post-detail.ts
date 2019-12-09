import { Component, ViewChild, ElementRef} from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, ToastController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import * as Constant from '../../config/constants';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import { ProductProvider } from '../../providers/product/product';
import { HelpersProvider } from '../../providers/helpers/helpers';
declare var google;
/**
 * Generated class for the Categories page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

 @IonicPage()
 @Component({
     selector: 'page-post-detail',
     templateUrl: 'post-detail.html',
 })
 export class PostDetailPage {
     @ViewChild('map') mapElement: ElementRef;
     obj: any;
     base_url: any = '';
     user_id: any = null;
     attachment: any;
     img_lists: any = new Array();
     lat:any=null;
     lng:any=null;
     map: any;

     constructor(
         public storage: Storage, 
         public events: Events,
         public modalCtrl: ModalController,
         public navCtrl: NavController,
         public navParams: NavParams,
         public alertCtrl: AlertController,
         public toastCtrl: ToastController,
         public http: Http,
         public productProvider:ProductProvider,
         public helpersProvider:HelpersProvider
         ) {
         this.base_url = Constant.domainConfig.base_url;
         this.obj = this.navParams.get('item');
         this.events.subscribe('local: change', () => {
             this.ionViewWillEnter();
         })
         this.events.subscribe('user: change', () => {
             this.ionViewWillEnter();
         })
         console.log(this.navParams.get('item'));
     }

     ionViewDidLoad() {
         console.log('ionViewDidLoad PostDetailPage');
         this.loadMap();
     }

     ionViewWillEnter() {
         console.log('ionViewWillEnter PostDetailPage');
         this.storage.ready().then(() => {
             this.storage.get('user').then((obj) => {
                 if (obj != null) {
                     this.user_id = obj.id;
                 }
             });
         });
         this.http.get(this.base_url + 'api/images_api/images?product_id=' + this.obj.id).subscribe(data => {
             console.log(data.json());
             this.img_lists = data.json();
         }, error => {

         })

         this.http.get(this.base_url + 'api/products_api/products?private=0&order=last&first=0' + '&offset=4' + '&user_id=' + this.obj.user_id + '&user_lg=' + this.user_id).subscribe(data => {
             console.log(data.json());
             this.attachment = data.json();
         }, error => { })
     }

     report(product_id) {
         if (this.user_id != null && this.user_id != 0) {
             let headers: Headers = new Headers({
                 'Content-Type': 'application/x-www-form-urlencoded'
             });
             this.http.post(this.base_url + 'api/products_api/report', 'product_id=' + product_id + '&user_id=' + this.user_id, { headers: headers }).subscribe(data => {
                 console.log(data.json());
                 this.obj.report = data.json().report;
             }, error => {

             })
         } else {
             let modal = this.modalCtrl.create('LoginPage');
             modal.present();
         }
     }


     favorites() {
         let temp_product_id = null;
         if (this.obj.product_id != null) {
             temp_product_id = this.obj.product_id;
         } else {
             temp_product_id = this.obj.id;
         }
         if (this.user_id != null && this.user_id != 0) {
             this.productProvider.favorites(temp_product_id,this.user_id).subscribe(data=>{
                 this.obj.favorites = data.json().favorites;
             });
         } else {
             let modal = this.modalCtrl.create('LoginPage');
             modal.present();
         }
     }

     view(item) {
         this.navCtrl.push(PostDetailPage, { item: item });
     }

     view_prf(id) {
         this.navCtrl.push('ProfilePage', { user_id: id });
     }

     rate() {
         this.storage.ready().then(() => {
             this.storage.get('user').then((obj) => {
                 if (obj != null) {
                     if (this.obj.user_id == obj.id) {
                         let alert = this.alertCtrl.create({
                             message: 'You can not rate your own product',
                             buttons: ['Dismiss']
                         })
                         alert.present();
                         return;
                     }
                     let modal = this.modalCtrl.create('ModalRatingPage', { 'product_id': this.obj.id, 'product_user_id': this.obj.user_id, 'user_id': obj.id });
                     modal.present();
                 } else {

                     let modal = this.modalCtrl.create('LoginPage');
                     modal.present();
                     return;
                    //go to login 
                }
            })
         })
     }


     mail(item) {
         console.log(item);
         if (this.user_id == null) {
            //go to login page
            let modal = this.modalCtrl.create('LoginPage');
            modal.present();
            return;
        }
        let promtDialog = this.alertCtrl.create({
            title: 'Messages',
            inputs: [
            {
                name: 'message',
                placeholder: 'Message'
            }
            ],
            buttons: [
            {
                text: 'Cancel',
                role: 'cancel',
                handler: data => {
                    console.log('Cancel clicked');
                }
            },
            {
                text: 'Send',
                handler: data => {
                        ///send message via email system
                        this.storage.ready().then(() => {
                            this.storage.get('user').then((obj) => {
                                if (obj.email == item.email) {
                                    let alert = this.alertCtrl.create({
                                        message: "you cannot send mail to yourself",
                                        buttons: ['Dismiss']
                                    })
                                    alert.present();
                                    return;
                                }
                                let post_data = 'email=' + item.email + '&message=' + data.message + '&user_name=' + obj.user_name + '&reply_to=' + obj.email;
                                let headers: Headers = new Headers({
                                    'Content-Type': 'application/x-www-form-urlencoded'
                                });
                                this.http.post(this.base_url + 'api/users_api/send_enquiry', post_data, { headers: headers }).subscribe(data => {
                                    if (data.json().success == 0) {
                                        let toast = this.toastCtrl.create({
                                            message: 'you just can send enquiry after 120 seconds',
                                            duration: 3000
                                        });
                                        toast.present();
                                    } else {
                                        let toast = this.toastCtrl.create({
                                            message: 'Your messages have been sent, thank you !!!',
                                            duration: 3000
                                        });
                                        toast.present();
                                    }
                                }, error => {

                                })
                            })
                        })
                    }
                }
                ]
            })
        promtDialog.present();
    }

    loadMap(){
        this.lat=this.obj.lat;
        this.lng=this.obj.lng;
        let latLng = new google.maps.LatLng(this.lat,
            this.lng);
        let mapOptions = {
            center: latLng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
        this.addMarker(this.lat,this.lng);
    }

    addMarker(lat,lng){
        let marker = new google.maps.Marker({
            map: this.map,
            animation: google.maps.Animation.DROP,
            position: {lat: lat, lng: lng}
        });
        return marker;
    }

}
