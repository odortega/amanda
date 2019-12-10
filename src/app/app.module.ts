import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { HttpModule, Http } from '@angular/http';
import { IonicStorageModule } from '@ionic/storage';

import { SocialSharing } from '@ionic-native/social-sharing';
import { CallNumber } from '@ionic-native/call-number';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Facebook } from '@ionic-native/facebook';
//import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

import { FileTransfer } from '@ionic-native/file-transfer';
import { FilePath } from '@ionic-native/file-path';
import { File } from '@ionic-native/file';
import { Camera } from '@ionic-native/camera';
import { OneSignal } from '@ionic-native/onesignal';

/*translate loader*/
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ProductProvider } from '../providers/product/product';
import { HelpersProvider } from '../providers/helpers/helpers';
/*end translate loader*/


export function createTranslateLoader(http: Http) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
import { Geolocation } from '@ionic-native/geolocation';

@NgModule({
    declarations: [
    MyApp
    ],
    imports: [
    BrowserModule,
    HttpModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(MyApp),
    TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useFactory: (createTranslateLoader),
            deps: [Http]
        }
    })
    ],
    bootstrap: [IonicApp],
    entryComponents: [
    MyApp
    ],
    providers: [
    StatusBar,
    Camera,
    SplashScreen,
    SocialSharing,
    CallNumber,
    HttpModule,
    FileTransfer,
    File,
    FilePath,
    Geolocation,
    Facebook,
    OneSignal,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    ProductProvider,
    HelpersProvider
    ]
})
export class AppModule { }
