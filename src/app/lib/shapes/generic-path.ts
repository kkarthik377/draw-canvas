import { ElementRef, Renderer2 } from '@angular/core';

import { MousePosition } from '../models';
import { BaseShape } from './base-shape';
import { BasePath } from './base-path';

export class GenericPath extends BasePath {
  static NAME = 'GENERIC_PATH';

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
      true,
      true
    );
  }

  onMousedown(event: MouseEvent, mousePos: MousePosition) {
    const distances = this._getDistances(mousePos);
    if (this._shouldStartMovingPoint(distances)) {
      this._startMovingPointInIndex(distances.minDistanceIndex);
    } else {
      const states = this._getCloseStatus(mousePos);
      if (this._shouldStartMovingPath(mousePos, distances, states)) {
        this._startMovingPath(mousePos);
      } else if (states.isClose && this.allowModifyPoints && this.allowAddNewPoints && event.button === 0) {
        this._addPoint(states.insertAt, mousePos);
      }
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
  }

  draw(): void {
    this.context.canvas.width = this.context.canvas.width;
    this.context.globalCompositeOperation = 'destination-over';
    this.context.lineWidth = 1;

    this.context.beginPath();
    this.points
      .filter((point: number[]) => point && point.length > 0)
      .forEach((point: number[]) => {
        point = this.getPointInPx(point);
        if (this.isActive && this.allowModifyPoints) {
          this._drawPoint(point);
        }
        this.context.fillStyle = this.fillColor;
        this.context.strokeStyle = this.strokeColor;
        this.context.lineTo(point[0], point[1]);
      });

    this.context.closePath();
    this.context.fill();
    this.context.stroke();
  }

  protected _getName(): string {
    return GenericPath.NAME;
  }

  protected _onInit() {
    this.isActive = false;
  }
}
