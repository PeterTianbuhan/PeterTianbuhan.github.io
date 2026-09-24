// One full-screen pass over the photo. The camera is faked by warping the
// lookup with a baked parallax map (R), then the sky (G) and the rain curtain
// (B) are advected with a two-phase flow map so they keep moving without ever
// drifting off the texture.

export const vertexSource = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

export const fragmentSource = `
precision highp float;

varying vec2 v_uv;

uniform sampler2D u_photo;
uniform sampler2D u_map;
uniform vec2 u_res;
uniform vec2 u_img;
uniform float u_time;
uniform float u_intro;   // 0 -> 1 over the opening seconds
uniform float u_flash;   // lightning envelope
uniform vec2 u_pan;      // lateral camera offset, image-uv units
uniform float u_dolly;   // 0..1 slow push toward the ridges

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    s += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return s;
}

// screen uv (y down) -> image uv, object-fit: cover
vec2 cover(vec2 uv) {
  float sa = u_res.x / u_res.y;
  float ia = u_img.x / u_img.y;
  vec2 s = sa > ia ? vec2(1.0, ia / sa) : vec2(sa / ia, 1.0);
  return (uv - 0.5) * s + 0.5;
}

vec3 photo(vec2 q) {
  return texture2D(u_photo, clamp(q, 0.001, 0.999)).rgb;
}

void main() {
  vec2 uv = vec2(v_uv.x, 1.0 - v_uv.y);
  vec2 base = cover(uv);
  float t = u_time;

  // ---- camera: zoom about a pivot near the horizon, parallax by depth ----
  float intro = 1.0 - pow(1.0 - u_intro, 3.0);
  float zoom = 1.12 + 0.14 * (1.0 - intro);
  vec2 pivot = vec2(0.5, 0.53);
  vec2 q = base;
  for (int i = 0; i < 3; i++) {
    float d = texture2D(u_map, clamp(q, 0.0, 1.0)).r;
    float push = 1.0 + u_dolly * 0.07 * d;
    q = pivot + (base - pivot) / (zoom * push) + u_pan * (d - 0.2);
  }

  vec3 m = texture2D(u_map, clamp(q, 0.0, 1.0)).rgb;
  float sky = m.g;
  float rain = m.b;

  // ---- sky: clouds drift left and boil, the rain curtain pours down ----
  vec2 cloudFlow = vec2(-1.0, 0.08) + (vec2(fbm(q * 3.0 + 4.0), fbm(q * 3.0 - 2.0)) - 0.5) * 0.9;
  vec2 rainFlow = vec2(-0.12, 1.0) * 1.8;
  vec2 flow = mix(cloudFlow, rainFlow, rain) * sky;

  float jitter = fbm(q * 2.5) * 0.6;
  float ph0 = fract(t * 0.03 + jitter);
  float ph1 = fract(t * 0.03 + jitter + 0.5);
  float w = abs(ph0 * 2.0 - 1.0);
  vec2 boil = (vec2(fbm(q * 5.0 + t * 0.02), fbm(q * 5.0 - t * 0.02 + 7.0)) - 0.5) * 0.005 * sky;
  float reach = 0.014;
  vec3 col = mix(
    photo(q + boil - flow * ph0 * reach),
    photo(q + boil - flow * ph1 * reach),
    w
  );

  // ---- light through the gap breathes a little ----
  float gap = exp(-pow(length((q - vec2(0.33, 0.3)) * vec2(1.0, 1.7)) / 0.22, 2.0));
  col *= 1.0 + gap * (0.05 + 0.05 * sin(t * 0.21));

  // ---- cloud shadows sliding over the ridges ----
  float land = 1.0 - sky;
  float shadowN = fbm(q * vec2(2.4, 5.0) + vec2(-t * 0.011, t * 0.002));
  float shade = mix(0.86, 1.07, smoothstep(0.32, 0.72, shadowN));
  col *= mix(1.0, shade, land * smoothstep(0.54, 0.72, q.y));

  // ---- valley mist, heavier under the storm ----
  float band = smoothstep(0.5, 0.56, q.y) * (1.0 - smoothstep(0.64, 0.78, q.y));
  float mistN = fbm(vec2(q.x * 3.2 - t * 0.014, q.y * 10.0 + t * 0.003));
  float mist = band * smoothstep(0.42, 0.82, mistN) * (0.3 + 0.7 * smoothstep(0.3, 0.85, q.x));
  col = mix(col, vec3(0.6, 0.66, 0.72), mist * 0.24);

  // ---- rain streaks inside the curtain, two depths ----
  float streaks = 0.0;
  for (int k = 0; k < 2; k++) {
    float fk = float(k);
    float density = 380.0 + fk * 260.0;
    vec2 rq = q;
    rq.x += rq.y * (0.07 + fk * 0.02);
    float column = floor(rq.x * density);
    float h = hash(vec2(column, 3.1 + fk));
    float fall = fract(rq.y * (3.2 + fk * 2.4) - t * (0.9 + h * 0.6 + fk * 0.4) + h * 17.0);
    float line = smoothstep(0.5, 0.15, abs(fract(rq.x * density) - 0.5));
    streaks += line * smoothstep(0.55, 1.0, fall) * fall * step(0.6, h) * (0.8 - fk * 0.35);
  }
  col += vec3(0.72, 0.77, 0.82) * streaks * rain * 0.045;

  // ---- distant lightning inside the storm cell ----
  float cell = smoothstep(0.55, 0.9, q.x) * (1.0 - smoothstep(0.08, 0.48, q.y)) * sky;
  col += vec3(0.72, 0.78, 0.95) * u_flash * cell * (0.2 + 0.8 * fbm(q * 7.0 + 3.0)) * 0.45;
  col += u_flash * 0.02;

  // ---- grade: gentle contrast, vignette, grain, fade from black ----
  col = mix(col, col * col * (3.0 - 2.0 * col), 0.18);
  vec2 v = (uv - 0.5) * vec2(0.95, 1.15);
  col *= 1.0 - dot(v, v) * 0.6;
  col += (hash(uv * u_res + fract(t * 7.0) * 91.0) - 0.5) * 0.03;
  col *= smoothstep(0.0, 0.55, u_intro);

  gl_FragColor = vec4(col, 1.0);
}
`;
