import { ElementRef, EventEmitter, Renderer2 } from '@angular/core';

import { MousePosition } from '../models';
import { BaseShape } from './base-shape';

export class Pencil extends BaseShape {
  static NAME = 'PENCIL';

  completed: EventEmitter<void> = new EventEmitter();

  private _isCompleted: boolean;
  private _isAddCiclePoint: boolean = false;

  constructor(
    protected renderer: Renderer2,
    protected parent: ElementRef,
    protected fillColor: string,
    protected strokeColor: string,
    protected handlerFillColor: string,
    protected handlerStrokeColor: string,
    points?: number[][],
    id?: number
  ) {
    super(
      renderer,
      parent,
      fillColor,
      strokeColor,
      handlerFillColor,
      handlerStrokeColor,
      points,
      id
    );
    this._onInit();
  }

  reset(): void {
    this.points = [];
    this._activePointPos = 0;
    this._isCompleted = false;
    this._isAddCiclePoint = false;
    this.renderer.setStyle(
      this.canvas,
      'display',
      'none'
    );
    this.context.canvas.width = this.context.canvas.width;
  }

  onMouseup(event: MouseEvent, mousePos: MousePosition): string {
    if (!this._isCompleted && !this._isAddCiclePoint) {
      if (event.button === 0) {
        this._addPoint(mousePos);
      } else {
        this._removeLastPoint();
      }
      this.draw();
      return null;
    } else if (this._isAddCiclePoint) {
      mousePos = this.getPositionInPercent(mousePos);
      this.points = [
        [mousePos.x, mousePos.y],
      ];
      this.drawCircle();
    }
  }

  onMovePoint(event: MouseEvent, mousePos: MousePosition): void {
    if (!this._isCompleted && typeof (this._activePointPos) === 'number') {
      mousePos = this.getPositionInPercent(mousePos);
      this.points[this._activePointPos] = [mousePos.x, mousePos.y];
      if (!this._isAddCiclePoint) {
        this.draw();
      }
    }
  }

  draw(): void {
    if (!this._isAddCiclePoint) {
      this.context.canvas.width = this.context.canvas.width;
      this.context.globalCompositeOperation = 'destination-over';
      this.context.lineWidth = 1;
      this.context.beginPath();
      this.points
        .filter((point: number[]) => point && point.length > 0)
        .forEach((point: number[]) => {
          point = this.getPointInPx(point);
          this._drawPoint(point);
          this.context.strokeStyle = this.strokeColor;
          this.context.lineTo(point[0], point[1]);
        });
      if (this._isCompleted) {
        this.context.closePath();
        this.completed.emit();
      }
      this.context.stroke();
    } else {
      this.drawCircle();
    }
  }

  drawCircle(): void {
    this.context.canvas.width = this.context.canvas.width;
    this.context.globalCompositeOperation = 'destination-over';
    this.context.lineWidth = 1;
    this.context.beginPath();
    const point: number[] = this.getPointInPx(this.points[0]);
    this.context.arc(point[0], point[1], 10, 0, 2 * Math.PI);
    this.context.fillStyle = this.fillColor;
    this.context.strokeStyle = this.strokeColor;
    this.context.fill();
    this.context.closePath();
    this._isCompleted = true;
    this.completed.emit();
    this.context.stroke();
    this._isAddCiclePoint = false;
  }

  protected _onInit() {
    this._activePointPos = this.points.length;
    this._isCompleted = false;
    this.renderer.setStyle(
      this.canvas,
      'display',
      'none'
    );
  }

  protected _getName(): string {
    return Pencil.NAME;
  }

  private _addPoint(mousePos: MousePosition) {
    const distances = this._getDistances(mousePos);

    if (distances.minDistance < BaseShape.CLOSE_LIMIT && distances.minDistanceIndex === 0 && this.points.length > 3) {
      this._closeShape();
    } else if (distances.minDistance >= BaseShape.CLOSE_LIMIT || this.points.length === 1) {
      this._activePointPos += 1;
    }
  }

  private _closeShape() {
    this.points.splice(this.points.length - 1, 1);
    this._activePointPos -= 1;
    this._isCompleted = true;
  }

  private _removeLastPoint() {
    this.points.splice(this.points.length - 2, 1);
    this._activePointPos -= 1;

    if (this._activePointPos === -1) {
      this.completed.emit();
    }
  }

  public addCirclePoint(): void {
    this._isAddCiclePoint = true;
  }
}
