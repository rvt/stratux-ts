import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { connect } from 'pwa-helpers';
import { emitter, TIME_MILLIS_AT_ZERO } from '../utils/utils.js';
import { store } from '../redux/store.js';
import {
  formatAlt,
  formatBearing,
  formatDM,
  formatTail,
} from '../utils/formatters.js';
import { Vehicle } from '../types/vehicle.js';

@customElement('stratux-traffic')
export class StratuxTraffic extends connect(store)(LitElement) {
  private vehicles: Array<Vehicle> = [];

  private filter: string = '';

  private updateInterval: any;

  @property({ type: Number }) stratuxTime = TIME_MILLIS_AT_ZERO;

  static get scopedElements() {
    return {};
  }

  connectedCallback() {
    super.connectedCallback();
    emitter.on('mySituation', (e: any) => {
      this.stratuxTime = e.stratuxTime;
    });

    const TRAFFIC_UPDATE_INTERVAL = 500;
    this.updateInterval = setInterval(() => {
      // Updaten local display
    }, TRAFFIC_UPDATE_INTERVAL);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this.updateInterval);
  }

  stateChanged(state: any) {
    this.vehicles = state.vehicles.vehicles;
    this.filter = state.filter;
  }

  render() {
    const result = this.vehicles.map(
      traffic => html` <tbody>
        <tr>
          <th>${formatTail(traffic.tail)}</th>
          <th>${traffic.icaoAddr.toString(16).toUpperCase()}</th>
          <th>${formatDM(traffic.latLon)}</th>
          <th>${formatAlt(traffic.alt)}'</th>
          <th>${traffic.speed}</th>
          <th>${formatBearing(traffic.track)}</th>
          <th>${traffic.signalLevel.toFixed(1)}</th>
          <th>${((this.stratuxTime - traffic.lastSeen) / 1000).toFixed(1)}</th>
        </tr>
      </tbody>`
    );
    return html`
      <button class="button">Button</button>
      <table class="table">
        <thead>
          <tr>
            <th>CallSign</th>
            <th>Code</th>
            <th>Location</th>
            <th>Altitude</th>
            <th>Speed</th>
            <th>Course</th>
            <th>Power</th>
            <th>Age</th>
          </tr>
        </thead>
        ${result}
      </table>
    `;
  }
}
