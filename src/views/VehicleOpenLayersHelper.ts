/* eslint max-classes-per-file: ["error", 2] */
// import { connect } from 'pwa-helpers';
// import { store } from '../redux/store.js';
import VectorSource from 'ol/source/Vector';
import { fromLonLat } from 'ol/proj';
import { Point, SimpleGeometry } from 'ol/geom';
import { Feature } from 'ol';
import { LitElement } from 'lit';
import { Vehicle } from '../types/vehicle.js';
// import { emitter } from '../utils/utils.js';

type Constructor<T> = new (...args: any[]) => T;

export declare class HighlightableInterface {
  vehiclesSource(): VectorSource<SimpleGeometry>;

  updateVehicles(vehicles: Vehicle[]): void;
}

export const VehicleOpenLayersHelper = <T extends Constructor<LitElement>>(
  superClass: T
) => {
  class HighlightableElement extends superClass {
    private aircraftSource: VectorSource<SimpleGeometry> =
      new VectorSource<SimpleGeometry>({
        wrapX: false,
      });

    private updateLock: boolean = false;

    private vehicles: Vehicle[] = [];

    private updateInterval?: any;

    private putVehicle(vehicle: Vehicle) {
      const feature = this.aircraftSource.getFeatureById(vehicle.id);
      const coordinate = fromLonLat(vehicle.lonLat);
      if (feature) {
        const geom = feature.getGeometry();
        if (geom) {
          geom.setCoordinates(coordinate);
        }
      } else {
        const geom = new Point(coordinate);
        const newFeature = new Feature(geom);
        newFeature.setId(vehicle.id);
        newFeature.setProperties({
          vehicle,
        });
        this.aircraftSource.addFeature(newFeature);
      }
    }

    private updateVehiclesOnMap() {
      if (!this.updateLock) {
        this.updateLock = true;
        // const stat = new Date().getTime();

        // Add all vehicles to the map that are in the vehicles list
        this.vehicles.forEach((vehicle: Vehicle) => {
          this.putVehicle(vehicle);
        });

        // Find all aged vehicles on the map
        const toRemove = this.aircraftSource
          .getFeatures()
          .filter((feature: any) => {
            const existingIndex = this.vehicles.findIndex(
              (vehicle: Vehicle) => vehicle.id === feature.getId()
            );
            return existingIndex === -1;
          });

        // Remove them from the map
        toRemove.forEach((feature: any) =>
          this.aircraftSource.removeFeature(feature)
        );

        // const end = new Date().getTime();
        // console.log('time ' + (end-stat) + " length:"+this.vehicles.length);
        this.updateLock = false;
      }
    }

    public vehiclesSource(): VectorSource<SimpleGeometry> {
      return this.aircraftSource;
    }

    public updateVehicles(vehicles: Vehicle[]): void {
      this.vehicles = vehicles;
    }

    connectedCallback() {
      super.connectedCallback();
      const that = this;

      // Every XX seconds tell to update vehicles
      const STRATUX_UPDATE_INTERVAL = 1000;
      this.updateInterval = setInterval(() => {
        // Updaten local display
        that.updateVehiclesOnMap();
      }, STRATUX_UPDATE_INTERVAL);

      that.updateVehiclesOnMap();
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
      }
    }
  }
  return HighlightableElement as Constructor<HighlightableInterface> & T;
};
