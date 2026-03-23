import React from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { FilterState, BusType } from '@/types';
import { cn } from '@/utils/helpers';

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  totalResults: number;
  isOpen?: boolean;
  onClose?: () => void;
}

const BUS_TYPES: BusType[] = ['AC Sleeper', 'Non-AC Sleeper', 'AC Seater', 'Non-AC Seater', 'AC Semi-Sleeper'];
const DEPARTURE_TIMES = [
  { label: '🌅 Before 6 AM', value: 'early' },
  { label: '☀️ 6 AM – 12 PM', value: 'morning' },
  { label: '🌤️ 12 PM – 6 PM', value: 'afternoon' },
  { label: '🌙 6 PM – 12 AM', value: 'evening' },
];
const AMENITIES = ['WiFi', 'Charging Point', 'Blanket', 'Live Tracking', 'Water Bottle'];

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters, onChange, totalResults, isOpen = true, onClose,
}) => {
  const toggleBusType = (type: BusType) => {
    const types = filters.busTypes.includes(type)
      ? filters.busTypes.filter((t) => t !== type)
      : [...filters.busTypes, type];
    onChange({ ...filters, busTypes: types });
  };

  const toggleDeparture = (val: string) => {
    const times = filters.departureTime.includes(val)
      ? filters.departureTime.filter((t) => t !== val)
      : [...filters.departureTime, val];
    onChange({ ...filters, departureTime: times });
  };

  const toggleAmenity = (a: string) => {
    const amenities = filters.amenities.includes(a)
      ? filters.amenities.filter((x) => x !== a)
      : [...filters.amenities, a];
    onChange({ ...filters, amenities });
  };

  const clearAll = () => {
    onChange({
      busTypes: [], priceRange: [0, 5000], departureTime: [],
      amenities: [], operators: [], sortBy: 'departure',
    });
  };

  const hasActiveFilters =
    filters.busTypes.length > 0 ||
    filters.departureTime.length > 0 ||
    filters.amenities.length > 0;

  return (
    <aside
      className={cn(
        'bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden',
        'lg:block',
        !isOpen && 'hidden'
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#d63031]" />
          <h3 className="font-bold text-[#1a1a2e] text-sm">Filters</h3>
          {hasActiveFilters && (
            <span className="w-5 h-5 bg-[#d63031] text-white text-xs rounded-full flex items-center justify-center">
              {filters.busTypes.length + filters.departureTime.length + filters.amenities.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button onClick={clearAll} className="text-xs text-[#d63031] font-medium hover:underline">
              Clear all
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-1 text-gray-500 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* ── Sort By ── */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Sort By</h4>
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#d63031]"
          >
            <option value="departure">Departure Time</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Rating</option>
            <option value="seats">Available Seats</option>
          </select>
        </div>

        {/* ── Price Range ── */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Price Range</h4>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>₹{filters.priceRange[0]}</span>
            <span>₹{filters.priceRange[1]}</span>
          </div>
          <input
            type="range"
            min={0}
            max={5000}
            step={50}
            value={filters.priceRange[1]}
            onChange={(e) => onChange({ ...filters, priceRange: [0, Number(e.target.value)] })}
            className="w-full accent-[#d63031]"
          />
        </div>

        {/* ── Bus Type ── */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Bus Type</h4>
          <div className="space-y-2">
            {BUS_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.busTypes.includes(type)}
                  onChange={() => toggleBusType(type)}
                  className="w-4 h-4 accent-[#d63031] rounded"
                />
                <span className="text-sm text-gray-700 group-hover:text-[#d63031] transition-colors">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ── Departure Time ── */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Departure Time</h4>
          <div className="space-y-2">
            {DEPARTURE_TIMES.map(({ label, value }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.departureTime.includes(value)}
                  onChange={() => toggleDeparture(value)}
                  className="w-4 h-4 accent-[#d63031] rounded"
                />
                <span className="text-sm text-gray-700 group-hover:text-[#d63031] transition-colors">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ── Amenities ── */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Amenities</h4>
          <div className="space-y-2">
            {AMENITIES.map((a) => (
              <label key={a} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.amenities.includes(a)}
                  onChange={() => toggleAmenity(a)}
                  className="w-4 h-4 accent-[#d63031] rounded"
                />
                <span className="text-sm text-gray-700 group-hover:text-[#d63031] transition-colors">{a}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;