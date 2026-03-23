import React from 'react';
import { formatPrice, formatDate } from '@/utils/helpers';
import { useBooking } from '@/context/BookingContext';
import { Tag, Clock, MapPin } from 'lucide-react';

const BookingSummary: React.FC = () => {
  const { selectedBus, selectedSeats, totalAmount, boardingPoint, droppingPoint } = useBooking();

  if (!selectedBus) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-[#1a1a2e] px-4 py-3">
        <h3 className="text-white font-bold text-sm">Booking Summary</h3>
      </div>

      <div className="p-4 space-y-3">
        {/* Bus Info */}
        <div>
          <p className="font-bold text-[#1a1a2e]">{selectedBus.name}</p>
          <p className="text-xs text-gray-500">{selectedBus.type}</p>
        </div>

        {/* Route */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-[#d63031] flex-shrink-0" />
          <span className="font-medium">{selectedBus.departureTime}</span>
          <span className="text-gray-400">→</span>
          <span className="font-medium">{selectedBus.arrivalTime}</span>
          <span className="text-xs text-gray-400">({selectedBus.duration})</span>
        </div>

        {/* Date */}
        <p className="text-xs text-gray-500">{formatDate(selectedBus.date)}</p>

        {/* Selected Seats */}
        {selectedSeats.length > 0 && (
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Selected Seats</p>
            <div className="flex flex-wrap gap-1.5">
              {selectedSeats.map((seat) => (
                <span
                  key={seat.id}
                  className="bg-red-50 text-[#d63031] text-xs font-bold px-2 py-0.5 rounded-lg border border-red-100"
                >
                  {seat.seatNumber}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Boarding/Dropping */}
        {boardingPoint && (
          <div className="border-t border-gray-100 pt-3 space-y-1.5">
            <div className="flex items-start gap-2 text-xs">
              <MapPin className="w-3.5 h-3.5 text-[#d63031] mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-gray-500">Boarding: </span>
                <span className="font-medium text-gray-700">{boardingPoint.name}</span>
                <span className="text-gray-400 ml-1">({boardingPoint.time})</span>
              </div>
            </div>
          </div>
        )}
        {droppingPoint && (
          <div className="flex items-start gap-2 text-xs">
            <MapPin className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-gray-500">Dropping: </span>
              <span className="font-medium text-gray-700">{droppingPoint.name}</span>
              <span className="text-gray-400 ml-1">({droppingPoint.time})</span>
            </div>
          </div>
        )}

        {/* Total */}
        {selectedSeats.length > 0 && (
          <div className="border-t border-gray-100 pt-3 mt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{selectedSeats.length} seat(s)</span>
              <span className="text-xs text-gray-500">
                {selectedSeats.length} × {formatPrice(selectedBus.price)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="font-bold text-[#1a1a2e]">Total</span>
              <span className="font-black text-xl text-[#d63031]">{formatPrice(totalAmount)}</span>
            </div>
            <p className="text-xs text-gray-400 text-right mt-0.5">Inclusive of all taxes</p>
          </div>
        )}

        {selectedSeats.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-3">
            Select seats to see total amount
          </p>
        )}
      </div>
    </div>
  );
};

export default BookingSummary;