import {
  Directive, ElementRef, Input, Renderer2, NgZone, Output, EventEmitter, AfterViewInit, OnDestroy
} from '@angular/core';
import { Shape } from './ngx-canvas-area-draw.shape';
import { Pencil } from './ngx-canvas-area-draw.pencil';
import { Subscription } from 'rxjs';


@Directive({
  selector: '[canvasAreaDraw]',
  exportAs: 'canvasAreaDraw'
})
export class CanvasAreaDraw implements AfterViewInit, OnDestroy {
  @Output() activeShapeChangeEvent: EventEmitter<any> = new EventEmitter();
  @Output() addShapeEvent: EventEmitter<void> = new EventEmitter();
  @Output() removeShapeEvent: EventEmitter<number> = new EventEmitter();

  @Input() defaultShapes: Array<Array<Array<number>>>;
  @Input() eventWhileMoving: boolean;

  @Input('canvasAreaDraw')
  set imageUrl(url: string) {
    if (this.isReady) {
      this.isReady = false;
      this.isDrawing = false;
      this.height = null;
      this.width = null;

      this._MousedownListen();
      this._MouseupListen();
      this._MouseLeaveListen();
      this._MousemoveListen();
      this._ContextmenuListen();
      this._deleteAllShapesSubscriptions();

      if (this._baseCanvas) {
        this.renderer.removeChild(this.element.nativeElement, this._baseCanvas);
      }
      if (this._pencil) {
        this.renderer.removeChild(this.element.nativeElement, this._pencil.canvas);
      }
      for (let i = 0; i < this.shapes.length; ++i) {
        this.renderer.removeChild(this.element.nativeElement, this.shapes[i].canvas);
      }
      this._baseCanvas = null;
      this._pencil = null;
      this.shapes = [];
      this._activeShapePos = null;
      this._imageUrl = url;

      if (url) {
        this.ngZone.runOutsideAngular(() => this._paint());
      } else {
        this._ImageLoadListen();
        if (this._baseImage) {
          this.renderer.removeChild(this.element.nativeElement, this._baseImage);
        }
        this.isReady = true;
        this._baseImage = null;
      }
    } else if (url) {
      this._imageUrl = url;
    }
  }

  get imageUrl(): string {
    return this._imageUrl;
  }

  @Input('strokeColor')
  set strokeColor(color: string) {
    if (color && this._strokeColor) {
      for (let i = 0; i < this.shapes.length; ++i) {
        this.shapes[i].setColors(color, null, null, null);
      }
      if (this._pencil) {
        this._pencil.setColors(color, null, null);
      }
    }
    this._strokeColor = color;
  }

  get strokeColor(): string {
    return this._strokeColor;
  }

  @Input('fillColor')
  set fillColor(color: string) {
    if (color && this._fillColor) {
      for (let i = 0; i < this.shapes.length; ++i) {
        this.shapes[i].setColors(null, color, null, null)
      }
    }
    this._fillColor = color;
  }

  get fillColor(): string {
    return this._fillColor;
  }

  @Input('handleStrokeColor')
  set handleStrokeColor(color: string) {
    if (color && this._handleStrokeColor) {
      for (let i = 0; i < this.shapes.length; ++i) {
        this.shapes[i].setColors(null, null, null, color)
      }
      if (this._pencil) {
        this._pencil.setColors(null, null, color)
      }
    }
    this._handleStrokeColor = color;
  }

  get handleStrokeColor(): string {
    return this._handleStrokeColor;
  }


  @Input('handleFillColor')
  set handleFillColor(color: string) {
    if (color && this._handleFillColor) {
      for (let i = 0; i < this.shapes.length; ++i) {
        this.shapes[i].setColors(null, null, color, null)
      }
      if (this._pencil) {
        this._pencil.setColors(null, color, null)
      }
    }
    this._handleFillColor = color;
  }

  get handleFillColor(): string {
    return this._handleFillColor;
  }

  shapes: Array<Shape>;
  height: string;
  width: string;
  isReady: boolean;
  isDrawing: boolean;

  private _pencil: Pencil;
  private _activeShapePos: number;
  private _baseCanvas: any;
  private _baseImage: any;
  private _imageUrl: string;
  private _strokeColor: string;
  private _fillColor: string;
  private _handleFillColor: string;
  private _handleStrokeColor: string;
  private _pencilSubscription: Subscription;
  private _shapesSubscription: Array<Array<Subscription>>;

  constructor(private  element: ElementRef,
        private renderer: Renderer2,
        private ngZone: NgZone) {
    this.shapes = [];
    this._shapesSubscription = [];
    this.defaultShapes = [];
    this.isReady = false;
    this.strokeColor = 'rgba(255, 255, 255, 0.7)';
    this.fillColor = 'rgba(255, 255, 255, 0.2)';
    this.handleFillColor = 'rgba(255, 255, 255, 1)';
    this.handleStrokeColor = 'rgba(255, 255, 255, 1)';

    this.renderer.setStyle(this.element.nativeElement, 'position', 'relative');
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => this._paint());
  }

  ngOnDestroy(): void {
    this._MousedownListen();
    this._MouseupListen();
    this._MouseLeaveListen();
    this._MousemoveListen();
    this._ContextmenuListen();
    this._ImageLoadListen();
    this._ImageErrorListen();

    this._deleteAllShapesSubscriptions();
    if (this._pencilSubscription) {
      this._pencilSubscription.unsubscribe();
    }
  }

  private _paint(): void {
    this._baseCanvas = this.renderer.createElement('canvas');

    if (!this._baseImage) {
      this._baseImage = this.renderer.createElement('img');
      this.renderer.setAttribute(this._baseImage, 'crossOrigin', 'Anonymous');
      this._setStyle(this._baseImage, '1');

      this._ImageLoadListen = this.renderer.listen(this._baseImage, 'load', (event: any) => {
        this.height = this._baseImage.height.toString();
        this.width = this._baseImage.width.toString();

        this._pencil = new Pencil(this.renderer, this.element, this.strokeColor, this.handleFillColor, this.handleStrokeColor);
        this._setStyle(this._pencil.canvas, '0');
        this._setStyle(this._baseCanvas, '3');

        if (this.defaultShapes.length > 0) {
          for (const shape of this.defaultShapes) {
            this.addShape(shape, false);
          }
          this.defaultShapes = [];
        }

        this.isReady = true;
      });

      this._ImageErrorListen = this.renderer.listen(this._baseImage, 'error', (event: any) => {
        this.isReady = true;
      });

      this.renderer.appendChild(this.element.nativeElement, this._baseImage);
    }
    this.renderer.setAttribute(this._baseImage, 'src', this.imageUrl);
    this.renderer.appendChild(this.element.nativeElement, this._baseCanvas);

    this._MouseLeaveListen = this.renderer.listen(this._baseCanvas, 'mouseleave', this._onMouseleave.bind(this));
    this._MousedownListen = this.renderer.listen(this._baseCanvas, 'mousedown', this._onMousedown.bind(this));
    this._MouseupListen = this.renderer.listen(this._baseCanvas, 'mouseup', this._onMouseup.bind(this));
    this._ContextmenuListen = this.renderer.listen(this._baseCanvas, 'contextmenu', this._onContextmenu.bind(this));
  }

  getImageIn(pos: number = null): string {
    if (typeof (pos) !== 'number') {
      pos = this._activeShapePos;
    }
    if (typeof (pos) === 'number' && this.shapes.length > pos) {
      const canvas = this.renderer.createElement('canvas');
      const context = canvas.getContext('2d');

      let minX = 1000000;
      let maxX = 0;
      let minY = 1000000;
      let maxY = 0;

      const shape = this.shapes[pos];
      for (let i = 0; i < shape.points.length; ++i) {
        if (minX > shape.points[i][0]) {
          minX = shape.points[i][0];
        }
        if (minY > shape.points[i][1]) {
          minY = shape.points[i][1];
        }
        if (maxX < shape.points[i][0]) {
          maxX = shape.points[i][0];
        }
        if (maxY < shape.points[i][1]) {
          maxY = shape.points[i][1];
        }
      }

      canvas.width = maxX - minX;
      canvas.height = maxY - minY;
      for (let i = 0; i < shape.points.length; ++i) {
        if (shape.points[i]) {
          context.lineTo(shape.points[i][0] - minX, shape.points[i][1] - minY);
        }
      }
      context.closePath();
      context.clip();
      context.drawImage(this._baseImage, -minX, -minY, this.width, this.height);
      return canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    }
    return null;
  }

  startPaint(): void {
    if (this.isReady && !this.isDrawing) {
      if (typeof (this._activeShapePos) === 'number') {
        this.shapes[this._activeShapePos].setActive(false);
        this.setActiveShapePos(null);
      }
      this.isDrawing = true;
      this.renderer.setStyle(this._pencil.canvas, 'display', 'block');
      this.renderer.setStyle(this._pencil.canvas, 'z-index', this.shapes.length + 2);
      this.renderer.setStyle(this._baseCanvas, 'z-index', this.shapes.length + 3);
      this.renderer.setStyle(this._baseCanvas, 'cursor', 'copy');

      this._pencilSubscription = this._pencil.onCompleted().subscribe(() => {
        this._stopPaint();
      });
      this._MousemoveListen = this.renderer.listen(this._baseCanvas, 'mousemove', this._onMovePoint.bind(this));
    }
  }

  addShape(points: Array<Array<any>> = [], emit: boolean = true): void {
    const shape: Shape = new Shape(this.renderer,
     this.element, points, this.strokeColor, this.fillColor, this.handleFillColor, this.handleStrokeColor);
    this._setStyle(shape.canvas, (this.shapes.length + 2).toString());
    this.renderer.setStyle(this._baseCanvas, 'z-index', this.shapes.length + 3);

    const subscription1 = shape.activeMovePoint().subscribe(() => {
      this._MousemoveListen = this.renderer.listen(this._baseCanvas, 'mousemove', this._onMovePoint.bind(this));
    });
    const subscription2 = shape.activeMoveShape().subscribe(() => {
      this._MousemoveListen = this.renderer.listen(this._baseCanvas, 'mousemove', this._onMoveShape.bind(this));
    });

    for (let p = 0; p < this.shapes.length; ++p) {
      if (this.shapes[p].isActive) {
        this.shapes[p].setActive(false);
      }
    }

    this.shapes.push(shape);
    this._shapesSubscription.push([subscription1, subscription2]);
    if (emit) {
      this.addShapeEvent.emit();
    }
    this.setActiveShapePos(this.shapes.length - 1);
    shape.setActive();
  }

  setActiveShapePos(value: any): void {
    this._activeShapePos = value;
    this.activeShapeChangeEvent.emit(value);
  }

  private _stopPaint(): void {
    if (this._pencilSubscription) {
      this._pencilSubscription.unsubscribe();
    }
    if (this.isDrawing) {
      this._MousemoveListen();
      this.isDrawing = false;
      const points = this._pencil.points.filter(x => x);
      this.renderer.setStyle(this._baseCanvas, 'cursor', 'default');
      this._pencil.reset();
      if (points) {
        this.addShape(points);
      }
    }
  }

  private _onMouseleave(event: any): boolean {
    if (typeof (this._activeShapePos) === 'number') {
      this.shapes[this._activeShapePos].setActive(false);
      this.setActiveShapePos(null);
    }
    if (!this.isDrawing) {
      this._MousemoveListen();
      this.renderer.setStyle(this._baseCanvas, 'cursor', 'default');
    }
    return false;
  }

  private _onMousedown(event: any): boolean {
    event.preventDefault();
    if (event.which === 1) {
      const mousePos = this._getMousePos(event);
      if (!this.isDrawing) {
        if (this.shapes.length > 0) {
          for (let p = this.shapes.length - 1; p >= 0; --p) {
            if (this.shapes[p].context.isPointInPath(mousePos.x, mousePos.y)) {
              if (p !== this._activeShapePos) {
                if (typeof (this._activeShapePos) === 'number') {
                  this.shapes[this._activeShapePos].setActive(false);
                }
                this.setActiveShapePos(p);
                this.shapes[p].setActive();
              }
              break;
            }
          }
          if (typeof (this._activeShapePos) === 'number' && this.shapes.length > this._activeShapePos) {
            this.shapes[this._activeShapePos].onMousedown(event, mousePos);
          }
        }
      } else {
        this.renderer.setStyle(this._baseCanvas, 'cursor', 'move');
      }
    }
    // else if (event.which === 3) {
    // this.renderer.setStyle(this._baseCanvas , 'cursor', 'not-allowed');
    // }
    return false;
  }

  private _onMouseup(event: any): boolean {
    if (event.which === 1 || event.which === 3) {
      const mousePos = this._getMousePos(event);
      if (this.isDrawing) {
        this.renderer.setStyle(this._baseCanvas, 'cursor', 'copy');
        this._pencil.onMouseup(event, mousePos);
      } else {
        this.renderer.setStyle(this._baseCanvas, 'cursor', 'default');
        this._MousemoveListen();
        if (typeof (this._activeShapePos) === 'number' && this.shapes.length > this._activeShapePos) {
          const action = this.shapes[this._activeShapePos].onMouseup(event, mousePos);
          if (action === 'delete shape') {
            this.renderer.removeChild(this.element.nativeElement, this.shapes[this._activeShapePos].canvas);
            this.shapes.splice(this._activeShapePos, 1);
            this._deleteShapeSubscription(this._activeShapePos);
            this.removeShapeEvent.emit(this._activeShapePos);

            if (this.shapes.length > 0) {
              this.setActiveShapePos(this.shapes.length - 1);
              this.shapes[this._activeShapePos].setActive();
            } else {
              this.setActiveShapePos(null);
            }
          } else {
            this.activeShapeChangeEvent.emit(this._activeShapePos);
          }
        }
      }
    }
    return false;
  }

  private _onContextmenu(event: any): boolean {
    event.preventDefault();
    return false;
  }

  private _onMoveShape(event: any): boolean {
    if (typeof (this._activeShapePos) === 'number') {
      const mousePos = this._getMousePos(event);
      if (this.eventWhileMoving) {
        this.activeShapeChangeEvent.emit(this._activeShapePos)
      }
      this.renderer.setStyle(this._baseCanvas, 'cursor', 'move');
      this.shapes[this._activeShapePos].onMoveShape(event, mousePos);
    }
    return false;
  }

  private _onMovePoint(event: any): boolean {
    const mousePos = this._getMousePos(event);
    if (this.isDrawing) {
      this._pencil.onMovePoint(event, mousePos);
    } else if (typeof (this._activeShapePos) === 'number') {
      if (this.eventWhileMoving) {
        this.activeShapeChangeEvent.emit(this._activeShapePos)
      }
      this.renderer.setStyle(this._baseCanvas, 'cursor', 'move');
      this.shapes[this._activeShapePos].onMovePoint(event, mousePos);
    }
    return false;
  };

  private _getMousePos(event): any {
    const rect = this._baseCanvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  private _setStyle(element: any, zIndex: string): void {
    this.renderer.setStyle(element, 'position', 'absolute');
    this.renderer.setStyle(element, 'top', '0');
    this.renderer.setStyle(element, 'left', '0');
    this.renderer.setStyle(element, 'z-index', zIndex);
    if (this.height && this.width) {
      this.renderer.setAttribute(element, 'height', this.height);
      this.renderer.setAttribute(element, 'width', this.width);
    } else {
      this.renderer.setStyle(element, 'height', 'auto');
      this.renderer.setStyle(element, 'width', '100%');
    }
  }

  private _deleteAllShapesSubscriptions(): void {
    for (const subscriptions of this._shapesSubscription) {
      for (const subscription of subscriptions) {
        subscription.unsubscribe();
      }
    }
    this._shapesSubscription = [];
  }

  private _deleteShapeSubscription(pos: number): void {
    for (const subscription of this._shapesSubscription[pos]) {
      subscription.unsubscribe();
    }
    this._shapesSubscription.splice(pos, 1);
  }

  private _MousedownListen(): void {
  }

  private _MouseupListen(): void {
  }

  private _MouseLeaveListen(): void {
  }

  private _MousemoveListen(): void {
  }

  private _ContextmenuListen(): void {
  }

  private _ImageLoadListen(): void {
  }

  private _ImageErrorListen(): void {
  }
}
