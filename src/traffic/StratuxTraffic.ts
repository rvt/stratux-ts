import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { connect } from 'pwa-helpers';
import { getVehicles } from '../redux/vehiclesSlice.js';
import { emitter, TIME_MILLIS_AT_ZERO } from '../utils/utils.js';
import { store } from '../redux/store.js';
import { bulmaStyles } from '../utils/bulma.js';

import {
  formatAge,
  formatAlt,
  formatBearing,
  formatDistance,
  formatDM,
  formatSpeed,
  formatTail,
} from '../utils/formatters.js';
import { Vehicle } from '../types/vehicle.js';

@customElement('stratux-traffic')
export class StratuxTraffic extends connect(store)(LitElement) {
  private vehicles: Vehicle[] = [];

  private updateInterval: any;

  private stratuxTime: number = TIME_MILLIS_AT_ZERO;
  // private that:StratuxTraffic;

  static get scopedElements() {
    return {};
  }

  static styles = [bulmaStyles];

  private handleStratuxTime = (stratuxTime: any) => {
    this.stratuxTime = stratuxTime;
  };

  connectedCallback() {
    super.connectedCallback();
    emitter.on('stratuxTime', this.handleStratuxTime);
    const TRAFFIC_UPDATE_INTERVAL = 500;
    this.updateInterval = setInterval(() => {
      this.requestUpdate();
    }, TRAFFIC_UPDATE_INTERVAL);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this.updateInterval);
    emitter.off('stratuxTime', this.handleStratuxTime);
  }

  stateChanged(state: any) {
    // const all vehicles = store.getState();
    this.vehicles = getVehicles(state.vehicles);
  }

  render() {
    const result = this.vehicles.map(
      traffic => html` <tr>
        <th>${formatTail(traffic.tail)}</th>
        <th>${traffic.squawk}</th>
        <th>${traffic.icaoAddr.toString(16).toUpperCase()}</th>
        <th>${formatDM(traffic.latLon)}</th>
        <th>${formatAlt(traffic.alt)}'</th>
        <th>${formatSpeed(traffic.speed)}</th>
        <th>${formatBearing(traffic.track)}</th>
        <th>${formatDistance(traffic.distance)}</th>
        <th>${traffic.signalLevel.toFixed(1)}</th>
        <th>${formatAge(this.stratuxTime, traffic.lastSeen)}</th>
      </tr>`
    );

    return html`
      <table class="table is-striped is-narrow is-hoverable is-fullwidth">
        <thead>
          <tr>
            <th>CallSign</th>
            <th>Squawk</th>
            <th>Code</th>
            <th>Location</th>
            <th>Altitude</th>
            <th>Speed</th>
            <th>Course</th>
            <th>Distance</th>
            <th>Power</th>
            <th>Age</th>
          </tr>
        </thead>
        <tbody>
          ${result}
        </tbody>
      </table>
    `;
  }
}
