import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxCanvasAreaDrawModule } from './lib/ngx-canvas-area-draw.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    NgxCanvasAreaDrawModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
