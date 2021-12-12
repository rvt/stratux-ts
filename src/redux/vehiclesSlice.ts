import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store.js';
import { Vehicle } from '../types/vehicle.js';
import { isTrafficAged } from '../utils/utils.js';

// Maximum number of vehicles we are trying to display in tables or map
// THis is to ensure our application keeps performing
// We will always show vehicles in order of distance. eg. least relevant vehicles
const MAXIMUM_VEHICLES_ON_DISPLAY: number = 400;

export interface VehiclesState {
  vehicles: Vehicle[];
  status: 'idle' | 'loading' | 'failed';
}

const initialState: VehiclesState = {
  vehicles: [],
  status: 'idle',
};

export const vehiclesSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    addvehicle: (state: VehiclesState, payload: PayloadAction<Vehicle[]>) => {
      const newList = [...state.vehicles];
      payload.payload.forEach(element => {
        const existingIndex = newList.findIndex(
          (vehicle: Vehicle) => vehicle.id === element.id
        );
        if (existingIndex >= 0) {
          // We merge the incomming object with the existing object so we can keep the meta data we have stored
          // eslint-disable-next-line no-param-reassign
          newList[existingIndex] = {
            ...element,
            ...newList[existingIndex],
          };
        } else {
          newList.push(element);
        }
      });
      // Must make a copy of the array to ensure that reselect will notice the change
      state.vehicles = newList; // eslint-disable-line no-param-reassign
    },
    cleanupAged: state => {
      // TODO: Perhaps use a better algorithm
      // If isTrafficAged returns true before stratux removes it from his list
      // then yiou will see vehicles disappearing and moments later
      // re-appearing, this is because /traffix endpoint alwayts pushes the complete dataset
      // A other strategy could be to keep track how long ago we get a update from stratux
      // if we do not see traffic from stratux for XX seconds, we could also remove it from the list
      // this might be more performant here
      // redux shoudl always hold the single source of truth of what vehicles are beeing tracked
      const notAgedvehicles = state.vehicles.filter(
        (vehicle: Vehicle) => !isTrafficAged(vehicle)
      );
      state.vehicles = notAgedvehicles; // eslint-disable-line no-param-reassign
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  // extraReducers: (builder) => {
  //  builder
  //     .addCase(incrementAsync.pending, (state) => {
  //        state.status = 'loading';
  //     })
  //     .addCase(incrementAsync.fulfilled, (state, action) => {
  //        state.status = 'idle';
  //        state.value += action.payload;
  //    });
  // },
});

export const { addvehicle, cleanupAged } = vehiclesSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectVehicles = (state: RootState) => state.vehicles;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// export const incrementIfOdd = (amount: number): AppThunk => (
//  dispatch,
//  getState
// ) => {
//  const currentValue = selectVehicles(getState());
//  if (currentValue % 2 === 1) {
//    dispatch(incrementByAmount(amount));
//  }
// };

export default vehiclesSlice.reducer;

// NOTE: We use reselect to cache the filtered vehicles. THis will reduce CPU load
//       and ensures that we will only re-apply the filter when changed
const getVehiclesSelector = (state: VehiclesState): Vehicle[] => state.vehicles;
const getFilterSelector = (state: VehiclesState): string => state.status;

export const getVehicles = createSelector(
  getVehiclesSelector,
  getFilterSelector,
  (vehicles: Vehicle[], status: string): Vehicle[] => {
    switch (status) {
      default:
        return (
          vehicles
            .filter((v: Vehicle) => v.isPositionValid === true)
            .sort((a: Vehicle, b: Vehicle) => a.distance - b.distance)
            //        .map((v:Vehicle) => {console.log(v.surfaceVehicleType); return v;})
            .slice(0, MAXIMUM_VEHICLES_ON_DISPLAY)
        );
    }
  }
);
