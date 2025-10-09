import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { busService } from '../services/busService';

interface Stop {
  name: string;
  lat: number;
  lon: number;
  time: string;
  order: number;
}

interface Bus {
  busId: string;
  lat: number;
  lon: number;
  speed: number;
  updated: string;
  status: string;
  currentStopIndex: number;
  driver: string;
  route: string;
  currentStop?: string;
  nextStop?: string;
  eta: string | number;
  totalStops: number;
  stops?: Stop[];
}

interface BusState {
  buses: Bus[];
  selectedBus: Bus | null;
  loading: boolean;
  error: string | null;
}

type BusAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_BUSES'; payload: Bus[] }
  | { type: 'SET_SELECTED_BUS'; payload: Bus | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_BUS_LOCATION'; payload: { busId: string; data: Partial<Bus> } };

const initialState: BusState = {
  buses: [],
  selectedBus: null,
  loading: false,
  error: null,
};

const BusContext = createContext<{
  state: BusState;
  dispatch: React.Dispatch<BusAction>;
  fetchBuses: () => Promise<void>;
  fetchBusDetails: (busId: string) => Promise<void>;
}>({
  state: initialState,
  dispatch: () => {},
  fetchBuses: async () => {},
  fetchBusDetails: async () => {},
});

function busReducer(state: BusState, action: BusAction): BusState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_BUSES':
      return { ...state, buses: action.payload, error: null };
    case 'SET_SELECTED_BUS':
      return { ...state, selectedBus: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'UPDATE_BUS_LOCATION':
      const updatedBuses = state.buses.map(bus =>
        bus.busId === action.payload.busId
          ? { ...bus, ...action.payload.data }
          : bus
      );
      const updatedSelectedBus =
        state.selectedBus?.busId === action.payload.busId
          ? { ...state.selectedBus, ...action.payload.data }
          : state.selectedBus;

      return {
        ...state,
        buses: updatedBuses,
        selectedBus: updatedSelectedBus
      };
    default:
      return state;
  }
}

export function BusProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(busReducer, initialState);

  const fetchBuses = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const buses = await busService.getAllBuses();
      dispatch({ type: 'SET_BUSES', payload: buses });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch buses' });
      console.error('Error fetching buses:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchBusDetails = async (busId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const bus = await busService.getBusLocation(busId);
      dispatch({ type: 'SET_SELECTED_BUS', payload: bus });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch bus details' });
      console.error(`Error fetching details for bus ${busId}:`, error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Auto-refresh buses every 5 seconds
  useEffect(() => {
    fetchBuses();
    const interval = setInterval(fetchBuses, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-refresh selected bus every 3 seconds
  useEffect(() => {
    if (state.selectedBus) {
      const interval = setInterval(() => {
        fetchBusDetails(state.selectedBus!.busId);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [state.selectedBus?.busId, fetchBusDetails]);

  return (
    <BusContext.Provider value={{ state, dispatch, fetchBuses, fetchBusDetails }}>
      {children}
    </BusContext.Provider>
  );
}

export const useBus = () => {
  const context = useContext(BusContext);
  if (!context) {
    throw new Error('useBus must be used within a BusProvider');
  }
  return context;
};