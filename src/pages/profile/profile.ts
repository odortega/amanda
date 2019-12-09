import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController,ActionSheetController, Platform,LoadingController} from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import  * as Constant from '../../config/constants';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import {File} from '@ionic-native/file';
import {FilePath} from '@ionic-native/file-path';
import { Camera,CameraOptions } from '@ionic-native/camera';
declare var cordova: any;

/**
 * Generated class for the Profile page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

 @IonicPage()
 @Component({
   selector: 'page-profile',
   templateUrl: 'profile.html',
 })
 export class ProfilePage {

   first: number;
   lists: Array<any>;
   base_url: any='';
   obj: any='';
   user_id: any=null;
   user_view: any=null;

   total_item: number=0;

   avatar: any;
   full_name: any;
   phone: any;
   address: any;
   old_pwd: any;
   new_pwd: any;
   confirm_pwd: any;
   check_edit: any=false;
   msg_err_edit: any;
   msg_err_pwd: any;
   my_photo:any=null;

   constructor(public navParams: NavParams,
     public navCtrl: NavController, 
     public events:Events, 
     public modalCtrl: ModalController,
     public actionSheetCtrl:ActionSheetController,
     public camera: Camera,
     public platform:Platform,
     public file:File,
     public filePath:FilePath, 
     public loadingCtrl:LoadingController,
     public transfer:FileTransfer,
     public http: Http,
     public storage: Storage) {
     this.base_url=Constant.domainConfig.base_url;
     this.obj = new Array();
     this.lists = new Array();

     this.events.subscribe('user: change',()=>{
       this.msg_err_edit = null;
       this.msg_err_pwd = null;
       this.old_pwd = null;
       this.new_pwd = null;
       this.confirm_pwd = null;
       this.ionViewWillEnter();
     })
   }

   ionViewDidLoad() {
     console.log('ionViewDidLoad ProfilePage');
   }

   ionViewWillEnter(){
     console.log('ionViewWillEnter ProfilePage');
     this.obj = new Array();
     this.first = -8;
     this.lists = new Array();
     this.user_view = this.navParams.get('user_id');
     if(this.user_view != null){
       this.http.get(this.base_url+'api/users_api/user?id='+this.user_view).subscribe(data=>{
         console.log(data.json());
         this.obj = data.json()[0];
         this.http.get(this.base_url+'api/products_api/products?private=0&order=last&first=0'+'&offset=1000'+'&user_id='+this.obj.id).subscribe(data=>{
           if(data.json().length !> 0){
             this.total_item = data.json().length;
           }
         },error=>{ })

         this.storage.ready().then(() => {
           this.storage.get('user').then((obj)=>{
             console.log(obj);
             if(obj != null){
               this.user_id = obj.id;
             }
           });
         });
         this.loadMore();
       },error=>{

       })
     }else{
       this.storage.ready().then(() => {
         this.storage.get('user').then((obj)=>{
           console.log(obj);
           if(obj != null){
             this.obj = obj;
             this.user_id = obj.id;
             this.full_name = obj.full_name;
             this.phone = obj.phone;
             this.address = obj.address;
             this.http.get(this.base_url+'api/products_api/products?private=0&order=last&first=0'+'&offset=1000'+'&user_id='+this.obj.id).subscribe(data=>{
               if(data.json().length !> 0){
                 this.total_item = data.json().length;
               }
             },error=>{ })

             this.loadMore();
           }
         });
       });
     }
   }

   changeAvt(){
     let loader= this.loadingCtrl.create({
       content: "Waitting"
     });
     loader.present();

     var options = {
       fileKey: "avt",
       fileName: this.my_photo,
       chunkedMode: false,
       mimeType: "multipart/form-data",
       params : {
         'user_id':this.user_id,
       }
     }
     const fileTransfer: FileTransferObject = this.transfer.create();
     fileTransfer.upload(this.my_photo,Constant.domainConfig.base_url+'api/users_api/update_avt',options).then(data=>{
       loader.dismiss()
       this.my_photo=null;
       let response=JSON.parse(data.response);
       this.obj.avt=response.avt;
       this.storage.set('user',this.obj);
     },error=>{
       console.log(error);
       loader.dismiss();
     });
   }

   selectPhotoOptions(){
     let actionSheet = this.actionSheetCtrl.create({
       title: 'Modify your album',
       buttons: [
       {
         text: 'Take photo',
         handler: () => {
           this.takePhoto(this.camera.PictureSourceType.CAMERA);
         }
       },{
         text: 'Select photo',
         handler: () => {
           this.takePhoto(this.camera.PictureSourceType.PHOTOLIBRARY);
         }
       }
       ]
     });
     actionSheet.present();
   }

   takePhoto(sourceType) {
     let camera_options: CameraOptions={
       quality: 75,
       sourceType: sourceType,
       saveToPhotoAlbum: false,
       correctOrientation: true,
       destinationType: this.camera.DestinationType.FILE_URI,
       encodingType: this.camera.EncodingType.JPEG,
       mediaType: this.camera.MediaType.PICTURE
     };
     this.camera.getPicture(camera_options).then((imagePath) => {
       this.my_photo=imagePath;
       console.log(imagePath);
       if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
         this.filePath.resolveNativePath(imagePath)
         .then(filePath => {
           let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
           let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
           this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
         });
       } else {
         var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
         var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
         this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
       }
       
     }, error => {
       console.log("ERROR -> " + JSON.stringify(error));
     });
   }

   private copyFileToLocalDir(namePath, currentName, newFileName) {
     this.file.copyFile(namePath, currentName, cordova.file.externalApplicationStorageDirectory, newFileName).then(success => {
       console.log(JSON.stringify(success));
       this.my_photo = success.nativeURL;
       this.changeAvt();
     }, error => {

     });
   }

   private createFileName() {
     var d = new Date(),
     n = d.getTime(),
     newFileName =  n + ".jpg";
     return newFileName;
   }


   loadMore(infiniteScroll:any=null){
     this.first+=8;
     this.http.get(this.base_url+'api/products_api/products?private=0&order=last&first='+this.first+'&offset=8'+'&user_id='+this.obj.id+'&user_lg='+this.user_id).subscribe(data=>{
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

   finder() {
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


   view(item){
     this.navCtrl.push('PostDetailPage', {item:item});
   }

   edit_prf(){
     this.check_edit = true;
   }

   un_edit_prf(){
     this.check_edit = false;
   }


   edit_product(item){
     let modal = this.modalCtrl.create('EditProductPage', {item: item});
     modal.present();
   }

   upload_edit(){
     let reg = /^[\s()+-]*([0-9][\s()+-]*){6,20}$/;
     if(
       this.full_name.length >= 5 &&
       this.full_name.length <= 60 &&

       reg.test(this.phone) == true &&

       this.address.length >= 5 &&
       this.address.length <= 250
       ){
       let headers:Headers = new Headers({
         'Content-Type': 'application/x-www-form-urlencoded'
       });
     this.http.post(this.base_url+'api/users_api/update','id='+this.user_id+'&full_name='+this.full_name+'&phone='+this.phone+'&address='+this.address,{headers:headers}).subscribe(data=>{
       console.log(data.json());
       if(data.json().ok == 0){
         this.msg_err_edit = 'You enter a missing or incorrect input 2';
       }else{
         console.log(data.json());
         let user = data.json()[0];
         this.storage.set('user', user);
         this.events.publish('user: change');
         this.msg_err_edit = 'Update Profile successfully';
       }
     },error=>{

     })
   }else{
     this.msg_err_edit = 'You enter a missing or incorrect input 1';
   }
 }

 change_password(){
   let reg = /^[a-zA-Z0-9]+$/;

   if(this.old_pwd != null && this.new_pwd != null &&  this.new_pwd == this.confirm_pwd && this.new_pwd.length <= 60 && this.new_pwd.length >= 5 && reg.test(this.new_pwd) == true){
     let headers:Headers = new Headers({
       'Content-Type': 'application/x-www-form-urlencoded'
     });
     this.http.post(this.base_url+'api/users_api/pwd','id='+this.user_id+'&old_pass='+this.old_pwd+'&new_pass='+this.new_pwd,{headers:headers}).subscribe(data=>{
       console.log(data.json());
       if(data.json().ok == 1){
         this.msg_err_pwd = 'Change password successfully';
         this.old_pwd = null;
         this.new_pwd = null;
         this.confirm_pwd = null;
       }else{
         this.msg_err_pwd = 'Your username or password is wrong';
       }
     },error=>{

     })
   }else{
     this.msg_err_pwd = 'You enter a missing or incorrect input';
   }
 }

 logout(){
   this.storage.ready().then(() => {
     this.storage.remove('user').then(success=>{
       this.events.publish('user: change');
       // this.navCtrl.parent.select(0);
     });
   });
 }

 open_login(){
   let modal = this.modalCtrl.create('LoginPage');
   modal.present();
 }

 dismiss(){
   this.navCtrl.pop();
 }

}

