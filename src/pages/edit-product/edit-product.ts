import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ToastController, ActionSheetController, Platform, LoadingController, ModalController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import * as Constant from '../../config/constants';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { FilePath } from '@ionic-native/file-path';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';
declare var cordova: any;
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
/**
 * Generated class for the EditProductPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-edit-product',
	templateUrl: 'edit-product.html',
})
export class EditProductPage {
	my_photo: any = null;
	categories_lists: Array<any>;
	county_lists: Array<any>;
	cities_lists: Array<any>;
	condition_lists: any;
	purpose_lists: any;

	obj:any;
	form:any;
	base_url: any;
	user: any;
	images_list: any = new Array();

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public http: Http,
		public actionSheetCtrl: ActionSheetController,
		public camera: Camera,
		public platform: Platform,
		public file: File,
		public filePath: FilePath,
		public transfer: FileTransfer,
		public storage: Storage,
		public toastCtrl: ToastController,
		public modalCtrl: ModalController,
		public formBuilder: FormBuilder,
		public loadingCtrl: LoadingController,
		public viewCtrl: ViewController
	) {
		this.obj = this.navParams.get('item');
		this.form = formBuilder.group({
			title: [this.obj.title, Validators.compose([Validators.minLength(5), Validators.maxLength(200), Validators.required])],
			price: [this.obj.price, Validators.required],
			categories: [this.obj.categories, Validators.required],
			county: [this.obj.county, Validators.required],
			cities: [this.obj.cities, Validators.required],
			content: [this.obj.content, Validators.required],
			condition: [this.obj.condition, Validators.required],
			purpose: [this.obj.aim, Validators.required]
		})

		this.base_url = Constant.domainConfig.base_url;
		this.condition_lists = [
			{ id: 0, name: 'new' },
			{ id: 1, name: 'second hand' }
		]

		this.purpose_lists = [
			{ id: 0, name: 'Buy' },
			{ id: 1, name: 'Sell' }
		]

		this.http.get(Constant.domainConfig.base_url + "api/county_api/county").subscribe(data => {
			console.log(data.json());
			this.county_lists = data.json();
		}, error => {

		})

		this.http.get(Constant.domainConfig.base_url + "api/categories_api/categories").subscribe(data => {
			console.log(data.json());
			this.categories_lists = data.json();
		}, error => {

		})


		this.storage.ready().then(() => {
			this.storage.get('user').then((obj) => {
				console.log(obj);
				if (obj == null) {
					let modal = this.modalCtrl.create(LoginPage);
					modal.present();
				} else {
					this.user = obj;
				}
			});
		});

	}

	load_cities() {
		this.http.get(Constant.domainConfig.base_url + "api/cities_api/cities_by_county_id?id=" + this.form.value.county).subscribe(data => {
			console.log(data.json());
			this.cities_lists = data.json();
		}, error => {

		})
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad EditProductPage');
	}

	ionViewWillEnter() {
		console.log('ionViewWillEnter PostProductPage');
		if (this.obj != null) {
			this.http.get(Constant.domainConfig.base_url + "api/images_api/images?product_id=" + this.obj.id).subscribe(data => {
				console.log(data.json());
				this.images_list = data.json();
			}, error => {

			})
		}
	}

	dismiss() {
		this.viewCtrl.dismiss();
	}

	edit() {
		let headers: Headers = new Headers({
			'Content-Type': 'application/x-www-form-urlencoded'
		});
		let post_data = 'product_id=' + this.obj.id + '&title=' + this.form.value.title + '&content=' + this.form.value.content + '&county=' + this.form.value.county + '&cities=' + this.form.value.cities + '&price=' + this.form.value.price + '&condition=' + this.form.value.condition + '&purpose=' + this.form.value.purpose + '&categories=' + this.form.value.categories;
		this.http.post(this.base_url + 'api/products_api/update', post_data, { headers: headers }).subscribe(data => {
			let toast = this.toastCtrl.create({
				message: 'Update Successfully',
				duration: 1000
			})
			toast.present();
		}, error => {

		})
	}


	selectPhotoOptions() {
		let actionSheet = this.actionSheetCtrl.create({
			title: 'Modify your album',
			buttons: [
				{
					text: 'Take photo',
					handler: () => {
						this.takePhoto(this.camera.PictureSourceType.CAMERA);
					}
				}, {
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
		let camera_options: CameraOptions = {
			quality: 100,
			sourceType: sourceType,
			saveToPhotoAlbum: false,
			correctOrientation: true,
			destinationType: this.camera.DestinationType.FILE_URI,
			encodingType: this.camera.EncodingType.JPEG,
			mediaType: this.camera.MediaType.PICTURE
		};
		this.camera.getPicture(camera_options).then((imagePath) => {
			this.my_photo = imagePath;
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
			this.uploadPhoto();
		}, error => {

		});
	}

	private createFileName() {
		var d = new Date(),
			n = d.getTime(),
			newFileName = n + ".jpg";
		return newFileName;
	}

	uploadPhoto(){
		let loader = this.loadingCtrl.create({
			content: "Loading"
		});
		loader.present();
		var options = {
			fileKey: "file",
			fileName: this.my_photo,
			chunkedMode: false,
			mimeType: "multipart/form-data",
			params: {
				'id': this.obj.id
			}
		}
		const fileTransfer: FileTransferObject = this.transfer.create();
		fileTransfer.upload(this.my_photo, Constant.domainConfig.base_url + 'api/images_api/images', options).then(data => {
			console.log(JSON.stringify(data));
			loader.dismiss();
			this.my_photo = null;
			let response = JSON.parse(data.response);
			this.images_list.push(response);
		}, error => {
			console.log(error);
			loader.dismiss();
		});
	}
}
