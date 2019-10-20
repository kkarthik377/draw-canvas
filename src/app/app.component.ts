import { Component, OnInit, ViewChild } from '@angular/core';

import { GenericPath, NgxCanvasAreaDrawDirective, PathData, Rect } from 'ngx-canvas-area-draw';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('areaDraw')
  areaDraw: NgxCanvasAreaDrawDirective;
  @ViewChild('area2Draw')
  area2Draw: NgxCanvasAreaDrawDirective;

  imageUrl: string;
  image2Url: string;
  strokeColor: string;
  fillColor: string;
  handlerFillColor: string;
  handlerStrokeColor: string;
  updateWhileMoving: boolean;
  allowDelete: boolean;
  defaults: PathData[];
  zoomScale: number = 1;
  imageWidth: number = 500;
  imageHeight: number = 500;

  constructor() {
  }

  ngOnInit(): void {
    this.imageUrl = 'https://i.imgur.com/0wMJHZK.jpg';

    this.strokeColor = 'rgba(255, 255, 255, 0.7)';
    this.fillColor = 'rgba(255, 255, 255, 0.2)';
    this.handlerFillColor = 'rgba(255, 255, 255, 1)';
    this.handlerStrokeColor = 'rgba(0, 0, 0, 1)';

    this.allowDelete = true;
    this.updateWhileMoving = true;
    this.defaults = [
      {
        name: GenericPath.NAME,
        points: [[10, 10], [20, 10], [15, 25]],
        keepInsideContainer: true
      },
      {
        name: Rect.NAME,
        keepInsideContainer: true
      },
      {
        name: GenericPath.NAME,
        points: [[70, 60], [80, 60], [90, 80], [60, 80]],
        keepInsideContainer: true
      }
    ];
  }

  onAddPath() {
    alert('A new path has been added.');
  }

  onRemovePath(event: number) {
    alert(`The path in position ${event} has been removed.`);
  }

  onSceneChange(event: number): void {
    if (typeof (event) === 'number') {
      const url = this.areaDraw.getImageInPosition();
      if (url && url !== this.image2Url) {
        this.setImage2Url(url);
      }
    }
  }

  clean(): void {
    this.setImage2Url('');
  }

  reset(): void {
    this.setImage2Url(this.imageUrl + '');
  }

  private setImage2Url(url: string): void {
    this.image2Url = url;
    this.area2Draw.imageUrl = url;
  }

  onImageSizeChange(event: any): void {
    this.imageWidth = event.width;
    this.imageHeight = event.height;
  }
}
