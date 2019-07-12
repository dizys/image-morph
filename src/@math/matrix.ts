export class Matrix {
  constructor(
    public m11: number,
    public m12: number,
    public m21: number,
    public m22: number,
  ) {}

  add(matrix: Matrix): Matrix {
    return new Matrix(
      this.m11 + matrix.m11,
      this.m12 + matrix.m12,
      this.m21 + matrix.m21,
      this.m22 + matrix.m22,
    );
  }

  multiply(scalar: number): Matrix {
    return new Matrix(
      this.m11 * scalar,
      this.m12 * scalar,
      this.m21 * scalar,
      this.m22 * scalar,
    );
  }

  adjugate(): Matrix {
    return new Matrix(this.m22, -this.m12, -this.m21, this.m11);
  }

  determinant(): number {
    return this.m11 * this.m22 - this.m12 * this.m21;
  }

  inverse(): Matrix {
    return this.adjugate().multiply(1.0 / this.determinant());
  }
}
