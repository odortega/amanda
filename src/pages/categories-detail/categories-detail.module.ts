import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CategoriesDetailPage } from './categories-detail';
import { Ionic2RatingModule } from 'ionic2-rating';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
	declarations: [
	CategoriesDetailPage,
	],
	imports: [
	IonicPageModule.forChild(CategoriesDetailPage),
	TranslateModule.forChild(),
	Ionic2RatingModule
	],
})

export class CategoriesDetailPageModule {}