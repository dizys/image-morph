export enum ShaderType {
    vertex,
    fragment
}

export function createShader(gl: WebGLRenderingContext, type: ShaderType, source: string): WebGLShader {
    let shader = gl.createShader(type === ShaderType.vertex ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER)!;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if (!success) {
        let errorLog = gl.getShaderInfoLog(shader)!;
        gl.deleteShader(shader);
        throw new Error(errorLog);
    }

    return shader;
}
