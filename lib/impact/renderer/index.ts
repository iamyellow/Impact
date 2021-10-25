// https://github.com/kutuluk/js13k-2d/blob/master/src/renderer.js
// https://github.com/finscn/DrawImageGL/blob/main/src/DrawImageGL.js

const VS_SRC = `
attribute vec2 a_vertex;
attribute vec2 a_pivot;
attribute vec2 a_size;
attribute float a_rotation;
attribute vec2 a_position;
attribute vec4 a_tex_prj;
attribute float a_alpha;

uniform mat4 u_matrix;

varying vec2 v_texcoord;
varying float v_alpha;

// https://theorangeduck.com/page/avoiding-shader-conditionals

float when_lt(float x, float y) {
  return max(sign(y - x), 0.0);
}

float when_gte(float x, float y) {
  return 1.0 - when_lt(x, y);
}

void main() {
  // flip
  vec2 vertex = a_vertex;
  vertex.s = when_lt(a_size.x, 0.0) +
  (when_lt(a_size.x, 0.0) * -1.0 * a_vertex.s) +
  (when_gte(a_size.x, 0.0) * 1.0 * a_vertex.s);
  vertex.t = when_lt(a_size.y, 0.0) +
  (when_lt(a_size.y, 0.0) * -1.0 * a_vertex.t) +
  (when_gte(a_size.y, 0.0) * 1.0 * a_vertex.t);

  vec2 p = (vertex - a_pivot) * abs(a_size);
  float q = cos(a_rotation);
  float w = sin(a_rotation);
  p = vec2(p.x * q - p.y * w, p.x * w + p.y * q);
  p += a_pivot + a_position;

  gl_Position = u_matrix * vec4(p, 0, 1);

  mat4 tex_map = mat4(
  a_tex_prj.x, 0, 0, 0,
  0, a_tex_prj.y, 0, 0,
  0, 0, 1, 0,
  a_tex_prj.z, a_tex_prj.w, 0, 1);

  v_texcoord = (tex_map * vec4(a_vertex, 0, 1)).xy;
  v_alpha = a_alpha;
}`

const FS_SRC = `
precision mediump float;

uniform sampler2D u_tex;

varying vec2 v_texcoord;
varying float v_alpha;

void main() {
  gl_FragColor = texture2D(u_tex, v_texcoord);
  gl_FragColor.a = min(gl_FragColor.a, v_alpha);
}`

const BATCH_COMMANDS_MAX = 65535
const DEPTH = 1e5

export const makeRenderer = (canvas: HTMLCanvasElement) => {
  const gl = canvas.getContext('webgl', {
    antialias: false,
    alpha: false
  })
  if (gl === null) {
    return
  }

  const ext = gl.getExtension('ANGLE_instanced_arrays')
  if (ext === null) {
    return
  }

  const program = gl.createProgram()
  if (program === null) {
    return
  }

  // begin: helpers

  const compileShader = (source: string, type: number): WebGLShader | null => {
    const shader = gl.createShader(type)
    if (shader === null) {
      return null
    }

    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    return shader
  }

  const createBuffer = (type: number, src: BufferSource | null) => {
    gl.bindBuffer(type, gl.createBuffer())
    gl.bufferData(type, src, gl.DYNAMIC_DRAW)
  }

  const getUniformLocation = (name: string) => {
    return gl.getUniformLocation(program, name)
  }

  const makeProjection = (width: number, height: number): Array<number> => {
    const at = { x: 0, y: 0 }
    const to = { x: 0, y: 0 }
    const angle = 0.0

    const x = at.x - width * to.x
    const y = at.y - height * to.y

    const c = Math.cos(angle)
    const s = Math.sin(angle)

    const w = 2 / width
    const h = -2 / height

    /*
    |   1 |    0| 0| 0|
    |   0 |    1| 0| 0|
    |   0 |    0| 1| 0|
    | at.x| at.y| 0| 1|
    x
    |  c| s| 0| 0|
    | -s| c| 0| 0|
    |  0| 0| 1| 0|
    |  0| 0| 0| 1|
    x
    |     1|     0| 0| 0|
    |     0|     1| 0| 0|
    |     0|     0| 1| 0|
    | -at.x| -at.y| 0| 1|
    x
    |     2/width|           0|        0| 0|
    |           0|   -2/height|        0| 0|
    |           0|           0| -1/depth| 0|
    | -2x/width-1| 2y/height+1|        0| 1|
    */

    // prettier-ignore
    return [
      c * w,  s * h,
      0, 0,
      -s * w,  c * h,
      0, 0,
      0, 0,
      -1 / DEPTH, 0,
      (at.x * (1 - c) + at.y * s) * w - 2 * x / width - 1, (at.y * (1 - c) - at.x * s) * h + 2 * y / height + 1,
      0, 1,
    ];
  }

  // end: helpers

  const vshader = compileShader(VS_SRC, gl.VERTEX_SHADER)
  const fshader = compileShader(FS_SRC, gl.FRAGMENT_SHADER)
  if (program === null || vshader === null || fshader === null) {
    return
  }

  gl.attachShader(program, vshader)
  gl.attachShader(program, fshader)
  gl.linkProgram(program)

  const projection = makeProjection(canvas.clientWidth, canvas.clientHeight)

  const pivotFloatSize = 2
  const sizeFloatSize = 2
  const rotationFloatSize = 1
  const positionFloatSize = 2
  const texPrjFloatsize = 4
  const alphaFloatSize = 1

  const bytesPerFloat = 4
  const commandFloatSize =
    pivotFloatSize +
    sizeFloatSize +
    rotationFloatSize +
    positionFloatSize +
    texPrjFloatsize +
    alphaFloatSize
  const commandByteSize = commandFloatSize * bytesPerFloat
  const batchArrayBuffer = new ArrayBuffer(BATCH_COMMANDS_MAX * commandByteSize)
  const batchArrayView = new Float32Array(batchArrayBuffer)

  // indicesBuffer
  createBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array([0, 1, 2, 2, 1, 3]))

  // vertexBuffer
  createBuffer(gl.ARRAY_BUFFER, new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]))
  const vertexLocation = gl.getAttribLocation(program, 'a_vertex')
  gl.enableVertexAttribArray(vertexLocation)
  gl.vertexAttribPointer(vertexLocation, 2, gl.FLOAT, false, 0, 0)

  // dynamicBuffer
  createBuffer(gl.ARRAY_BUFFER, batchArrayBuffer)
  let bindOffset = 0
  const bindAttrib = (name: string, floatSize: number) => {
    const location = gl.getAttribLocation(program, name)
    gl.enableVertexAttribArray(location)
    gl.vertexAttribPointer(
      location,
      floatSize,
      gl.FLOAT, // type
      false, // normalized
      commandByteSize, // stride
      bindOffset // offset
    )
    ext?.vertexAttribDivisorANGLE(location, 1)
    bindOffset += floatSize * 4
  }
  bindAttrib('a_pivot', pivotFloatSize)
  bindAttrib('a_size', sizeFloatSize)
  bindAttrib('a_rotation', rotationFloatSize)
  bindAttrib('a_position', positionFloatSize)
  bindAttrib('a_tex_prj', texPrjFloatsize)
  bindAttrib('a_alpha', alphaFloatSize)

  const matrixLocation = getUniformLocation('u_matrix')
  const textureLocation = getUniformLocation('u_tex')

  let batchedCommandsCount = 0
  let currentTexture: WebGLTexture | null = null

  // API

  const makeTexture = (source: TexImageSource): WebGLTexture | null => {
    const texture = gl.createTexture()

    if (texture === null) {
      return null
    }

    gl.bindTexture(gl.TEXTURE_2D, texture)

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    return texture
  }

  const draw = (
    tex: WebGLTexture,
    texWidth: number,
    texHeight: number,
    srcX: number,
    srcY: number,
    srcWidth: number,
    srcHeight: number,
    dstX: number,
    dstY: number,
    dstWidth: number,
    dstHeight: number,
    rotation: number,
    pivotX: number,
    pivotY: number,
    alpha: number
  ) => {
    if (batchedCommandsCount === BATCH_COMMANDS_MAX || currentTexture !== tex) {
      flush()
    }

    currentTexture = tex

    let i = batchedCommandsCount * commandFloatSize

    batchArrayView[i++] = pivotX
    batchArrayView[i++] = pivotY

    batchArrayView[i++] = dstWidth
    batchArrayView[i++] = dstHeight

    batchArrayView[i++] = rotation

    batchArrayView[i++] = dstX + Math.abs(dstWidth * pivotX)
    batchArrayView[i++] = dstY + Math.abs(dstHeight * pivotY)

    batchArrayView[i++] = srcWidth / texWidth
    batchArrayView[i++] = srcHeight / texHeight
    batchArrayView[i++] = srcX / texWidth
    batchArrayView[i++] = srcY / texHeight

    batchArrayView[i] = alpha

    batchedCommandsCount++
  }

  const resetState = () => {
    batchedCommandsCount = 0
    currentTexture = null
  }

  const clear = () => {
    resetState()

    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }

  const flush = () => {
    if (batchedCommandsCount === 0 || currentTexture === null) {
      return
    }

    gl.useProgram(program)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    gl.uniformMatrix4fv(matrixLocation, false, projection)

    gl.bindTexture(gl.TEXTURE_2D, currentTexture)
    gl.uniform1i(textureLocation, 0)

    // prettier-ignore
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, batchArrayView.subarray(0, batchedCommandsCount * commandFloatSize))
    ext.drawElementsInstancedANGLE(
      gl.TRIANGLES,
      6,
      gl.UNSIGNED_BYTE,
      0,
      batchedCommandsCount
    )

    resetState()
  }

  return { gl, makeTexture, clear, draw, flush }
}
