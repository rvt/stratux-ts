import { LatLon } from './latLon.js';

export interface Vehicle {
  id: string;
  icaoAddr: number;
  reg: number;
  tail: string;
  squawk: number;

  emitterCategory: number;
  surfaceVehicleType: number;
  isOnGround: boolean;
  targetType: number;
  signalLevel: number;
  isPositionValid: boolean;

  latLon: LatLon;
  lonLat: Array<number>; // Convenience for open layers and turf
  track: number;
  turnrate: number;
  speed: number;
  isSpeedValid: boolean;
  vVel: number;
  alt: number;
  isAltGNSS: boolean;

  lastSeen: number;
  age: number;
  ageExtrapolation: number;
  isExtrapolatedPosition: boolean;

  distance: number;
  isDistanceEstimated: boolean;
  distanceEstimatedLastTs: Date;

  isStratux: boolean;
  lastSource: number;
}

//    this.vehicles = visiblevehiclesSelector(state);
//    this.filter = state.filter;
//   {
//     "Icao_addr":4221883,
//     "Reg":"",
//     "Tail":"ea",
//     "Emitter_category":0,
//     "SurfaceVehicleType":0,
//     "OnGround":false,
//     "Addr_type":0,
//     "TargetType":1,
//     "SignalLevel":-35.45155139991489,
//     "SignalLevelHist":[
//        -37.77283528852416,
//        -36.67561540084395,
//        -35.98599459218456,
//        -35.86700235918748,
//        -35.45155139991489,
//        -36.108339156354674,
//        -35.70247719997592,
//        -36.497519816658375
//     ],
//     "Squawk":0,
//     "Position_valid":false,
//     "Lat":0,
//     "Lng":0,
//     "Alt":36975,
//     "GnssDiffFromBaroAlt":0,
//     "AltIsGNSS":false,
//     "NIC":8,
//     "NACp":8,
//     "Track":0,
//     "TurnRate":0,
//     "Speed":0,
//     "Speed_valid":false,
//     "Vvel":0,
//     "Timestamp":"2021-11-01T19:52:39.499Z",
//     "PriorityStatus":0,
//     "Age":16.46,
//     "AgeLastAlt":16.46,
//     "Last_seen":"0001-01-01T00:10:01.55Z",
//     "Last_alt":"0001-01-01T00:10:01.55Z",
//     "Last_GnssDiff":"0001-01-01T00:00:00Z",
//     "Last_GnssDiffAlt":0,
//     "Last_speed":"0001-01-01T00:00:00Z",
//     "Last_source":1,
//     "ExtrapolatedPosition":false,
//     "Last_extrapolation":"0001-01-01T00:00:00Z",
//     "AgeExtrapolation":618.01,
//     "Lat_fix":0,
//     "Lng_fix":0,
//     "Alt_fix":0,
//     "BearingDist_valid":false,
//     "Bearing":0,
//     "Distance":0,
//     "DistanceEstimated":178940.64969353442,
//     "DistanceEstimatedLastTs":"2021-11-01T19:52:39.499Z",
//     "ReceivedMsgs":54,
//     "IsStratux":false
//  }
