import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, ToastController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import * as Constant from '../../config/constants';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
//import { SocialSharing } from '@ionic-native/social-sharing';
//import { CallNumber } from '@ionic-native/call-number';
import { ProductProvider} from '../../providers/product/product';
import { HelpersProvider } from '../../providers/helpers/helpers';

/**
 * Generated class for the Categories page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

 @IonicPage()
 @Component({
   selector: 'page-search',
   templateUrl: 'search.html',
 })
 export class SearchPage {
   cat_lists: Array<any>;
   purpose_lists: any;

   base_url: any = '';
   user_id: any = null;

   lists: any;
   first: number;

   purpose: any = '';
   cat: any = '';
   price: { lower: number, upper: number };
   county: any = null;
   cities: any = null;
   query: any = null;

   constructor(
   //constructor(private socialSharing: SocialSharing, 
     //private callNumber: CallNumber,
     public events: Events,
     public navCtrl: NavController,
     public navParams: NavParams,
     public http: Http,
     public storage: Storage,
     public toastCtrl: ToastController,
     public alertCtrl: AlertController,
     public modalCtrl: ModalController,
     public productPorivder:ProductProvider,
     public productProvider:ProductProvider,
     public helpersProvider:HelpersProvider
     ) {
     this.base_url = Constant.domainConfig.base_url;
     this.lists = new Array();

     this.purpose_lists = [
     { id: 0, name: 'buy' },
     { id: 1, name: 'sell' }
     ]

     this.http.get(Constant.domainConfig.base_url + "api/categories_api/categories").subscribe(data => {
       console.log(data.json());
       this.cat_lists = data.json();
     }, error => {

     })

     this.price = {
       'lower': 1,
       'upper': 600
     };

     this.events.subscribe('local: change', () => {
       this.ionViewWillEnter();
       if (this.query != null && this.query != '') {
         this.loadMore();
       }
     })
   }

   ionViewDidLoad() {
     console.log('ionViewDidLoad SearchPage');
   }

   ionViewWillEnter() {

     this.first = -5;
     this.lists = new Array();
     this.county = null;
     this.cities = null;

     this.storage.ready().then(() => {
       this.storage.get('user').then((obj) => {
         if (obj != null) {
           this.user_id = obj.id;
         } else {
           this.user_id = null;
         }
       });
     });
   }

   onInput(event) {
     console.log(event.target.value);
     this.query = event.target.value;
     this.lists = new Array();
     this.first = -5;
     this.loadMore();
   }

   select_change() {
     this.first = -5;
     if (this.query != null && this.query != '' && this.query != ' ') {
       this.lists = new Array();
       this.first = -5;
       this.loadMore();
     }
   }

   loadMore(infiniteScroll: any = null) {
     this.first += 5;
     if (this.query != null && this.query != '' && this.query != ' ') {

       this.http.get(this.base_url + 'api/products_api/products?user_lg='+this.user_id+'&order=last&first=' + this.first + '&offset=5' + '&title=' + this.query + '&min_price=' + this.price.lower + '&max_price=' + this.price.upper + '&aim=' + this.purpose + '&categories_id=' + this.cat + '&county_id=' + this.county + '&cities_id=' + this.cities).subscribe(data => {
         let jsonData = data.json();
         for (var i = 0; i < jsonData.length; i++) {
           this.lists.push(jsonData[i]);
         }
         if (infiniteScroll) {
           infiniteScroll.complete();
         }
       }, error => {
         if (infiniteScroll != null) {
           infiniteScroll.enable(false);
         }
       })
     }
   }


   up_product() {
     if (this.user_id != null && this.user_id != 0) {
       let modal = this.modalCtrl.create('PostProductPage');
       modal.present();
     } else {
       let modal = this.modalCtrl.create('LoginPage');
       modal.present();
     }
   }

   finder(){
     this.navCtrl.push('FinderProductPage');
   }

   report(product_id, i){
     if (this.user_id != null && this.user_id != 0) {
       this.productProvider.reportProduct(product_id,this.user_id).subscribe(data=>{
         console.log(data.json());
         this.lists[i].report = data.json().report;
       },error=>{
         //can not review
         console.log('review error');
       })
     } else {
       let modal = this.modalCtrl.create('LoginPage');
       modal.present();
     }
   }

   favorites(product_id, i) {
     if (this.user_id != null && this.user_id != 0) {
       this.productProvider.favorites(product_id,this.user_id).subscribe(data=>{
         this.lists[i].favorites = data.json().favorites;
       });
     } else {
       let modal = this.modalCtrl.create('LoginPage');
       modal.present();
     }
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
                if(obj.email==item.email){
                  let alert=this.alertCtrl.create({
                    message:"you cannot send mail to yourself",
                    buttons:['Dismiss']
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

  view(item) {
    this.navCtrl.push('PostDetailPage', { item: item });
  }

  view_prf(id) {
    this.navCtrl.push('ProfilePage', { user_id: id });
  }

}
