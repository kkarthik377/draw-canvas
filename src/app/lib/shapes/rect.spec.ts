import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ElementRef, Renderer2, Type } from '@angular/core';

import { configureTestSuite } from 'ng-bullet';

import { Rect } from './rect';

@Component({
  selector: 'app-mock',
  template: ''
})
export class MockComponent {
  constructor(private renderer: Renderer2) {
  }
}

describe('Rect', () => {
  let fixture: ComponentFixture<MockComponent>;
  let rect: Rect;
  let renderer: Renderer2;
  let element: ElementRef<HTMLDivElement>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [MockComponent]
    }).compileComponents();
  });


  beforeEach(() => {
    fixture = TestBed.createComponent(MockComponent);
    renderer = fixture.componentRef.injector.get<Renderer2>(Renderer2 as Type<Renderer2>);

    element = new ElementRef<HTMLDivElement>(
      renderer.createElement('div')
    );
    rect = new Rect(
      renderer,
      element,
      'red',
      'green',
      'blue',
      'white',
      [],
      null,
      true
    );
  });

  it('should create', () => {
    expect(rect).toBeTruthy();
    expect(rect.isActive).toBeFalsy();
    expect(rect.points).toEqual([
      [30, 30],
      [70, 30],
      [70, 70],
      [30, 70],
    ])
  });

  it('should update the colors and update the rect', () => {
    jest.spyOn(rect, 'draw');

    rect.setColors({
      fillColor: 'black',
      handlerFillColor: 'black',
      strokeColor: 'black',
      handlerStrokeColor: 'black'
    });

    expect(rect.draw).toHaveBeenCalled();
  });

  it('should get rect data', () => {
    expect(rect.getData()).toEqual({
      name: 'RECT',
      points: rect.points,
      forcedAspectRatio: null
    });
  });

  it('should start resizing the rect', () => {
    jest.spyOn(rect.resizingPath, 'emit');

    const event = new MouseEvent('mousedown', {
      button: 0
    });

    rect.onMousedown(event, {
      x: rect.xToPx(70),
      y: rect.yToPx(30)
    });

    expect(rect.resizingPath.emit).toHaveBeenCalled();
  });


  it('should start moving the rect', () => {
    jest.spyOn(rect.movingPath, 'emit');
    jest.spyOn(rect.context, 'isPointInPath').mockReturnValue(true);

    const event = new MouseEvent('mousedown', {
      button: 0
    });

    rect.onMousedown(event, {
      x: rect.xToPx(50),
      y: rect.yToPx(50)
    });

    expect(rect.movingPath.emit).toHaveBeenCalled();
  });

  it('should move rect', () => {
    jest.spyOn(rect.movingPath, 'emit');
    jest.spyOn(rect.context, 'isPointInPath').mockReturnValue(true);

    const event = new MouseEvent('mousedown', {
      button: 0
    });

    expect(rect.points[0]).toEqual([30, 30]);

    rect.onMousedown(event, {
      x: rect.xToPx(50),
      y: rect.yToPx(50)
    });

    rect.onMovePath(event, {
      x: rect.xToPx(55),
      y: rect.yToPx(55)
    });

    expect(rect.points[0]).not.toEqual([30, 30]);
    expect(rect.movingPath.emit).toHaveBeenCalled();
  });

  it('should not delete any node', () => {
    jest.spyOn(rect.movingPath, 'emit');

    const event = new MouseEvent('mouseup', {
      button: 1
    });

    expect(rect.points.length).toBe(4);

    const action = rect.onMouseup(
      event,
      {
        x: rect.xToPx(30),
        y: rect.yToPx(30)
      },
      true
    );

    expect(action).toEqual('delete node');
    expect(rect.points.length).toBe(4);
  });

  it('should delete the rect', () => {
    jest.spyOn(rect.movingPath, 'emit');
    jest.spyOn(rect.context, 'isPointInPath').mockReturnValue(true);

    const event = new MouseEvent('mouseup', {
      button: 1
    });

    const action = rect.onMouseup(
      event,
      {
        x: rect.xToPx(50),
        y: rect.yToPx(50)
      },
      true
    );

    expect(action).toEqual('delete path');
  });

  it('should convert X value to PX', () => {
    rect.canvas.width = 500;
    const value = rect.xToPx(50);
    expect(value).toBe(250);
  });

  it('should convert X value to Percent', () => {
    rect.canvas.width = 500;
    const value = rect.xToPercent(250);
    expect(value).toBe(50);
  });

  it('should convert Y value to PX', () => {
    rect.canvas.height = 500;
    const value = rect.yToPx(50);
    expect(value).toBe(250);
  });

  it('should convert Y value to Percent', () => {
    rect.canvas.height = 500;
    const value = rect.yToPercent(250);
    expect(value).toBe(50);
  });

  it('should convert position to Percent', () => {
    rect.canvas.width = 500;
    rect.canvas.height = 500;
    const value = rect.getPositionInPercent({
      x: 250,
      y: 250
    });
    expect(value).toEqual({
      x: 50,
      y: 50
    });
  });

  it('should convert point to PX', () => {
    rect.canvas.width = 500;
    rect.canvas.height = 500;
    const value = rect.getPointInPx([50, 50]);
    expect(value).toEqual([250, 250]);
  });

  it('should get rect boundaries', () => {
    const value = rect.getBoundaries(false);
    expect(value).toEqual({
      minX: 30,
      maxX: 70,
      minY: 30,
      maxY: 70
    });
  });

  it('should get rect width', () => {
    const value = rect.getWidth();
    expect(value).toEqual(
      rect.xToPx(40)
    );
  });

  it('should get rect height', () => {
    const value = rect.getHeight();
    expect(value).toEqual(
      rect.yToPx(40)
    );
  });
});
