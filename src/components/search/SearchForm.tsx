import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeftRight, Calendar, Search, X } from 'lucide-react';
import { useBooking } from '@/context/BookingContext';
import { INDIAN_CITIES } from '@/data/mockData';
import { getTodayISO, getTomorrowISO, formatDate } from '@/utils/helpers';
import { cn } from '@/utils/helpers';

interface SearchFormProps {
  variant?: 'hero' | 'compact';
  initialSource?: string;
  initialDestination?: string;
  initialDate?: string;
}

const BusIcon = () => (
  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24"
    stroke="currentColor" strokeWidth="1.6">
    <rect x="2" y="7" width="20" height="12" rx="2" />
    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" strokeLinecap="round" />
    <circle cx="7" cy="19" r="1.5" />
    <circle cx="17" cy="19" r="1.5" />
    <path d="M2 13h20" strokeLinecap="round" />
  </svg>
);

// ── Reusable city dropdown ────────────────────────────────────────
interface CityDropdownProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onSelect: (city: string) => void;
  exclude?: string;
  placeholder: string;
  inputClass?: string;
}

const CityDropdown: React.FC<CityDropdownProps> = ({
  label, value, onChange, onSelect, exclude, placeholder, inputClass,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep local query in sync when parent value changes (e.g. swap)
  useEffect(() => { setQuery(value); }, [value]);

  // Close on outside click — use mousedown so it fires before blur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        // If user clicked away without selecting, restore last confirmed value
        setQuery(value);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [value]);

  const filtered = INDIAN_CITIES.filter(
    (c) =>
      c.toLowerCase().includes(query.toLowerCase()) &&
      c.toLowerCase() !== (exclude || '').toLowerCase()
  ).slice(0, 8);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onChange(e.target.value);
    setOpen(true);
  };

  const handleSelect = (city: string) => {
    setQuery(city);
    onSelect(city);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuery('');
    onChange('');
    onSelect('');
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapRef} className="relative w-full">
      <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(
            'w-full bg-transparent focus:outline-none font-bold text-[#1a1a2e]',
            'placeholder:font-normal placeholder:text-gray-300',
            inputClass
          )}
        />
        {/* Clear button — only when there's a value */}
        {query && (
          <button
            type="button"
            onMouseDown={handleClear}
            className="absolute right-0 p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown list */}
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100
                        rounded-2xl shadow-2xl z-[999] overflow-hidden">
          {filtered.map((city) => (
            <button
              key={city}
              type="button"
              // Use onMouseDown so it fires BEFORE the input's onBlur
              onMouseDown={(e) => {
                e.preventDefault(); // prevent blur
                handleSelect(city);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm
                         text-gray-700 hover:bg-red-50 hover:text-[#d63031]
                         border-b border-gray-50 last:border-0 text-left
                         transition-colors duration-100"
            >
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="font-medium">{city}</span>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {open && query.length >= 2 && filtered.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100
                        rounded-2xl shadow-2xl z-[999] px-4 py-3 text-sm text-gray-400">
          No cities found for "{query}"
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
const SearchForm: React.FC<SearchFormProps> = ({
  variant = 'hero',
  initialSource = '',
  initialDestination = '',
  initialDate,
}) => {
  const navigate = useNavigate();
  const { setSearchParams } = useBooking();

  const [source, setSource] = useState(initialSource);
  const [destination, setDestination] = useState(initialDestination);
  const [date, setDate] = useState(initialDate || getTomorrowISO());
  const [bookingForWomen, setBookingForWomen] = useState(false);
  const [error, setError] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const mobileDateRef = useRef<HTMLInputElement>(null);
  const desktopDateRef = useRef<HTMLInputElement>(null);

  const todayISO = getTodayISO();
  const tomorrowISO = getTomorrowISO();

  const swapCities = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const handleSearch = () => {
    setError('');
    if (!source.trim()) { setError('Please enter source city'); return; }
    if (!destination.trim()) { setError('Please enter destination city'); return; }
    if (!date) { setError('Please select a travel date'); return; }
    if (source.toLowerCase() === destination.toLowerCase()) {
      setError('Source and destination cannot be the same'); return;
    }
    setSearchParams({ source, destination, date });
    navigate(
      `/search?from=${encodeURIComponent(source)}&to=${encodeURIComponent(destination)}&date=${date}`
    );
  };

  const handleWomenToggle = useCallback(() => {
    const next = !bookingForWomen;
    setBookingForWomen(next);
    setSnackbarMessage(next ? 'Booking for women enabled' : 'Booking for women disabled');
    setSnackbarVisible(true);
    setTimeout(() => setSnackbarVisible(false), 4000);
  }, [bookingForWomen]);

  const getDateParenLabel = () => {
    if (date === todayISO) return 'Today';
    if (date === tomorrowISO) return 'Tmrw';
    return null;
  };

  /* ──────────────────────────────────────────────────────────────
     COMPACT variant (search results bar)
  ────────────────────────────────────────────────────────────── */
  if (variant === 'compact') {
    return (
      <div className="w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">

            {/* From */}
            <div className="flex-1 min-w-0 relative border border-gray-200 rounded-lg px-3 py-2.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#d63031] flex-shrink-0" />
                <CityDropdown
                  label=""
                  value={source}
                  onChange={setSource}
                  onSelect={setSource}
                  exclude={destination}
                  placeholder="From city"
                  inputClass="text-sm"
                />
              </div>
            </div>

            {/* Swap */}
            <button type="button" onClick={swapCities}
              className="self-center p-2 rounded-full border border-gray-200
                         hover:border-[#d63031] hover:text-[#d63031] text-gray-400 transition-all">
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>

            {/* To */}
            <div className="flex-1 min-w-0 relative border border-gray-200 rounded-lg px-3 py-2.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#d63031] flex-shrink-0" />
                <CityDropdown
                  label=""
                  value={destination}
                  onChange={setDestination}
                  onSelect={setDestination}
                  exclude={source}
                  placeholder="To city"
                  inputClass="text-sm"
                />
              </div>
            </div>

            {/* Date */}
            <div className="flex-1">
              <div className="relative border border-gray-200 rounded-lg px-3 py-2.5">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4
                                     text-[#d63031] pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  min={todayISO}
                  onChange={e => setDate(e.target.value)}
                  className="w-full pl-7 text-sm text-[#1a1a2e] font-medium
                             focus:outline-none bg-transparent cursor-pointer"
                />
              </div>
            </div>

            <button type="button" onClick={handleSearch}
              className="flex items-center justify-center gap-2 px-5 py-2.5
                         bg-[#d63031] hover:bg-[#b71c1c] text-white text-sm
                         font-semibold rounded-lg transition-colors">
              <Search className="w-4 h-4" /> Search
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────────
     HERO variant
  ────────────────────────────────────────────────────────────── */
  return (
    <>
      <div className="w-full">

        {/* ══════════════════════════════════════════
            DESKTOP
        ══════════════════════════════════════════ */}
        <div className="hidden md:block">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100">
            <div className="flex items-stretch divide-x divide-gray-100">

              {/* FROM */}
              <div className="flex items-center gap-3 px-5 py-5 flex-1 min-w-0">
                <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center
                                justify-center flex-shrink-0">
                  <BusIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <CityDropdown
                    label="From"
                    value={source}
                    onChange={setSource}
                    onSelect={(city) => { setSource(city); setError(''); }}
                    exclude={destination}
                    placeholder="Enter source city"
                    inputClass="text-[15px]"
                  />
                </div>
              </div>

              {/* Swap */}
              <div className="flex items-center justify-center px-2 flex-shrink-0 z-10">
                <button type="button" onClick={swapCities}
                  className="w-9 h-9 rounded-full bg-[#1a1a2e] hover:bg-[#d63031]
                             flex items-center justify-center shadow-md
                             transition-all duration-200 active:scale-95">
                  <ArrowLeftRight className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* TO */}
              <div className="flex items-center gap-3 px-5 py-5 flex-1 min-w-0">
                <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center
                                justify-center flex-shrink-0">
                  <BusIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <CityDropdown
                    label="To"
                    value={destination}
                    onChange={setDestination}
                    onSelect={(city) => { setDestination(city); setError(''); }}
                    exclude={source}
                    placeholder="Enter destination city"
                    inputClass="text-[15px]"
                  />
                </div>
              </div>

              {/* DATE */}
              <div className="flex items-center gap-3 px-5 py-5">
                {/* Calendar icon triggers date picker */}
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gray-500 pointer-events-none" />
                  </div>
                  <input
                    ref={desktopDateRef}
                    type="date"
                    value={date}
                    min={todayISO}
                    onChange={e => setDate(e.target.value)}
                    style={{ fontSize: '16px', zIndex: 10 }}
                    className="absolute inset-0 w-full h-full opacity-0
                               cursor-pointer rounded-xl"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-medium mb-0.5">
                    Date of Journey
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[15px] font-bold text-[#1a1a2e] whitespace-nowrap">
                      {formatDate(date, 'dd MMM, yyyy')}
                    </span>
                    {getDateParenLabel() && (
                      <span className="text-xs text-gray-400">
                        ({getDateParenLabel()})
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 ml-1">
                  <button type="button" onClick={() => setDate(todayISO)}
                    className={cn(
                      'text-sm font-bold px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap',
                      date === todayISO
                        ? 'bg-red-100 text-[#d63031]'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    )}>
                    Today
                  </button>
                  <button type="button" onClick={() => setDate(tomorrowISO)}
                    className={cn(
                      'text-sm font-bold px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap',
                      date === tomorrowISO
                        ? 'bg-red-100 text-[#d63031]'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    )}>
                    Tomorrow
                  </button>
                </div>
              </div>

              {/* WOMEN */}
              <div className="flex items-center gap-3 px-5 py-5">
                <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center
                                justify-center flex-shrink-0 text-xl">👩</div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-[#1a1a2e] whitespace-nowrap">
                    Booking for women
                  </p>
                  <button type="button"
                    className="text-xs text-[#d63031] font-semibold mt-0.5">
                    Know more
                  </button>
                </div>
                <button type="button" onClick={handleWomenToggle}
                  role="switch"
                  aria-checked={bookingForWomen}
                  className={cn(
                    'relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200 ml-1',
                    bookingForWomen ? 'bg-[#d63031]' : 'bg-gray-300'
                  )}>
                  <span className={cn(
                    'absolute top-0.5 bottom-0.5 aspect-square bg-white rounded-full',
                    'shadow-sm transition-all duration-200',
                    bookingForWomen ? 'right-0.5' : 'left-0.5'
                  )} />
                </button>
              </div>
            </div>
          </div>

          {/* Search button */}
          <div className="flex justify-center mt-4">
            <button type="button" onClick={handleSearch}
              className="flex items-center gap-2.5 px-20 py-3.5 -mt-8 bg-[#d63031] hover:bg-[#b71c1c] text-white font-bold text-base rounded-full shadow-lg transition-colors">
              <Search className="w-5 h-5" /> Search buses
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-600 text-center mt-2 font-medium">
              ⚠ {error}
            </p>
          )}
        </div>

        {/* ══════════════════════════════════════════
            MOBILE
        ══════════════════════════════════════════ */}
        <div className="md:hidden w-full space-y-3">

          {/* Card 1: From / To / Date */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="relative">
              {/* FROM */}
              <div className="flex items-center px-4 py-5">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 mr-3">
                  <BusIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <CityDropdown
                    label="From"
                    value={source}
                    onChange={setSource}
                    onSelect={(city) => { setSource(city); setError(''); }}
                    exclude={destination}
                    placeholder="Enter city"
                    inputClass="text-[16px]"
                  />
                </div>
              </div>

              {/* FLOATING SWAP BUTTON */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10">
                <button
                  type="button"
                  onClick={swapCities}
                  className="w-10 h-10 rounded-full bg-[#1a1a2e] text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>

              <div className="h-px bg-gray-100 mx-4" />

              {/* TO */}
              <div className="flex items-center px-4 py-5">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 mr-3">
                  <BusIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <CityDropdown
                    label="To"
                    value={destination}
                    onChange={setDestination}
                    onSelect={(city) => { setDestination(city); setError(''); }}
                    exclude={source}
                    placeholder="Enter city"
                    inputClass="text-[16px]"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100 mx-4" />

            {/* DATE */}
            <div className="flex items-center gap-3 px-4 py-4">
  {/* Calendar icon with hidden date input */}
  <div className="relative flex-shrink-0">
    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
      <Calendar className="w-5 h-5 text-gray-400" />
    </div>
    <input
      ref={mobileDateRef}
      type="date"
      value={date}
      min={todayISO}
      onChange={e => setDate(e.target.value)}
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
    />
  </div>

  {/* Date label + value */}
  <div className="flex-1 min-w-0">
    <p className="text-xs text-gray-400 font-medium leading-none mb-1">Date of Journey</p>
    <p className="text-[15px] font-bold text-[#1a1a2e] leading-tight truncate">
      {formatDate(date, 'dd MMM, yyyy')}
      {getDateParenLabel() && (
        <span className="ml-1 text-xs font-normal text-gray-400">
          ({getDateParenLabel()})
        </span>
      )}
    </p>
  </div>

  {/* Quick-select buttons */}
  <div className="flex items-center gap-2 flex-shrink-0">
    <button
      type="button"
      onClick={() => setDate(todayISO)}
      className={cn(
        "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap",
        date === todayISO
          ? "bg-red-50 text-[#d63031]"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      )}
    >
      Today
    </button>
    <button
      type="button"
      onClick={() => setDate(tomorrowISO)}
      className={cn(
        "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap",
        date === tomorrowISO
          ? "bg-red-50 text-[#d63031]"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      )}
    >
      Tomorrow
    </button>
  </div>
</div>
          </div>

          {/* Card 2: Booking for Women */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-2xl">👩</div>
            <div className="flex-1">
              <p className="text-[15px] font-bold text-[#1a1a2e]">Booking for women</p>
              <button type="button" className="text-xs text-[#d63031] font-semibold">Know more</button>
            </div>
            <button
              type="button"
              onClick={handleWomenToggle}
              className={cn(
                "relative w-14 h-7 rounded-full transition-colors",
                bookingForWomen ? "bg-[#d63031]" : "bg-gray-200"
              )}
            >
              <span className={cn(
                "absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm",
                bookingForWomen ? "right-1" : "left-1"
              )} />
            </button>
          </div>

          <button type="button" onClick={handleSearch}
            className="w-full py-4 bg-[#d63031] text-white font-bold text-lg rounded-2xl shadow-md active:bg-[#b71c1c]">
            Search buses
          </button>

          {error && <p className="text-sm text-red-600 text-center font-medium">⚠ {error}</p>}
        </div>
      </div>

      {/* Snackbar */}
      <div className={cn(
        'fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999]',
        'flex items-center gap-4 px-5 py-3.5',
        'bg-[#1a1a2e] text-white rounded-xl shadow-2xl whitespace-nowrap',
        'transition-all duration-300 ease-out',
        snackbarVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
      )}>
        <span className="text-sm font-medium">{snackbarMessage}</span>
        <button type="button"
          onClick={() => {
            setBookingForWomen(prev => !prev);
            setSnackbarVisible(false);
          }}
          className="text-sm font-bold uppercase tracking-wide
                     hover:text-red-300 transition-colors ml-2">
          Undo
        </button>
      </div>
    </>
  );
};

export default SearchForm;