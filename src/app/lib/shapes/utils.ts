export const calcPointSegmentDistance: Function = (
    x: number,
    y: number,
    x0: number,
    y0: number,
    x1: number,
    y1: number
  ): number => {
    const vectorY: number = y0 - y1;
    const vectorX: number = x1 - x0;
    const vectorModule: number = x0 * y1 - y0 * x1;
  return Math.abs((vectorY * x) + (vectorX * y) + vectorModule) / Math.sqrt((vectorY * vectorY) + (vectorX * vectorX));
};
