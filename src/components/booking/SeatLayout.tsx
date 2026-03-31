import React, { useMemo } from 'react';
import { Seat, DeckType } from '@/types';
import { useBooking } from '@/context/BookingContext';
import { cn } from '@/utils/helpers';

interface SeatLayoutProps {
  seats: Seat[];
  deck: DeckType;
}

// Renders a single seat button
const SeatButton: React.FC<{ seat: Seat; onClick: () => void }> = ({ seat, onClick }) => {
  const isBooked = seat.status === 'booked';
  const isSelected = seat.status === 'selected';
  const isLadies = seat.status === 'ladies';

  const getSeatStyle = () => {
    if (isSelected) {
      return 'bg-[#d63031] border-[#d63031] text-white cursor-pointer shadow-md';
    }
    if (isBooked) {
      return 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed opacity-60';
    }
    if (isLadies) {
      return 'bg-pink-100 border-pink-400 text-pink-700 cursor-pointer hover:bg-pink-200';
    }
    return 'bg-green-100 border-green-400 text-green-700 cursor-pointer hover:bg-green-200';
  };

  return (
    <button
      onClick={!isBooked ? onClick : undefined}
      className={cn(
        'w-9 h-10 rounded-t-xl border-2 text-xs font-bold flex items-center justify-center',
        'transition-all duration-150',
        getSeatStyle()
      )}
      title={`Seat ${seat.seatNumber} – ${isBooked ? 'Booked' : `₹${seat.price}`}`}
    >
      {seat.seatNumber.replace(/[A-Z]/g, '')}
    </button>
  );
};

const SeatLayout: React.FC<SeatLayoutProps> = ({ seats, deck }) => {
  const { toggleSeat, selectedSeats } = useBooking();

  // Merge seats with selected state from context
  const selectedIds = useMemo(() => 
    new Set(selectedSeats.map(s => s.id)), 
    [selectedSeats]
  );

  const deckSeats = useMemo(() => {
    return seats.filter((s) => s.deck === deck).map(seat => {
      if (selectedIds.has(seat.id)) {
        return { ...seat, status: 'selected' as const };
      }
      return seat;
    });
  }, [seats, deck, selectedIds]);

  // Group by row
  const rows: Record<number, Seat[]> = {};
  deckSeats.forEach((seat) => {
    if (!rows[seat.position.row]) rows[seat.position.row] = [];
    rows[seat.position.row].push(seat);
  });

  const sortedRows = Object.entries(rows)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([row, s]) => ({ row: Number(row), seats: s.sort((a, b) => a.position.col - b.position.col) }));

  return (
    <div>
      {/* Deck Label */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          {deck === 'lower' ? ' Lower Deck' : ' Upper Deck (Sleeper)'}
        </h3>
        {deck === 'lower' && selectedSeats.length > 0 && (
          <span className="text-xs text-[#d63031] font-medium">
            {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected
          </span>
        )}
      </div>

      {/* Driver cabin indicator */}
      <div className="flex justify-end mb-2">
        <div className="bg-gray-200 rounded px-3 py-1 text-xs text-gray-500 font-medium"> Driver</div>
      </div>

      {/* Seat Grid — 2+2 layout with aisle */}
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
        {sortedRows.map(({ row, seats: rowSeats }) => (
          <div key={row} className="flex items-center gap-1 mb-2">
            <span className="w-5 text-xs text-gray-400 text-center">{row}</span>
            {/* Left 2 seats */}
            {rowSeats.filter((s) => s.position.col < 2).map((seat) => (
              <SeatButton key={seat.id} seat={seat} onClick={() => toggleSeat(seat)} />
            ))}
            <div className="w-5 flex-shrink-0" />
            {/* Right 2 seats */}
            {rowSeats.filter((s) => s.position.col >= 2).map((seat) => (
              <SeatButton key={seat.id} seat={seat} onClick={() => toggleSeat(seat)} />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3">
        {[
          { color: 'bg-green-100 border-green-400', label: 'Available' },
          { color: 'bg-pink-100 border-pink-400', label: 'Ladies Only' },
          { color: 'bg-[#d63031] border-[#d63031]', label: 'Selected' },
          { color: 'bg-gray-200 border-gray-300', label: 'Booked' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={cn('w-4 h-4 rounded border-2', color)} />
            <span className="text-xs text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatLayout;