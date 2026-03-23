import React, {
  createContext, useContext, useReducer,
  useMemo, ReactNode,
} from 'react';
import { Bus, Seat, Passenger, BoardingPoint, DroppingPoint, SearchParams } from '@/types';

// ─── State Type ───────────────────────────────────────────────────
interface BookingState {
  searchParams:  SearchParams | null;
  selectedBus:   Bus | null;
  seats:         Seat[];
  selectedSeats: Seat[];
  passengers:    Passenger[];
  boardingPoint: BoardingPoint | null;
  droppingPoint: DroppingPoint | null;
  contactEmail:  string;
  contactPhone:  string;
}

// ─── Actions ──────────────────────────────────────────────────────
type BookingAction =
  | { type: 'SET_SEARCH_PARAMS'; payload: SearchParams }
  | { type: 'SET_BUS';           payload: Bus }
  | { type: 'SET_SEATS';         payload: Seat[] }
  | { type: 'TOGGLE_SEAT';       payload: Seat }
  | { type: 'SET_PASSENGERS';    payload: Passenger[] }
  | { type: 'SET_BOARDING_POINT'; payload: BoardingPoint }
  | { type: 'SET_DROPPING_POINT'; payload: DroppingPoint }
  | { type: 'SET_CONTACT';       payload: { email: string; phone: string } }
  | { type: 'CLEAR_BOOKING' };

// ─── Context Type ─────────────────────────────────────────────────
interface BookingContextType extends BookingState {
  setSearchParams:  (params: SearchParams) => void;
  setSelectedBus:   (bus: Bus) => void;
  setSeats:         (seats: Seat[]) => void;
  toggleSeat:       (seat: Seat) => void;
  setPassengers:    (passengers: Passenger[]) => void;
  setBoardingPoint: (bp: BoardingPoint) => void;
  setDroppingPoint: (dp: DroppingPoint) => void;
  setContact:       (email: string, phone: string) => void;
  clearBooking:     () => void;
  totalAmount:      number;
}

// ─── Initial State ────────────────────────────────────────────────
const initialState: BookingState = {
  searchParams:  null,
  selectedBus:   null,
  seats:         [],
  selectedSeats: [],
  passengers:    [],
  boardingPoint: null,
  droppingPoint: null,
  contactEmail:  '',
  contactPhone:  '',
};

// ─── Reducer ──────────────────────────────────────────────────────
const bookingReducer = (state: BookingState, action: BookingAction): BookingState => {
  switch (action.type) {

    case 'SET_SEARCH_PARAMS':
      // ✅ Skip update if params haven't changed — prevents re-renders
      if (
        state.searchParams?.source      === action.payload.source &&
        state.searchParams?.destination === action.payload.destination &&
        state.searchParams?.date        === action.payload.date
      ) return state;
      return { ...state, searchParams: action.payload };

    case 'SET_BUS':
      return { ...state, selectedBus: action.payload };

    case 'SET_SEATS':
      return { ...state, seats: action.payload };

    case 'TOGGLE_SEAT': {
      const seat = action.payload;
      // Ignore clicks on already-booked seats
      if (seat.status === 'booked') return state;

      const isSelected = state.selectedSeats.some((s) => s.id === seat.id);

      const updatedSeats = state.seats.map((s) =>
        s.id === seat.id
          ? { ...s, status: isSelected ? ('available' as const) : ('selected' as const) }
          : s
      );

      const updatedSelected = isSelected
        ? state.selectedSeats.filter((s) => s.id !== seat.id)
        : [...state.selectedSeats, { ...seat, status: 'selected' as const }];

      return { ...state, seats: updatedSeats, selectedSeats: updatedSelected };
    }

    case 'SET_PASSENGERS':
      return { ...state, passengers: action.payload };

    case 'SET_BOARDING_POINT':
      return { ...state, boardingPoint: action.payload };

    case 'SET_DROPPING_POINT':
      return { ...state, droppingPoint: action.payload };

    case 'SET_CONTACT':
      return {
        ...state,
        contactEmail: action.payload.email,
        contactPhone: action.payload.phone,
      };

    case 'CLEAR_BOOKING':
      return initialState;

    default:
      return state;
  }
};

// ─── Context ──────────────────────────────────────────────────────
const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  // ✅ Memoize totalAmount — only recalculates when selectedSeats changes
  const totalAmount = useMemo(
    () => state.selectedSeats.reduce((sum, s) => sum + s.price, 0),
    [state.selectedSeats]
  );

  // ✅ Memoize ALL context functions — stable references prevent
  //    child components (like SearchResultsPage) from re-rendering
  //    and triggering duplicate useEffect calls
  const contextValue = useMemo<BookingContextType>(
    () => ({
      // State
      ...state,
      totalAmount,

      // Actions — stable function references
      setSearchParams:  (p)           => dispatch({ type: 'SET_SEARCH_PARAMS',  payload: p }),
      setSelectedBus:   (b)           => dispatch({ type: 'SET_BUS',            payload: b }),
      setSeats:         (s)           => dispatch({ type: 'SET_SEATS',          payload: s }),
      toggleSeat:       (s)           => dispatch({ type: 'TOGGLE_SEAT',        payload: s }),
      setPassengers:    (p)           => dispatch({ type: 'SET_PASSENGERS',     payload: p }),
      setBoardingPoint: (bp)          => dispatch({ type: 'SET_BOARDING_POINT', payload: bp }),
      setDroppingPoint: (dp)          => dispatch({ type: 'SET_DROPPING_POINT', payload: dp }),
      setContact:       (email,phone) => dispatch({ type: 'SET_CONTACT',        payload: { email, phone } }),
      clearBooking:     ()            => dispatch({ type: 'CLEAR_BOOKING' }),
    }),
    // ✅ Only re-create when state or totalAmount actually changes
    [state, totalAmount]
  );

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
};