import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from "react";
import {
  BookingData,
  BookingClient,
  BookingFlight,
  BookingAccommodation,
  BookingVehicle,
  BookingActivity,
  BOOKING_STEPS,
} from "@shared/booking";

interface BookingState extends BookingData {
  steps: typeof BOOKING_STEPS;
  visitedSteps: Set<number>;
  maxVisitedStep: number;
}

type BookingAction =
  | { type: "SET_CURRENT_STEP"; payload: number }
  | { type: "SET_CLIENT"; payload: BookingClient }
  | { type: "ADD_FLIGHT"; payload: BookingFlight }
  | { type: "REMOVE_FLIGHT"; payload: string }
  | { type: "UPDATE_FLIGHT"; payload: { id: string; passengers: number } }
  | { type: "UPDATE_FLIGHT_DATE"; payload: { id: string; date: Date } }
  | { type: "ADD_ACCOMMODATION"; payload: BookingAccommodation }
  | { type: "REMOVE_ACCOMMODATION"; payload: string }
  | { type: "ADD_VEHICLE"; payload: BookingVehicle }
  | { type: "REMOVE_VEHICLE"; payload: string }
  | { type: "ADD_ACTIVITY"; payload: BookingActivity }
  | { type: "REMOVE_ACTIVITY"; payload: string }
  | { type: "SET_TRAVEL_DATES"; payload: { start: Date; end: Date } }
  | { type: "SET_NOTES"; payload: string }
  | { type: "CALCULATE_TOTALS" }
  | { type: "RESET_BOOKING" }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "MARK_STEP_VISITED"; payload: number }
  | { type: "LOAD_RESERVATION"; payload: any };

const initialState: BookingState = {
  currentStep: 1,
  steps: BOOKING_STEPS,
  visitedSteps: new Set([1]), // First step is always visited
  maxVisitedStep: 1,
  flights: [],
  accommodations: [],
  vehicles: [],
  activities: [],
  subtotals: {
    flights: 0,
    accommodations: 0,
    vehicles: 0,
    activities: 0,
  },
  totalPrice: 0,
  currency: "Ar",
  travelDates: {
    start: new Date(),
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  },
};

function calculateSubtotals(state: BookingState) {
  const flightsTotal = (state.flights || []).reduce(
    (sum, flight) => sum + (flight?.price || 0),
    0,
  );
  const accommodationsTotal = (state.accommodations || []).reduce(
    (sum, acc) => sum + (acc?.price || 0),
    0,
  );
  const vehiclesTotal = (state.vehicles || []).reduce(
    (sum, vehicle) => sum + (vehicle?.price || 0),
    0,
  );
  const activitiesTotal = (state.activities || []).reduce(
    (sum, activity) => sum + (activity?.price || 0),
    0,
  );

  return {
    flights: flightsTotal,
    accommodations: accommodationsTotal,
    vehicles: vehiclesTotal,
    activities: activitiesTotal,
  };
}

function bookingReducer(
  state: BookingState,
  action: BookingAction,
): BookingState {
  switch (action.type) {
    case "SET_CURRENT_STEP":
      const newStep = Math.max(
        1,
        Math.min(BOOKING_STEPS.length, action.payload),
      );
      // Only allow navigation to visited steps or the next unvisited step
      if (
        state.visitedSteps.has(newStep) ||
        newStep <= state.maxVisitedStep + 1
      ) {
        const newVisitedSteps = new Set(state.visitedSteps);
        newVisitedSteps.add(newStep);
        return {
          ...state,
          currentStep: newStep,
          visitedSteps: newVisitedSteps,
          maxVisitedStep: Math.max(state.maxVisitedStep, newStep),
        };
      }
      return state;

    case "NEXT_STEP":
      const nextStep = Math.min(BOOKING_STEPS.length, state.currentStep + 1);
      const nextVisitedSteps = new Set(state.visitedSteps);
      nextVisitedSteps.add(nextStep);
      return {
        ...state,
        currentStep: nextStep,
        visitedSteps: nextVisitedSteps,
        maxVisitedStep: Math.max(state.maxVisitedStep, nextStep),
      };

    case "PREV_STEP":
      return {
        ...state,
        currentStep: Math.max(1, state.currentStep - 1),
      };

    case "MARK_STEP_VISITED":
      const stepToMark = action.payload;
      const updatedVisitedSteps = new Set(state.visitedSteps);
      updatedVisitedSteps.add(stepToMark);
      return {
        ...state,
        visitedSteps: updatedVisitedSteps,
        maxVisitedStep: Math.max(state.maxVisitedStep, stepToMark),
      };

    case "SET_CLIENT":
      return {
        ...state,
        client: action.payload,
      };

    case "ADD_FLIGHT":
      const newFlights = [...state.flights, action.payload];
      const flightSubtotals = calculateSubtotals({
        ...state,
        flights: newFlights,
      });
      return {
        ...state,
        flights: newFlights,
        subtotals: flightSubtotals,
        totalPrice: Object.values(flightSubtotals).reduce(
          (sum, val) => sum + val,
          0,
        ),
      };

    case "REMOVE_FLIGHT":
      const filteredFlights = state.flights.filter(
        (flight) => flight.id !== action.payload,
      );
      const updatedFlightSubtotals = calculateSubtotals({
        ...state,
        flights: filteredFlights,
      });
      return {
        ...state,
        flights: filteredFlights,
        subtotals: updatedFlightSubtotals,
        totalPrice: Object.values(updatedFlightSubtotals).reduce(
          (sum, val) => sum + val,
          0,
        ),
      };

    case "UPDATE_FLIGHT":
      const updatedFlights = state.flights.map((flight) => {
        if (flight.id === action.payload.id) {
          // Recalculate price based on new passenger count
          const basePrice = flight.price / flight.passengers;
          return {
            ...flight,
            passengers: action.payload.passengers,
            price: basePrice * action.payload.passengers,
          };
        }
        return flight;
      });
      const flightSubtotalsAfterUpdate = calculateSubtotals({
        ...state,
        flights: updatedFlights,
      });
      return {
        ...state,
        flights: updatedFlights,
        subtotals: flightSubtotalsAfterUpdate,
        totalPrice: Object.values(flightSubtotalsAfterUpdate).reduce(
          (sum, val) => sum + val,
          0,
        ),
      };

    case "UPDATE_FLIGHT_DATE":
      const flightsWithUpdatedDate = state.flights.map((flight) => {
        if (flight.id === action.payload.id) {
          return {
            ...flight,
            date: action.payload.date,
          };
        }
        return flight;
      });
      return {
        ...state,
        flights: flightsWithUpdatedDate,
      };

    case "ADD_ACCOMMODATION":
      const newAccommodations = [...state.accommodations, action.payload];
      const accSubtotals = calculateSubtotals({
        ...state,
        accommodations: newAccommodations,
      });
      return {
        ...state,
        accommodations: newAccommodations,
        subtotals: accSubtotals,
        totalPrice: Object.values(accSubtotals).reduce(
          (sum, val) => sum + val,
          0,
        ),
      };

    case "REMOVE_ACCOMMODATION":
      const filteredAccommodations = state.accommodations.filter(
        (acc) => acc.id !== action.payload,
      );
      const updatedAccSubtotals = calculateSubtotals({
        ...state,
        accommodations: filteredAccommodations,
      });
      return {
        ...state,
        accommodations: filteredAccommodations,
        subtotals: updatedAccSubtotals,
        totalPrice: Object.values(updatedAccSubtotals).reduce(
          (sum, val) => sum + val,
          0,
        ),
      };

    case "ADD_VEHICLE":
      const newVehicles = [...state.vehicles, action.payload];
      const vehicleSubtotals = calculateSubtotals({
        ...state,
        vehicles: newVehicles,
      });
      return {
        ...state,
        vehicles: newVehicles,
        subtotals: vehicleSubtotals,
        totalPrice: Object.values(vehicleSubtotals).reduce(
          (sum, val) => sum + val,
          0,
        ),
      };

    case "REMOVE_VEHICLE":
      const filteredVehicles = state.vehicles.filter(
        (vehicle) => vehicle.id !== action.payload,
      );
      const updatedVehicleSubtotals = calculateSubtotals({
        ...state,
        vehicles: filteredVehicles,
      });
      return {
        ...state,
        vehicles: filteredVehicles,
        subtotals: updatedVehicleSubtotals,
        totalPrice: Object.values(updatedVehicleSubtotals).reduce(
          (sum, val) => sum + val,
          0,
        ),
      };

    case "ADD_ACTIVITY":
      const newActivities = [...state.activities, action.payload];
      const activitySubtotals = calculateSubtotals({
        ...state,
        activities: newActivities,
      });
      return {
        ...state,
        activities: newActivities,
        subtotals: activitySubtotals,
        totalPrice: Object.values(activitySubtotals).reduce(
          (sum, val) => sum + val,
          0,
        ),
      };

    case "REMOVE_ACTIVITY":
      const filteredActivities = state.activities.filter(
        (activity) => activity.id !== action.payload,
      );
      const updatedActivitySubtotals = calculateSubtotals({
        ...state,
        activities: filteredActivities,
      });
      return {
        ...state,
        activities: filteredActivities,
        subtotals: updatedActivitySubtotals,
        totalPrice: Object.values(updatedActivitySubtotals).reduce(
          (sum, val) => sum + val,
          0,
        ),
      };

    case "SET_TRAVEL_DATES":
      return {
        ...state,
        travelDates: action.payload,
      };

    case "SET_NOTES":
      return {
        ...state,
        notes: action.payload,
      };

    case "CALCULATE_TOTALS":
      const subtotals = calculateSubtotals(state);
      return {
        ...state,
        subtotals,
        totalPrice: Object.values(subtotals).reduce((sum, val) => sum + val, 0),
      };

    case "RESET_BOOKING":
      return {
        ...initialState,
        visitedSteps: new Set([1]),
        maxVisitedStep: 1,
        travelDates: {
          start: new Date(),
          end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      };

    case "LOAD_RESERVATION":
      const reservationData = action.payload;
      if (!reservationData) {
        console.warn(
          "LOAD_RESERVATION called with invalid data:",
          reservationData,
        );
        return state;
      }

      // Ensure arrays are properly initialized
      const flights = Array.isArray(reservationData.flights)
        ? reservationData.flights
        : [];
      const accommodations = Array.isArray(reservationData.accommodations)
        ? reservationData.accommodations
        : [];
      const vehicles = Array.isArray(reservationData.vehicles)
        ? reservationData.vehicles
        : [];
      const activities = Array.isArray(reservationData.activities)
        ? reservationData.activities
        : [];

      const loadedSubtotals = calculateSubtotals({
        ...state,
        flights,
        accommodations,
        vehicles,
        activities,
      });

      return {
        ...state,
        client: reservationData.client || null,
        flights,
        accommodations,
        vehicles,
        activities,
        travelDates: reservationData.travelDates || state.travelDates,
        notes: reservationData.notes || "",
        subtotals: loadedSubtotals,
        totalPrice:
          reservationData.totalPrice ||
          Object.values(loadedSubtotals).reduce((sum, val) => sum + val, 0),
        currency: reservationData.currency || "Ar",
        visitedSteps: new Set([1, 2, 3, 4, 5, 6]), // Mark all steps as visited for editing
        maxVisitedStep: 6,
      };

    default:
      return state;
  }
}

interface BookingContextType {
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  addFlight: (flight: BookingFlight) => void;
  removeFlight: (id: string) => void;
  updateFlight: (id: string, passengers: number) => void;
  updateFlightDate: (id: string, date: Date) => void;
  addAccommodation: (accommodation: BookingAccommodation) => void;
  removeAccommodation: (id: string) => void;
  addVehicle: (vehicle: BookingVehicle) => void;
  removeVehicle: (id: string) => void;
  addActivity: (activity: BookingActivity) => void;
  removeActivity: (id: string) => void;
  setClient: (client: BookingClient) => void;
  setTravelDates: (dates: { start: Date; end: Date }) => void;
  setNotes: (notes: string) => void;
  resetBooking: () => void;
  loadReservation: (reservationData: any) => void;
  formatCurrency: (amount: number) => string;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Stabilize loadReservation to prevent infinite re-renders
  const loadReservation = useCallback(
    (reservationData: any) =>
      dispatch({ type: "LOAD_RESERVATION", payload: reservationData }),
    [],
  );

  const contextValue: BookingContextType = {
    state,
    dispatch,
    nextStep: () => dispatch({ type: "NEXT_STEP" }),
    prevStep: () => dispatch({ type: "PREV_STEP" }),
    goToStep: (step: number) =>
      dispatch({ type: "SET_CURRENT_STEP", payload: step }),
    addFlight: (flight: BookingFlight) =>
      dispatch({ type: "ADD_FLIGHT", payload: flight }),
    removeFlight: (id: string) =>
      dispatch({ type: "REMOVE_FLIGHT", payload: id }),
    updateFlight: (id: string, passengers: number) =>
      dispatch({ type: "UPDATE_FLIGHT", payload: { id, passengers } }),
    updateFlightDate: (id: string, date: Date) =>
      dispatch({ type: "UPDATE_FLIGHT_DATE", payload: { id, date } }),
    addAccommodation: (accommodation: BookingAccommodation) =>
      dispatch({ type: "ADD_ACCOMMODATION", payload: accommodation }),
    removeAccommodation: (id: string) =>
      dispatch({ type: "REMOVE_ACCOMMODATION", payload: id }),
    addVehicle: (vehicle: BookingVehicle) =>
      dispatch({ type: "ADD_VEHICLE", payload: vehicle }),
    removeVehicle: (id: string) =>
      dispatch({ type: "REMOVE_VEHICLE", payload: id }),
    addActivity: (activity: BookingActivity) =>
      dispatch({ type: "ADD_ACTIVITY", payload: activity }),
    removeActivity: (id: string) =>
      dispatch({ type: "REMOVE_ACTIVITY", payload: id }),
    setClient: (client: BookingClient) =>
      dispatch({ type: "SET_CLIENT", payload: client }),
    setTravelDates: (dates: { start: Date; end: Date }) =>
      dispatch({ type: "SET_TRAVEL_DATES", payload: dates }),
    setNotes: (notes: string) =>
      dispatch({ type: "SET_NOTES", payload: notes }),
    resetBooking: () => dispatch({ type: "RESET_BOOKING" }),
    loadReservation,
    formatCurrency,
  };

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
