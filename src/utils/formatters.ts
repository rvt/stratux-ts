import { html } from 'lit';
import { toStringHDMS } from 'ol/coordinate';
import { LatLon } from '../types/latLon.js';

// import 'numbro';
// @ts-ignore
// let foo:string = numbro(1000).format('0000');

export const formatDM = (latLog: LatLon) =>
  toStringHDMS([latLog.lon, latLog.lat]);

export const formatAlt = (val: number) => val.toLocaleString('en-US');

export const formatTail = (tail: string) => {
  if (tail.trim().length === 0) {
    return '[--N/A--]';
  }
  return tail;
};

export const formatBearing = (bearing: number) =>
  html`${bearing.toFixed(0)}&deg;`;

export const formatDistance = (distance: number) =>
  html`${(distance / 1000).toFixed(1)}nm`;

export const formatSquawk = (squawk: number) => {
  const out = `${squawk}`.padStart(4, '0');
  return html`${out}`;
};

export const formatAge = (stratuxTime: number, lastSeen: number) => {
  const age = (Math.max(0, stratuxTime - lastSeen) / 1000).toFixed(1);
  return html`${age}s`;
};

export const formatSpeed = (speed: number) => html`${speed}kts`;
