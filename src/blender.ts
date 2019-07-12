import {Vector} from './@math';
import {createImageData} from './utils';
import {Warper} from './warper';

export interface MorphPoint {
  x: number;
  y: number;
}

export interface MorphSourceInput {
  imageData: ImageData;
  points: MorphPoint[];
}

export interface MorphSource extends MorphSourceInput {
  points: Vector[];
}

export class Morpher {
  private sourceA: MorphSource;
  private sourceB: MorphSource;
  private warperA: Warper;
  private warperB: Warper;

  constructor(sourceA: MorphSourceInput, sourceB: MorphSourceInput) {
    this.sourceA = buildMorphSourceFromInput(sourceA);
    this.sourceB = buildMorphSourceFromInput(sourceB);

    this.warperA = new Warper(this.sourceA.imageData);
    this.warperB = new Warper(this.sourceB.imageData);
  }

  morph(progress: number): ImageData {
    let position = this.calculatePosition(progress);

    let warpedA = this.warperA.warp(this.sourceA.points, position);
    let warpedB = this.warperB.warp(this.sourceB.points, position);

    console.log(warpedA);

    return this.blendImages(warpedA, warpedB, progress);
  }

  private calculatePosition(progress: number): Vector[] {
    let pointsA = this.sourceA.points;
    let pointsB = this.sourceB.points;

    let position: Vector[] = [];

    for (let i = 0; i < pointsA.length; i++) {
      let pointA = pointsA[i];
      let pointB = pointsB[i];

      let vector = new Vector(
        pointA.x + (pointB.x - pointA.x) * progress,
        pointA.y + (pointB.y - pointA.y) * progress,
      );

      position.push(vector);
    }

    return position;
  }

  private blendImages(
    imageA: ImageData,
    imageB: ImageData,
    progress: number,
  ): ImageData {
    let result = createImageData(imageA.width, imageA.height);

    let dataA = imageA.data;
    let dataB = imageB.data;

    for (let i = 0; i < imageA.data.length; i++) {
      result.data[i] = dataA[i] + (dataB[i] - dataA[i]) * progress;
    }

    return result;
  }
}

export function buildMorphSourceFromInput(
  source: MorphSourceInput,
): MorphSource {
  let {imageData, points: rawPoints} = source;

  let points: Vector[] = [];

  for (let rawPoint of rawPoints) {
    let {x, y} = rawPoint;

    points.push(new Vector(x, y));
  }

  return {imageData, points};
}
