import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { connect } from 'pwa-helpers';
import { store } from '../redux/store.js';
import { StratuxConnectionSettings } from './forms/StratuxConnectionSettings.js';

import { bulmaStyles } from '../utils/bulma.js';

// Perhaps we can use ReactiveController later on?
@customElement('main-settings')
export class MainSettings extends connect(store)(LitElement) {
  static styles = [bulmaStyles];

  static get scopedElements() {
    return {
      'stratux-connection-settings': StratuxConnectionSettings,
    };
  }

  render() {
    return html`
      <div class="tile is-ancestor">
        <div class="tile is-vertical is-8">
          <div class="tile">
            <div class="tile is-parent is-vertical">
              <article class="tile is-child box is-primary">
                <p class="title">Stratux</p>
                <stratux-connection-settings></stratux-connection-settings>
              </article>
              <article class="tile is-child notification is-warning">
                <p class="title">...tiles</p>
                <p class="subtitle">Bottom tile</p>
              </article>
            </div>
            <div class="tile is-parent">
              <article class="tile is-child notification is-info">
                <p class="title">Middle tile</p>
                <p class="subtitle">With an image</p>
                <figure class="image is-4by3"></figure>
              </article>
            </div>
          </div>
          <div class="tile is-parent">
            <article class="tile is-child notification is-danger">
              <p class="title">Wide tile</p>
              <p class="subtitle">Aligned with the right tile</p>
              <div class="content">
                <!-- Content -->
              </div>
            </article>
          </div>
        </div>
        <div class="tile is-parent">
          <article class="tile is-child notification is-success">
            <div class="content">
              <p class="title">Tall tile</p>
              <p class="subtitle">With even more content</p>
              <div class="content">
                <!-- Content -->
              </div>
            </div>
          </article>
        </div>
      </div>
    `;
  }
}
