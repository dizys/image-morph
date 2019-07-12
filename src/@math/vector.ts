import {Matrix} from './matrix';

export class Vector {
  constructor(public x: number, public y: number) {}

  add(vector: Vector): Vector {
    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  subtract(vector: Vector): Vector {
    return new Vector(this.x - vector.x, this.y - vector.y);
  }

  square(): Matrix {
    return new Matrix(
      this.x * this.x,
      this.x * this.y,
      this.y * this.x,
      this.y * this.y,
    );
  }

  dot(vector: Vector): number {
    return this.x * vector.x + this.y * vector.y;
  }

  multiply(obj: number | Matrix): Vector {
    let x: number;
    let y: number;

    if (typeof obj === 'number') {
      x = this.x * obj;
      y = this.y * obj;
    } else {
      x = this.x * obj.m11 + this.y * obj.m21;
      y = this.x * obj.m12 + this.y * obj.m22;
    }

    return new Vector(x, y);
  }

  infinityNormDistanceTo(vector: Vector): number {
    return Math.max(Math.abs(this.x - vector.x), Math.abs(this.y - vector.y));
  }

  static weightedAverage(vectors: Vector[], weights: number[]): Vector {
    let xSum = 0;
    let ySum = 0;
    let weightSum = 0;

    for (let i = 0; i < vectors.length; i++) {
      let vector = vectors[i];
      let weight = i < weights.length ? weights[i] : 0;

      xSum += vector.x * weight;
      ySum += vector.y * weight;
      weightSum += weight;
    }

    return new Vector(xSum / weightSum, ySum / weightSum);
  }
}

export type Cell = Vector[];

export type Grid = Cell[];
