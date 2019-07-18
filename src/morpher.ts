
import { TransformFilter, TransformableImage } from './transform-filter';

export class Morpher {
  private canvas: OffscreenCanvas;

  private gl: WebGLRenderingContext;

  private filter: TransformFilter;

  constructor(sourceA: TransformableImage, sourceB: TransformableImage) {
    let { width, height } = sourceA.imageData;

    this.canvas = new OffscreenCanvas(width, height);

    this.gl = this.canvas.getContext('webgl') as WebGLRenderingContext;

    this.filter = new TransformFilter(this.gl, sourceA, sourceB);
  }

  morph(progress: number): ImageData {
    let gl = this.gl;

    this.filter.render(progress);

    let width = gl.drawingBufferWidth;
    let height = gl.drawingBufferHeight;

    let pixels = new Uint8Array(width * height * 4);

    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

    return new ImageData(Uint8ClampedArray.from(pixels), width, height);
  }
}

