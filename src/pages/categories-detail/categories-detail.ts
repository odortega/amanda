import { Component} from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController,AlertController,ToastController,LoadingController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import  * as Constant from '../../config/constants';
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
   selector: 'page-categories-detail',
   templateUrl: 'categories-detail.html',
 })
 export class CategoriesDetailPage {
   lists:Array<any>;
   first:number;
   base_url:any;
   user_id: any=null;
   county: any=null;
   cities: any=null;
   cat_id: any;
   cat_name: any;

   constructor(
     public modalCtrl: ModalController,
     public events: Events,
     public storage: Storage, 
     public toastCtrl: ToastController,
     public alertCtrl:AlertController,
     public navCtrl: NavController, 
     public navParams: NavParams,
     public http:Http,
     public productProvider:ProductProvider,
     public helpersProvider:HelpersProvider,
     public loadingCtrl:LoadingController,
     ) {
     this.base_url=Constant.domainConfig.base_url;
     this.lists=new Array();

     this.events.subscribe('local: change',()=>{
       this.ionViewWillEnter();
     })
     this.events.subscribe('user: change',()=>{
       this.ionViewWillEnter();
     })
   }

   ionViewWillEnter(){
     let temp_cat = this.navParams.get('cat');

     this.first = -5;
     this.lists = new Array();

     this.cat_id = temp_cat.id;
     this.cat_name = temp_cat.name;

     this.county = null;
     this.cities = null;

     this.storage.ready().then(() => {
       this.storage.get('user').then((obj)=>{
         console.log(obj);
         if(obj != null){
           this.user_id = obj.id;
         }else{
           this.user_id = null;
         }
       });
       this.storage.get('local').then((data)=>{
         console.log(data);
         if(data != null && data.all_local == false){
           this.county = data.county;
           this.cities = data.cities;
         }
         this.loadMore();
       });
     });
   }

   loadMore(infiniteScroll:any=null){
     this.first+=5;
     this.http.get(this.base_url+'api/products_api/products?private=0&order=last&first='+this.first+'&offset=10'+'&categories_id='+this.cat_id+'&county_id='+this.county+'&cities_id='+this.cities+'&user_lg='+this.user_id).subscribe(data=>{
       console.log(data.json());
       let jsonData = data.json();
       for (var i = 0; i < jsonData.length; i++) {
         this.lists.push(jsonData[i]);
       }
       if(infiniteScroll){
         infiniteScroll.complete();
       }
     },error=>{
       if(infiniteScroll!=null){
         infiniteScroll.enable(false);
       }
     })
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


   favorites(product_id, i){
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
}
