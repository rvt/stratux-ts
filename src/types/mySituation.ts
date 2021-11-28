import { LatLon } from './latLon.js';

export interface MySituation {
  stratuxTime: number;

  latLon: LatLon;
  lonLat: Array<number>; // Convenience for open layers and turf

  trueCourse: number;
  groundSpeed: number;
  turnRate: number;
  pressureAltitude: number;
}

// {
//   "GPSLastFixSinceMidnightUTC":66370.2,
//   "GPSLatitude":52,
//   "GPSLongitude":4,
//   "GPSFixQuality":1,
//   "GPSHeightAboveEllipsoid":146.65355,
//   "GPSGeoidSep":150.26247,
//   "GPSSatellites":11,
//   "GPSSatellitesTracked":31,
//   "GPSSatellitesSeen":12,
//   "GPSHorizontalAccuracy":4.8500004,
//   "GPSNACp":10,
//   "GPSAltitudeMSL":-3.6089242,
//   "GPSVerticalAccuracy":6.8,
//   "GPSVerticalSpeed":0,
//   "GPSLastFixLocalTime":"0001-01-01T00:03:20.35Z",
//   "GPSTrueCourse":0,
//   "GPSTurnRate":0,
//   "GPSGroundSpeed":1.1069999933242798,
//   "GPSLastGroundTrackTime":"0001-01-01T00:03:20.34Z",
//   "GPSTime":"2021-11-09T18:26:10.4Z",
//   "GPSLastGPSTimeStratuxTime":"0001-01-01T00:03:20.34Z",
//   "GPSLastValidNMEAMessageTime":"0001-01-01T00:03:20.37Z",
//   "GPSLastValidNMEAMessage":"$POGNR,1,0,,-85.0,+3.2,+101,,*64",
//   "GPSPositionSampleRate":4.999213630406291,
//   "BaroTemperature":25.9,
//   "BaroPressureAltitude":-270.14145,
//   "BaroVerticalSpeed":2.0436587,
//   "BaroLastMeasurementTime":"0001-01-01T00:03:20.32Z",
//   "BaroSourceType":1,
//   "AHRSPitch":0,
//   "AHRSRoll":0,
//   "AHRSGyroHeading":0,
//   "AHRSMagHeading":0,
//   "AHRSSlipSkid":0,
//   "AHRSTurnRate":0,
//   "AHRSGLoad":0,
//   "AHRSGLoadMin":0,
//   "AHRSGLoadMax":0,
//   "AHRSLastAttitudeTime":"0001-01-01T00:03:20.31Z",
//   "AHRSStatus":5,
//   "StratuxTime":"0001-01-01T00:03:20.37Z"
// }
