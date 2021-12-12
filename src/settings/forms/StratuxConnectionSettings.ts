import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { toast } from 'bulma-toast';
import { localSettingsService } from '../../utils/localDb.js';
import {
  StratuxConnectionConfig,
  defaultStratuxConnectionConfig,
} from '../../utils/models/StratuxConnectionConfig.js';
import { bulmaStyles } from '../../utils/bulma.js';
import { emitter } from '../../utils/utils.js';

// Perhaps we can use ReactiveController later on?
@customElement('stratux-connection-settings')
export class StratuxConnectionSettings extends LitElement {
  static styles = [bulmaStyles];

  @property({ type: Object }) connectionConfig: StratuxConnectionConfig =
    defaultStratuxConnectionConfig;

  constructor() {
    super();
    localSettingsService
      .getStratuxConnectionConfig()
      .then((event: StratuxConnectionConfig) => {
        this.connectionConfig = event;
      });
  }

  private submit(event: any) {
    event.preventDefault();
    const form = event.target;
    this.connectionConfig.ip = form.ip.value.trim();
    this.connectionConfig.port = parseInt(form.port.value, 10);
    localSettingsService
      .storeStratuxConnectionConfig(this.connectionConfig)
      .then(() => {
        emitter.emit('config.stratuxConnectionConfig.changed', true);
        toast({
          message: 'Stratux Connection Configuration saved',
          position: 'top-center',
        });
      });
  }

  public render() {
    return html`
      <form @submit="${this.submit}">
        <div class="field">
          <label class="label">IP</label>
          <div class="control">
            <input
              name="ip"
              class="input"
              type="text"
              placeholder="Text input"
              .value=${this.connectionConfig.ip}
            />
          </div>
          <p class="help">IP Address of your stratux</p>
        </div>

        <div class="field">
          <label class="label">Port</label>
          <div class="control">
            <input
              name="port"
              class="input"
              type="text"
              placeholder="Text input"
              .value=${this.connectionConfig.port}
            />
          </div>
          <p class="help">Port of your stratux</p>
        </div>

        <div class="field is-grouped">
          <div class="control">
            <button class="button is-link" type="submit">Save</button>
          </div>
        </div>
      </form>
    `;
  }
}
