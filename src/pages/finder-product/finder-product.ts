import { Component, ViewChild, ElementRef, Renderer } from '@angular/core';
import { IonicPage, NavController, NavParams,LoadingController } from 'ionic-angular';
import  * as Constant from '../../config/constants';
import { Http } from '@angular/http';
//import { Http, Headers } from '@angular/http';
//import {PostDetailPage} from '../post-detail/post-detail';
import { Geolocation } from '@ionic-native/geolocation';

declare var google;
declare var InfoBox;
/**
 * Generated class for the FinderProductPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

 @IonicPage()
 @Component({
 	selector: 'page-finder-product',
 	templateUrl: 'finder-product.html',
 })
 export class FinderProductPage {
 	@ViewChild('map') mapElement: ElementRef;
 	map: any;
 	lat:any=null;
 	lng:any=null;
 	first:any;
 	infobox:any=null;
 	current_marker:any=0;
 	marker_lists:any;
 	distance_list:any;
 	distance:any;
 	query:any='';
 	cat_lists: Array<any>;
 	cat:any=null;
 	price: { lower: number, upper: number };
 	loader:any=null;

 	constructor(public navCtrl: NavController,
 		public loadingCtrl:LoadingController,
 		public renderer:Renderer,
 		public http:Http,
 		public elementRef:ElementRef,
 		private geolocation: Geolocation,
 		public navParams: NavParams) {
 		this.lat=this.navParams.get('lat');
 		this.lng=this.navParams.get('lng');
 		this.distance_list=[
 		5,
 		10,
 		20,
 		30,
 		40,
 		50,
 		100
 		];
 		this.distance='';
 		this.cat='';

 		this.price = {
 			'lower': 1,
 			'upper': 1000000
 		};

 		this.http.get(Constant.domainConfig.base_url + "api/categories_api/categories").subscribe(data => {
 			console.log(data.json());
 			this.cat_lists = data.json();
 		}, error => {

 		})
 	}

 	ionViewDidEnter() {
 		console.log('ionViewDidLoad FinderPage');
 		this.marker_lists=new Array();
 		this.first=-20;
 		let $this=this;
 		this.geolocation.getCurrentPosition().then((resp) => {
 			$this.loader=this.loadingCtrl.create({
 				'content':'loading'
 			})

 			$this.loader.present();
 			//console.log(JSON.stringify(resp));
 			$this.lat=resp.coords.latitude;
 			$this.lng=resp.coords.longitude;
 			this.loadMap();
 		}).catch((error) => {
 			alert('Error getting location '+ JSON.stringify(error));
 			// $this.lat=21;
 			// $this.lng=105;
 			//this.loadMap();
 		});
 	}

 	loadMap(){

 		let latLng = new google.maps.LatLng(this.lat,
 			this.lng);
 		let mapOptions = {
 			center: latLng,
 			zoom: 15,
 			mapTypeId: google.maps.MapTypeId.ROADMAP
 		}

 		this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

 		let $this=this;
 		google.maps.event.addListenerOnce(this.map, 'idle', function(){
 			$this.loader.dismiss();
 			$this.loadMore();
 		});
 		this.addGpsMarker(this.lat,this.lng);
 	}


 	loadMore(){
 		let $this=this;
 		this.first += 20;
 		let request_url=Constant.domainConfig.base_url+"api/products_api/nearby?radius="+this.distance+'&lat='+this.lat+'&lng='+this.lng+'&first='+this.first+'&offset=20&brand='+this.query+'&categories_id='+$this.cat+'&min_price=' + this.price.lower + '&max_price=' + this.price.upper;
 		this.http.get(request_url).subscribe(data=>{
 			console.log(data.json());
 			let markers=data.json();
 			if(!data.json().ok){

 				if(this.marker_lists.length!=0){
 					this.current_marker=this.marker_lists.length;
 				}
 				for (var i = 0; i < markers.length; i++) {
 					let marker = this.addMarker(markers[i].lat,markers[i].lng,markers[i].brand);
 					this.marker_lists.push(marker);
 					var myOptions = {
 						content: "",
 						disableAutoPan: true,
 						maxWidth: 300,
 						boxClass:"mybox",
 						zIndex: null,			
 						closeBoxMargin: "-13px 0px 0px 0px",
 						closeBoxURL: "",
 						infoBoxClearance: new google.maps.Size(1, 1),
 						isHidden: false,
 						pane: "floatPane",
 						enableEventPropagation: false                   
 					}; 

 					google.maps.event.addListener(marker, 'click', (function(marker, i) {
 						return function() {
 							if($this.infobox!=null){
 								$this.infobox.close();
 							}
 							$this.infobox = new InfoBox(myOptions);
 							$this.map.setCenter(new google.maps.LatLng(markers[i].lat,markers[i].lng));

 							let img =markers[i].image_path;
 							if(img != null && img.indexOf('graph.facebook.com')==-1){
 								img = Constant.domainConfig.base_url+markers[i].image_path;
 							}
 							if(img==null){
 								img='assets/avt.png';
 							}

 							let content ='<div class="infowindow-wrapper" product_index="'+i+'"><div class="inner"><span id="infocloser" (click)="close_box()"></span><img class="img" src="'+img+'" height="140px"/><h6 class="brand">'+markers[i].title+'</h6><p class="price">'+markers[i].price+'</p><h5 class="address">'+markers[i].location+'</h5><h6 class="distance">'+markers[i].distance+'km</h6></div></div>';
 							$this.infobox.setContent(content);
 							$this.infobox.open($this.map, marker);

 							google.maps.event.addListener($this.infobox,'domready',function(){
 								$this.renderer.listen($this.elementRef.nativeElement.querySelector("#infocloser"), 'click', (event) => {
 									$this.infobox.close();
 								});

 								$this.renderer.listen($this.elementRef.nativeElement.querySelector(".infowindow-wrapper .brand"), 'click', (event) => {
 									let item= markers[$this.elementRef.nativeElement.querySelector('.infowindow-wrapper').getAttribute('product_index')];
 									$this.navCtrl.push('PostDetailPage',{
 										'item': item
 									});
 								});

 								$this.renderer.listen($this.elementRef.nativeElement.querySelector(".infowindow-wrapper .img"), 'click', (event) => {
 									let item= markers[$this.elementRef.nativeElement.querySelector('.infowindow-wrapper').getAttribute('product_index')];
 									$this.navCtrl.push('PostDetailPage',{
 										'item': item
 									});
 								});
 							})

 						}
 					})(marker, i));
 				}
 				google.maps.event.trigger($this.marker_lists[$this.current_marker], 'click');
 			};//end if

 		}, (err) => {
 			console.log(err);

 		});
 	}

 	onInput(event) {
 		this.clearOverlays();
 		this.query=event.target.value;
 		this.marker_lists=new Array();
 		this.first=-20;
 		this.loadMore();
 	}

 	change_distance(){
 		this.clearOverlays();
 		this.marker_lists=new Array();
 		this.first=-20;
 		this.loadMore();
 	}


 	select_change() {
 		this.clearOverlays();
 		this.marker_lists=new Array();
 		this.first=-20;
 		this.loadMore();
 	}

 	clearOverlays() {
 		if(this.infobox!=null){
 			this.infobox.close();
 		}
 		for (var i = 0; i < this.marker_lists.length; i++ ) {
 			this.marker_lists[i].setMap(null);
 		}
 		this.marker_lists.length=0;
 	}

 	next(){
 		this.current_marker++;
 		if(this.current_marker==this.marker_lists.length){
 			this.current_marker=0;
 		}

 		if( this.map.getZoom() <15 ){
 			this.map.setZoom(15);
 		}
 		google.maps.event.trigger(this.marker_lists[this.current_marker], 'click');
 	}

 	prev(){
 		this.current_marker--;
 		if(this.current_marker < 0){
 			this.current_marker=this.marker_lists.length-1;
 		}

 		if( this.map.getZoom() <15 ){
 			this.map.setZoom(15);
 		}
 		google.maps.event.trigger(this.marker_lists[this.current_marker], 'click');
 	}

 	addGpsMarker(lat,lng){
/* 
		let marker = new google.maps.Marker({
 			map: this.map,
 			animation: google.maps.Animation.DROP,
 			icon:'assets/img/gps.png',
 			position: {lat: lat, lng: lng}
 		});     
*/ 
	}

 	addMarker(lat,lng,brandname){
 		let marker = new google.maps.Marker({
 			map: this.map,
 			animation: google.maps.Animation.DROP,
 			position: {lat: lat, lng: lng}
 		});
 		return marker;
 	}

 	addInfoWindow(marker, content){
 		let infoWindow = new google.maps.InfoWindow({
 			content: content
 		});
 		infoWindow.open(this.map, marker);
 	}

 }

