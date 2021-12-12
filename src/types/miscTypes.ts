export interface VehicleVisuals {
  color: string;
  category: string;
  icon: string;
}

export interface RadarStyle extends VehicleVisuals {
  styleKey: string;
  rotatable: boolean;
  opacity: number;
  track: number;
  font: string;
}

export interface MapStyle extends VehicleVisuals {
  styleKey: string;
  rotatable: boolean;
  opacity: number;
  track: number;
}
