// The Western Hills, drawn per pixel. Seven ridgelines from the far range to
// the near slope, each a 1D ridged noise that parallaxes with the camera, lit
// by the real sun, washed into haze by distance. Sky, clouds, weather and
// night all sit on top of the same few uniforms.

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

uniform vec3 u_skyTop;
uniform vec3 u_skyHorizon;
uniform vec3 u_haze;
uniform vec3 u_sunCol;
uniform vec2 u_sun;       // azimuth off straight-ahead (west), elevation; radians
uniform float u_sunVis;
uniform float u_light;
uniform float u_night;
uniform vec2 u_moon;      // x in half-widths, y in screen heights

uniform vec3 u_foliage;
uniform vec3 u_foliageAlt;

uniform float u_cloud;
uniform float u_rain;
uniform float u_snow;
uniform float u_fog;
uniform float u_wind;
uniform float u_flash;
uniform float u_flashX;

const float HORIZON = 0.46;
const float FOCAL = 1.2;
const float LAST = 6.0;   // index of the nearest layer

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise1(float x) {
  float i = floor(x);
  float f = fract(x);
  return mix(hash11(i), hash11(i + 1.0), f * f * (3.0 - 2.0 * f));
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

float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    s += a * noise2(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return s;
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

// ridged value noise: rounded shoulders, creased peaks
float ridgeline(float x) {
  float h = 0.0;
  float a = 0.5;
  for (int o = 0; o < 6; o++) {
    float n = noise1(x);
    float r = 1.0 - abs(n * 2.0 - 1.0);
    h += a * mix(n, r * r, 0.55);
    x = x * 2.07 + 13.1;
    a *= 0.47;
  }
  return h;
}

float layerPar(float s) { return mix(0.05, 1.0, pow(s, 1.7)); }
float layerAmp(float s) { return mix(0.05, 0.34, pow(s, 1.3)); }

float layerHeight(float i, float x) {
  float s = i / LAST;
  float par = layerPar(s);
  float base = mix(0.455, 0.0, pow(s, 0.9));
  float freq = mix(4.2, 0.85, pow(s, 0.7));
  float wx = (x + u_cam.x * par) * freq + i * 41.7;
  float swell = 0.45 + 0.8 * noise1(wx * 0.19 + 7.0);
  float tilt = (noise1(wx * 0.06 + 3.0) - 0.5) * 0.05 * s;
  return base + tilt + layerAmp(s) * ridgeline(wx) * swell - u_cam.y * par;
}

float cloudField(vec2 p, out float thick) {
  float yy = max(p.y - HORIZON, 0.0);
  vec2 cp = vec2((p.x + u_cam.x * 0.12) / (0.3 + yy) * 0.85, yy * 3.4);
  cp.x += u_time * 0.004 * (0.4 + u_wind * 1.6);
  vec2 w = vec2(fbm(cp * 1.1 + vec2(0.0, u_time * 0.005)), fbm(cp * 1.1 + vec2(5.2, 1.3)));
  float n = fbm(cp * 1.6 + w * 1.4);
  float edge = mix(0.68, 0.3, u_cloud);
  thick = smoothstep(edge, edge + 0.42, n);
  return smoothstep(edge, edge + 0.2, n) * smoothstep(-0.01, 0.07, p.y - HORIZON);
}

void main() {
  float aspect = u_res.x / u_res.y;
  vec2 p = vec2((v_uv.x - 0.5) * aspect, v_uv.y);
  float t = u_time;
  float px = 1.0 / u_res.y;

  // ---- where the sun is, and what it does to the air ----
  vec2 sp = vec2(tan(clamp(u_sun.x, -1.3, 1.3)) * FOCAL, HORIZON + tan(clamp(u_sun.y, -1.2, 1.2)) * FOCAL);
  float ahead = cos(u_sun.x);
  float sunAhead = smoothstep(0.2, 0.55, ahead);
  float sunDist = length(p - sp);
  float lowSun = 1.0 - smoothstep(0.05, 0.45, u_sun.y);
  float twilight = smoothstep(-0.22, -0.02, u_sun.y) * lowSun;
  float glow = (exp(-sunDist * 2.2) * 0.55 + exp(-sunDist * 9.0) * 0.45)
    * sunAhead * u_sunVis * smoothstep(-0.12, 0.02, u_sun.y);
  float band = twilight * (sunAhead * exp(-abs(p.x - sp.x) * 1.4) + (1.0 - sunAhead) * 0.35);
  vec3 haze = u_haze + u_sunCol * (glow * 0.45 + band * 0.22);

  // ---- mountains, nearest layer that covers this pixel wins ----
  float hit = -1.0;
  float ridge = 0.0;
  for (int k = 0; k < 7; k++) {
    float i = LAST - float(k);
    float h = layerHeight(i, p.x);
    if (p.y < h) {
      hit = i;
      ridge = h;
      break;
    }
  }

  vec3 col;
  float cloudDens = 0.0;

  if (hit >= 0.0) {
    float s = hit / LAST;
    float par = layerPar(s);
    float amp = layerAmp(s);
    float d = ridge - p.y;
    vec2 wp = vec2(p.x + u_cam.x * par, p.y + u_cam.y * par);

    float e = 2.0 * px;
    float slope = (layerHeight(hit, p.x + e) - layerHeight(hit, p.x - e)) / (2.0 * e);
    vec2 n = normalize(vec2(-slope * 1.6, 1.0));
    // below the crest the ridge's own slope fades out; faces get gullies and spurs
    float crest = exp(-d / (amp * 0.4 + 0.008));
    vec2 fp = wp * vec2(mix(22.0, 7.0, s), mix(7.0, 2.4, s)) + hit * 3.0;
    float fx = fbm3(fp + vec2(0.3, 0.0)) - fbm3(fp - vec2(0.3, 0.0));
    n = normalize(mix(normalize(vec2(-fx * 2.4, 1.0)), n, crest));
    vec2 L = normalize(vec2(sin(u_sun.x) * cos(u_sun.y), max(sin(u_sun.y), 0.0) + 0.25));
    float lambert = clamp(dot(n, L), 0.0, 1.0);
    float frontLit = clamp(-ahead, 0.0, 1.0);
    float backlit = clamp(ahead, 0.0, 1.0) * lowSun * smoothstep(-0.05, 0.03, u_sun.y);

    // forest, coarser up close; foliage patches carry the season
    float detail = fbm3(wp * mix(260.0, 70.0, s) + hit * 11.0);
    float patches = smoothstep(0.35, 0.7, noise2(wp * vec2(9.0, 14.0) + hit * 5.0));
    vec3 albedo = mix(u_foliage, u_foliageAlt, patches) * (0.8 + 0.45 * detail * mix(0.4, 1.0, s));
    albedo = mix(albedo, vec3(0.8, 0.83, 0.88), u_snow * 0.75 * smoothstep(0.3, 0.9, n.y) * (0.6 + 0.4 * detail));

    float sunLight = mix(lambert, 0.75, frontLit) * (1.0 - backlit * 0.55) * smoothstep(-0.1, 0.05, u_sun.y);
    float shadows = smoothstep(0.4, 0.75, fbm3(vec2(wp.x * 1.3 - t * 0.012 * (0.5 + u_wind), hit * 3.7 + wp.y * 2.0)));
    sunLight *= 1.0 - shadows * 4.0 * u_cloud * (1.0 - u_cloud) * 0.6;

    vec3 ambient = mix(u_skyTop, u_skyHorizon, 0.5) * (0.55 + 0.35 * u_cloud) + vec3(0.03, 0.05, 0.09) * u_night;
    vec3 direct = u_sunCol * sunLight * u_sunVis * u_light * 1.1;
    // valleys of the near ridges sit in their own shade
    float occlusion = mix(1.0, 0.72, smoothstep(0.0, amp * 0.8, d) * s);
    col = albedo * (ambient + direct) * 1.45 * occlusion;

    // sunlight catching the ridge crest when the sun is low ahead of us
    col += u_sunCol * exp(-d / (2.5 * px)) * backlit * u_sunVis * 0.7 * (0.4 + 0.6 * s);
    col += haze * exp(-d / (1.5 * px)) * 0.05;

    // lights in the far valleys at night
    if (u_night > 0.01 && hit > 1.5 && hit < 4.5) {
      float cell = floor(wp.x * 55.0);
      float r = hash11(cell + hit * 91.0);
      if (r > 0.9) {
        float lx = (cell + 0.5 + (hash11(cell * 1.7 + hit) - 0.5) * 0.6) / 55.0 - u_cam.x * par;
        float ly = layerHeight(hit, lx) - (0.3 + 0.5 * hash11(cell * 3.1 + hit)) * amp;
        float dist = length(p - vec2(lx, ly)) * u_res.y;
        float flicker = 0.85 + 0.15 * sin(t * (1.3 + r * 3.0) + cell);
        col += vec3(1.0, 0.72, 0.42) * (exp(-dist * dist / 2.5) + exp(-dist / 5.0) * 0.12) * u_night * flicker;
      }
    }

    // distance and the mist that pools at every ridge's foot
    float aer = pow(1.0 - s, 1.35) * mix(0.8, 0.95, u_fog);
    float foot = smoothstep(0.0, amp * 0.9 + 0.02, d) * mix(0.55, 0.18, s) * (1.0 + u_fog * 0.8);
    float drift = 0.55 + 0.9 * fbm3(vec2(wp.x * 2.5 - t * 0.008 * (1.0 + u_wind), d * 12.0 + hit));
    col = mix(col, haze, clamp(aer + foot * drift * (1.0 - aer), 0.0, 0.985));
  } else {
    float y = clamp((p.y - HORIZON) / (1.0 - HORIZON), 0.0, 1.0);
    col = mix(u_skyHorizon, u_skyTop, pow(y, 0.6));
    col = mix(col, haze, (1.0 - smoothstep(0.0, 0.25, y)) * 0.5);
    col += u_sunCol * (glow * 0.9 + band * 0.3 * (1.0 - y));
    float disc = smoothstep(0.03, 0.025, sunDist) * sunAhead * u_sunVis;
    col = mix(col, u_sunCol * 1.5 + 0.25, disc);

    if (u_night > 0.01) {
      vec2 sg = (p + u_cam * 0.03) * u_res.y / 2.5;
      vec2 cell = floor(sg);
      float hs = hash12(cell);
      if (hs > 0.986) {
        vec2 o = vec2(hash12(cell + 1.3), hash12(cell + 2.9)) - 0.5;
        float dd = length(fract(sg) - 0.5 - o * 0.6);
        float tw = 0.6 + 0.4 * sin(t * (1.0 + hs * 4.0) + hs * 80.0);
        col += vec3(0.85, 0.9, 1.0) * smoothstep(0.4, 0.0, dd) * tw * (0.35 + (hs - 0.986) * 110.0)
          * u_night * smoothstep(0.0, 0.3, y);
      }
      vec2 mp = vec2(u_moon.x * aspect * 0.5, u_moon.y);
      float md = length(p - mp);
      float moon = smoothstep(0.0135, 0.0115, md) * (0.82 + 0.18 * fbm3((p - mp) * 160.0));
      col += vec3(0.93, 0.94, 1.0) * (moon * 0.9 + exp(-md * 7.0) * 0.09 + exp(-md * 32.0) * 0.08) * u_night;
    }

    float thick;
    cloudDens = cloudField(p, thick);
    float lit = 1.0 - thick * 0.7 + exp(-sunDist * 3.0) * 0.4 * (1.0 - thick);
    vec3 litCol = mix(vec3(0.92, 0.93, 0.95), u_sunCol, 0.35 + 0.4 * lowSun) * u_light;
    vec3 darkCol = mix(u_skyTop, vec3(0.3, 0.32, 0.36), 0.7) * u_light * (1.0 - 0.45 * u_rain);
    vec3 cloud = mix(darkCol, litCol, clamp(lit, 0.0, 1.0));
    cloud += u_sunCol * exp(-sunDist * 5.0) * (1.0 - thick) * sunAhead * u_sunVis * 0.6;
    col = mix(col, cloud, cloudDens * mix(0.75, 1.0, u_cloud));
  }

  // ---- weather in the air ----
  if (u_rain > 0.01) {
    // grey curtains hanging under the clouds over the far ranges
    float shaft = smoothstep(0.4, 0.75, fbm3(vec2(p.x * 1.8 + u_cam.x * 0.2 + t * 0.003, 3.0)));
    float streaky = fbm3(vec2((p.x + p.y * 0.08 * (0.5 + u_wind)) * 70.0, p.y * 3.0 + t * 0.9));
    float span = smoothstep(HORIZON - 0.12, HORIZON + 0.05, p.y) * (1.0 - smoothstep(0.6, 0.85, p.y));
    float farW = hit < 0.0 ? 1.0 : pow(1.0 - hit / LAST, 0.7);
    float veil = u_rain * shaft * span * farW * (0.55 + 0.45 * streaky);
    col = mix(col, mix(u_haze, vec3(0.5, 0.53, 0.57) * u_light, 0.5), veil * 0.55);

    float streaks = 0.0;
    for (int k = 0; k < 2; k++) {
      float fk = float(k);
      float density = 140.0 + fk * 120.0;
      vec2 rq = vec2(p.x + p.y * (0.12 + u_wind * 0.25), p.y);
      float column = floor(rq.x * density);
      float h = hash11(column * 1.3 + fk * 57.0);
      float fall = fract(rq.y * (1.6 + fk) + t * (2.2 + h + fk * 0.6) + h * 19.0);
      float line = smoothstep(0.5, 0.1, abs(fract(rq.x * density) - 0.5));
      streaks += line * smoothstep(0.7, 1.0, fall) * fall * step(0.55, h) * (0.9 - fk * 0.4);
    }
    col += vec3(0.75, 0.8, 0.86) * streaks * u_rain * 0.09 * (0.3 + 0.7 * u_light);
  }

  if (u_snow > 0.01) {
    float flakes = 0.0;
    for (int k = 0; k < 3; k++) {
      float fk = float(k);
      float scale = mix(16.0, 48.0, fk * 0.5);
      vec2 sq = p * scale;
      sq.y += t * scale * (0.035 - fk * 0.008);
      sq.x += sin(t * 0.6 + sq.y * 0.35 + fk) * 0.35 - t * u_wind * scale * 0.02;
      vec2 cell = floor(sq);
      float h = hash12(cell + fk * 17.0);
      vec2 o = (vec2(hash12(cell + 3.1), hash12(cell + 7.7)) - 0.5) * 0.7;
      float dd = length(fract(sq) - 0.5 - o);
      flakes += step(0.55, h) * smoothstep(0.12 - fk * 0.02, 0.0, dd) * (1.0 - fk * 0.3);
    }
    col += vec3(0.9, 0.92, 0.96) * flakes * u_snow * (0.35 + 0.65 * u_light);
  }

  // lightning lights the cloud deck from inside
  col += vec3(0.75, 0.8, 1.0) * u_flash * (cloudDens * exp(-abs(p.x - u_flashX) * 2.2) * 0.9 + 0.05);

  // ---- grade ----
  col = max(col, 0.0);
  col = col / (1.0 + col * 0.15);
  vec2 v = (v_uv - 0.5) * vec2(0.95, 1.15);
  col *= 1.0 - dot(v, v) * 0.55;
  col += (hash12(v_uv * u_res + fract(t * 7.0) * 91.0) - 0.5) * 0.025;
  col *= smoothstep(0.0, 0.5, u_intro);

  gl_FragColor = vec4(col, 1.0);
}
`;
