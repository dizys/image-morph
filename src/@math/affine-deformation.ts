import {Matrix} from './matrix';
import {Vector} from './vector';

export class AffineDeformation {
  private pRelative: Vector[] = new Array(this.length);
  private qRelative: Vector[] = new Array(this.length);
  private weights: number[] = new Array(this.length);
  private A: number[] = new Array(this.length);

  private get length(): number {
    return this.fromPoints.length;
  }

  constructor(
    private fromPoints: Vector[],
    private toPoints: Vector[],
    private alpha: number,
  ) {
    if (fromPoints.length !== toPoints.length) {
      throw new Error('Inconsistent fromPoints and toPoints length');
    }
  }

  movePoint(point: Vector): Vector {
    let fromPoints = this.fromPoints;

    for (let i = 0; i < this.length; i++) {
      let t = fromPoints[i].subtract(point);
      this.weights[i] = Math.pow(t.x * t.x + t.y * t.y, -this.alpha);
    }

    let pAverage = Vector.weightedAverage(this.fromPoints, this.weights);
    let qAverage = Vector.weightedAverage(this.toPoints, this.weights);

    for (let i = 0; i < this.length; i++) {
      this.pRelative[i] = this.fromPoints[i].subtract(pAverage);
      this.qRelative[i] = this.toPoints[i].subtract(qAverage);
    }

    let B = new Matrix(0, 0, 0, 0);

    for (let i = 0; i < this.length; i++) {
      B.add(this.pRelative[i].square().multiply(this.weights[i]));
    }

    B = B.inverse();

    for (let i = 0; i < this.length; i++) {
      this.A[i] =
        point
          .subtract(pAverage)
          .multiply(B)
          .dot(this.pRelative[i]) * this.weights[i];
    }

    let result = qAverage;

    for (let i = 0; i < this.length; i++) {
      result = result.add(this.qRelative[i].multiply(this.A[i]));
    }

    return result;
  }
}
