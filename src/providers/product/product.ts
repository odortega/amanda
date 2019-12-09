import { Injectable } from '@angular/core';
import { Http,Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SocialSharing } from '@ionic-native/social-sharing';
import * as Constant from '../../config/constants';

/*
  Generated class for the ProductProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
  	*/
  @Injectable()
  export class ProductProvider {
  	headers:Headers;
  	constructor(public http: Http,
      public socialSharing: SocialSharing) {
  		this.headers= new Headers({
  			'Content-Type': 'application/x-www-form-urlencoded'
  		});
  	}

  	getSlideProducts():Observable<any>{
  		return this.http.get(Constant.domainConfig.base_url+'api/products_api/slider');
  	}

  	getProducts(first,offset,user_id=null):Observable<any>{
  		return this.http.get(Constant.domainConfig.base_url+'api/products_api/products?first='+first+'&offset='+offset+'&user_lg='+user_id);
  	}

  	reportProduct(product_id,user_id):Observable<any>{
  		return this.http.post(Constant.domainConfig.base_url + 'api/products_api/report', 'product_id=' + product_id + '&user_id=' + user_id, { headers: this.headers });
  	}

    share(item){
      this.socialSharing.share(item.name, item.content, null, Constant.domainConfig.base_url + 'detail?id=' + item.id);
    }

    view(navCtrl,item){
      navCtrl.push('PostDetailPage', { item: item });
    }

    favorites(product_id,user_id){
      return this.http.post(Constant.domainConfig.base_url + 'api/favorites_api/add_un_favorites', 'product_id=' + product_id + '&user_id=' + user_id, { headers: this.headers })
    }

    getFavoritesProduct(first,offset,user_id):Observable<any>{
      return this.http.get(Constant.domainConfig.base_url + 'api/favorites_api/favorites?first=' + first + '&offset=' +offset+ '&user_id=' + user_id);
    }

  }
