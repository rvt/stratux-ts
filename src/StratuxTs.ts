import { LitElement, html, css } from 'lit';
import Navigo from 'navigo';
import { property } from 'lit/decorators.js';
import { TrafficSocket } from './sockets/TrafficSocket.js';
import { MySituationSocket } from './sockets/MySituationSocket.js';
import { StratuxTraffic } from './traffic/StratuxTraffic.js';
// import button from 'bulma/sass/elements/button.sass'
// import bulma from 'bulma/css/bulma.css'
// import './bulma.css';
// import './styles.css' // import the tailwind styles
// import tailwind from 'lit-tailwindcss';
import { bulmaStyles } from './utils/bulma.js';

// const logo = new URL('../../assets/open-wc-logo.svg', import.meta.url).href;

export class StratuxTs extends LitElement {
  @property({ type: Object }) route = {};

  @property({ type: Object }) params = {};

  @property({ type: Object }) query = {};

  @property({ type: Object }) data = {};

  router: Navigo = new Navigo('/', { hash: true });

  static styles = [
    bulmaStyles,
    css`
      :host {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        font-size: calc(10px + 2vmin);
        color: #1a2b42;
        margin: 0 auto;
        text-align: center;
        background-color: var(--stratux-ts-background-color);
      }

      main {
        flex-grow: 1;
        width: 100%;
        background-color: #ffa0a0;
      }
      main > * {
        background-color: #a0ffa0;
      }
    `,
  ];

  constructor() {
    super();

    this.router.on('map', () => {
      this.route = html` <stratux-map></stratux-map>Map1`;
    });

    this.router.on('traffic', () => {
      this.route = html` <stratux-traffic></stratux-traffic>`;
    });

    this.router.on('radar', () => {
      this.route = html` <radar-screen></radar-screen>Radar1`;
    });

    // style="min-height:500px;width:100%;"
    this.router.on('all', () => {
      this.route = html`
        <div style="display:flex;flex-direction: row;height:100%">
          <div style="background-color:#FF4444;flex: 1;align-items: stretch;">
            <div style="background-color:#444444;flex: 1;height: 50%;">1</div>
            <div style="background-color:#666666;flex: 1;height: 50%;">2</div>
          </div>

          <div
            style="background-color:#4444FF;flex: 1;flex-direction: column;align-items: stretch;"
          >
            <div
              style="background-color:#888888;flex: 1;height: 50%;overflow: auto;"
            >
              3
            </div>
            <div style="background-color:#aaaaaa;flex: 1;height: 50%;">4</div>
          </div>
        </div>
      `;
    });

    this.router.on('settings', () => {
      this.route = html` Settings `;
    });

    this.router.on('*', () => {
      // this.route = html` <div>Homepage</div> `;
    });
    this.router.resolve();
  }

  static get scopedElements() {
    return {
      'traffic-socket': TrafficSocket,
      'mysituation-socket': MySituationSocket,
      'stratux-traffic': StratuxTraffic,
    };
  }

  render() {
    return html`
      <nav
        role="navigation"
        aria-label="main navigation"
        style="display:flex;justify-content:center;"
      >
        <button
          class="button is-light"
          @click="${() => this.router.navigate('all')}"
        >
          All
        </button>
        <button
          class="button is-light"
          @click="${() => this.router.navigate('radar')}"
        >
          Radar
        </button>
        <button
          class="button is-light"
          @click="${() => this.router.navigate('map')}"
        >
          Map
        </button>
        <button
          class="button is-light"
          @click="${() => this.router.navigate('traffic')}"
        >
          Traffic
        </button>
        &nbsp;
      </nav>
      <div></div>
      <main>
        <div style="display:flex; flex-direction: row">
          <div style="flex: 1">
            <traffic-socket
              .ip=${'192.168.178.226'}
              .port=${80}
            ></traffic-socket>
          </div>
          <div style="flex: 1">
            <mysituation-socket
              .ip=${'192.168.178.226'}
              .port=${80}
            ></mysituation-socket>
          </div>
        </div>
        ${this.route}
      </main>
    `;
  }
}
