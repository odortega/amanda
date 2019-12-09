import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import  * as Constant from '../../config/constants';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';

/**
 * Generated class for the Categories page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
 @IonicPage()
 @Component({
   selector: 'page-categories',
   templateUrl: 'categories.html',
 })
 export class CategoriesPage {

   user_id: any=null;
   lists:Array<any>;
   base_url: any='';
   county: any=null;
   cities: any=null;
   old_index: any=null;

   constructor(public events: Events,
     public storage: Storage,
     public modalCtrl: ModalController,
     public navCtrl: NavController,
     public navParams: NavParams,
     public http:Http) {
     this.base_url=Constant.domainConfig.base_url;
     this.events.subscribe('local: change',()=>{
       this.ionViewWillEnter();
     })
     this.events.subscribe('user: change',()=>{
       this.ionViewWillEnter();
     })
   }

   ionViewDidLoad() {
     console.log('ionViewDidLoad CategoriesPage');
     this.http.get(this.base_url+"api/categories_api/categories").subscribe(data=>{
       console.log(data.json());
       this.lists=data.json();
     },error=>{

     })
   }

   ionViewWillEnter(){
     console.log('ionViewWillEnter TabHomePage');

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
       });
     });
   }

   open_cat(item){
     this.navCtrl.push('CategoriesDetailPage', {cat:item});
   }

   tree_cat(i){
     if(this.old_index != null && this.old_index != i){
       this.lists[this.old_index].active = false;
     }
     if(this.lists[i].active == true){
       this.lists[i].active = false;
     }else{
       this.lists[i].active = true;
     }
     this.old_index = i;
   }

   finder(){
     let modal = this.navCtrl.push('FinderProductPage');
   }

   up_product(){
     if(this.user_id != null && this.user_id != 0){
       let modal = this.modalCtrl.create('PostProductPage');
       modal.present();
     }else{
       let modal = this.modalCtrl.create('LoginPage');
       modal.present();
     }
   }

 }
