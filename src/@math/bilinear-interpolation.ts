import {createImageData} from '../utils';

import {Grid, Vector} from './vector';

export class BilinearInterpolation {
  private imageData = createImageData(this.width, this.height);

  constructor(private width: number, private height: number) {}

  generate(source: Uint8ClampedArray, fromGrid: Grid, toGrid: Grid): ImageData {
    for (let i = 0; i < toGrid.length; i++) {
      this.fill(source, toGrid[i], fromGrid[i]);
    }

    return this.imageData;
  }

  private fill(
    source: Uint8ClampedArray,
    sourcePoints: Vector[],
    fillingPoints: Vector[],
  ) {
    let imageData = this.imageData;

    let x0 = fillingPoints[0].x;
    let x1 = fillingPoints[2].x;
    let y0 = fillingPoints[0].y;
    let y1 = fillingPoints[2].y;

    x0 = Math.max(x0, 0);
    y0 = Math.max(y0, 0);
    x1 = Math.min(x1, this.width - 1);
    y1 = Math.min(y1, this.height - 1);

    for (let i = x0; i <= x1; i++) {
      let xl = (i - x0) / (x1 - x0);
      let xr = 1 - xl;
      let topX = xr * sourcePoints[0].x + xl * sourcePoints[1].x;
      let topY = xr * sourcePoints[0].y + xl * sourcePoints[1].y;
      let bottomX = xr * sourcePoints[3].x + xl * sourcePoints[2].x;
      let bottomY = xr * sourcePoints[3].y + xl * sourcePoints[2].y;

      for (let j = y0; j <= y1; j++) {
        let yl = (j - y0) / (y1 - y0);
        let yr = 1 - yl;
        let srcX = topX * yr + bottomX * yl;
        let srcY = topY * yr + bottomY * yl;
        let index = (j * this.width + i) * 4;

        if (
          srcX < 0 ||
          srcX > this.width - 1 ||
          srcY < 0 ||
          srcY > this.height - 1
        ) {
          imageData.data[index] = 255;
          imageData.data[index + 1] = 255;
          imageData.data[index + 2] = 255;
          imageData.data[index + 3] = 255;
          continue;
        }

        let srcX1 = Math.floor(srcX);
        let srcY1 = Math.floor(srcY);

        let base = (srcY1 * this.width + srcX1) * 4;

        imageData.data[index] = source[base];
        imageData.data[index + 1] = source[base + 1];
        imageData.data[index + 2] = source[base + 2];
        imageData.data[index + 3] = source[base + 3];
      }
    }
  }
}
