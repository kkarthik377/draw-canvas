import { ElementRef, EventEmitter, Renderer2 } from '@angular/core';

import { CloseStatus, MinimumDistance, MousePosition, PathData, Boundaries } from '../models';
import { calcPointSegmentDistance } from './utils';
import { BaseShape } from './base-shape';

export abstract class BasePath extends BaseShape {
  forcedAspectRatio: number;
  allowAddNewPoints: boolean;
  allowModifyPoints: boolean;
  keepInsideContainer: boolean;
  movingPoint: EventEmitter<number> = new EventEmitter();
  movingPath: EventEmitter<void> = new EventEmitter();
  resizingPath: EventEmitter<void> = new EventEmitter();

  protected _movePathStartPoint: MousePosition;

  protected constructor(
    protected renderer: Renderer2,
    protected parent: ElementRef,
    protected fillColor: string,
    protected strokeColor: string,
    protected handlerFillColor: string,
    protected handlerStrokeColor: string,
    id: number,
    points: number[][],
    forcedAspectRatio: number,
    keepInsideContainer: boolean,
    allowAddNewPoints: boolean,
    allowModifyPoints: boolean
  ) {
    super(
      renderer,
      parent,
      fillColor,
      strokeColor,
      handlerFillColor,
      handlerStrokeColor,
      points
    );
    this.keepInsideContainer = keepInsideContainer;
    this.forcedAspectRatio = forcedAspectRatio;
    this.allowAddNewPoints = allowAddNewPoints;
    this.allowModifyPoints = allowModifyPoints;

    this._onInit();
  }

  protected _isActive: boolean;

  get isActive(): boolean {
    return this._isActive;
  }

  set isActive(isActive: boolean) {
    this._isActive = isActive;
    setTimeout(() => {
      this.draw();
    }, 1);
  }

  public abstract onMousedown(event: MouseEvent, mousePos: MousePosition): void;

  public abstract onResizePath(event: MouseEvent, mousePos: MousePosition): void;

  getData(): PathData {
    return {
      name: this._getName(),
      points: this.points,
      forcedAspectRatio: this.forcedAspectRatio
    };
  }

  onMovePoint(event: MouseEvent, mousePos: MousePosition): void {
    if (typeof (this._activePointPos) === 'number' && this.points.length > this._activePointPos) {
      mousePos = this.getPositionInPercent(mousePos);
      this.points[this._activePointPos][0] = mousePos.x;
      this.points[this._activePointPos][1] = mousePos.y;
      this.draw();
    }
  }

  onMovePath(event: MouseEvent, mousePos: MousePosition): void {
    mousePos = this.getPositionInPercent(mousePos);

    if (this.keepInsideContainer && !this._isPositionInsideContainer(mousePos)) {
      return;
    }

    this.points
      .filter((point: number[]) => point && point.length > 0)
      .forEach((point: number[]) => {
        point[0] = mousePos.x - this._movePathStartPoint.x + point[0];
        point[1] = mousePos.y - this._movePathStartPoint.y + point[1];
      });

    this._movePathStartPoint = { ...mousePos };
    this.draw();
  }

  protected _isPositionInsideContainer(mousePos: MousePosition): boolean {
    const boundaries: Boundaries = this.getBoundaries(false);

    const minX: number = mousePos.x - this._movePathStartPoint.x + boundaries.minX;
    const minY: number = mousePos.y - this._movePathStartPoint.y + boundaries.minY;
    const maxX: number = mousePos.x - this._movePathStartPoint.x + boundaries.maxX;
    const maxY: number = mousePos.y - this._movePathStartPoint.y + boundaries.maxY;

    return (
      minX >= 0
      && minY >= 0
      && maxX <= 100
      && maxY <= 100
    );
  }

  protected _deleteNode(index: number): void {
    if (this.allowModifyPoints) {
      this.points.splice(index, 1);
      this._activePointPos = null;
      this.draw();
    }
  }

  protected _addPoint(insertAt: number, mousePos: MousePosition): void {
    if (this.allowModifyPoints && this.allowAddNewPoints) {
      mousePos = this.getPositionInPercent(mousePos);
      this.points.splice(
        insertAt,
        0,
        [mousePos.x, mousePos.y]
      );
      this._activePointPos = insertAt;
      this.movingPoint.emit(insertAt);
      this.draw();
    }
  }

  protected _startResizingPath(index: number): void {
    this._activePointPos = index;
    this.resizingPath.emit();
  }

  protected _startMovingPath(mousePos: MousePosition): void {
    this._movePathStartPoint = this.getPositionInPercent(mousePos);
    this.movingPath.emit();
  }

  protected _startMovingPointInIndex(index: number): void {
    this._activePointPos = index;
    this.movingPoint.emit(index);
  }

  protected _shouldStartReizingPath(distances: MinimumDistance): boolean {
    return (
      distances.minDistance < BaseShape.CLOSE_LIMIT
      && distances.minDistanceIndex === 1
    );
  }

  protected _shouldStartMovingPoint(distances: MinimumDistance): boolean {
    return (
      this.allowModifyPoints
      && distances.minDistance < BaseShape.CLOSE_LIMIT
      && distances.minDistanceIndex >= 0
    );
  }

  protected _shouldStartMovingPath(mousePos: MousePosition, distances: MinimumDistance, states: CloseStatus): boolean {
    return (
      (
        this.context.isPointInPath(mousePos.x, mousePos.y)
        && (
          !states.isClose
          || !(this.allowAddNewPoints && this.allowModifyPoints)
        )
      )
      || (
        distances.minDistance < BaseShape.CLOSE_LIMIT
        && distances.minDistanceIndex >= 0
      )
    );
  }

  protected _getCloseStatus(mousePos: MousePosition): CloseStatus {
    let lineDis ;
    let isClose: boolean = false;
    let insertAt: number = this.points.length;
    const closeLimit: number = this.pxToPercent(BaseShape.CLOSE_LIMIT);
    mousePos = this.getPositionInPercent(mousePos);

    for (let i: number = 0; i < this.points.length; ++i) {
      if (this.points[i]) {
        if (i >= 1) {
          lineDis = calcPointSegmentDistance(
            mousePos.x, mousePos.y,
            this.points[i][0], this.points[i][1],
            this.points[i - 1][0], this.points[i - 1][1]
          );
          if (lineDis < closeLimit) {
            insertAt = i;
          }
        } else {
          lineDis = calcPointSegmentDistance(
            mousePos.x, mousePos.y,
            this.points[this.points.length - 1][0], this.points[this.points.length - 1][1],
            this.points[0][0], this.points[0][1]
          );
        }

        if (lineDis < closeLimit) {
          isClose = true;
          break;
        }
      }
    }

    return {
      isClose,
      insertAt
    };
  }
}
