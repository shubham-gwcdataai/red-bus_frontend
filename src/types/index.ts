
export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    createdAt?: string;
  }
  
  export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  }
  
  export interface LoginPayload {
    email: string;
    password: string;
  }
  
  export interface SignupPayload {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }
  
  export interface AuthResponse {
    user: User;
    token: string;
    message: string;
  }
  

  export interface SearchParams {
    source: string;
    destination: string;
    date: string;
  }
  
 
  export type BusType = 'AC Sleeper' | 'Non-AC Sleeper' | 'AC Seater' | 'Non-AC Seater' | 'AC Semi-Sleeper';
  
  export interface Bus {
    id: string;
    name: string;
    operatorName: string;
    type: BusType;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    source: string;
    destination: string;
    date: string;
    price: number;
    originalPrice?: number;
    totalSeats: number;
    availableSeats: number;
    rating: number;
    reviewCount: number;
    amenities: string[];
    policies: {
      cancellation: string;
      refund: string;
    };
    boardingPoints: BoardingPoint[];
    droppingPoints: DroppingPoint[];
  }
  
  export interface BoardingPoint {
    id: string;
    name: string;
    time: string;
    address: string;
  }
  
  export interface DroppingPoint {
    id: string;
    name: string;
    time: string;
    address: string;
  }
  
 
  export type SeatStatus = 'available' | 'booked' | 'selected' | 'ladies';
  export type DeckType = 'lower' | 'upper';
  
  export interface Seat {
    id: string;
    seatNumber: string;
    deck: DeckType;
    status: SeatStatus;
    price: number;
    isLadies?: boolean;
    position: { row: number; col: number };
  }
  
  
  export interface Passenger {
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    seatNumber: string;
  }
  
  export interface Booking {
    id: string;
    userId: string;
    busId: string;
    bus: Bus;
    passengers: Passenger[];
    selectedSeats: string[];
    totalAmount: number;
    boardingPoint: BoardingPoint;
    droppingPoint: DroppingPoint;
    status: 'confirmed' | 'cancelled' | 'pending';
    bookingDate: string;
    pnr: string;
    contactEmail: string;
    contactPhone: string;
  }
  
  export interface BookingPayload {
    busId: string;
    selectedSeats: string[];
    passengers: Passenger[];
    boardingPointId: string;
    droppingPointId: string;
    contactEmail: string;
    contactPhone: string;
    totalAmount: number;
  }
  

  export interface FilterState {
    busTypes: BusType[];
    priceRange: [number, number];
    departureTime: string[];
    amenities: string[];
    operators: string[];
    sortBy: 'price_asc' | 'price_desc' | 'departure' | 'rating' | 'seats';
  }
  

  export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
  }
  
  export interface PaginatedResponse<T> extends ApiResponse<T> {
    total: number;
    page: number;
    limit: number;
  }