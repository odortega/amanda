import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalRatingPage } from './modal-rating';

@NgModule({
  declarations: [
    ModalRatingPage
  ],
  imports: [
    IonicPageModule.forChild(ModalRatingPage)
  ],
})

export class ModalRatingPageModule {}