import test from "node:test";
import assert from "node:assert/strict";
import {
  beijingHour,
  timeOfDay,
  contrastRatio,
  readableColor,
} from "../components/terminal/time-of-day.ts";

test("Beijing clock is independent of machine timezone, including midnight", () => {
  assert.equal(beijingHour(Date.parse("2026-09-15T04:00:00Z")), 12);
  assert.equal(beijingHour(Date.parse("2026-09-15T16:00:00Z")), 0);
  assert.equal(beijingHour(Date.parse("2026-01-01T22:30:00Z")), 6.5);
});
test("sun, moon and scene periods follow the same Beijing clock", () => {
  assert.equal(timeOfDay(6).period, "清晨");
  assert.equal(timeOfDay(12).period, "白天");
  assert.equal(timeOfDay(18.5).period, "黄昏");
  assert.equal(timeOfDay(23).period, "夜晚");
  assert.equal(timeOfDay(12).daylight, 1);
  assert.equal(timeOfDay(0).daylight, 0);
  assert.ok(timeOfDay(12).sunY < timeOfDay(6).sunY);
});
test("midnight wraps without a palette discontinuity", () => {
  assert.deepEqual(timeOfDay(0).palette, timeOfDay(24).palette);
  assert.deepEqual(timeOfDay(-1), timeOfDay(23));
  assert.deepEqual(timeOfDay(23.999).palette, timeOfDay(0).palette);
});
test("sky and terminal transition together between keyframes", () => {
  for (const hour of [5, 7, 17, 19.5]) {
    const a = timeOfDay(hour).palette,
      b = timeOfDay(hour + 0.1).palette;
    assert.notEqual(a.panel, b.panel);
    assert.notEqual(a.skyTop, b.skyTop);
  }
});
test("text remains readable through every minute of the light-dark transitions", () => {
  for (let minute = 0; minute < 1440; minute++) {
    const p = timeOfDay(minute / 60).palette;
    for (const key of ["text", "muted", "accent"])
      assert.ok(contrastRatio(p[key], p.panel) >= 4.5, `${minute}: ${key}`);
    for (const surface of ["chrome", "prompt", "code"])
      assert.ok(
        contrastRatio(readableColor(p.accent, p[surface]), p[surface]) >= 4.5,
        `${minute}: ${surface}`,
      );
    for (const color of Object.values(p)) assert.match(color, /^#[0-9a-f]{6}$/);
  }
});
