import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ElementRef, Renderer2, Type } from '@angular/core';

import { configureTestSuite } from 'ng-bullet';

import { Pencil } from './pencil';

@Component({
  selector: 'app-mock',
  template: ''
})
export class MockComponent {
  constructor(private renderer: Renderer2) {
  }
}

describe('Pencil', () => {
  let fixture: ComponentFixture<MockComponent>;
  let pencil: Pencil;
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
    pencil = new Pencil(
      renderer,
      element,
      'red',
      'green',
      'blue',
      'white',
      [[0, 0], [10, 10]]
    );
  });

  it('should create', () => {
    expect(pencil).toBeTruthy();
  });

  it('should update the colors and update the pencil', () => {
    jest.spyOn(pencil, 'draw');

    pencil.setColors({
      fillColor: 'black',
      handlerFillColor: 'black',
      strokeColor: 'black',
      handlerStrokeColor: 'black'
    });

    expect(pencil.draw).toHaveBeenCalled();
  });

  it('should insert a new point', () => {
    const event = new MouseEvent('mousemove', {
      button: 0
    });

    expect(pencil.points.length).toBe(2);

    pencil.onMovePoint(event, {
      x: pencil.xToPx(20),
      y: pencil.yToPx(20)
    });

    expect(pencil.points.length).toBe(3);
  });

  it('should complete the path', () => {
    jest.spyOn(pencil.completed, 'emit');

    const event = new MouseEvent('mouseup', {
      button: 0
    });

    expect(pencil.points.length).toBe(2);

    pencil.onMovePoint(event, {
      x: pencil.xToPx(20),
      y: pencil.yToPx(20)
    });

    pencil.onMouseup(event, {
      x: pencil.xToPx(20),
      y: pencil.yToPx(20)
    });

    pencil.onMovePoint(event, {
      x: pencil.xToPx(0),
      y: pencil.yToPx(0)
    });

    pencil.onMouseup(event, {
      x: pencil.xToPx(0),
      y: pencil.yToPx(0)
    });

    expect(pencil.points.length).toBe(3);
    expect(pencil.completed.emit).toHaveBeenCalled();
  });

  it('should delete the last point', () => {
    const event = new MouseEvent('mouseup', {
      button: 1
    });

    expect(pencil.points.length).toBe(2);

    pencil.onMouseup(event, {
      x: pencil.xToPx(20),
      y: pencil.yToPx(20)
    });

    expect(pencil.points.length).toBe(1);
  });

  it('should reset the pencil', () => {
    pencil.reset();
    expect(pencil.points.length).toBe(0)
  });

  it('should convert X value to PX', () => {
    pencil.canvas.width = 500;
    const value = pencil.xToPx(50);
    expect(value).toBe(250);
  });

  it('should convert X value to Percent', () => {
    pencil.canvas.width = 500;
    const value = pencil.xToPercent(250);
    expect(value).toBe(50);
  });

  it('should convert Y value to PX', () => {
    pencil.canvas.height = 500;
    const value = pencil.yToPx(50);
    expect(value).toBe(250);
  });

  it('should convert Y value to Percent', () => {
    pencil.canvas.height = 500;
    const value = pencil.yToPercent(250);
    expect(value).toBe(50);
  });

  it('should convert position to Percent', () => {
    pencil.canvas.width = 500;
    pencil.canvas.height = 500;
    const value = pencil.getPositionInPercent({
      x: 250,
      y: 250
    });
    expect(value).toEqual({
      x: 50,
      y: 50
    });
  });

  it('should convert point to PX', () => {
    pencil.canvas.width = 500;
    pencil.canvas.height = 500;
    const value = pencil.getPointInPx([50, 50]);
    expect(value).toEqual([250, 250]);
  });

  it('should get pencil boundaries', () => {
    const value = pencil.getBoundaries(false);
    expect(value).toEqual({
      minX: 0,
      maxX: 10,
      minY: 0,
      maxY: 10
    });
  });

  it('should get pencil width', () => {
    const value = pencil.getWidth();
    expect(value).toEqual(
      pencil.xToPx(10)
    );
  });

  it('should get pencil height', () => {
    const value = pencil.getHeight();
    expect(value).toEqual(
      pencil.yToPx(10)
    );
  });
});
