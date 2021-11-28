import { LitElement, html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { connect } from 'pwa-helpers';
import { store } from '../redux/store.js';
import { TIME_MILLIS_AT_ZERO } from '../utils/utils.js';
import { Vehicle } from '../types/vehicle.js';

import { addvehicle, cleanupAged } from '../redux/vehiclesSlice.js';

// Perhaps we can use ReactiveController later on?
@customElement('traffic-socket')
export class TrafficSocket extends connect(store)(LitElement) {
  @property({ type: Array }) vehicles = [];

  @property({ type: String }) filter = '';

  @property({ type: String }) ip = '127.0.0.1';

  @property({ type: Number }) port = -1;

  @property({ type: Boolean }) connected = false;

  @property({ attribute: false }) _date = new Date();

  private totalMessagesReceived: number = 0;

  private websocket: WebSocket | undefined;

  private cleanupInterval: any;

  private updateInterval: any;

  static get styles() {
    return css`
      .info {
        font-size: 9px;
      }
    `;
  }

  stateChanged(state: any) {
    this.vehicles = state.vehicles.vehicles;
    this.filter = state.filter;
  }

  // TODO: Decide if we want to use https://github.com/typestack/class-transformer
  private static _trafficToVehicleTransformer(traffic: any): Vehicle {
    return {
      id: `${traffic.Icao_addr}_${traffic.Addr_type}`,

      icaoAddr: traffic.Icao_addr,
      reg: traffic.Reg,
      tail: traffic.Tail,
      squawk: traffic.Squawk,

      emitterCategory: traffic.Emitter_category,
      surfaceVehicleType: traffic.SurfaceVehicleType,
      isOnGround: traffic.OnGround,
      targetType: traffic.TargetType,
      signalLevel: traffic.SignalLevel,
      isPositionValid: traffic.Position_valid,

      lonLat: [traffic.Lat, traffic.Lng],
      latLon: { lon: traffic.Lng, lat: traffic.Lat },
      track: traffic.Track,
      turnrate: traffic.TurnRate,
      speed: traffic.Speed,
      isSpeedValid: traffic.Speed_valid,
      vVel: traffic.Vvel,
      alt: traffic.Alt,
      isAltGNSS: traffic.AltIsGNSS,
      lastSeen:
        Date.parse(traffic.Last_seen).valueOf() - TIME_MILLIS_AT_ZERO.valueOf(),
      age: traffic.Age,
      ageExtrapolation: traffic.AgeExtrapolation,
      isExtrapolatedPosition: traffic.ExtrapolatedPosition,

      distance: traffic.Distance,
      isDistanceEstimated: traffic.DistanceEstimated,
      distanceEstimatedLastTs: traffic.DistanceEstimatedLastTs,

      isStratux: traffic.IsStratux,
      lastSource: traffic.Last_source,
    };
  }

  connectedCallback() {
    super.connectedCallback();
    const { ip, port } = this;
    this.websocket = new WebSocket(`ws://${ip}:${port}/traffic`);
    //    this.websocket = new WebSocket(`ws://${ip}:${port}/radar`);

    this.websocket.onopen = () => {
      this.connected = true;
    };

    this.websocket.onclose = () => {
      this.connected = false;
    };

    this.websocket.onmessage = msg => {
      this.totalMessagesReceived += 1;
      const traffic = TrafficSocket._trafficToVehicleTransformer(
        JSON.parse(msg.data)
      );
      if (traffic.icaoAddr) {
        // Fixed a weird bug from radar that had undefined traffic
        store.dispatch(addvehicle(traffic));
      }
    };

    // Every XX seconds tell to update vehicles
    // const STRATUX_UPDATE_INTERVAL = 1000;
    // this.updateInterval = setInterval(() => {
    //   // Updaten local display
    //   this._date = new Date();
    //   emitter.emit('vehicles.position.updated', true)
    // }, STRATUX_UPDATE_INTERVAL);

    // Every XX seconds cleanup agaed traffic
    this.cleanupInterval = setInterval(() => {
      store.dispatch(cleanupAged());
    }, 5000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    const { connected, updateInterval, cleanupInterval } = this;

    clearInterval(updateInterval);
    clearInterval(cleanupInterval);
    if (connected && this.websocket && this.connected) {
      this.websocket.close();
    }
  }

  render() {
    const { ip, port, connected, totalMessagesReceived, vehicles } = this;
    return html`
      <div class="info">
        Listening on: ${ip}:${port}<br />
        Connected: ${connected ? 'true' : 'false'}<br />
        Total Messages: ${totalMessagesReceived}<br />
        Total tracked: ${vehicles.length}
      </div>
    `;
  }
}
