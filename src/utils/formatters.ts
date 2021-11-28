import { html } from 'lit';
import { toStringHDMS } from 'ol/coordinate';
import { LatLon } from '../types/latLon.js';

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
