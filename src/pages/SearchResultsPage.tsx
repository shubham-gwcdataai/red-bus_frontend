import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { Bus, FilterState } from '@/types';
import { busAPI } from '@/services/api';
import { useBooking } from '@/context/BookingContext';
import { formatDisplayDate, getTodayISO, parseTimeToMinutes } from '@/utils/helpers';
import BusCard from '@/components/search/BusCard';
import FilterSidebar from '@/components/search/FilterSidebar';
import SearchForm from '@/components/search/SearchForm';
import Spinner from '@/components/ui/Spinner';
import {
  isDepartureMorning,
  isDepartureAfternoon,
  isDepartureEvening,
  isDepartureNight,
} from '@/utils/helpers';
import { addDays, format, parseISO, isPast, isToday } from 'date-fns';

const defaultFilters: FilterState = {
  busTypes:      [],
  priceRange:    [0, 5000],
  departureTime: [],
  amenities:     [],
  operators:     [],
  sortBy:        'departure',
};

const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSearchParams: setBookingSearch } = useBooking();

  const from = searchParams.get('from') || '';
  const to   = searchParams.get('to')   || '';
  const date = searchParams.get('date') || '';

  const [buses,        setBuses]        = useState<Bus[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [filters,      setFilters]      = useState<FilterState>(defaultFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // ── Date validation: block past dates ────────────────────────────
  const isPastDate = date ? isPast(parseISO(date + 'T00:00:00')) && !isToday(parseISO(date)) : false;

  useEffect(() => {
    if (!from || !to || !date) {
      navigate('/');
      return;
    }

    // Block past date searches
    if (isPastDate) {
      setError('Cannot search for past dates. Please select today or a future date.');
      setIsLoading(false);
      setBuses([]);
      return;
    }

    setBookingSearch({ source: from, destination: to, date });
    setError(null);
    setIsLoading(true);

    busAPI
      .search({ source: from, destination: to, date })
      .then(setBuses)
      .catch((err) => {
        setError(err.message || 'Failed to fetch buses. Please try again.');
        setBuses([]);
      })
      .finally(() => setIsLoading(false));
  }, [from, to, date]);

  // Navigate prev/next day — prevent going to past
  const changeDate = (direction: -1 | 1) => {
    const newDate    = format(addDays(parseISO(date), direction), 'yyyy-MM-dd');
    const todayISO   = getTodayISO();
    // Prevent navigating to yesterday
    if (direction === -1 && newDate < todayISO) return;
    setSearchParams({ from, to, date: newDate });
  };

  // ── Time-aware filtering for today's date ────────────────────────
  // If searching for today, hide buses that have already departed
  const nowMinutes = useMemo(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }, []);

  const filteredBuses = useMemo(() => {
    let result = [...buses];

    // Time-aware: for today's date, filter out already-departed buses
    const searchDate = date;
    const todayISO   = getTodayISO();
    if (searchDate === todayISO) {
      result = result.filter((b) => parseTimeToMinutes(b.departureTime) > nowMinutes);
    }

    // Bus type filter
    if (filters.busTypes.length > 0)
      result = result.filter((b) => filters.busTypes.includes(b.type));

    // Price range filter
    result = result.filter(
      (b) => b.price >= filters.priceRange[0] && b.price <= filters.priceRange[1]
    );

    // Departure time filter
    if (filters.departureTime.length > 0) {
      result = result.filter((b) =>
        filters.departureTime.some((t) => {
          if (t === 'early')     return parseTimeToMinutes(b.departureTime) < 360;
          if (t === 'morning')   return isDepartureMorning(b.departureTime);
          if (t === 'afternoon') return isDepartureAfternoon(b.departureTime);
          if (t === 'evening')   return isDepartureEvening(b.departureTime) || isDepartureNight(b.departureTime);
          return false;
        })
      );
    }

    // Amenities filter
    if (filters.amenities.length > 0)
      result = result.filter((b) => filters.amenities.every((a) => b.amenities.includes(a)));

    // Operator filter
    if (filters.operators.length > 0)
      result = result.filter((b) => filters.operators.includes(b.operatorName));

    // Sorting
    switch (filters.sortBy) {
      case 'price_asc':  result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating':     result.sort((a, b) => b.rating - a.rating); break;
      case 'seats':      result.sort((a, b) => b.availableSeats - a.availableSeats); break;
      case 'departure':
      default:
        result.sort((a, b) => parseTimeToMinutes(a.departureTime) - parseTimeToMinutes(b.departureTime));
    }

    return result;
  }, [buses, filters, nowMinutes, date]);

  const isToday_ = date === getTodayISO();

  return (
    <div className="min-h-screen bg-[#f5f7fa] page-enter">

      {/* ── Top Bar ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">

          {/* Route header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#d63031] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex items-center gap-2 text-lg font-bold text-[#1a1a2e]">
              <span>{from}</span>
              <span className="text-[#d63031]">→</span>
              <span>{to}</span>
            </div>
            {isToday_ && (
              <div className="flex items-center gap-1 bg-orange-50 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                Showing buses departing after {format(new Date(), 'HH:mm')}
              </div>
            )}
          </div>

          {/* Date navigation */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => changeDate(-1)}
              disabled={date <= getTodayISO()}
              className="p-1.5 rounded-lg border border-gray-200 hover:border-[#d63031] hover:text-[#d63031] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-4 py-1.5 bg-red-50 rounded-lg">
              <Calendar className="w-4 h-4 text-[#d63031]" />
              <span className="text-sm font-semibold text-[#d63031]">
                {formatDisplayDate(date)}
              </span>
            </div>
            <button
              onClick={() => changeDate(1)}
              className="p-1.5 rounded-lg border border-gray-200 hover:border-[#d63031] hover:text-[#d63031] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Compact search form */}
          <SearchForm variant="compact" initialSource={from} initialDestination={to} initialDate={date} />
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">

          {/* Filter sidebar — desktop */}
          <div className="w-64 flex-shrink-0 hidden lg:block">
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              totalResults={filteredBuses.length}
            />
          </div>

          {/* Bus list */}
          <div className="flex-1 min-w-0">

            {/* Result count + mobile filter toggle */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {isLoading ? 'Searching...' : (
                  <>
                    <span className="font-bold text-[#1a1a2e]">{filteredBuses.length}</span>
                    {' '}buses found
                  </>
                )}
              </p>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="lg:hidden flex items-center gap-1.5 text-sm text-[#d63031] font-medium border border-[#d63031] px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
            </div>

            {/* Mobile filter */}
            {isFilterOpen && (
              <div className="lg:hidden mb-4">
                <FilterSidebar
                  filters={filters}
                  onChange={setFilters}
                  totalResults={filteredBuses.length}
                  isOpen={isFilterOpen}
                  onClose={() => setIsFilterOpen(false)}
                />
              </div>
            )}

            {/* Past date error */}
            {isPastDate && (
              <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white rounded-2xl border border-gray-100">
                <span className="text-5xl">📅</span>
                <h3 className="text-lg font-bold text-[#1a1a2e]">Past date selected</h3>
                <p className="text-gray-500 text-sm text-center max-w-xs">
                  You cannot book tickets for past dates. Please select today or a future date.
                </p>
                <button
                  onClick={() => setSearchParams({ from, to, date: getTodayISO() })}
                  className="text-sm text-white bg-[#d63031] px-4 py-2 rounded-lg font-semibold hover:bg-[#b71c1c] transition-colors"
                >
                  Search for Today
                </button>
              </div>
            )}

            {/* API error */}
            {error && !isPastDate && (
              <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white rounded-2xl border border-gray-100">
                <span className="text-5xl">⚠️</span>
                <h3 className="text-lg font-bold text-[#1a1a2e]">Search failed</h3>
                <p className="text-gray-500 text-sm text-center max-w-xs">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm text-[#d63031] font-semibold hover:underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Spinner size="lg" />
                <p className="text-gray-500">Searching for buses...</p>
              </div>
            )}

            {/* No results */}
            {!isLoading && !error && filteredBuses.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-2xl border border-gray-100">
                <span className="text-6xl">🚌</span>
                <h3 className="text-lg font-bold text-[#1a1a2e]">No buses found</h3>
                <p className="text-gray-500 text-sm text-center max-w-sm">
                  {buses.length === 0
                    ? `No buses available from ${from} to ${to} on ${formatDisplayDate(date)}.`
                    : isToday_ && buses.length > 0
                    ? 'All buses for today have already departed. Try tomorrow!'
                    : 'No buses match your current filters.'}
                </p>

                {isToday_ && buses.length > 0 && (
                  <button
                    onClick={() => setSearchParams({ from, to, date: format(addDays(new Date(), 1), 'yyyy-MM-dd') })}
                    className="text-sm font-semibold text-white bg-[#d63031] px-5 py-2 rounded-lg hover:bg-[#b71c1c] transition-colors"
                  >
                    Search Tomorrow
                  </button>
                )}

                {buses.length > 0 && !isToday_ && (
                  <button
                    onClick={() => setFilters(defaultFilters)}
                    className="text-sm text-[#d63031] font-semibold hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Bus cards */}
            {!isLoading && !error && filteredBuses.length > 0 && (
              <div className="space-y-3">
                {filteredBuses.map((bus) => (
                  <BusCard key={bus.id} bus={bus} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
