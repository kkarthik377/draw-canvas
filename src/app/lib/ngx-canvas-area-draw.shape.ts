import {ElementRef, EventEmitter, Renderer2} from "@angular/core";
import {dotLineLength} from "./ngx-canvas-area-draw.functions";

export class Shape {
  canvas: any;
  context: any;
  points: Array<Array<number>>;
  isActive: boolean;
  movePoint: EventEmitter<void> = new EventEmitter();
  moveShape: EventEmitter<void> = new EventEmitter();

  private _activePointPos: number;
  private _moveShapeStartPoint: any;

  constructor(private renderer: Renderer2,
        private parent: ElementRef,
        points: Array<Array<number>>,
        public strokeColor: string,
        public fillColor: string,
        public handleFillColor: string,
        public handleStrokeColor: string) {
    this.points = points;
    this.isActive = true;

    this.canvas = this.renderer.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.renderer.appendChild(this.parent.nativeElement, this.canvas);
    this._draw();
  }

  activeMovePoint(): any {
    return this.movePoint;
  }

  activeMoveShape(): any {
    return this.moveShape;
  }

  onMousedown(event: any, mousePos: any): string {
    const distances = this._getDistances(mousePos);
    if (distances.minDis < 6 && distances.minDisIndex >= 0) {
      // move existing node
      this._activePointPos = distances.minDisIndex;
      this.movePoint.emit();
      return 'move node'
    } else {
      const states = this._isCloseAndInsertion(mousePos);
      if (this.context.isPointInPath(mousePos.x, mousePos.y) && !states.isClose) {
        // move current shape
        this._moveShapeStartPoint = {
          x: mousePos.x,
          y: mousePos.y
        };
        this.moveShape.emit();
        return 'move shape';
      } else if (states.isClose && event.which === 1) {
        // create and move new node
        this.points.splice(states.insertAt, 0, [mousePos.x, mousePos.y]);
        this._activePointPos = states.insertAt;
        this.movePoint.emit();
        this._draw();
        return 'create node';
      }
    }
    return null;
  }

  onMouseup(event: any, mousePos: any): string {
    const distances = this._getDistances(mousePos);
    if (distances.minDis < 6 && distances.minDisIndex >= 0) {
      if (event.which === 3 && this.points.length > 3) {
        // delete node
        this.points.splice(distances.minDisIndex, 1);
        this._activePointPos = null;
        this._draw();
        return 'delete node'
      }
    } else {
      const states = this._isCloseAndInsertion(mousePos);
      if (event.which === 3 && this.context.isPointInPath(mousePos.x, mousePos.y) && !states.isClose) {
        // delete shape
        this.context.canvas.width = this.context.canvas.width;
        return 'delete shape';
      }
    }
    this._activePointPos = null;
    return null;
  }

  onMovePoint(event: any, mousePos: any): void {
    if (typeof (this._activePointPos) === 'number' && this.points.length > this._activePointPos) {
      this.points[this._activePointPos][0] = mousePos.x;
      this.points[this._activePointPos][1] = mousePos.y;
      this._draw();
    }
  }

  onMoveShape(event: any, mousePos: any): void {
    const mouseCurrentPos = {
      x: mousePos.x,
      y: mousePos.y
    };
    for (let i = 0; i < this.points.length; i++) {
      if (this.points[i]) {
        this.points[i][0] = (mouseCurrentPos.x - this._moveShapeStartPoint.x) + this.points[i][0];
        this.points[i][1] = (mouseCurrentPos.y - this._moveShapeStartPoint.y) + this.points[i][1];
      }
    }
    this._moveShapeStartPoint = mouseCurrentPos;
    this._draw();
  }

  setColors(strokeColor: string, fillColor: string, handleFillColor: string, handleStrokeColor: string): void {
    if (strokeColor) {
      this.strokeColor = strokeColor;
    }
    if (fillColor) {
      this.fillColor = fillColor;
    }
    if (handleFillColor) {
      this.handleFillColor = handleFillColor;
    }
    if (handleStrokeColor) {
      this.handleStrokeColor = handleStrokeColor;
    }

    this._draw();
  }

  setActive(isActive: boolean = true): void {
    this.isActive = isActive;
    this._draw();
  }

  private _draw(): void {
    this.context.canvas.width = this.context.canvas.width;
    this.context.globalCompositeOperation = 'destination-over';
    this.context.lineWidth = 1;

    this.context.beginPath();
    for (let i = 0; i < this.points.length; ++i) {
      if (this.points[i]) {
        if (this.isActive) {
          this.context.fillStyle = this.handleFillColor;
          this.context.strokeStyle = this.handleStrokeColor;
          this.context.fillRect(this.points[i][0] - 3, this.points[i][1] - 3, 6, 6);
          this.context.strokeRect(this.points[i][0] - 3, this.points[i][1] - 3, 6, 6);
        }
        this.context.fillStyle = this.fillColor;
        this.context.strokeStyle = this.strokeColor;
        this.context.lineTo(this.points[i][0], this.points[i][1]);
      }
    }
    this.context.closePath();
    this.context.fill();
    this.context.stroke();
  }

  private _getDistances(mousePos: any): any {
    let dis,
      minDis: number = 0,
      minDisIndex: number = -1;

    for (let i = 0; i < this.points.length; ++i) {
      if (this.points[i]) {
        dis = Math.sqrt(
          Math.pow(mousePos.x - this.points[i][0], 2) + Math.pow(mousePos.y - this.points[i][1], 2)
        );
        if (minDisIndex === -1 || minDis > dis) {
          minDis = dis;
          minDisIndex = i;
        }
      }
    }
    return {
      minDis: minDis,
      minDisIndex: minDisIndex,
    };
  }

  private _isCloseAndInsertion(mousePos: any): any {
    let lineDis,
      isClose: boolean = false,
      insertAt: number = this.points.length;

    for (let i = 0; i < this.points.length; ++i) {
      if (this.points[i]) {
        if (i >= 1) {
          lineDis = dotLineLength(
            mousePos.x, mousePos.y,
            this.points[i][0], this.points[i][1],
            this.points[i - 1][0], this.points[i - 1][1]
          );
          if (lineDis < 6) {
            insertAt = i;
          }
        } else {
          lineDis = dotLineLength(
            mousePos.x, mousePos.y,
            this.points[this.points.length - 1][0], this.points[this.points.length - 1][1],
            this.points[0][0], this.points[0][1]
          );
        }

        if (lineDis < 6) {
          isClose = true;
          break;
        }
      }
    }
    return {
      isClose: isClose,
      insertAt: insertAt,
    };
  }
}
