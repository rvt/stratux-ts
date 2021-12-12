import { RadarStyle, MapStyle, VehicleVisuals } from '../types/miscTypes.js';
import { Vehicle } from '../types/vehicle.js';
import { TARGET_TYPE_AIS, HashMap } from './utils.js';

// const trafficSourceColors = {
//     1: 'cornflowerblue', // ES
//     2: 'darkkhaki',      // UAT
//     4: 'green',          // OGN
//     5: '#0077be'         // AIS
// }

// const getTrafficSourceColor = (source:Vehicle):string => {
//     if (trafficSourceColors[source] !== undefined) {
//         return trafficSourceColors[source];
//     } else {
//         return 'gray';
//     }
// }

const getAISVisuals = (vessel: Vehicle): VehicleVisuals => {
  // https://www.navcen.uscg.gov/?pageName=AISMessagesAStatic

  const first: HashMap<VehicleVisuals> = {
    2: { color: 'orange', category: 'Cargo', icon: 'vessel.svg' },
    4: { color: 'orange', category: 'Cargo', icon: 'vessel.svg' },
    5: { color: 'orange', category: 'Cargo', icon: 'vessel.svg' },
    6: { color: 'blue', category: 'Passenger', icon: 'vessel.svg' },
    7: { color: 'green', category: 'Cargo', icon: 'vessel.svg' },
    8: { color: 'red', category: 'Tanker', icon: 'vessel.svg' },
    9: { color: 'red', category: 'Cargo', icon: 'vessel.svg' },
  };
  const second: HashMap<VehicleVisuals> = {
    0: { color: 'silver', category: 'Fishing', icon: 'vessel.svg' },
    1: { color: 'cyan', category: 'Tugs', icon: 'vessel.svg' },
    2: { color: 'darkblue', category: 'Tugs', icon: 'vessel.svg' },
    3: { color: 'LightSkyBlue', category: 'Dredging', icon: 'vessel.svg' },
    4: { color: 'LightSkyBlue', category: 'Diving', icon: 'vessel.svg' },
    5: { color: 'darkolivegreen', category: 'Military', icon: 'vessel.svg' },
    6: { color: 'maroon', category: 'Sailing', icon: 'vessel.svg' },
    7: { color: 'purple', category: 'Pleasure', icon: 'vessel.svg' },
  };

  const firstDigit = Math.floor(vessel.surfaceVehicleType / 10);
  const secondDigit =
    vessel.surfaceVehicleType - Math.floor(vessel.surfaceVehicleType / 10) * 10;

  const defaultColor: VehicleVisuals = {
    color: 'gray',
    category: '---',
    icon: 'vessel.svg',
  };

  if (first[firstDigit]) {
    return first[firstDigit] || defaultColor;
  }
  if (firstDigit === 3 && second[secondDigit]) {
    return second[secondDigit] || defaultColor;
  }
  return defaultColor;
};

const getAircraftVisuals = (aircraft: Vehicle): VehicleVisuals => {
  const aircraftColors: HashMap<string> = {
    10: 'cornflowerblue',
    11: 'cornflowerblue',
    12: 'skyblue',
    13: 'skyblue',
    14: 'skyblue',

    20: 'darkkhaki',
    21: 'darkkhaki',
    22: 'khaki',
    23: 'khaki',
    24: 'khaki',

    40: 'green',
    41: 'green',
    42: 'greenyellow',
    43: 'greenyellow',
    44: 'greenyellow',
  };

  const category: HashMap<string> = {
    1: 'Light',
    2: 'Small',
    3: 'Large',
    4: 'VLarge',
    5: 'Heavy',
    6: 'Fight',
    7: 'Helic',
    9: 'Glide',
    10: 'Ballo',
    11: 'Parac',
    12: 'Ultrl',
    14: 'Drone',
    15: 'Space',
    16: 'VLarge',
    17: 'Vehic',
    18: 'Vehic',
    19: 'Obstc',
  };

  const icon = (vehicle: Vehicle): string => {
    switch (vehicle.emitterCategory) {
      case 1:
      case 6:
        return 'light.svg';
      case 2:
      case 3:
      case 4:
      case 5:
        return 'heavy.svg';
      case 7:
        return 'helicopter.svg';
      case 9:
        return 'glider.svg';
      case 10:
        return 'lighter-than-air.svg';
      case 11:
      case 12:
        return 'skydiver.svg';
      default:
        return 'undef.svg';
    }
  };

  const code = aircraft.lastSource * 10 + aircraft.targetType;
  return {
    color: aircraftColors[code] || 'white',
    category: category[aircraft.emitterCategory] || '---',
    icon: icon(aircraft),
  };
};

const trackMod = (vehicle: Vehicle) => {
  const NEAREST_DEGREES = 5;
  return Math.round(vehicle.track / NEAREST_DEGREES) * NEAREST_DEGREES;
};

export const isRotatable = (aircraft: Vehicle): boolean => {
  switch (aircraft.emitterCategory) {
    case 10:
    case 11:
    case 12:
      return false;
    default:
      return true;
  }
};

export const generateMapVehicleText = (aircraft: Vehicle) => {
  const text = [];
  if (aircraft.tail.length > 0) text.push(aircraft.tail);
  if (aircraft.targetType !== TARGET_TYPE_AIS) {
    text.push(`${aircraft.alt}ft`);
  }
  if (aircraft.isSpeedValid && aircraft.speed > 0.1)
    text.push(`${aircraft.speed}kt`);

  return text.join('\n');
};

export const getRadarStyle = (vehicle: Vehicle): RadarStyle => {
  const track = isRotatable(vehicle) ? trackMod(vehicle) : 0.0;
  const visuals: VehicleVisuals =
    vehicle.targetType === TARGET_TYPE_AIS
      ? getAISVisuals(vehicle)
      : getAircraftVisuals(vehicle);

  return {
    styleKey: `${track}_${visuals.icon}_${visuals.color}`,
    rotatable: isRotatable(vehicle),
    opacity: 1,
    font: 'bold 1em sans-serif',
    track,
    ...visuals,
  };
};

export const getMapStyle = (vehicle: Vehicle): MapStyle =>
  getRadarStyle(vehicle);
