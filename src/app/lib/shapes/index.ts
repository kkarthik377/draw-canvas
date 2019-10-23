import { GenericPath } from './generic-path';
import { BasePath } from './base-path';
import { Rect } from './rect';
import { Circle } from './circle';

const register = {};
register[GenericPath.NAME] = GenericPath;
register[Rect.NAME] = Rect;
register[Circle.NAME] = Circle;

export * from './base-shape';
export * from './base-path';
export * from './generic-path';
export * from './rect';
export * from './pencil';
export * from './circle';

export function getShape(name: string, args: any[]): BasePath {
  if (register.hasOwnProperty(name)) {
    return new register[name](...args);
  }
  throw new ReferenceError(
    `Unknown shape "${name}", available shapes are: ${Object.keys(register)}`
  );
}
