import { LitElement, html } from "lit-element";
import { getVehicles, VisibilityFilters} from './redux/reducer.js';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM  from 'ol/source/OSM';
import XYZ  from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj.js';
import { ScaleLine } from 'ol/control';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';

import Feature from 'ol/Feature';
import {Circle as CircleStyle, Stroke, Style, Icon} from 'ol/style';
import Point from 'ol/geom/Point';
import {getVectorContext} from 'ol/render';
import {unByKey} from 'ol/Observable';
import {easeOut} from 'ol/easing';
import {add} from 'ol/coordinate';
import { connect } from 'pwa-helpers';
import { SlButton } from "@shoelace-style/shoelace";


export class StratuxMap extends VehicleOpenLayersHelper {

  constructor() {
    super();
    this.vehicles = [];
    this.filter = "";
  }

  static get scopedElements() {
    return {
      'sl-button': SlButton
    };
  }

  static get properties() {
    return {
      vehicles: { type: Array },
      filter: { type: String }
    };
  }


  _createMap() {
    this.tileLayer = new TileLayer({
      source: new OSM({
        wrapX: false,
      }),
    });
    
    const otherAircraftStyleCache = {};
    this.otherAircraftLayer = new VectorLayer({
      source: this.vehiclesSource(),
      style: function (feature) {     
        const radarStyle = getRadarStyle(feature.getProperties().vehicle);
        let cachedStyle = otherAircraftStyleCache[radarStyle.styleKey];
        if (!cachedStyle) {
          const props = feature.getProperties();
          cachedStyle = new Style({
            image: new Icon({
              opacity: 1.0,
              src: radarStyle.icon,
              rotation: toRadians(radarStyle.rotation),
              anchor: [0.5, 0.5],
              anchorXUnits: 'fraction',
              anchorYUnits: 'fraction',
              color: radarStyle.color
            }),
          });
        }
        otherAircraftStyleCache[radarStyle.styleKey] = cachedStyle;
        return cachedStyle;
      },
    });

    this.map = new Map({
      controls: [
        new ScaleLine()
      ],
      layers: [this.tileLayer, this.otherAircraftLayer],
      view: new View({
        center: fromLonLat([14.233083, 50.911416]),
        zoom: 1,
        maxZoom: 17
      }),
    });
  }
 
  async firstUpdated() {
    // Give the browser a chance to paint
  //  await new Promise((r) => setTimeout(r, 0));
    this._createMap();

    // Add Openlayers to LitElements
    var div = this.shadowRoot?.getElementById('map');
    if (div) {
      this.map.setTarget(div);
    }

    emitter.on('myLocation', (myLocation) => {
      this._myLocation = myLocation;
      this.map.getView().setCenter(fromLonLat(myLocation.lonLat));
    });

  }

  render() {
    return html`
      <div id="map" style="background-color:blue;height:100%;"></div>
      `;
  }
}

customElements.define("stratux-map", StratuxMap);



// _flash(feature) {
//   const start = Date.now();
//   const flashGeom = feature.getGeometry().clone(); // We clone otherwise we also move the original point feature
//   const duration = 30000;
//   let foo = 0.0;
  
//   const animate = (event) => {
//     const frameState = event.frameState;
//     const elapsed = frameState.time - start;
//     // Remove from event listener and stop drawing?
//     if (elapsed >= duration) {
//       unByKey(listenerKey);
//       return;
//     }

//     const position = flashGeom.getCoordinates();
//     add(position, [foo,0]);
//     foo=foo+10;
//     flashGeom.setCoordinates(position );


//     const style = new Style({
//       image: new CircleStyle({
//         radius: 15,
//         stroke: new Stroke({
//           color: 'rgba(255, 0, 0, ' + 255 + ')',
//           width: 0.25 + 1,
//         }),
//       }),
//     });
//     const vectorContext = getVectorContext(event);
//     vectorContext.setStyle(style);
//     vectorContext.drawGeometry(flashGeom);
//     // tell OpenLayers to continue postrender animation
//     this.map.render();
//   };

//   const listenerKey = this.tileLayer.on('postrender', animate);
// };