import { Component, ViewChild } from '@angular/core';
import { CanvasAreaDraw } from './lib/ngx-canvas-area-draw.directive';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('areaDraw') areaDraw: CanvasAreaDraw;
  @ViewChild('area2Draw') area2Draw: CanvasAreaDraw;

    imageUrl: string;
    image2Url: string;
    strokeColor: string;
    fillColor: string;
    handleFillColor: string;
    handleStrokeColor: string;
    updateWhileMoving: boolean;
    defaults: Array<Array<Array<number>>>;

    constructor() {
      this.imageUrl = 'https://i.imgur.com/0wMJHZK.jpg';
      this.image2Url = 'https://i.imgur.com/0wMJHZK.jpg';
        this.strokeColor = 'rgba(255, 255, 255, 0.7)';
        this.fillColor = 'rgba(255, 255, 255, 0.2)';
        this.handleFillColor = 'rgba(255, 255, 255, 1)';
        this.handleStrokeColor = 'rgba(0, 0, 0, 1)';
        this.updateWhileMoving = true;
        this.defaults = [
            [[10, 50], [200, 62], [120, 200]],
            [[310, 50], [500, 90], [420, 200], [320, 210]]
        ];
    }

    onAddShape(): void {
        alert('A new shape has been added.');
    }

    onRemoveShape(event: number): void {
        alert(`The shape in position ${event} has been removed.`);
    }

    clean(): void {
        this._setImage2Url('');
    }

    reset(): void {
        this._setImage2Url(this.imageUrl + '');
    }

    sceneChange(event: number): void {
        if (typeof (event) === 'number') {
            const url = this.areaDraw.getImageIn();
            if (url && url !== this.image2Url) {
                this._setImage2Url(url);
            }
        }
    }

    private _setImage2Url(url: string): void {
        this.image2Url = url;
        this.area2Draw.imageUrl = url;
    }
}
