import {AffineDeformation, BilinearInterpolation, Grid, Vector} from './@math';

export class Warper {
  private grid: Grid = [];

  private bilinearInterpolation = new BilinearInterpolation(
    this.width,
    this.height,
  );

  private get width(): number {
    return this.imageData.width;
  }

  private get height(): number {
    return this.imageData.height;
  }

  private get data(): Uint8ClampedArray {
    return this.imageData.data;
  }

  constructor(private imageData: ImageData, gridSize = 20, private alpha = 1) {
    for (let i = 0; i < this.width; i += gridSize) {
      for (let j = 0; j < this.height; j += gridSize) {
        let a = new Vector(i, j);
        let b = new Vector(i + gridSize, j);
        let c = new Vector(i + gridSize, j + gridSize);
        let d = new Vector(i, j + gridSize);

        this.grid.push([a, b, c, d]);
      }
    }
  }

  warp(fromPoints: Vector[], toPoints: Vector[]): ImageData {
    let deformation = new AffineDeformation(toPoints, fromPoints, this.alpha);

    let transformedGrid: Grid = [];

    let grid = this.grid;

    for (let cell of grid) {
      transformedGrid.push([
        deformation.movePoint(cell[0]),
        deformation.movePoint(cell[1]),
        deformation.movePoint(cell[2]),
        deformation.movePoint(cell[3]),
      ]);
    }

    return this.bilinearInterpolation.generate(
      this.data,
      grid,
      transformedGrid,
    );
  }
}
