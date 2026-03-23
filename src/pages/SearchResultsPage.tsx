import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, SlidersHorizontal,
  ChevronLeft, ChevronRight, Calendar, Clock,
} from 'lucide-react';
import { Bus, FilterState } from '@/types';
import { busAPI } from '@/services/api';
import { useBooking } from '@/context/BookingContext';
import {
  formatDisplayDate, getTodayISO, parseTimeToMinutes,
} from '@/utils/helpers';
import BusCard       from '@/components/search/BusCard';
import FilterSidebar from '@/components/search/FilterSidebar';
import SearchForm    from '@/components/search/SearchForm';
import Spinner       from '@/components/ui/Spinner';
import { addDays, format, parseISO } from 'date-fns';

const defaultFilters: FilterState = {
  busTypes:      [],
  priceRange:    [0, 5000],
  departureTime: [],
  amenities:     [],
  operators:     [],
  sortBy:        'departure',
};

const buildApiParams = (filters: FilterState) => {
  const params: Record<string, string | number | undefined> = {};
  if (filters.busTypes.length > 0)     params.busTypes      = filters.busTypes.join(',');
  if (filters.priceRange[0] > 0)       params.minPrice      = filters.priceRange[0];
  if (filters.priceRange[1] < 5000)    params.maxPrice      = filters.priceRange[1];
  if (filters.departureTime.length > 0) params.departureTime = filters.departureTime.join(',');
  if (filters.amenities.length > 0)    params.amenities     = filters.amenities.join(',');
  if (filters.sortBy !== 'departure')  params.sortBy        = filters.sortBy;
  return params;
};

const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSearchParams: setBookingSearch } = useBooking();

  const from = searchParams.get('from') || '';
  const to   = searchParams.get('to')   || '';
  const date = searchParams.get('date') || '';

  const [buses,        setBuses]        = useState<Bus[]>([]);
  const [totalCount,   setTotalCount]   = useState(0);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [filters,      setFilters]      = useState<FilterState>(defaultFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const todayISO   = getTodayISO();
  const isPastDate = date < todayISO;

  // ✅ FIX 1: Track last fetched key to prevent duplicate calls
  const lastFetchKey   = useRef('');
  // ✅ FIX 2: Track if this is the initial mount to skip filter useEffect
  const isInitialMount = useRef(true);

  // ── Core fetch function ───────────────────────────────────────
  const fetchBuses = useCallback(async (currentFilters: FilterState) => {
    if (!from || !to || !date) { navigate('/'); return; }
    if (isPastDate) { setIsLoading(false); return; }

    setError(null);
    setIsLoading(true);

    try {
      const results = await busAPI.search({
        source:      from,
        destination: to,
        date,
        ...buildApiParams(currentFilters),
      });
      setBuses(results);
      setTotalCount(results.length);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch buses';
      setError(msg);
      setBuses([]);
    } finally {
      setIsLoading(false);
    }
  }, [from, to, date, navigate, isPastDate]);

  // ✅ FIX 3: Single useEffect for route/date change
  // Resets filters + fetches fresh results
  useEffect(() => {
    if (!from || !to || !date) return;

    // Build unique key for this route+date combination
    const routeKey = `${from}|${to}|${date}`;

    // Skip if same route+date already fetched
    if (lastFetchKey.current === routeKey) return;
    lastFetchKey.current = routeKey;

    // Update booking context
    setBookingSearch({ source: from, destination: to, date });

    // Reset filters on new route search
    const resetFilters = defaultFilters;
    setFilters(resetFilters);
    isInitialMount.current = true; // mark so filter effect skips this cycle

    // Fetch with default filters
    fetchBuses(resetFilters);
  }, [from, to, date]); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ FIX 4: Separate useEffect for filter changes only
  // Skips on initial mount (already handled above)
  useEffect(() => {
    // Skip the very first render — route useEffect already fetched
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only re-fetch if we have valid route params
    if (!from || !to || !date || isPastDate) return;

    // Update key to allow filter-based re-fetch
    lastFetchKey.current = `${from}|${to}|${date}|${JSON.stringify(filters)}`;

    fetchBuses(filters);
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const changeDate = (direction: -1 | 1) => {
    const newDate = format(addDays(parseISO(date), direction), 'yyyy-MM-dd');
    if (direction === -1 && newDate < todayISO) return;
    setSearchParams({ from, to, date: newDate });
  };

  const isToday_ = date === todayISO;

  const activeFilterCount = useMemo(() =>
    filters.busTypes.length +
    filters.departureTime.length +
    filters.amenities.length +
    (filters.priceRange[1] < 5000 ? 1 : 0),
  [filters]);

  // Time-aware: filter out departed buses for today
  const nowMinutes = useMemo(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }, []);

  const displayedBuses = useMemo(() => {
    if (!isToday_) return buses;
    return buses.filter(b => parseTimeToMinutes(b.departureTime) > nowMinutes);
  }, [buses, isToday_, nowMinutes]);

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
                Showing buses after {format(new Date(), 'HH:mm')}
              </div>
            )}
          </div>

          {/* Date navigation */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => changeDate(-1)}
              disabled={date <= todayISO}
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

          {/* Compact search */}
          <SearchForm
            variant="compact"
            initialSource={from}
            initialDestination={to}
            initialDate={date}
          />
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">

          {/* Filter sidebar */}
          <div className="w-64 flex-shrink-0 hidden lg:block">
            <FilterSidebar
              filters={filters}
              onChange={handleFilterChange}
              totalResults={displayedBuses.length}
            />
          </div>

          {/* Bus list */}
          <div className="flex-1 min-w-0">

            {/* Result count + filter toggle */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" /> Searching...
                  </span>
                ) : (
                  <>
                    <span className="font-bold text-[#1a1a2e]">{displayedBuses.length}</span>
                    {' '}buses found
                    {activeFilterCount > 0 && (
                      <span className="ml-2 text-xs bg-[#d63031] text-white px-2 py-0.5 rounded-full">
                        {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied
                      </span>
                    )}
                  </>
                )}
              </p>

              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => handleFilterChange(defaultFilters)}
                    className="text-xs text-[#d63031] font-medium hover:underline"
                  >
                    Clear filters
                  </button>
                )}
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="lg:hidden flex items-center gap-1.5 text-sm text-[#d63031] font-medium border border-[#d63031] px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-[#d63031] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile filter */}
            {isFilterOpen && (
              <div className="lg:hidden mb-4">
                <FilterSidebar
                  filters={filters}
                  onChange={handleFilterChange}
                  totalResults={displayedBuses.length}
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
                <p className="text-gray-500 text-sm">Please select today or a future date.</p>
                <button
                  onClick={() => setSearchParams({ from, to, date: todayISO })}
                  className="text-sm text-white bg-[#d63031] px-4 py-2 rounded-lg font-semibold"
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
                  onClick={() => fetchBuses(filters)}
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
                <p className="text-gray-500">
                  {activeFilterCount > 0 ? 'Applying filters...' : 'Searching for buses...'}
                </p>
              </div>
            )}

            {/* No results */}
            {!isLoading && !error && !isPastDate && displayedBuses.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-2xl border border-gray-100">
                <span className="text-6xl">🚌</span>
                <h3 className="text-lg font-bold text-[#1a1a2e]">No buses found</h3>
                <p className="text-gray-500 text-sm text-center max-w-sm">
                  {activeFilterCount > 0
                    ? 'No buses match your filters. Try adjusting them.'
                    : isToday_
                    ? 'All buses for today have departed. Try tomorrow!'
                    : `No buses from ${from} to ${to} on ${formatDisplayDate(date)}.`}
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => handleFilterChange(defaultFilters)}
                    className="text-sm font-semibold text-white bg-[#d63031] px-5 py-2 rounded-lg"
                  >
                    Clear All Filters
                  </button>
                )}
                {isToday_ && activeFilterCount === 0 && (
                  <button
                    onClick={() => setSearchParams({ from, to, date: format(addDays(new Date(), 1), 'yyyy-MM-dd') })}
                    className="text-sm font-semibold text-white bg-[#d63031] px-5 py-2 rounded-lg"
                  >
                    Search Tomorrow
                  </button>
                )}
              </div>
            )}

            {/* Bus cards */}
            {!isLoading && !error && displayedBuses.length > 0 && (
              <div className="space-y-3">
                {displayedBuses.map((bus) => (
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