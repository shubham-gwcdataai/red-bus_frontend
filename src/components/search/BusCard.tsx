import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star, ChevronDown, ChevronUp, MapPin, Shield,
  Wifi, Zap, Wind, Coffee, Navigation
} from 'lucide-react';
import { Bus } from '@/types';
import { formatPrice, calcDiscount } from '@/utils/helpers';
import { useBooking } from '@/context/BookingContext';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/helpers';

const BUS_TYPE_COLORS: Record<string, 'blue' | 'green' | 'gray' | 'orange'> = {
  'AC Sleeper':     'blue',
  'Non-AC Sleeper': 'gray',
  'AC Seater':      'green',
  'Non-AC Seater':  'gray',
  'AC Semi-Sleeper':'orange',
};

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'WiFi':           <Wifi className="w-3.5 h-3.5" />,
  'Charging Point': <Zap className="w-3.5 h-3.5" />,
  'Blanket':        <span className="text-xs">🛋️</span>,
  'Water Bottle':   <span className="text-xs">💧</span>,
  'Live Tracking':  <Navigation className="w-3.5 h-3.5" />,
  'Snacks':         <Coffee className="w-3.5 h-3.5" />,
  'AC':             <Wind className="w-3.5 h-3.5" />,
};

interface BusCardProps {
  bus: Bus;
}

const BusCard: React.FC<BusCardProps> = ({ bus }) => {
  const navigate = useNavigate();
  const { setSelectedBus, setSearchParams, searchParams } = useBooking();
  const [showDetails, setShowDetails] = useState(false);

  const discount = bus.originalPrice ? calcDiscount(bus.originalPrice, bus.price) : null;
  const typeColor = BUS_TYPE_COLORS[bus.type] || 'gray';

  const handleSelectSeat = () => {
    setSelectedBus(bus);
    navigate(`/seat-selection/${bus.id}`);
  };

  const isLowSeats = bus.availableSeats <= 5;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* ── Main Info Row ── */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">

          {/* Operator Name & Type */}
          <div className="sm:w-48 flex-shrink-0">
            <p className="font-bold text-[#1a1a2e] text-base">{bus.name}</p>
            <Badge variant={typeColor} className="mt-1">{bus.type}</Badge>
            <div className="flex items-center gap-1 mt-2">
              <div className="flex items-center gap-0.5 bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                <Star className="w-3 h-3 fill-white" />
                {bus.rating}
              </div>
              <span className="text-xs text-gray-400">({bus.reviewCount.toLocaleString()})</span>
            </div>
          </div>

          {/* Times */}
          <div className="flex items-center gap-3 flex-1">
            <div className="text-center">
              <p className="text-xl font-bold text-[#1a1a2e]">{bus.departureTime}</p>
              <p className="text-xs text-gray-500 mt-0.5">{bus.source}</p>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <p className="text-xs text-gray-400">{bus.duration}</p>
              <div className="relative w-full flex items-center">
                <div className="w-2 h-2 rounded-full border-2 border-[#d63031] bg-white flex-shrink-0" />
                <div className="flex-1 h-0.5 bg-gradient-to-r from-[#d63031] to-orange-400" />
                <div className="w-2 h-2 rounded-full bg-[#d63031] flex-shrink-0" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-[#1a1a2e]">{bus.arrivalTime}</p>
              <p className="text-xs text-gray-500 mt-0.5">{bus.destination}</p>
            </div>
          </div>

          {/* Amenities (desktop) */}
          <div className="hidden lg:flex items-center gap-2 flex-wrap max-w-32">
            {bus.amenities.slice(0, 4).map((a) => (
              <div
                key={a}
                className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg"
                title={a}
              >
                {AMENITY_ICONS[a] || <span>•</span>}
              </div>
            ))}
          </div>

          {/* Price & Book */}
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:min-w-36">
            <div className="text-right">
              {discount && (
                <div className="flex items-center gap-1.5">
                  <p className="text-xs text-gray-400 line-through">{formatPrice(bus.originalPrice!)}</p>
                  <Badge variant="green" size="sm">{discount}% off</Badge>
                </div>
              )}
              <p className="text-2xl font-black text-[#d63031]">{formatPrice(bus.price)}</p>
              <p
                className={cn(
                  'text-xs mt-0.5 font-medium',
                  isLowSeats ? 'text-orange-500' : 'text-gray-500'
                )}
              >
                {isLowSeats ? `🔥 Only ${bus.availableSeats} seats left!` : `${bus.availableSeats} seats available`}
              </p>
            </div>
            <Button size="md" onClick={handleSelectSeat} className="whitespace-nowrap">
              Select Seats
            </Button>
          </div>
        </div>

        {/* ── Amenities (mobile) ── */}
        <div className="flex lg:hidden items-center gap-2 mt-3 flex-wrap">
          {bus.amenities.slice(0, 5).map((a) => (
            <div
              key={a}
              className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg"
            >
              {AMENITY_ICONS[a] || <span>•</span>}
              <span>{a}</span>
            </div>
          ))}
        </div>

        {/* ── Toggle Details ── */}
        <button
          className="mt-3 flex items-center gap-1 text-xs text-[#d63031] font-medium hover:underline"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? <><ChevronUp className="w-3.5 h-3.5" /> Hide Details</> : <><ChevronDown className="w-3.5 h-3.5" /> View Details</>}
        </button>
      </div>

      {/* ── Expanded Details ── */}
      {showDetails && (
        <div className="border-t border-gray-100 px-4 sm:px-5 py-4 bg-gray-50 rounded-b-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Boarding Points */}
            <div>
              <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#d63031]" /> Boarding Points
              </h4>
              {bus.boardingPoints.map((bp) => (
                <div key={bp.id} className="flex items-start gap-2 mb-2">
                  <span className="text-sm font-semibold text-[#1a1a2e] w-12 flex-shrink-0">{bp.time}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{bp.name}</p>
                    <p className="text-xs text-gray-400">{bp.address}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Dropping Points */}
            <div>
              <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-green-500" /> Dropping Points
              </h4>
              {bus.droppingPoints.map((dp) => (
                <div key={dp.id} className="flex items-start gap-2 mb-2">
                  <span className="text-sm font-semibold text-[#1a1a2e] w-12 flex-shrink-0">{dp.time}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{dp.name}</p>
                    <p className="text-xs text-gray-400">{dp.address}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Cancellation Policy */}
            <div>
              <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-green-500" /> Policies
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">{bus.policies.cancellation}</p>
              <p className="text-xs text-gray-500 mt-1">{bus.policies.refund}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusCard;