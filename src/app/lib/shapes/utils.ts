export const calcPointSegmentDistance = (x, y, x0, y0, x1, y1) => {
  const vectorY = y0 - y1;
  const vectorX = x1 - x0;
  const vectorModule = x0 * y1 - y0 * x1;
  return Math.abs((vectorY * x) + (vectorX * y) + vectorModule) / Math.sqrt((vectorY * vectorY) + (vectorX * vectorX));
};
