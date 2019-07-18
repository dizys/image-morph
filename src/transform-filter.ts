import { createProgram } from './@utils';
import { buildFaceTrianglesFromFacePoints } from './face-triangles';
import FragmentShader from './shaders/fragment_shader.glsl';
import VertexShader from './shaders/vertex_shader.glsl';

export interface TransformPoint {
    x: number;
    y: number;
}

export interface TransformableImage {
    imageData: ImageData,
    points: TransformPoint[]
}

export class TransformFilter {
    private program: WebGLProgram;

    private attributeToPositionLocation: number;
    private attributeFromPositionALocation: number;
    private attributeFromPositionBLocation: number;

    private uniformAlphaLocation: WebGLUniformLocation;
    private uniformImageALocation: WebGLUniformLocation;
    private uniformImageBLocation: WebGLUniformLocation;

    constructor(private gl: WebGLRenderingContext, private imageA: TransformableImage, private imageB: TransformableImage) {

        gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true)

        this.program = createProgram(gl, VertexShader, FragmentShader)
        gl.useProgram(this.program);
        this.attributeToPositionLocation = gl.getAttribLocation(this.program, 'a_toPosition');
        this.attributeFromPositionALocation = gl.getAttribLocation(this.program, 'a_fromPositionA')
        this.attributeFromPositionBLocation = gl.getAttribLocation(this.program, 'a_fromPositionB')

        gl.enableVertexAttribArray(this.attributeToPositionLocation);
        gl.enableVertexAttribArray(this.attributeFromPositionALocation);
        gl.enableVertexAttribArray(this.attributeFromPositionBLocation);

        this.uniformAlphaLocation = gl.getUniformLocation(this.program, 'u_alpha')!;
        this.uniformImageALocation = gl.getUniformLocation(this.program, 'u_imageA')!;
        this.uniformImageBLocation = gl.getUniformLocation(this.program, 'u_imageB')!;
    }

    render(alpha: number) {
        let gl = this.gl;

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        let imageA = this.imageA;
        let imageB = this.imageB;

        // Point transforming

        let { points: pointsA, imageData: imageDataA } = imageA;
        let { points: pointsB, imageData: imageDataB } = imageB;

        let transformedPoints = transformPoints(pointsA, pointsB, alpha);

        let trianglesA = buildFaceTrianglesFromFacePoints(pointsA);
        let trianglesB = buildFaceTrianglesFromFacePoints(pointsB);
        let transformedTriangles = buildFaceTrianglesFromFacePoints(transformedPoints);

        ////////////////////
        // Buffer binding //
        ////////////////////

        // toPosition

        let toPositionBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, toPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(transformedTriangles), gl.STATIC_DRAW);

        gl.vertexAttribPointer(this.attributeToPositionLocation, 2, gl.FLOAT, false, 0, 0);

        // fromPositionA

        let fromPositionABuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, fromPositionABuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(trianglesA), gl.STATIC_DRAW
        );

        gl.vertexAttribPointer(this.attributeFromPositionALocation, 2, gl.FLOAT, false, 0, 0);

        // fromPositionB

        let fromPositionBBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, fromPositionBBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(trianglesB), gl.STATIC_DRAW
        );

        gl.vertexAttribPointer(this.attributeFromPositionBLocation, 2, gl.FLOAT, false, 0, 0);

        /////////////////////
        // Texture Binding //
        /////////////////////

        // imageA

        let textureA = gl.createTexture();

        gl.uniform1i(this.uniformImageALocation, 1);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, textureA);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageDataA);

        // imageB

        let textureB = gl.createTexture();

        gl.uniform1i(this.uniformImageBLocation, 2);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, textureB);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageDataB);

        /////////////////////
        // Passing Uniform //
        /////////////////////

        gl.uniform1f(this.uniformAlphaLocation, alpha);

        /////////////
        // Drawing //
        /////////////

        gl.drawArrays(gl.TRIANGLES, 0, trianglesA.length / 2);
    }
}

function transformPoints(fromPoints: TransformPoint[], toPoints: TransformPoint[], progress: number): TransformPoint[] {
    let result: TransformPoint[] = [];

    for (let i = 0; i < fromPoints.length; i++) {
        let point: TransformPoint = { x: 0, y: 0 };

        let fromPoint = fromPoints[i];
        let toPoint = toPoints[i];

        point.x = fromPoint.x + (toPoint.x - fromPoint.x) * progress;
        point.y = fromPoint.y + (toPoint.y - fromPoint.y) * progress;

        result.push(point);
    }

    return result;
}

export function buildTransformableImage(imageData: ImageData, pixelPointArray: number[]): TransformableImage {
    let { width, height } = imageData;

    let centerX = width / 2;
    let centerY = height / 2;

    let points: TransformPoint[] = new Array(105);

    for (let i = 0; i < 97; i++) {
        let pixelPointX = pixelPointArray[i * 2];
        let pixelPointY = pixelPointArray[i * 2 + 1];

        let x = (pixelPointX - centerX) / centerX;
        let y = (pixelPointY - centerY) / centerY;

        points[i] = { x, y };
    }

    points[97] = { x: -1, y: -1 };
    points[98] = { x: -1, y: 0 };
    points[99] = { x: -1, y: 1 };
    points[100] = { x: 0, y: 1 };
    points[101] = { x: 1, y: 1 };
    points[102] = { x: 1, y: 0 };
    points[103] = { x: 1, y: -1 };
    points[104] = { x: 0, y: -1 };

    return {
        imageData,
        points
    }
}
