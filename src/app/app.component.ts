import { Component, OnInit, ViewChild, NgZone } from '@angular/core';

import { GenericPath, NgxCanvasAreaDrawDirective, PathData, Rect, Circle, Colors } from 'ngx-canvas-area-draw';

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
  imageWidth: string = 'auto';
  imageHeight: string = 'auto';
  imageDivOverflow: string = 'unset';

  genericColors: Colors = {
    strokeColor : 'rgba(91, 81, 255, 0.96)',
    fillColor : 'rgba(96, 87, 254, 0.11)',
    handlerFillColor : 'rgba(96, 87, 254, 0.11)',
    handlerStrokeColor : 'rgba(91, 81, 255, 0.96)'
  }

  circleColors = {
    strokeColor : 'rgba(94, 179, 0, 1)',
    fillColor : 'rgba(234, 255, 211, 1)',
    handlerFillColor : 'rgba(94, 179, 0, 1)',
    handlerStrokeColor : 'rgba(234, 255, 211, 1)',
  }

  constructor(private ngZone: NgZone) {
  }


  ngOnInit(): void {
    this.imageUrl = 'https://fusemaptest.s3.amazonaws.com/local/building_logo/d404b4e8-3d53-428e-b37a-f4fab20a2973floormap.png';

    this.strokeColor = 'rgba(0, 3, 188, 0.7)';
    this.fillColor = 'rgba(123, 125, 243, 0.2)';
    this.handlerFillColor = 'rgba(255, 255, 255, 1)';
    this.handlerStrokeColor = 'rgba(0, 0, 0, 1)';

    this.allowDelete = true;
    this.updateWhileMoving = true;
    this.defaults = [
      {
        name: GenericPath.NAME,
        points: [[10, 10], [20, 10], [15, 25]],
        keepInsideContainer: true,
        id: 14,
        ...this.genericColors
      },
      {
        name: Rect.NAME,
        points: [[10, 10], [20, 10], [20, 20], [10, 20]],
        keepInsideContainer: true,
        id: 15,
        strokeColor : 'rgba(78, 0, 235, 1)',
        fillColor : 'rgba(153, 102, 255, 1)',
        handlerFillColor : 'rgba(58, 0, 173, 1)',
        handlerStrokeColor : 'rgba(15, 0, 46, 1)',
      },
      {
        name: Circle.NAME,
        points: [[10, 10]],
        keepInsideContainer: true,
        id: 16,
        ...this.circleColors
      },
    ];
  }

  onAddPath(event) {
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
    this.imageDivOverflow = (event.width === 'auto' && event.height === 'auto') ? 'unset' : 'hidden';
    this.imageWidth = event.width;
    this.imageHeight = event.height;
    this.ngZone.run(() => {});
  }

  setScale(event: number): void {
    this.zoomScale = event;
  }
}
