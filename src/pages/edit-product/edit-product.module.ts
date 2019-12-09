import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditProductPage } from './edit-product';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  declarations: [
    EditProductPage,
  ],
  imports: [
    IonicPageModule.forChild(EditProductPage),
    TranslateModule.forChild()
  ],
})

export class EditProductPageModule {}