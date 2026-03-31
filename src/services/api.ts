import axios, { AxiosError } from 'axios';
import {
  AuthResponse, LoginPayload, SignupPayload,
  Bus, Seat, Booking, BookingPayload, SearchParams,
} from '@/types';
import { storage } from '@/utils/helpers';

export interface FilterApiParams {
  busTypes?:      string;
  minPrice?:      number;
  maxPrice?:      number;
  departureTime?: string;
  amenities?:     string;
  sortBy?:        string;
}

// ─── Axios Instance ───────────────────────────────────────────────
const api = axios.create({
  baseURL: 'https://red-bus-backend-tosi.onrender.com/api',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every outgoing request
api.interceptors.request.use((config) => {
  const token = storage.get<string>('rb_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — but NOT on login/signup pages
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isAuthRoute =
      window.location.pathname === '/login' ||
      window.location.pathname === '/signup';

    if (error.response?.status === 401 && !isAuthRoute) {
      storage.remove('rb_token');
      storage.remove('rb_user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// ─── Error message extractor ──────────────────────────────────────
const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong'
    );
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
};
const parseDate = (val: unknown): string => {
  if (!val) return '';
  const str = typeof val === 'string' ? val : String(val);
  const clean = str.slice(0, 10);
  // Validate it looks like a real date YYYY-MM-DD
  return /^\d{4}-\d{2}-\d{2}$/.test(clean) ? clean : '';
};
const parseTime = (val: unknown): string => {
  if (!val) return '';
  const str = typeof val === 'string' ? val : String(val);
  return str.slice(0, 5);
};

// ─────────────────────────────────────────────────────────────────
// AUTH APIs
// ─────────────────────────────────────────────────────────────────
export const authAPI = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    try {
      const { data } = await api.post('/auth/login', payload);
      return { user: data.data.user, token: data.data.token, message: data.message };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  signup: async (payload: SignupPayload): Promise<AuthResponse> => {
    try {
      const { data } = await api.post('/auth/signup', payload);
      return { user: data.data.user, token: data.data.token, message: data.message };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  logout: async (): Promise<void> => {
    storage.remove('rb_token');
    storage.remove('rb_user');
  },

  getProfile: async () => {
    try {
      const { data } = await api.get('/auth/profile');
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      return { message: data.message };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    try {
      const { data } = await api.post('/auth/reset-password', { token, password });
      return { message: data.message };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

// ─────────────────────────────────────────────────────────────────
// BUS / SEARCH APIs
// ─────────────────────────────────────────────────────────────────
export const busAPI = {
  search: async (params: SearchParams & Partial<FilterApiParams>): Promise<Bus[]> => {
    try {
      const { data } = await api.get('/buses/search', { params });
      return data.data.map((trip: BackendTrip) => mapTripToBus(trip));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getById: async (id: string): Promise<Bus | undefined> => {
    try {
      const { data } = await api.get(`/buses/${id}`);
      return mapTripToBus(data.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getSeats: async (tripId: string): Promise<Seat[]> => {
    try {
      const { data } = await api.get(`/buses/${tripId}/seats`);
      return data.data.map((seat: BackendSeat) => mapSeat(seat));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

// ─────────────────────────────────────────────────────────────────
// PAYMENT APIs
// ─────────────────────────────────────────────────────────────────
export interface PaymentOrder {
  orderId:  string;
  amount:   number;
  currency: string;
  keyId:    string;
}

export interface PaymentVerification {
  razorpay_order_id:   string;
  razorpay_payment_id: string;
  razorpay_signature:  string;
  bookingData:         BookingPayload;
}

export const paymentAPI = {
  createOrder: async (amount: number): Promise<PaymentOrder> => {
    try {
      const { data } = await api.post('/payments/create-order', { amount });
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  verifyAndBook: async (payload: PaymentVerification): Promise<Booking> => {
    try {
      const { data } = await api.post('/payments/verify-and-book', payload);
      return mapBooking(data.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  mockPay: async (bookingPayload: BookingPayload): Promise<Booking> => {
    try {
      const { data } = await api.post('/payments/mock-pay', bookingPayload);
      return mapBooking(data.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

// ─────────────────────────────────────────────────────────────────
// BOOKING APIs
// ─────────────────────────────────────────────────────────────────
export const bookingAPI = {
  create: async (payload: BookingPayload): Promise<Booking> => {
    try {
      const { data } = await api.post('/bookings', {
        tripId:          payload.busId,
        boardingPointId: payload.boardingPointId,
        droppingPointId: payload.droppingPointId,
        contactEmail:    payload.contactEmail,
        contactPhone:    payload.contactPhone,
        totalAmount:     payload.totalAmount,
        selectedSeats:   payload.selectedSeats,
        passengers:      payload.passengers,
      });
      return mapBooking(data.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getMyBookings: async (): Promise<Booking[]> => {
    try {
      const { data } = await api.get('/bookings/my');
      return data.data.map((b: BackendBooking) => mapBooking(b));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getById: async (id: string): Promise<Booking | undefined> => {
    try {
      const { data } = await api.get(`/bookings/${id}`);
      return mapBooking(data.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  cancel: async (id: string): Promise<{ message: string }> => {
    try {
      const { data } = await api.put(`/bookings/${id}/cancel`);
      return { message: data.message };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

// ─────────────────────────────────────────────────────────────────
// ADMIN APIs
// ─────────────────────────────────────────────────────────────────
export interface AdminBusPayload {
  name:               string;
  operatorName:       string;
  busType:            string;
  totalSeats:         number;
  amenities:          string[];
  cancellationPolicy: string;
  refundPolicy:       string;
}

export interface AdminTripPayload {
  busId:          string;
  source:         string;
  destination:    string;
  departureTime:  string;
  arrivalTime:    string;
  duration:       string;
  price:          number;
  originalPrice?: number;
  travelDate:     string;
  totalSeats:     number;
  boardingPoints: { name: string; time: string; address: string }[];
  droppingPoints: { name: string; time: string; address: string }[];
}

export const adminAPI = {
  getStats: async () => {
    try {
      const { data } = await api.get('/admin/stats');
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getAllBuses: async () => {
    try {
      const { data } = await api.get('/admin/buses');
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  createBus: async (payload: AdminBusPayload) => {
    try {
      const { data } = await api.post('/admin/buses', payload);
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  updateBus: async (id: string, payload: Partial<AdminBusPayload>) => {
    try {
      const { data } = await api.put(`/admin/buses/${id}`, payload);
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  deleteBus: async (id: string) => {
    try {
      const { data } = await api.delete(`/admin/buses/${id}`);
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getAllTrips: async () => {
    try {
      const { data } = await api.get('/admin/trips');
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  createTrip: async (payload: AdminTripPayload) => {
    try {
      const { data } = await api.post('/admin/trips', payload);
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  updateTrip: async (id: string, payload: Partial<AdminTripPayload>) => {
    try {
      const { data } = await api.put(`/admin/trips/${id}`, payload);
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  deleteTrip: async (id: string) => {
    try {
      const { data } = await api.delete(`/admin/trips/${id}`);
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getAllBookings: async () => {
    try {
      const { data } = await api.get('/admin/bookings');
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getAllUsers: async () => {
    try {
      const { data } = await api.get('/admin/users');
      return data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

// ─────────────────────────────────────────────────────────────────
// Backend → Frontend type mappers
// ─────────────────────────────────────────────────────────────────

interface BackendTrip {
  id:                  string;
  bus_id:              string;
  bus_name:            string;
  operator_name:       string;
  bus_type:            string;
  source:              string;
  destination:         string;
  departure_time:      string;
  arrival_time:        string;
  duration:            string;
  price:               string | number;
  original_price:      string | number | null;
  travel_date:         string;
  available_seats:     number;
  total_seats:         number;
  rating:              string | number;
  review_count:        number;
  amenities:           string[];
  cancellation_policy: string;
  refund_policy:       string;
  boarding_points:     BackendPoint[];
  dropping_points:     BackendPoint[];
}

interface BackendPoint {
  id:      string;
  name:    string;
  time:    string;
  address: string;
}

interface BackendSeat {
  id:          string;
  seat_number: string;
  deck:        'lower' | 'upper';
  status:      'available' | 'booked' | 'blocked';
  price:       string | number;
  is_ladies:   boolean;
  row_num:     number;
  col_num:     number;
}

interface BackendBooking {
  id:               string;
  user_id:          string;
  trip_id:          string;
  pnr:              string;
  total_amount:     string | number;
  status:           'confirmed' | 'cancelled' | 'pending';
  contact_email:    string;
  contact_phone:    string;
  booked_at:        string;
  source:           string;
  destination:      string;
  departure_time:   string;
  arrival_time:     string;
  duration:         string;
  travel_date:      string;
  bus_name:         string;
  bus_type:         string;
  boarding_name:    string;
  boarding_time:    string;
  boarding_address: string;
  dropping_name:    string;
  dropping_time:    string;
  dropping_address: string;
  passengers: {
    passenger_name:   string;
    passenger_age:    number;
    passenger_gender: string;
    seat_number:      string;
  }[];
}

// ─────────────────────────────────────────────────────────────────
// ✅ FIXED: All date fields use parseDate(), all time fields use parseTime()
// ─────────────────────────────────────────────────────────────────

export const mapTripToBus = (trip: BackendTrip): Bus => ({
  id:             trip.id,
  name:           trip.bus_name,
  operatorName:   trip.operator_name,
  type:           trip.bus_type as Bus['type'],
  departureTime:  parseTime(trip.departure_time),   
  arrivalTime:    parseTime(trip.arrival_time),     
  duration:       trip.duration,
  source:         trip.source,
  destination:    trip.destination,
  date:           parseDate(trip.travel_date),      
  price:          Number(trip.price),
  originalPrice:  trip.original_price ? Number(trip.original_price) : undefined,
  totalSeats:     trip.total_seats     ?? 40,
  availableSeats: trip.available_seats ?? 0,
  rating:         Number(trip.rating)  || 4.0,
  reviewCount:    trip.review_count    ?? 0,
  amenities:      trip.amenities       ?? [],
  policies: {
    cancellation: trip.cancellation_policy ?? '',
    refund:       trip.refund_policy       ?? '',
  },
  boardingPoints: (trip.boarding_points ?? []).map((bp) => ({
    id:      bp.id,
    name:    bp.name,
    time:    parseTime(bp.time),                    
    address: bp.address,
  })),
  droppingPoints: (trip.dropping_points ?? []).map((dp) => ({
    id:      dp.id,
    name:    dp.name,
    time:    parseTime(dp.time),                 
    address: dp.address,
  })),
});

export const mapSeat = (seat: BackendSeat): Seat => ({
  id:         seat.id,
  seatNumber: seat.seat_number,
  deck:       seat.deck,
  status:     seat.status === 'blocked' ? 'booked' : seat.status,
  price:      Number(seat.price),
  isLadies:   seat.is_ladies,
  position: {
    row: seat.row_num,
    col: seat.col_num,
  },
});

export const mapBooking = (b: BackendBooking): Booking => {
  // total_amount comes back as a numeric string from Postgres; guard against null/undefined
  const rawAmount = b.total_amount ?? b.passengers?.reduce(() => 0, 0) ?? 0;
  const safeAmount = isNaN(Number(rawAmount)) ? 0 : Number(rawAmount);

  return {
    id:     b.id,
    userId: b.user_id,
    busId:  b.trip_id,
    bus: {
      id:             b.trip_id,
      name:           b.bus_name        ?? '',
      operatorName:   b.bus_name        ?? '',
      type:           b.bus_type as Bus['type'],
      departureTime:  parseTime(b.departure_time),
      arrivalTime:    parseTime(b.arrival_time),
      duration:       b.duration        ?? '',
      source:         b.source          ?? '',
      destination:    b.destination     ?? '',
      date:           parseDate(b.travel_date),
      price:          safeAmount,
      totalSeats:     40,
      availableSeats: 0,
      rating:         4.0,
      reviewCount:    0,
      amenities:      [],
      policies:       { cancellation: '', refund: '' },
      boardingPoints: [],
      droppingPoints: [],
    },
    passengers: (b.passengers ?? []).map((p) => ({
      name:       p.passenger_name   ?? '',
      age:        p.passenger_age    ?? 0,
      gender:     (p.passenger_gender ?? 'Male') as 'Male' | 'Female' | 'Other',
      seatNumber: p.seat_number      ?? '',
    })),
    selectedSeats: (b.passengers ?? []).map((p) => p.seat_number ?? ''),
    totalAmount:   safeAmount,
    boardingPoint: {
      id:      b.trip_id             ?? '',
      name:    b.boarding_name       ?? '',
      time:    parseTime(b.boarding_time),
      address: b.boarding_address    ?? '',
    },
    droppingPoint: {
      id:      b.trip_id             ?? '',
      name:    b.dropping_name       ?? '',
      time:    parseTime(b.dropping_time),
      address: b.dropping_address    ?? '',
    },
    status:       b.status           ?? 'confirmed',
    bookingDate:  b.booked_at        ?? '',
    pnr:          b.pnr              ?? '',
    contactEmail: b.contact_email    ?? '',
    contactPhone: b.contact_phone    ?? '',
  };
};

export default api;