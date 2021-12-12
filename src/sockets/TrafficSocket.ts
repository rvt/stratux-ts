import { LitElement, html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { connect } from 'pwa-helpers';
import { store } from '../redux/store.js';
import { TIME_MILLIS_AT_ZERO, emitter } from '../utils/utils.js';
import { Vehicle } from '../types/vehicle.js';
import {
  StratuxConnectionConfig,
  defaultStratuxConnectionConfig,
} from '../utils/models/StratuxConnectionConfig.js';
import { addvehicle, cleanupAged } from '../redux/vehiclesSlice.js';
import { localSettingsService } from '../utils/localDb.js';
import Patrolling from '../thirdparty/patrolling/index.js';

// We use a cash to push updayes into the application
// THis is specially usefull when we need to handle a lot of traffic (>200 tracked)
const CACH_BUFFER_SIZE: number = 50;
const CACH_TIMEOUT_MS: number = 300;

// Perhaps we can use ReactiveController later on?
@customElement('traffic-socket')
export class TrafficSocket extends connect(store)(LitElement) {
  @property({ type: Array }) vehicles = [];

  @property({ type: String }) filter = '';

  @property({ type: Boolean }) connected = false;

  @property({ attribute: false }) _date = new Date();

  private totalMessagesReceived: number = 0;

  private websocket: WebSocket | undefined;

  private cleanupInterval: any;

  private updateInterval: any;

  @property({ type: Object }) connectionConfig: StratuxConnectionConfig =
    defaultStratuxConnectionConfig;

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
  private static trafficToVehicleTransformer(traffic: any): Vehicle {
    return {
      id: `${traffic.Icao_addr}_${traffic.Addr_type}`,

      icaoAddr: traffic.Icao_addr,
      reg: traffic.Reg,
      tail: traffic.Tail,
      squawk: `${traffic.Squawk}`.padStart(4, '0'),

      emitterCategory: traffic.Emitter_category,
      surfaceVehicleType: traffic.SurfaceVehicleType,
      isOnGround: traffic.OnGround,
      targetType: traffic.TargetType,
      signalLevel: traffic.SignalLevel,
      isPositionValid: traffic.Position_valid,

      lonLat: [traffic.Lng, traffic.Lat],
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

  private async connect() {
    if (this.connected) return;

    await localSettingsService
      .getStratuxConnectionConfig()
      .then((event: StratuxConnectionConfig) => {
        this.connectionConfig = event;
      });

    const { connectionConfig } = this;

    this.websocket = new WebSocket(
      `ws://${connectionConfig.ip}:${connectionConfig.port}/traffic`
    );
    // `ws://${connectionConfig.ip}:${connectionConfig.port}/radar`);

    this.websocket.onopen = () => {
      this.connected = true;
    };

    this.websocket.onclose = () => {
      this.connected = false;
    };
    this.websocket.onerror = () => {
      if (this.websocket) this.websocket.close();
      this.connected = false;
      this.connect();
    };

    // We use Patrolling to only send updates after a X number of records where received or
    // when a timeout accurent
    // TODO: Also send out trafiic that appeared very close in range
    let buffer: Vehicle[] = [];
    const patrolling: Patrolling<Vehicle> = new Patrolling<Vehicle>(
      CACH_BUFFER_SIZE,
      CACH_TIMEOUT_MS,
      () => {
        store.dispatch(addvehicle(buffer));
        buffer = [];
      },
      (element: Vehicle) => {
        buffer.push(element);
        return buffer.length;
      }
    );

    this.websocket.onmessage = msg => {
      this.totalMessagesReceived += 1;
      const traffic: Vehicle = TrafficSocket.trafficToVehicleTransformer(
        JSON.parse(msg.data)
      );
      // Fixed a weird bug from radar, I think this was a config record??
      // that had undefined traffic
      if (traffic.icaoAddr) {
        patrolling.push(traffic);
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();

    emitter.on('config.stratuxConnectionConfig.changed', () => {
      if (this.websocket) this.websocket.close();
      this.connected = false;
      this.connect();
    });

    // Every XX seconds cleanup agaed traffic
    this.cleanupInterval = setInterval(() => {
      store.dispatch(cleanupAged());
      // Reconnect if connection was dropped somehow
      this.connect();
    }, 5000);

    // Immediatly connect
    this.connect();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    const { connected, cleanupInterval } = this;

    clearInterval(cleanupInterval);
    if (connected && this.websocket) {
      this.websocket.close();
    }
  }

  render() {
    const { connectionConfig, connected, totalMessagesReceived, vehicles } =
      this;
    return html`
      <div class="info">
        Listening on: ${connectionConfig.ip}:${connectionConfig.port}<br />
        Connected: ${connected ? 'true' : 'false'}<br />
        Total Messages: ${totalMessagesReceived}<br />
        Total tracked: ${vehicles.length}
      </div>
    `;
  }
}
