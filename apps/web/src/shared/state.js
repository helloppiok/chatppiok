export const state = {
  w: 0,
  h: 0,
  grid: 32,
  me: null,
  bots: [],
  keys: { up:false, down:false, left:false, right:false },
  touchTarget: null,
  lastMoveAt: 0,
  viewScale: 1
};

export const clamp = (v, min, max) =>
  Math.max(min, Math.min(max, v));

export const rand = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
