import { Component } from '@angular/core';
import { IonicPage,NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import * as Constant from '../../config/constants';

/**
 * Generated class for the ModalRatingPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-modal-rating',
	templateUrl: 'modal-rating.html',
})
export class ModalRatingPage {
	point: any = 5;
	product_id: any;
	product_user_id: any;
	user_id: any;
	message: any;
	constructor(
		public navCtrl: NavController,
		public http: Http,
		public navParams: NavParams,
		public alertCtrl:AlertController,
		public viewCtrl: ViewController) {
		this.product_id = this.navParams.get('product_id');
		this.product_user_id = this.navParams.get('product_user_id');
		this.user_id = this.navParams.get('user_id');
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad ModalRatingPage');
	}


	dismiss() {
		this.viewCtrl.dismiss();
	}

	rate() {
		let headers: Headers = new Headers({
			'Content-Type': 'application/x-www-form-urlencoded'
		});
		let post_data = 'product_id=' + this.product_id + '&user_id=' + this.user_id + '&product_user_id=' + this.product_user_id + '&point=' + this.point+'&message='+this.message;
		this.http.post(Constant.domainConfig.base_url + 'api/products_api/rate', post_data, { headers: headers }).subscribe(data => {

		})
	}
}
