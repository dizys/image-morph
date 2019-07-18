export function createCanvas2dContext(
  width: number,
  height: number,
): CanvasRenderingContext2D {
  let canvas = new OffscreenCanvas(width, height);

  return canvas.getContext('2d') as any;
}

export function createImageData(width: number, height: number): ImageData {
  return createCanvas2dContext(width, height).createImageData(width, height);
}

export function loadImageData(
  image: HTMLImageElement,
  width: number,
  height: number,
): ImageData {
  let context = createCanvas2dContext(width, height);
  context.drawImage(image, 0, 0, width, height);
  return context.getImageData(0, 0, width, height);
}

export function loadImageDataFromSrc(
  src: string,
  width: number,
  height: number,
): Promise<ImageData> {
  let image = new Image(width, height);

  image.src = src;

  return new Promise<ImageData>(resolve => {
    image.onload = () => {
      let data = loadImageData(image, width, height);
      resolve(data);
    };
  });
}
