// The water light: a WebGL shader added over the paint with `screen`.
// Screen leaves white untouched, so on bare paper this layer is invisible; on
// paint it lights the water. It outputs black (no change) plus light:
//   - caustics: the bright, curving net that sunlight throws on a pool floor,
//     made from the edges between cells of moving, warped cellular noise
//   - iridescence: a faint rainbow fringe along the brightest lines
//   - stars: many small four-point sparkles, each its own size, that swell and fade
//   - glitter: a sprinkle of tiny sparkles in white, pink and aqua
//   - ripples spreading from the pointer
// Drawn at half resolution; still under reduced motion.

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uMouseAge;
uniform float uScroll;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec2 hash2(vec2 p){
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

// Distance to the nearest edge between moving cells.
float cellEdge(vec2 p, float t){
  vec2 i = floor(p);
  vec2 f = fract(p);
  float f1 = 8.0;
  float f2 = 8.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 o = hash2(i + g);
      o = 0.5 + 0.42 * sin(t + 6.2831 * o);
      float d = length(g + o - f);
      if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) { f2 = d; }
    }
  }
  return f2 - f1;
}

vec2 warp(vec2 p, float t){
  return p + 0.35 * vec2(sin(p.y * 1.7 + t * 0.6), cos(p.x * 1.5 - t * 0.5))
           + 0.15 * vec2(sin(p.y * 4.1 - t), cos(p.x * 3.7 + t * 0.8));
}

void main(){
  vec2 px = gl_FragCoord.xy;
  float s = 3.2 / uRes.y;
  vec2 p = px * s;
  p.y -= uScroll * 0.0011;

  vec2 m = vec2(uMouse.x, uRes.y - uMouse.y) * s;
  m.y -= uScroll * 0.0011;
  vec2 dm = p - m;
  float d = length(dm);
  float rip = sin(d * 18.0 - uTime * 5.0) * exp(-d * 2.0) * exp(-uMouseAge * 0.8) * 0.09;
  p += dm / (d + 0.0001) * rip;

  float t = uTime * 0.55;
  vec2 q = warp(p, t);
  float e1 = cellEdge(q * 0.72, t * 0.8);
  float e2 = cellEdge(q * 1.6 + 4.0, t * 1.1);
  // Soft, sparse ripples of light: a thin bright core with a wide faint glow,
  // fading in and out across the surface so the net never reads as a grid.
  float patch = smoothstep(0.15, 0.85, 0.5 + 0.5 * sin(q.x * 0.9 + t * 0.3) * sin(q.y * 0.7 - t * 0.25));
  // Cores kept soft so the light sits behind the content rather than over it.
  float lines = (exp(-e1 * 26.0) * 0.4 + exp(-e1 * 10.0) * 0.1) * (0.35 + 0.65 * patch)
              + exp(-e2 * 34.0) * 0.12 * patch;

  // Rainbow fringe where the light is strongest.
  vec3 rainbow = 0.5 + 0.5 * cos(6.2831 * (q.x * 0.18 + q.y * 0.12 + e1 * 2.5 + t * 0.05 + vec3(0.0, 0.33, 0.67)));
  vec3 col = vec3(0.92, 0.98, 1.0) * lines + rainbow * exp(-e1 * 16.0) * 0.1 * patch;

  // Stars: small four-point sparkles with fainter diagonals, scattered
  // through cells; each has its own size and twinkles at its own pace.
  vec2 cell = vec2(120.0);
  vec2 sp = px + vec2(0.0, uScroll * 0.5);
  vec2 id = floor(sp / cell);
  float h = hash(id);
  if (h > 0.7) {
    vec2 c = (id + 0.5 + 0.5 * (hash2(id) - 0.5)) * cell;
    float k = 0.5 + 0.6 * hash(id + 7.0);
    vec2 v = (sp - c) / k;
    float tw = pow(0.5 + 0.5 * sin(uTime * (0.9 + h) + h * 40.0), 3.0);
    float core = exp(-length(v) * 0.6);
    float rays = exp(-abs(v.x) * 2.2) * exp(-abs(v.y) * 0.16) + exp(-abs(v.y) * 2.2) * exp(-abs(v.x) * 0.16);
    vec2 r = vec2(v.x + v.y, v.x - v.y) * 0.7071;
    rays += 0.35 * (exp(-abs(r.x) * 2.6) * exp(-abs(r.y) * 0.3) + exp(-abs(r.y) * 2.6) * exp(-abs(r.x) * 0.3));
    col += vec3(1.0, 0.97, 0.95) * (core * 1.2 + rays * 0.55) * tw;
  }

  // Glitter: tiny sparkles rather than round specks, and fewer of them.
  vec2 gid = floor(sp / 14.0);
  float gh = hash(gid);
  if (gh > 0.985) {
    float tw = pow(0.5 + 0.5 * sin(uTime * 2.2 + gh * 90.0), 6.0);
    vec3 tint = mix(vec3(1.0), mix(vec3(1.0, 0.75, 0.9), vec3(0.7, 0.95, 1.0), hash(gid + 2.0)), 0.6);
    vec2 g = (fract(sp / 14.0) - 0.5) * 14.0;
    float spark = exp(-length(g) * 1.2)
                + exp(-abs(g.x) * 1.6) * exp(-abs(g.y) * 0.45)
                + exp(-abs(g.y) * 1.6) * exp(-abs(g.x) * 0.45);
    col += tint * tw * spark * 0.8;
  }

  gl_FragColor = vec4(min(col, 1.0), 1.0);
}`

/** Phones and tablets: draw the light coarser and less often, to keep scrolling smooth. */
const TOUCH = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
const SCALE = TOUCH ? 0.35 : 0.5
/** The light moves slowly; 30 fps looks the same as 60 and halves the GPU work (20 on touch screens). */
const FRAME_MS = 1000 / (TOUCH ? 20 : 30)

export class Crystal {
  private gl: WebGLRenderingContext
  private canvas: HTMLCanvasElement
  private u: Record<string, WebGLUniformLocation | null> = {}
  private raf = 0
  private start = performance.now()
  private mouse = { x: -9999, y: -9999, at: -100 }
  private teardown: () => void
  private still: boolean
  /** Animating. Off while the paper is bare: screen over white shows nothing. */
  private running = false

  constructor(canvas: HTMLCanvasElement, still: boolean) {
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
    if (!gl) throw new Error('WebGL is not available')
    this.gl = gl
    this.canvas = canvas
    this.still = still

    const prog = gl.createProgram()!
    for (const [type, src] of [
      [gl.VERTEX_SHADER, VERT],
      [gl.FRAGMENT_SHADER, FRAG],
    ] as const) {
      const sh = gl.createShader(type)!
      gl.shaderSource(sh, src)
      gl.compileShader(sh)
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) ?? 'shader')
      gl.attachShader(prog, sh)
    }
    gl.linkProgram(prog)
    gl.useProgram(prog)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    for (const n of ['uRes', 'uTime', 'uMouse', 'uMouseAge', 'uScroll']) this.u[n] = gl.getUniformLocation(prog, n)

    const onResize = () => this.resize()
    const onMove = (e: PointerEvent) => {
      this.mouse = { x: e.clientX * SCALE, y: e.clientY * SCALE, at: this.now() }
    }
    const onVis = () => (document.hidden ? cancelAnimationFrame(this.raf) : this.loop())
    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('visibilitychange', onVis)
    this.teardown = () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVis)
    }
    this.resize()
    this.loop()
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    this.teardown()
  }

  /** Start or stop the animation; stopped, one still frame stays on screen. */
  run(on: boolean) {
    if (on === this.running) return
    this.running = on
    this.loop()
  }

  private now() {
    return (performance.now() - this.start) / 1000
  }

  private resize() {
    const w = Math.max(1, Math.round(window.innerWidth * SCALE))
    const h = Math.max(1, Math.round(window.innerHeight * SCALE))
    // Phones resize the height as their toolbars slide while scrolling.
    // Resizing a WebGL canvas reallocates it, which stutters, so only grow
    // for that; a real change of width rebuilds.
    const sameWidth = w === this.canvas.width
    if (sameWidth && h <= this.canvas.height) return
    const height = sameWidth ? Math.max(h, this.canvas.height) : h
    this.canvas.width = w
    this.canvas.height = height
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    if (this.still || !this.running) this.draw(this.still ? 12 : this.now())
  }

  private draw(time: number) {
    const { gl, u } = this
    gl.uniform2f(u.uRes, this.canvas.width, this.canvas.height)
    gl.uniform1f(u.uTime, time)
    gl.uniform2f(u.uMouse, this.mouse.x, this.mouse.y)
    gl.uniform1f(u.uMouseAge, this.still ? 100 : time - this.mouse.at)
    gl.uniform1f(u.uScroll, window.scrollY)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  private loop = () => {
    cancelAnimationFrame(this.raf)
    if (this.still || !this.running) {
      this.draw(this.still ? 12 : this.now())
      return
    }
    let last = 0
    const frame = (now: number) => {
      // A little under the frame budget, so 60 Hz screens draw every other frame.
      if (now - last >= FRAME_MS - 4) {
        last = now
        this.draw(this.now())
      }
      this.raf = requestAnimationFrame(frame)
    }
    this.raf = requestAnimationFrame(frame)
  }
}
