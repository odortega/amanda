import { Component } from '@angular/core';
import { IonicPage, ModalController, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import * as Constant from '../../config/constants';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

/**
 * Generated class for the Login page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  base_url: any = '';
  user_name: any = '';
  password: any = '';
  msg_err: any = null;

  constructor(
    public modalCtrl: ModalController,
    public viewCtrl: ViewController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public events: Events,
    public http: Http,
    public storage: Storage,
    public fb: Facebook,
    public alertCtrl: AlertController
  ) {
    this.base_url = Constant.domainConfig.base_url;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter LoginPage');
    this.msg_err = null;
  }

  login() {
    if (this.user_name != null && this.user_name != '' && this.password != null && this.password != '') {
      let headers: Headers = new Headers({
        'Content-Type': 'application/x-www-form-urlencoded'
      });
      this.http.post(this.base_url + 'api/users_api/login', 'user_name=' + this.user_name + '&pwd=' + this.password, { headers: headers }).subscribe(data => {
        console.log(data.json());
        if (data.json().empty != 1) {
          let user = data.json()[0];
          this.storage.set('user', user);
          this.events.publish('user: change');
          this.navCtrl.pop();
        } else {
          this.msg_err = 'Your username or password is wrong';
        }
      }, error => {

      })
    } else {
      this.msg_err = 'You enter not enough information';
    }
  }

  fb_login() {
    this.fb.login(['public_profile', 'user_friends', 'email'])
      .then((res: FacebookLoginResponse) => {
        let params = new Array<string>();
        this.fb.api('/me?fields=name,gender,email', params).then(user => {
          console.log(JSON.stringify(user));
          this.http.get(this.base_url + 'api/users_api/facebook_user_check?fb_id=' + user.id).subscribe(data => {
            //check user facebook
            if (data.json().success == 0) {
              //if do not have user, insert it 
              let headers: Headers = new Headers({
                'Content-Type': 'application/x-www-form-urlencoded'
              });

              let username = user.email.substring(0, user.email.indexOf("@"));
              //console.log(username.substring(0,4));
              username = username.substring(0, 4) + '_' + user.id;

              let params = 'fb_id=' + user.id + '&email=' + user.email + '&fullname=' + user.name + '&user_name=' + username;
              this.http.post(this.base_url + 'api/users_api/facebook_user_register', params, { headers: headers }).subscribe(data => {
                console.log(JSON.stringify(data));
                let user = data.json();
                user = user[0];
                this.storage.set('user', user);
                this.events.publish('user: change');
                this.navCtrl.pop();
              }, error => {
                console.log(error);
              })
            } else {
              let user = data.json().data[0];
              this.storage.set('user', user);
              this.events.publish('user: change');
              this.navCtrl.pop();
              //console.log(JSON.stringify(data.json().data[0]));
            }
          }, error => {

          })


        }).catch(e => {
          alert("Facebook login failed, try again !!!" + JSON.stringify(e));
        })
      })
      .catch(e => {
        alert("Facebook login failed, try again !!!" + JSON.stringify(e));
      });
  }

  signup() {
    let modal = this.modalCtrl.create('SignupPage');
    modal.present();
  }

  // forgot() {
  //   let prompt = this.alertCtrl.create({
  //     title: 'Get new password via ?',
  //     inputs: [
  //       {
  //         type: 'radio',
  //         label: 'SMS',
  //         value: '0'
  //       },
  //       {
  //         type: 'radio',
  //         label: 'Mail',
  //         value: '1'
  //       }

  //     ],
  //     buttons: [
  //       {
  //         text: "Cancel",
  //         handler: data => {

  //         }
  //       },
  //       {
  //         text: "OK",
  //         handler: data => {
  //           if (data == 0) {
  //             //send sms
  //             this.showInputPhone(data);
  //           } else {
  //             //send mail
  //             this.showInputMail(data);
  //           }
  //         }
  //       }
  //     ]
  //   });
  //   prompt.present();
  // }

  // showInputPhone(type) {
  //   let prompt = this.alertCtrl.create({
  //     title: 'Input your phone ',
  //     inputs: [
  //       {
  //         name: 'phone',
  //         placeholder: 'Your Phone'
  //       }
  //     ],
  //     buttons: [
  //       {
  //         text: 'Cancel',
  //         role: 'cancel',
  //         handler: () => {
  //           console.log('Cancel clicked');
  //         }
  //       },
  //       {
  //         text: 'OK',
  //         handler: (data) => {
  //           console.log(data);
  //           this.reset_pwd(type,data.phone);
  //         }
  //       }
  //     ]
  //   })
  //   prompt.present()
  // }

  // showInputMail(type) {
  //   let prompt = this.alertCtrl.create({
  //     title: 'Input your mail',
  //     inputs: [
  //       {
  //         name: 'mail',
  //         placeholder: 'Your Mail'
  //       }
  //     ],
  //     buttons: [
  //       {
  //         text: 'Cancel',
  //         role: 'cancel',
  //         handler: () => {
  //           console.log('Cancel clicked');
  //         }
  //       },
  //       {
  //         text: 'OK',
  //         handler: (data) => {
  //           console.log(data);
  //           this.reset_pwd(type,data.mail);
  //         }
  //       }
  //     ]
  //   })
  //   prompt.present()
  // }

  // reset_pwd(type,data) {
  //   let headers: Headers = new Headers({
  //     'Content-Type': 'application/x-www-form-urlencoded'
  //   });
  //   let params='type='+type+'&data='+data;
  //   this.http.post(this.base_url + 'api/users_api/reset_pwd', params, { headers: headers }).subscribe(data => {
     
  //   }, error => {
    
  //   })
  // }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
