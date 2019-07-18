import { ShaderType, createShader } from './shader';


export function createProgram(gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string): WebGLProgram;
export function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram;
export function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader | string, fragmentShader: WebGLShader | string): WebGLProgram {
    if (typeof vertexShader === 'string') {
        vertexShader = createShader(gl, ShaderType.vertex, vertexShader);
    }

    if (typeof fragmentShader === 'string') {
        fragmentShader = createShader(gl, ShaderType.fragment, fragmentShader);
    }

    let program = gl.createProgram()!;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    let success = gl.getProgramParameter(program, gl.LINK_STATUS);

    if (!success) {
        let errorLog = gl.getProgramInfoLog(program)!;
        gl.deleteProgram(program);
        throw new Error(errorLog);
    }

    return program;
}
