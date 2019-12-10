import { Component,ViewChild,ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ActionSheetController, Platform, LoadingController, ModalController, AlertController} from 'ionic-angular';
import { Http } from '@angular/http';
//import { Http, Headers } from '@angular/http';
import  * as Constant from '../../config/constants';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
//import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import {File} from '@ionic-native/file';
import {FilePath} from '@ionic-native/file-path';
import { Camera,CameraOptions } from '@ionic-native/camera';
import { Storage } from '@ionic/storage';
//import {FormBuilder,FormGroup,Validators} from '@angular/forms';
import {FormBuilder,Validators} from '@angular/forms';

declare var cordova: any;
declare var google;
/**
 * Generated class for the PostProduct page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

 @IonicPage()
 @Component({
 	selector: 'page-post-product',
 	templateUrl: 'post-product.html',
 })

 export class PostProductPage {
 	@ViewChild('map') mapElement: ElementRef;
 	@ViewChild('pac') searchBoxElement: ElementRef;
 	my_photo:any = null;
 	categories_lists:Array<any>;
 	condition_lists:any;
 	purpose_lists:any;
 	base_url:any;
 	user:any;
 	form:any;
 	map:any;
 	lat: any=null;
 	lng: any=null;
 	searchBox:any;
 	marker:any=null;
 	constructor(
 		public navCtrl: NavController, 
 		public navParams: NavParams, 
 		public http:Http, 
 		public actionSheetCtrl:ActionSheetController,
 		public camera: Camera,
 		public platform:Platform,
 		public file:File,
 		public filePath:FilePath, 
 		public transfer:FileTransfer,
 		public storage: Storage,
 		public modalCtrl:ModalController,
 		public loadingCtrl:LoadingController,
 		public formBuilder:FormBuilder,
 		public alertCtrl:AlertController,
 		public viewCtrl: ViewController){
 		
 		this.form=formBuilder.group({
 			title:['',Validators.compose([Validators.minLength(5),Validators.maxLength(200),Validators.required])],
 			price:['',Validators.required],
 			categories:['',Validators.required],
 			content:['',Validators.required],
 			condition:['',Validators.required],
 			purpose:['',Validators.required],
 			location:['',Validators.required]
 		})

 		this.storage.ready().then(() => {
 			this.storage.get('user').then((obj)=>{
 				console.log(obj);
 				if(obj == null){
 					let modal = this.modalCtrl.create('LoginPage');
 					modal.present();
 				}else{
 					this.user=obj;
 				}
 			});
 		});


 		this.base_url=Constant.domainConfig.base_url;
 		this.condition_lists=[
 		{id:0,name:'new'},
 		{id:1,name:'second hand'}
 		]

 		this.purpose_lists=[
 		{id:0,name:'Buy'},
 		{id:1,name:'Sell'}
 		]

 		this.http.get(Constant.domainConfig.base_url+"api/categories_api/categories").subscribe(data=>{
 			console.log(data.json());
 			this.categories_lists=data.json();
 		},error=>{

 		})

 	}


 	uploadPhoto() {
 		if(this.my_photo==null){
 			let alert= this.alertCtrl.create({
 				message:'Please choose a photo',
 				buttons:['Dismiss']
 			})
 			alert.present();
 			return;
 		}

 		let loader = this.loadingCtrl.create({
 			content: "Loading"
 		});
 		loader.present();

 		var options = {
 			fileKey: "file",
 			fileName: this.my_photo,
 			chunkedMode: false,
 			mimeType: "multipart/form-data",
 			params : {
 				'cat_id':this.form.value.categories,
 				'condition':this.form.value.condition,
 				'purpose':this.form.value.purpose,
 				'title':this.form.value.title,
 				'price':this.form.value.price,
 				'content':this.form.value.content,
 				'fb_id':this.user.fb_id,
 				'user_id':this.user.id,
 				'location':this.form.value.location,
 				'lat':this.lat,
 				'lng':this.lng
 			}
 		}
 		const fileTransfer: FileTransferObject = this.transfer.create();
 		fileTransfer.upload(this.my_photo,Constant.domainConfig.base_url+'api/products_api/products',options).then(data=>{
 			console.log(JSON.stringify(data));
 			loader.dismiss();
 			let alert=this.alertCtrl.create({
 				message:"Upload successfully",
 				buttons:['OK']
 			})
 			alert.present();
 			this.form.value.content='';
 			this.form.value.title='';
 			this.form.value.price='';
 			this.my_photo=null;
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
 			quality: 100,
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
 		}, error => {

 		});
 	}

 	private createFileName() {
 		var d = new Date(),
 		n = d.getTime(),
 		newFileName =  n + ".jpg";
 		return newFileName;
 	}

 	dismiss(){
 		this.viewCtrl.dismiss();
 	}

 	ionViewDidLoad() {
 		this.loadMap();
 	}

 	loadMap(){
 		let latLng = new google.maps.LatLng(this.lat,
 			this.lng);
 		let mapOptions = {
 			center: latLng,
 			zoom: 1,
 			mapTypeId: google.maps.MapTypeId.ROADMAP
 		}
 		this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
 		let $this=this;
 		google.maps.event.addListenerOnce(this.map, 'idle', function(){
 			$this.searchBox= new google.maps.places.SearchBox($this.searchBoxElement.nativeElement, {
 				types: ["address"]
 			});

 			$this.searchBox.addListener('places_changed', function() {
 				var places = $this.searchBox.getPlaces();
 				var bounds = new google.maps.LatLngBounds();

 				if($this.marker!=null){
 					$this.removeMarker();
 				}
 				for (var i = 0, place; place = places[i]; i++) {
 					$this.addMarker( place.geometry.location.lat(), place.geometry.location.lng());
 					bounds.extend(place.geometry.location);
 					$this.form.controls['location'].setValue(place.formatted_address);
 					$this.lat=place.geometry.location.lat();
 					$this.lng=place.geometry.location.lng();
 				}
 				$this.map.fitBounds(bounds);
 			})

 		})

 	}//end loadMap function

 	addMarker(lat,lng){
 		this.marker = new google.maps.Marker({
 			map: this.map,
 			animation: google.maps.Animation.DROP,
 			icon:'assets/img/gps.png',
 			position: {lat: lat, lng: lng}
 		});     
 		this.map.setZoom(4);
 	}

 	removeMarker(){
 		this.marker.setMap(null);
 	}


 }
