import { ElementRef, Renderer2 } from '@angular/core';

import { MousePosition } from '../models';
import { BaseShape } from './base-shape';
import { BasePath } from './base-path';

export class Rect extends BasePath {
  static NAME = 'RECT';

  constructor(
    protected renderer: Renderer2,
    protected parent: ElementRef,
    protected fillColor: string,
    protected strokeColor: string,
    protected handlerFillColor: string,
    protected handlerStrokeColor: string,
    points: number[][],
    forcedAspectRatio: number,
    keepInsideContainer: boolean
  ) {
    super(
      renderer,
      parent,
      fillColor,
      strokeColor,
      handlerFillColor,
      handlerStrokeColor,
      points,
      forcedAspectRatio,
      keepInsideContainer,
      false,
      false
    );
  }

  onMousedown(event: MouseEvent, mousePos: MousePosition) {
    const distances = this._getDistances(mousePos);
    if (this._shouldStartReizingPath(distances)) {
      this._startResizingPath(distances.minDistanceIndex);
    } else if (this.context.isPointInPath(mousePos.x, mousePos.y)) {
      this._startMovingPath(mousePos);
    }
  }

  onMouseup(event: MouseEvent, mousePos: MousePosition, allowDelete = true): string {
    const distances = this._getDistances(mousePos);
    if (distances.minDistance < BaseShape.CLOSE_LIMIT && distances.minDistanceIndex >= 0) {
      if (event.button === 1 && this.points.length > 3) {
        this._deleteNode(distances.minDistanceIndex);
        return 'delete node';
      }
    } else if (allowDelete) {
      const states = this._getCloseStatus(mousePos);
      if (event.button === 1 && this.context.isPointInPath(mousePos.x, mousePos.y) && !states.isClose) {
        this.context.canvas.width = this.context.canvas.width;
        return 'delete path';
      }
    }
    this._activePointPos = null;
    return null;
  }

  onResizePath(event: MouseEvent, mousePos: MousePosition): void {
    if (this._activePointPos === 1) {
      mousePos = this.getPositionInPercent(mousePos);

      // toDo: fox, 4/10/19 Implement _fitInsideContainer
      // It should check if the next path size is not overflowing its container
      // if (this.keepInsideContainer && !this._fitInsideContainer(mousePos)) {
      //   return;
      // }

      // toDo: fox, 4/10/19 FIX this calculations
      // This should use forcedAspectRatio || 1 as aspect ratio to grow
      const resizeAspectRatioX = mousePos.x / this.points[this._activePointPos][0];
      const resizeAspectRatioY = mousePos.y / this.points[this._activePointPos][1];

      this.points[0][0] /= resizeAspectRatioX;
      this.points[0][1] *= resizeAspectRatioY;

      this.points[1][0] *= resizeAspectRatioX;
      this.points[1][1] *= resizeAspectRatioY;

      this.points[2][0] *= resizeAspectRatioX;
      this.points[2][1] /= resizeAspectRatioY;

      this.points[3][0] /= resizeAspectRatioX;
      this.points[3][1] /= resizeAspectRatioY;
      // **********************************************************************************

      this.draw();
    }
  }

  draw(): void {
    this.context.canvas.width = this.context.canvas.width;
    this.context.globalCompositeOperation = 'destination-over';
    this.context.lineWidth = 1;

    if (this.isActive) {
      this._drawExpander(
        this.getPointInPx(this.points[1])
      );
    }

    this.context.beginPath();
    this.context.fillStyle = this.fillColor;
    this.context.strokeStyle = this.strokeColor;
    this.points
      .filter((point: number[]) => point && point.length > 0)
      .forEach((point: number[]) => {
        point = this.getPointInPx(point);
        this.context.lineTo(point[0], point[1]);
      });
    this.context.closePath();
    this.context.fill();
    this.context.stroke();
  }

  protected _getName(): string {
    return Rect.NAME;
  }

  protected _onInit() {
    if (!this.points || this.points.length === 0) {
      const height = 40 * (this.forcedAspectRatio || 1);
      const left = 30;
      const right = 70;
      const top = 50 - (height / 2);
      const bottom = 50 + (height / 2);
      this.points = [
        [left, top],
        [right, top],
        [right, bottom],
        [left, bottom]
      ];
    }
    this.isActive = false;
  }
}
