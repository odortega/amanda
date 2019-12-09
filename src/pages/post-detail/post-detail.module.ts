import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PostDetailPage } from './post-detail';
import { TranslateModule } from '@ngx-translate/core';
import { Ionic2RatingModule } from 'ionic2-rating';
@NgModule({
	declarations: [
	PostDetailPage
	],
	imports: [
	IonicPageModule.forChild(PostDetailPage),
	TranslateModule.forChild(),
	Ionic2RatingModule
	],
})

export class PostDetailModule {}