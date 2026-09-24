// Brings a baked poster to life. The layers are painted illustrations
// (premultiplied alpha, 16:9 board); this pass parallaxes them, lets the sky
// churn, turns the gap below the far shore into a lake that mirrors the sky,
// the far shore and the pagoda, sways the willow, and floats catkins through
// the sunlight.

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

uniform vec2 u_res;
uniform float u_time;
uniform float u_intro;
uniform vec2 u_cam;
uniform vec2 u_focus;     // board x to hold: wide screens, tall screens
uniform float u_water;    // waterline, board uv (y down)
uniform vec2 u_sun;       // where the painted sun sits, board uv

uniform sampler2D u_sky;
uniform sampler2D u_far;
uniform sampler2D u_tower;
uniform sampler2D u_island;
uniform sampler2D u_near;
uniform sampler2D u_front;

const float BOARD = 16.0 / 9.0;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x),
    mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm3(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    s += a * noise2(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return s / 0.875;
}

vec2 shift(float depth) {
  return vec2(u_cam.x * (1.0 - depth) * 0.028, u_cam.y * (1.0 - depth) * 0.01);
}

vec4 layer(sampler2D tex, vec2 q) {
  return texture2D(tex, clamp(q, vec2(0.0), vec2(1.0)));
}

vec3 over(vec3 base, vec4 l) {
  return base * (1.0 - l.a) + l.rgb;
}

vec3 skyAt(vec2 a) {
  // clouds churn in place: a slow drift plus a soft domain warp
  vec2 w = vec2(fbm3(a * 3.0 + u_time * 0.015), fbm3(a * 3.0 - u_time * 0.012 + 4.0)) - 0.5;
  vec2 q = a + shift(1.0) + vec2(sin(u_time * 0.02) * 0.006, 0.0) + w * 0.006 * smoothstep(u_water, 0.0, a.y);
  return texture2D(u_sky, clamp(q, vec2(0.0), vec2(1.0))).rgb;
}

// what stands on the far side of the water
vec3 beyond(vec2 a) {
  vec3 col = skyAt(a);
  col = over(col, layer(u_far, a + shift(0.85)));
  col = over(col, layer(u_tower, a + shift(0.7)));
  return col;
}

void main() {
  float t = u_time;
  vec2 uv = vec2(v_uv.x, 1.0 - v_uv.y);

  // cover the screen with the board; tall screens hold on the focus point
  float sa = u_res.x / u_res.y;
  vec2 span = sa > BOARD ? vec2(1.0, BOARD / sa) : vec2(sa / BOARD, 1.0);
  float intro = 1.0 - pow(1.0 - u_intro, 3.0);
  float zoom = 1.06 + 0.08 * (1.0 - intro);
  vec2 halfSpan = span / (2.0 * zoom);
  vec2 focus = vec2(mix(u_focus.y, u_focus.x, smoothstep(0.8, 1.6, sa)), 0.5);
  vec2 a = clamp(focus, halfSpan, 1.0 - halfSpan) + (uv - 0.5) * span / zoom;

  vec3 col;
  if (a.y < u_water) {
    col = beyond(a);
  } else {
    // the lake: a mirror, smeared and broken up more as it comes closer
    float wy = a.y - u_water;
    float persp = clamp(wy / (1.0 - u_water), 0.0, 1.0);
    // coordinates on the water plane: ripples shrink toward the far shore
    float pz = 1.0 / (persp + 0.035);
    vec2 wp = vec2((a.x - 0.5) * pz, pz);
    float r1 = fbm3(vec2(wp.x * 0.9 + t * 0.03, wp.y * 0.55 - t * 0.35));
    float r2 = noise2(vec2(wp.x * 4.0 - t * 0.06, wp.y * 1.6 + t * 0.7));
    vec2 wobble = vec2((r1 - 0.5) * 0.012, (r2 - 0.5) * 0.003) * (0.25 + persp * 1.4);
    vec2 m = vec2(a.x, u_water - wy) + wobble;
    float spread = 0.0015 + persp * 0.008;
    vec3 refl = (beyond(m - vec2(0.0, spread)) + beyond(m) + beyond(m + vec2(0.0, spread))) / 3.0;

    vec3 jade = vec3(0.1, 0.36, 0.38);
    col = mix(jade, refl * vec3(0.84, 0.95, 0.95), mix(0.82, 0.5, pow(persp, 0.8)));
    // bright ripple lines and sun glitter
    float lines = smoothstep(0.72, 0.95, noise2(vec2(wp.x * 1.2 + t * 0.02, wp.y * 1.4 - t * 0.25)));
    col += vec3(0.85, 0.95, 1.0) * lines * (0.04 + 0.1 * persp);
    float glint = pow(noise2(vec2(wp.x * 14.0, wp.y * 5.0 + t * 1.4)), 16.0);
    col += vec3(1.0, 0.97, 0.88) * glint * 1.6 * smoothstep(0.02, 0.2, persp);
    // a thin shadow line where the water meets the far shore
    col *= mix(0.72, 1.0, smoothstep(0.0, 0.004, wy));
  }

  col = over(col, layer(u_island, a + shift(0.55)));
  col = over(col, layer(u_near, a + shift(0.25)));

  // sun shafts from the upper left, behind the willow
  vec2 d = a - u_sun;
  float ang = atan(d.y, d.x * BOARD);
  float shafts = noise2(vec2(ang * 18.0, t * 0.05)) * noise2(vec2(ang * 7.0 + 3.0, t * 0.03));
  col += vec3(1.0, 0.93, 0.78) * shafts * exp(-length(d * vec2(BOARD, 1.0)) * 1.6) * 0.22;

  // the willow in the breeze: branches swing more toward their tips
  float hang = clamp(a.y * 1.6, 0.0, 1.0);
  float sway = sin(t * 0.8 + a.y * 6.0 + a.x * 2.0) * 0.004 + sin(t * 1.7 + a.y * 11.0) * 0.0015;
  col = over(col, layer(u_front, a + shift(0.05) + vec2(sway * hang, 0.0)));

  // willow catkins drifting through the light, three depths
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float scale = 7.0 + fi * 6.0;
    vec2 p = vec2(uv.x * sa, uv.y) * scale;
    p += vec2(t * (0.05 + fi * 0.03), -t * (0.02 + fi * 0.01)) * scale * 0.4;
    p.x += u_cam.x * (0.2 + fi * 0.3);
    vec2 cell = floor(p);
    float h = hash12(cell + fi * 13.0);
    if (h > 0.8) {
      vec2 o = vec2(hash12(cell + 2.3), hash12(cell + 5.1)) - 0.5;
      o += 0.18 * vec2(sin(t * (0.6 + h) + h * 30.0), cos(t * (0.5 + h) + h * 20.0));
      float dd = length(fract(p) - 0.5 - o * 0.7);
      float size = (0.025 + 0.02 * h) * (1.3 - fi * 0.3);
      float glow = smoothstep(size, 0.0, dd) + smoothstep(size * 2.5, 0.0, dd) * 0.2;
      // catkins only catch the eye where the light falls through
      float lit = 0.35 + 0.65 * exp(-length((a - u_sun) * vec2(BOARD, 1.0)) * 0.9);
      col += vec3(1.0, 0.95, 0.82) * glow * lit * (0.45 + 0.25 * sin(t + h * 40.0)) * (0.5 - fi * 0.12);
    }
  }

  // grade
  vec2 v = (v_uv - 0.5) * vec2(0.9, 1.1);
  col *= 1.0 - dot(v, v) * 0.35;
  col += (hash12(v_uv * u_res + fract(t * 7.0) * 91.0) - 0.5) * 0.012;
  col = mix(vec3(1.0), col, smoothstep(0.0, 0.45, u_intro));

  gl_FragColor = vec4(col, 1.0);
}
`;
