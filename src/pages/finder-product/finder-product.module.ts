import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FinderProductPage } from './finder-product';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    FinderProductPage
  ],
  imports: [
    IonicPageModule.forChild(FinderProductPage),
    TranslateModule.forChild()
  ],
  exports: [
    FinderProductPage
  ]
})

export class FinderPriductPageModule {
	
}
