import mitt from 'mitt';
import { Vehicle } from '../types/vehicle.js';

export const emitter = mitt();

export const TRAFFIC_MAX_AGE_MILLIS_ECONDS: number = 59 * 1000;
export const TRAFFIC_AIS_MAX_AGE_MILLI_SECONDS: number = 60 * 1000 * 15; // TODO: Set back to 15 minutes
export const TARGET_TYPE_AIS: number = 5;
export const TIME_MILLIS_AT_ZERO: number = new Date(
  '0001-01-01T00:00:00.00Z'
).valueOf();

let __stratuxTime: number = 0;
emitter.on('stratuxTime', (stratuxTime: any /* TODO: Make type */) => {
  __stratuxTime = stratuxTime;
});

export const isTrafficAged = (vehicle: Vehicle) => {
  const ageMillieSeconds = __stratuxTime - vehicle.lastSeen;
  if (vehicle.targetType === TARGET_TYPE_AIS) {
    return ageMillieSeconds > TRAFFIC_AIS_MAX_AGE_MILLI_SECONDS;
  }
  return ageMillieSeconds > TRAFFIC_MAX_AGE_MILLIS_ECONDS;
};
