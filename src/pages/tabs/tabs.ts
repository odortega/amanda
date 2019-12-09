import { Component } from '@angular/core';
import { NavController,IonicPage } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = 'HomePage';
  tab2Root = 'SearchPage';
  tab3Root = 'CategoriesPage';
  tab4Root = 'FavoritesPage';
  tab5Root = 'ProfilePage';
  tab6Root = 'LoginPage';

  constructor(public storage: Storage, public events:Events, public navCtrl: NavController) {

  }

  ionViewWillEnter(){
    console.log('ionViewWillEnter TabsPage');
  }

}
