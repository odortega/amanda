import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchPage } from './search';
import { TranslateModule } from '@ngx-translate/core';
import { Ionic2RatingModule } from 'ionic2-rating';
@NgModule({
	declarations: [
	SearchPage
	],
	imports: [
	IonicPageModule.forChild(SearchPage),	
	TranslateModule.forChild(),
	Ionic2RatingModule
	],
})

export class SearchPageModule {}