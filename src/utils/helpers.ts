import { format, parseISO, isValid } from 'date-fns';
export const formatDate = (dateStr: string, fmt = 'dd MMM yyyy'): string => {
  try {
    const date = parseISO(dateStr);
    return isValid(date) ? format(date, fmt) : dateStr;
  } catch {
    return dateStr;
  }
};

export const formatDisplayDate = (dateStr: string): string =>
  formatDate(dateStr, 'EEE, dd MMM yyyy');

export const formatShortDate = (dateStr: string): string =>
  formatDate(dateStr, 'dd MMM');

export const getTodayISO = (): string =>
  new Date().toISOString().split('T')[0];

export const getTomorrowISO = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};
export const formatPrice = (amount: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const calcDiscount = (original: number, current: number): number =>
  Math.round(((original - current) / original) * 100);

export const parseTimeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export const isDepartureMorning = (time: string): boolean => {
  const mins = parseTimeToMinutes(time);
  return mins >= 360 && mins < 720;
};

export const isDepartureAfternoon = (time: string): boolean => {
  const mins = parseTimeToMinutes(time);
  return mins >= 720 && mins < 1020; 
};

export const isDepartureEvening = (time: string): boolean => {
  const mins = parseTimeToMinutes(time);
  return mins >= 1020 && mins < 1260; 
};

export const isDepartureNight = (time: string): boolean => {
  const mins = parseTimeToMinutes(time);
  return mins >= 1260 || mins < 360; 
};


export const generatePNR = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pnr = 'RB';
  for (let i = 0; i < 9; i++) {
    pnr += chars[Math.floor(Math.random() * chars.length)];
  }
  return pnr;
};

export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch {
      return null;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.warn('LocalStorage write failed:', key);
    }
  },
  remove: (key: string): void => localStorage.removeItem(key),
  clear: (): void => localStorage.clear(),
};

export const amenityIconMap: Record<string, string> = {
  'WiFi': '📶',
  'Charging Point': '🔌',
  'Blanket': '🛋️',
  'Pillow': '🛏️',
  'Water Bottle': '💧',
  'Snacks': '🍫',
  'Live Tracking': '📍',
  'Reading Light': '💡',
  'AC': '❄️',
};

// ─── Class name helper ────────────────────────────────────────────
export const cn = (...classes: (string | undefined | null | boolean)[]): string =>
  classes.filter(Boolean).join(' ');