import { html, css, LitElement } from 'lit';
import { connect } from 'pwa-helpers';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
// import XYZ  from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj.js';
import { ScaleLine } from 'ol/control';
// import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';

// import Feature from 'ol/Feature';
import { Style, Icon, Text, Fill, Stroke } from 'ol/style';
// import {Circle as CircleStyle, Stroke, Style, Icon} from 'ol/style';
// import Point from 'ol/geom/Point';
// import {getVectorContext} from 'ol/render';
// import {unByKey} from 'ol/Observable';
// import {easeOut} from 'ol/easing';
// import {add} from 'ol/coordinate';
// import { connect } from 'pwa-helpers';
import { customElement } from 'lit/decorators.js';
import { store } from '../redux/store.js';
// import { VehicleOpenLayersHelper } from './VehicleOpenLayersHelper.js';
import {
  emitter,
  toRadians,
  HashMap,
  TARGET_TYPE_AIS,
} from '../utils/utils.js';
import { generateMapVehicleText, getMapStyle } from '../utils/Rendering.js';
import { MySituation } from '../types/mySituation.js';
import { getVehicles } from '../redux/vehiclesSlice.js';
// import { MapStyle } from "../types/miscTypes.js";
import { VehicleOpenLayersHelper } from './VehicleOpenLayersHelper.js';

@customElement('stratux-map')
export class StratuxMap extends connect(store)(
  VehicleOpenLayersHelper(LitElement)
) {
  private tileLayer?: TileLayer<OSM>;

  private map?: Map;

  private otherAircraftLayer?: VectorLayer<any>;

  private otherAircraftTextLayer?: VectorLayer<any>;

  private otherAircraftStyleCache: HashMap<Style> = {};

  private mySituation?: MySituation;

  static styles = [
    css`
      :host {
        display: flex;
      }
      div {
        flex: 1;
      }
    `,
  ];

  static get scopedElements() {
    return {};
  }

  static get properties() {
    return {};
  }

  _createMap() {
    this.tileLayer = new TileLayer({
      source: new OSM({
        wrapX: false,
      }),
    });

    const that = this;
    this.otherAircraftLayer = new VectorLayer({
      source: this.vehiclesSource(),
      style(feature) {
        const mapStyle = getMapStyle(feature.getProperties().vehicle);
        let cachedStyle = that.otherAircraftStyleCache[mapStyle.styleKey];
        if (!cachedStyle) {
          //          const props = feature.getProperties();
          cachedStyle = new Style({
            image: new Icon({
              opacity: 1.0,
              src: `../../assets/actype/${mapStyle.icon}`,
              rotation: toRadians(mapStyle.track),
              anchor: [0.5, 0.5],
              anchorXUnits: 'fraction',
              anchorYUnits: 'fraction',
              color: mapStyle.color,
            }),
          });
          // cachedStyle.getText().setText(feature.get('name'));
        }
        that.otherAircraftStyleCache[mapStyle.styleKey] = cachedStyle;
        return cachedStyle;
      },
    });

    const vehicleTextStyle = new Style({
      text: new Text({
        font: 'bold 1em "Open Sans", "Arial Unicode MS", "sans-serif"',
        stroke: new Stroke({ color: 'white', width: 2 }),
        fill: new Fill({
          color: '#333',
        }),
      }),
    });

    this.otherAircraftTextLayer = new VectorLayer({
      source: this.vehiclesSource(),
      style(feature) {
        const { vehicle } = feature.getProperties();
        let offsetY = 40;
        if (vehicle.targetType === TARGET_TYPE_AIS) {
          offsetY = 20;
        }
        vehicleTextStyle.getText().setOffsetY(offsetY);
        vehicleTextStyle.getText().setText(generateMapVehicleText(vehicle));
        return vehicleTextStyle;
      },
    });

    this.map = new Map({
      controls: [new ScaleLine()],
      layers: [
        this.tileLayer,
        this.otherAircraftLayer,
        this.otherAircraftTextLayer,
      ],
      view: new View({
        center: fromLonLat([14.233083, 50.911416]),
        zoom: 4,
        maxZoom: 17,
      }),
    });
  }

  stateChanged(state: any) {
    this.updateVehicles(getVehicles(state.vehicles));
  }

  async firstUpdated() {
    // Give the browser a chance to paint
    await new Promise(r => setTimeout(r, 0));
    this._createMap();

    // Add Openlayers to LitElements
    const div = this.shadowRoot?.getElementById('map');
    if (div && this.map) {
      this.map.setTarget(div);
    }

    emitter.on('mySituation', (mySituation: any) => {
      const mySitu: MySituation = mySituation as MySituation;
      this.mySituation = mySitu;
      if (this.map) {
        this.map.getView().setCenter(fromLonLat(mySitu.lonLat));
      }
    });
  }

  render() {
    return html` <div id="map"></div> `;
  }
}
