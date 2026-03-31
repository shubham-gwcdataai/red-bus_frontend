import React, { useState, useCallback } from 'react';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';
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
  { label: '🌅 Before 6 AM', value: 'early', desc: '12:00 AM - 6:00 AM' },
  { label: '☀️ 6 AM – 12 PM', value: 'morning', desc: '6:00 AM - 12:00 PM' },
  { label: '🌤️ 12 PM – 6 PM', value: 'afternoon', desc: '12:00 PM - 6:00 PM' },
  { label: '🌙 6 PM – 12 AM', value: 'evening', desc: '6:00 PM - 12:00 AM' },
];
const AMENITIES = ['WiFi', 'Charging Point', 'Blanket', 'Live Tracking', 'Water Bottle'];

const MIN_PRICE = 0;
const MAX_PRICE = 5000;
const PRICE_STEP = 50;
const PRICE_PRESETS = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 - ₹1000', min: 500, max: 1000 },
  { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
  { label: '₹2000+', min: 2000, max: MAX_PRICE },
];

const DualRangeSlider: React.FC<{
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  onChange: (min: number, max: number) => void;
}> = ({ min, max, minValue, maxValue, onChange }) => {
  const [hovering, setHovering] = useState(false);

  const getPercent = (value: number) => ((value - min) / (max - min)) * 100;

  const minPercent = getPercent(minValue);
  const maxPercent = getPercent(maxValue);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxValue - PRICE_STEP);
    onChange(value, maxValue);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minValue + PRICE_STEP);
    onChange(minValue, value);
  };

  return (
    <div className="relative h-6 mt-2">
      {/* Track background */}
      <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 bg-gray-200 rounded-full" />
      
      {/* Active track */}
      <div
        className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-[#d63031] rounded-full"
        style={{
          left: `${minPercent}%`,
          width: `${maxPercent - minPercent}%`,
        }}
      />

      {/* Min slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={PRICE_STEP}
        value={minValue}
        onChange={handleMinChange}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#d63031] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
        style={{ zIndex: minValue > max - 100 ? 5 : 3 }}
      />

      {/* Max slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={PRICE_STEP}
        value={maxValue}
        onChange={handleMaxChange}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#d63031] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
        style={{ zIndex: 4 }}
      />
    </div>
  );
};

const PriceFilterSection: React.FC<{
  priceRange: [number, number];
  onChange: (range: [number, number]) => void;
}> = ({ priceRange, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasCustomRange = 
    priceRange[0] !== MIN_PRICE || priceRange[1] !== MAX_PRICE;

  const isPresetActive = (preset: typeof PRICE_PRESETS[0]) =>
    priceRange[0] === preset.min && priceRange[1] === preset.max;

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-3"
      >
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Price Range</h4>
        <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', isExpanded && 'rotate-180')} />
      </button>

      {isExpanded && (
        <>
          {/* Price display */}
          <div className="flex items-center justify-between text-sm mb-3">
            <div className="flex items-center gap-1">
              <span className="text-gray-500">₹</span>
              <input
                type="number"
                value={priceRange[0]}
                min={MIN_PRICE}
                max={priceRange[1] - PRICE_STEP}
                step={PRICE_STEP}
                onChange={(e) => {
                  const val = Math.max(MIN_PRICE, Math.min(Number(e.target.value), priceRange[1] - PRICE_STEP));
                  onChange([val, priceRange[1]]);
                }}
                className="w-20 px-2 py-1 text-sm font-medium border border-gray-200 rounded-lg text-center focus:outline-none focus:border-[#d63031]"
              />
            </div>
            <span className="text-gray-400">to</span>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">₹</span>
              <input
                type="number"
                value={priceRange[1]}
                min={priceRange[0] + PRICE_STEP}
                max={MAX_PRICE}
                step={PRICE_STEP}
                onChange={(e) => {
                  const val = Math.min(MAX_PRICE, Math.max(Number(e.target.value), priceRange[0] + PRICE_STEP));
                  onChange([priceRange[0], val]);
                }}
                className="w-20 px-2 py-1 text-sm font-medium border border-gray-200 rounded-lg text-center focus:outline-none focus:border-[#d63031]"
              />
            </div>
          </div>

          {/* Dual range slider */}
          <DualRangeSlider
            min={MIN_PRICE}
            max={MAX_PRICE}
            minValue={priceRange[0]}
            maxValue={priceRange[1]}
            onChange={(min, max) => onChange([min, max])}
          />

          {/* Quick presets */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {PRICE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => onChange([preset.min, preset.max])}
                className={cn(
                  'px-3 py-2 text-xs font-medium rounded-lg border transition-all',
                  isPresetActive(preset)
                    ? 'bg-[#d63031] text-white border-[#d63031]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#d63031] hover:text-[#d63031]'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Clear price filter */}
          {hasCustomRange && (
            <button
              onClick={() => onChange([MIN_PRICE, MAX_PRICE])}
              className="mt-3 text-xs text-[#d63031] font-medium hover:underline"
            >
              Clear price filter
            </button>
          )}
        </>
      )}
    </div>
  );
};

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
    filters.amenities.length > 0 ||
    filters.priceRange[0] !== 0 ||
    filters.priceRange[1] !== 5000;

  const activeFilterCount = 
    filters.busTypes.length +
    filters.departureTime.length +
    filters.amenities.length +
    (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 5000 ? 1 : 0);

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
              {activeFilterCount}
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

      <div className="p-4 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
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
        <div className="border-b border-gray-100 pb-5">
          <PriceFilterSection
            priceRange={filters.priceRange}
            onChange={(range) => onChange({ ...filters, priceRange: range })}
          />
        </div>

        {/* ── Bus Type ── */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Bus Type</h4>
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
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Departure Time</h4>
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
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Amenities</h4>
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

        {/* Results count */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            <span className="font-bold text-[#d63031]">{totalResults}</span> buses found
          </p>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;