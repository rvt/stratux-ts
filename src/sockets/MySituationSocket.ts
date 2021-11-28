import { LitElement, html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { formatDM } from '../utils/formatters.js';
import { emitter, TIME_MILLIS_AT_ZERO } from '../utils/utils.js';
import { MySituation } from '../types/mySituation.js';

// Perhaps we can use ReactiveController later on?
@customElement('mysituation-socket')
export class MySituationSocket extends LitElement {
  @property({ type: String }) ip = '127.0.0.1';

  @property({ type: Number }) port = 80;

  @property({ type: Boolean }) connected = false;

  @property({ type: Number }) totalMessagesReceived = 0;

  private websocket: WebSocket | undefined;

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

  connectedCallback() {
    super.connectedCallback();
    this.websocket = new WebSocket(`ws://${this.ip}:${this.port}/situation`);

    this.websocket.onopen = () => {
      this.connected = true;
    };
    this.websocket.onclose = () => {
      this.connected = false;
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

    // For testing
    // TODO: Need to removed untill we have a betetr way to simulate traffic
    setInterval(() => {
      // Updaten local display
      this.mySituation.trueCourse += 1;
      //      emitter.emit('mySituation', this.mySituation);
    }, 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.websocket && this.connected) {
      this.websocket.close();
    }
  }

  render() {
    const { ip, port, connected, totalMessagesReceived } = this;
    return html`
      <div class="info">
        Listening on: ${ip}:${port}<br />
        Connected: ${connected ? 'true' : 'false'}<br />
        Total Messages: ${totalMessagesReceived}<br />
        Location: ${formatDM(this.mySituation.latLon)}
      </div>
    `;
  }
}
