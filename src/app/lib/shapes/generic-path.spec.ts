import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ElementRef, Renderer2, Type } from '@angular/core';

import { configureTestSuite } from 'ng-bullet';

import { GenericPath } from './generic-path';

@Component({
  selector: 'app-mock',
  template: ''
})
export class MockComponent {
  constructor(private renderer: Renderer2) {
  }
}

describe('GenericPath', () => {
  let fixture: ComponentFixture<MockComponent>;
  let path: GenericPath;
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
    path = new GenericPath(
      renderer,
      element,
      'red',
      'green',
      'blue',
      'white',
      [[0, 0], [90, 0], [90, 90], [0, 90]],
      1,
      true
    );
  });

  it('should create', () => {
    expect(path).toBeTruthy();
    expect(path.isActive).toBeFalsy();
  });

  it('should update the colors and update the path', () => {
    jest.spyOn(path, 'draw');

    path.setColors({
      fillColor: 'black',
      handlerFillColor: 'black',
      strokeColor: 'black',
      handlerStrokeColor: 'black'
    });

    expect(path.draw).toHaveBeenCalled();
  });

  it('should get path data', () => {
    expect(path.getData()).toEqual({
      name: 'GENERIC_PATH',
      points: path.points,
      forcedAspectRatio: 1
    });
  });

  it('should start moving the first point', () => {
    jest.spyOn(path.movingPoint, 'emit');

    const event = new MouseEvent('mousedown', {
      button: 0
    });

    path.onMousedown(event, {
      x: 0,
      y: 0
    });

    expect(path.movingPoint.emit).toHaveBeenCalledWith(0);
  });

  it('should start moving the first point if the click was within 6px of distance', () => {
    jest.spyOn(path.movingPoint, 'emit');

    const event = new MouseEvent('mousedown', {
      button: 0
    });

    path.onMousedown(event, {
      x: 5,
      y: 0
    });

    expect(path.movingPoint.emit).toHaveBeenCalledWith(0);
  });

  it('should move point', () => {
    jest.spyOn(path.movingPoint, 'emit');

    const event = new MouseEvent('mousedown', {
      button: 0
    });

    expect(path.points[0]).toEqual([0, 0]);

    path.onMousedown(event, {
      x: 5,
      y: 0
    });

    path.onMovePoint(event, {
      x: 10,
      y: 10
    });

    expect(path.points[0]).toEqual([
      path.xToPercent(10),
      path.yToPercent(10)
    ]);

    expect(path.movingPoint.emit).toHaveBeenCalledWith(0);
  });

  it('should insert new point in the second position', () => {
    jest.spyOn(path.movingPoint, 'emit');

    const event = new MouseEvent('mousedown', {
      button: 0
    });

    expect(path.points.length).toBe(4);

    path.onMousedown(event, {
      x: 45,
      y: 0
    });

    expect(path.points.length).toBe(5);
    expect(path.movingPoint.emit).toHaveBeenCalledWith(1);
  });

  it('should insert new point in the second position if the click was within 6px of distance', () => {
    jest.spyOn(path.movingPoint, 'emit');

    const event = new MouseEvent('mousedown', {
      button: 0
    });

    expect(path.points.length).toBe(4);

    path.onMousedown(event, {
      x: 45,
      y: 2
    });

    expect(path.points.length).toBe(5);
    expect(path.movingPoint.emit).toHaveBeenCalledWith(1);
  });

  it('should start moving the path', () => {
    jest.spyOn(path.movingPath, 'emit');
    jest.spyOn(path.context, 'isPointInPath').mockReturnValue(true);

    const event = new MouseEvent('mousedown', {
      button: 0
    });

    path.onMousedown(event, {
      x: path.xToPx(45),
      y: path.yToPx(20)
    });

    expect(path.movingPath.emit).toHaveBeenCalled();
  });

  it('should move path', () => {
    jest.spyOn(path.movingPath, 'emit');
    jest.spyOn(path.context, 'isPointInPath').mockReturnValue(true);

    const event = new MouseEvent('mousedown', {
      button: 0
    });

    expect(path.points[0]).toEqual([0, 0]);

    path.onMousedown(event, {
      x: 45,
      y: 20
    });

    path.onMovePath(event, {
      x: 50,
      y: 25
    });

    expect(path.points[0]).not.toEqual([0, 0]);

    expect(path.movingPath.emit).toHaveBeenCalled();
  });

  it('should delete the first node', () => {
    jest.spyOn(path.movingPath, 'emit');

    const event = new MouseEvent('mouseup', {
      button: 1
    });

    expect(path.points.length).toBe(4);

    const action = path.onMouseup(
      event,
      {
        x: 0,
        y: 3
      },
      true
    );

    expect(action).toEqual('delete node');
    expect(path.points.length).toBe(3);
  });

  it('should delete the path', () => {
    jest.spyOn(path.movingPath, 'emit');
    jest.spyOn(path.context, 'isPointInPath').mockReturnValue(true);

    const event = new MouseEvent('mouseup', {
      button: 1
    });

    const action = path.onMouseup(
      event,
      {
        x: path.xToPx(45),
        y: path.yToPx(20)
      },
      true
    );

    expect(action).toEqual('delete path');
  });

  it('should convert X value to PX', () => {
    path.canvas.width = 500;
    const value = path.xToPx(50);
    expect(value).toBe(250);
  });

  it('should convert X value to Percent', () => {
    path.canvas.width = 500;
    const value = path.xToPercent(250);
    expect(value).toBe(50);
  });

  it('should convert Y value to PX', () => {
    path.canvas.height = 500;
    const value = path.yToPx(50);
    expect(value).toBe(250);
  });

  it('should convert Y value to Percent', () => {
    path.canvas.height = 500;
    const value = path.yToPercent(250);
    expect(value).toBe(50);
  });

  it('should convert position to Percent', () => {
    path.canvas.width = 500;
    path.canvas.height = 500;
    const value = path.getPositionInPercent({
      x: 250,
      y: 250
    });
    expect(value).toEqual({
      x: 50,
      y: 50
    });
  });

  it('should convert point to PX', () => {
    path.canvas.width = 500;
    path.canvas.height = 500;
    const value = path.getPointInPx([50, 50]);
    expect(value).toEqual([250, 250]);
  });

  it('should get path boundaries', () => {
    const value = path.getBoundaries(false);
    expect(value).toEqual({
      minX: 0,
      maxX: 90,
      minY: 0,
      maxY: 90
    });
  });

  it('should get path width', () => {
    const value = path.getWidth();
    expect(value).toEqual(
      path.xToPx(90)
    );
  });

  it('should get path height', () => {
    const value = path.getHeight();
    expect(value).toEqual(
      path.yToPx(90)
    );
  });
});
