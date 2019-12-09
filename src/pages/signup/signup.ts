import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController,AlertController,ToastController} from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import  * as Constant from '../../config/constants';
import {FormBuilder,FormGroup,Validators} from '@angular/forms';
import {EmailValidator} from '../../validators/email';
import {PhoneValidator} from '../../validators/phone';
import {UserNameValidator} from '../../validators/username';
import {PasswordValidator} from '../../validators/password';
/**
 * Generated class for the Signup page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

 @IonicPage()
 @Component({
   selector: 'page-signup',
   templateUrl: 'signup.html',
 })

 export class SignupPage {
   post:any={
     user_name: '',
     full_name:'',
     email:'',
     address: '',
     pwd: '',
     repwd:'',
     phone:'',
     send_code_method:0
   };
   base_url: any='';
   form:FormGroup;

   constructor(
     public navCtrl: NavController,
     public viewCtrl: ViewController, 
     public http:Http,
     public alertCtrl:AlertController,
     public toastCtrl:ToastController,
     public formBuilder: FormBuilder,
     public navParams: NavParams) {
     this.base_url=Constant.domainConfig.base_url;
     this.form = formBuilder.group({
        full_name: ['',Validators.compose([Validators.minLength(5),Validators.maxLength(50),Validators.pattern('[a-zA-Z ]*'),Validators.required])],
        user_name: ['',Validators.compose([UserNameValidator.isValid,Validators.minLength(5),Validators.maxLength(50)])],
        email: ['',Validators.compose([EmailValidator.isValid,Validators.required])],
        phone:['', PhoneValidator.isValid],
        address:['',Validators.compose([Validators.minLength(5),Validators.maxLength(200),Validators.required])],
        pwd:['',Validators.compose([Validators.minLength(5),Validators.maxLength(50)])],
        repwd:['',PasswordValidator.isMatch],
        send_code_method:['0']
      });
   }

   ionViewDidLoad() {
     console.log('ionViewDidLoad SignupPage');
   }

   dismiss(){
     this.viewCtrl.dismiss();
   }

   signup(){
     if(this.post.user_name==''){

     }

     let signup_url='';
     if(this.post.send_code_method==0){
       //if SMS method
       signup_url=this.base_url+'api/users_api/check_sms_register_valid';
     }else{
       //if mail method
       signup_url=this.base_url+'api/users_api/check_mail_register_valid';
     }

     let headers:Headers = new Headers({
       'Content-Type': 'application/x-www-form-urlencoded'
     });

     let data='user_name='+this.form.value.user_name+
     '&full_name='+this.form.value.full_name+
     '&email='+this.form.value.email+
     '&address='+this.form.value.address+
     '&pwd='+this.form.value.pwd+'&phone='+this.form.value.phone;

     this.http.post(signup_url,data,{headers:headers}).subscribe(data=>{
       console.log(data);
       let jsonData=data.json();
       if(jsonData.success==3){
         //if success go to verification page
         let alertCtrl = this.alertCtrl.create({
           title: 'Please enter your verification code',
           enableBackdropDismiss:false,
           inputs: [
           {
             name: 'code',
             placeholder: 'verification code'
           }
           ],
           buttons: [
           {
             text: 'Cancel',
             handler:data=>{
               let post_data='email='+this.form.value.email;
               this.http.post(this.base_url+'api/users_api/cancel_register',post_data,{headers:headers}).subscribe(data=>{
                  this.navCtrl.pop();
               })
             }
           },
           {
             text: 'Resend',
             handler: data => {
               let post_data='email='+this.form.value.email+'&phone='+this.form.value.phone+'&send_code_method='+this.form.value.send_code_method;
               this.http.post(this.base_url+'api/users_api/resend_verified_code',post_data,{headers:headers}).subscribe(data=>{

               })
             }
           },
           {
             text: 'Submit',
             handler: data => {
               let post_data='code='+data.code+'&email='+this.form.value.email;
               this.http.post(this.base_url+'api/users_api/register',post_data,{headers:headers}).subscribe(data=>{
                 if(data.json().success==1){
                   //register done
                     let confirmCtl= this.alertCtrl.create({
                       message:'Signup Successfully, Login now !!!',
                       buttons:[{
                           text: 'Ok',
                           handler: () => {
                             alertCtrl.dismiss();
                             this.navCtrl.pop();
                           }
                       }]
                     });
                     confirmCtl.present();
                   }else{
                     //register failed
                     let toastCtrl=this.toastCtrl.create({
                       message:'your confirm code wrong, pls try again',
                       duration: 3000,
                       position: 'top'
                     })
                     toastCtrl.present();
                   }//end if else
                 });
               return false;
             }
           }
           ]
         });
         alertCtrl.present();
       }

       if(jsonData.success==1){
         let alertCtrl=this.alertCtrl.create({
           message:'UserName exist, try another !!',
           buttons: ['Dismiss']
         })
         alertCtrl.present();
       }


       if(jsonData.success==0){
         let alertCtrl=this.alertCtrl.create({
           message:'Email exist, try another !!',
           buttons: ['Dismiss']
         })
         alertCtrl.present();
       }

        if(jsonData.success==2){
         let alertCtrl=this.alertCtrl.create({
           message:'Phone exist, try another !!',
           buttons: ['Dismiss']
         })
         alertCtrl.present();
       }
     },error=>{
       console.log(error);
     })
   }

 }
