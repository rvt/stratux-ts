import { LitElement, html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { formatDM } from '../utils/formatters.js';
import { emitter, TIME_MILLIS_AT_ZERO } from '../utils/utils.js';
import { MySituation } from '../types/mySituation.js';
import { localSettingsService } from '../utils/localDb.js';
import {
  StratuxConnectionConfig,
  defaultStratuxConnectionConfig,
} from '../utils/models/StratuxConnectionConfig.js';

// Perhaps we can use ReactiveController later on?
@customElement('mysituation-socket')
export class MySituationSocket extends LitElement {
  @property({ type: String }) ip = '127.0.0.1';

  @property({ type: Number }) port = 80;

  @property({ type: Boolean }) connected = false;

  @property({ type: Number }) totalMessagesReceived = 0;

  private websocket: WebSocket | undefined;

  private reconnectInterval: any;

  @property({ type: Object }) connectionConfig: StratuxConnectionConfig =
    defaultStratuxConnectionConfig;

  private mySituation: MySituation = {
    stratuxTime: TIME_MILLIS_AT_ZERO,
    latLon: { lat: 52, lon: 4 },
    lonLat: [4, 52],
    trueCourse: 0,
    groundSpeed: 0,
    turnRate: 0,
    pressureAltitude: 0,
  };

  static get styles() {
    return css`
      .info {
        font-size: 9px;
      }
    `;
  }

  private static _transformMySituation(situation: any): MySituation {
    return {
      stratuxTime: Date.parse(situation.StratuxTime) - TIME_MILLIS_AT_ZERO,
      latLon: { lat: situation.GPSLatitude, lon: situation.GPSLongitude },
      lonLat: [situation.GPSLongitude, situation.GPSLatitude],
      trueCourse: situation.GPSTrueCourse,
      groundSpeed: situation.GPSGroundSpeed,
      turnRate: situation.GPSTurnRate,
      pressureAltitude: situation.BaroPressureAltitude,
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
      `ws://${connectionConfig.ip}:${connectionConfig.port}/situation`
    );

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
    this.websocket.onmessage = msg => {
      this.totalMessagesReceived += 1;
      const raw = JSON.parse(msg.data);
      this.mySituation = MySituationSocket._transformMySituation(raw);
      emitter.emit('stratuxTime', this.mySituation.stratuxTime);

      if (raw.GPSFixQuality === 1) {
        emitter.emit('mySituation', this.mySituation);
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

    // For testing
    // TODO: Need to removed untill we have a betetr way to simulate traffic
    setInterval(() => {
      // Updaten local display
      this.mySituation.trueCourse += 1;
      //      emitter.emit('mySituation', this.mySituation);
    }, 1000);

    // For testing
    // TODO: Need to removed untill we have a betetr way to simulate traffic
    this.reconnectInterval = setInterval(() => {
      // Reconnect if connection was dropped somehow
      this.connect();
    }, 5000);

    // Immediatly connect
    this.connect();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    const { connected, reconnectInterval } = this;

    clearInterval(reconnectInterval);
    if (this.websocket && connected) {
      this.websocket.close();
    }
  }

  render() {
    const { connectionConfig, connected, totalMessagesReceived } = this;
    return html`
      <div class="info">
        Listening on: ${connectionConfig.ip}:${connectionConfig.port}<br />
        Connected: ${connected ? 'true' : 'false'}<br />
        Total Messages: ${totalMessagesReceived}<br />
        Location: ${formatDM(this.mySituation.latLon)}
      </div>
    `;
  }
}
