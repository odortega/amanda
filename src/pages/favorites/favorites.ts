import { Component } from '@angular/core';
import { IonicPage, NavController, ModalController, AlertController, ToastController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import * as Constant from '../../config/constants';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import { ProductProvider } from '../../providers/product/product';
import { HelpersProvider } from '../../providers/helpers/helpers';

/**
 * Generated class for the Categories page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

 @IonicPage()
 @Component({
   selector: 'page-favorites',
   templateUrl: 'favorites.html',
 })
 export class FavoritesPage {

   lists: Array<any>;
   first: number;
   base_url: any;
  //url_favorites:any='';
  user_id: any;

  constructor(public events: Events,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public navCtrl: NavController,
    public http: Http,
    public storage: Storage,
    public modalCtrl: ModalController,
    public productProvider: ProductProvider,
    public helpersProvider: HelpersProvider
    ) {
    this.base_url = Constant.domainConfig.base_url;
    this.lists = new Array();
    this.events.subscribe('user: change', () => {
      this.storage.ready().then(() => {
        this.storage.get('user').then((obj) => {
          console.log(obj);
          if (obj == null) {
            this.user_id = null;
            this.lists = new Array();
          } else {
            this.ionViewWillEnter();
          }
        });
      });
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FavoritesPage');
  }

  ionViewWillEnter() {
    this.first = -10;
    this.lists = new Array();
    this.storage.ready().then(() => {
      this.storage.get('user').then((obj) => {
        console.log(obj);
        if (obj == null) {
          let modal = this.modalCtrl.create('LoginPage');
          modal.present();
        } else {
          this.user_id = obj.id;
          this.loadMore();
        }
      });
    });
  }

  loadMore(infiniteScroll: any = null) {
    if (this.user_id != null) {
      this.first += 10;
      this.productProvider.getFavoritesProduct(this.first,10,this.user_id).subscribe(data=>{
        let jsonData = data.json();
        for (var i = 0; i < jsonData.length; i++) {
          this.lists.push(jsonData[i]);
        }
        if (infiniteScroll) {
          infiniteScroll.complete();
        }
      },error=>{
        if(infiniteScroll!=null){
          infiniteScroll.enable(false);
        }
      })
    }else{
        ///go to login page
      }
    }

    finder() {
      let modal = this.navCtrl.push('FinderProductPage');
    }

    report(product_id, i) {
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

    up_product() {
      if (this.user_id != null && this.user_id != 0) {
        let modal = this.modalCtrl.create('PostProductPage');
        modal.present();
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
}
