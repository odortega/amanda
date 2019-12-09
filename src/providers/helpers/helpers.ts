import { Injectable } from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing';
import { CallNumber } from '@ionic-native/call-number';
import * as Constant from '../../config/constants';
/*
  Generated class for the HelpersProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class HelpersProvider {

  constructor(
  	public callNumber:CallNumber,
  	public socialSharing:SocialSharing
  	) {
   
  }

  call(phone:string){
    this.callNumber.callNumber(phone, true)
			.then(() => console.log('Launched dialer!'))
			.catch(() => console.log('Error launching dialer'));
  }

  viewProfile(navCtrl,id){
	 navCtrl.push('ProfilePage', { user_id: id });
  }

  goToMapFinder(navCtrl,id){
  	 //navCtrl.push('ProfilePag')
  }

}
