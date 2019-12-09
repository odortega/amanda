import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PostProductPage } from './post-product';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  declarations: [
    PostProductPage
  ],
  imports: [
    IonicPageModule.forChild(PostProductPage),
    TranslateModule.forChild()
  ],
})

export class PostProductPageModule {}