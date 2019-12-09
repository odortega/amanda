import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ActivationCodePage } from './activation-code';

@NgModule({
  declarations: [
    ActivationCodePage
  ],
  imports: [
    IonicPageModule.forChild(ActivationCodePage)
  ],
})

export class ActivationCodePageModule {}