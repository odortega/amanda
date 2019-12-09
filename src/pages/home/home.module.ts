import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomePage } from './home';
import { TranslateModule } from '@ngx-translate/core';
import { Ionic2RatingModule } from 'ionic2-rating';
@NgModule({
	declarations: [
	HomePage,
	],
	imports: [
	IonicPageModule.forChild(HomePage),
	TranslateModule.forChild(),
	Ionic2RatingModule
	],
})

export class HomePageModule {}