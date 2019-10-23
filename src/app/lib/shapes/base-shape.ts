import { ElementRef, Renderer2 } from '@angular/core';

import { Boundaries, Colors, MinimumDistance, MousePosition } from '../models';

export abstract class BaseShape {
  static CLOSE_LIMIT: number = 6;

  points: number[][];
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  protected _activePointPos: number;

  protected constructor(
    protected renderer: Renderer2,
    protected parent: ElementRef,
    protected fillColor: string,
    protected strokeColor: string,
    protected handlerFillColor: string,
    protected handlerStrokeColor: string,
    points: number[][]
  ) {
    this.points = points || [];
    this._initializeCanvas();
  }

  setColors(colors: Colors): void {
    if (colors.fillColor) {
      this.fillColor = colors.fillColor;
    }
    if (colors.strokeColor) {
      this.strokeColor = colors.strokeColor;
    }
    if (colors.handlerFillColor) {
      this.handlerFillColor = colors.handlerFillColor;
    }
    if (colors.handlerStrokeColor) {
      this.handlerStrokeColor = colors.handlerStrokeColor;
    }
    this.draw();
  }

  public abstract draw(): void;

  public abstract onMouseup(event: MouseEvent, mousePos: MousePosition, allowDelete: boolean): string;

  public abstract onMovePoint(event: MouseEvent, mousePos: MousePosition): void;

  getPositionInPercent(mousePos: MousePosition): MousePosition {
    return {
      x: this.xToPercent(mousePos.x),
      y: this.yToPercent(mousePos.y)
    };
  }

  getPointInPx(point: number[]): number[] {
    return [
      this.xToPx(point[0]),
      this.yToPx(point[1])
    ];
  }

  xToPercent(value: number): number {
    return value * 100 / this.canvas.width;
  }

  xToPx(value: number): number {
    return value * this.canvas.width / 100;
  }

  yToPercent(value: number): number {
    return value * 100 / this.canvas.height;
  }

  yToPx(value: number): number {
    return value * this.canvas.height / 100;
  }

  pxToPercent(value: number): number {
    return value * 100 / Math.max(this.canvas.height, this.canvas.width);
  }

  getBoundaries(inPx: boolean = true): Boundaries {
    let minX: number = 100;
    let maxX: number = 0;
    let minY: number = 100;
    let maxY: number = 0;

    this.points
      .filter((point: number[]) => point && point.length > 0)
      .forEach((point: number[]) => {
        if (minX > point[0]) {
          minX = point[0];
        }
        if (minY > point[1]) {
          minY = point[1];
        }
        if (maxX < point[0]) {
          maxX = point[0];
        }
        if (maxY < point[1]) {
          maxY = point[1];
        }
      });

    return inPx
      ? {
        minX: this.xToPx(minX),
        maxX: this.xToPx(maxX),
        minY: this.yToPx(minY),
        maxY: this.yToPx(maxY)
      }
      : {
        minX,
        maxX,
        minY,
        maxY
      };
  }

  getWidth(): number {
    const boundaries: Boundaries = this.getBoundaries();
    return boundaries.maxX - boundaries.minX;
  }

  getHeight(): number {
    const boundaries: Boundaries = this.getBoundaries();
    return boundaries.maxY - boundaries.minY;
  }

  protected abstract _getName(): string;

  protected abstract _onInit(): void;

  protected _drawPoint(point: number[]): void {
    this.context.fillStyle = this.handlerFillColor;
    this.context.strokeStyle = this.handlerStrokeColor;
    this.context.fillRect(point[0] - 3, point[1] - 3, 6, 6);
    this.context.strokeRect(point[0] - 3, point[1] - 3, 6, 6);
  }

  protected _drawExpander(point: number[]): void {
    this.context.beginPath();
    this.context.fillStyle = this.handlerFillColor;
    this.context.strokeStyle = this.handlerStrokeColor;

    this.context.lineTo(point[0], point[1] - 5);
    this.context.lineTo(point[0] - 5, point[1]);
    this.context.lineTo(point[0], point[1] + 5);
    this.context.lineTo(point[0] + 5, point[1]);

    this.context.closePath();
    this.context.fill();
    this.context.stroke();
  }

  protected _getDistances(mousePos: MousePosition): MinimumDistance {
    let distanceFromMouse: number;
    let minDistance: number = 0;
    let minDistanceIndex: number = -1;

    for (let i: number = 0; i < this.points.length - 1; ++i) {
      if (this.points[i]) {
        const point: number[] = this.getPointInPx(this.points[i]);
        distanceFromMouse = Math.sqrt(
          Math.pow(mousePos.x - point[0], 2) + Math.pow(mousePos.y - point[1], 2)
        );
        if (minDistanceIndex === -1 || minDistance > distanceFromMouse) {
          minDistance = distanceFromMouse;
          minDistanceIndex = i;
        }
      }
    }

    return {
      minDistance,
      minDistanceIndex
    };
  }

  private _initializeCanvas(): void {
    this.canvas = this.renderer.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.renderer.appendChild(
      this.parent.nativeElement,
      this.canvas
    );
  }
}
