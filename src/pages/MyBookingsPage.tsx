import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, User, Download,
  XCircle, Bus, ChevronDown,
} from 'lucide-react';
import { Booking } from '@/types';
import { bookingAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, formatDate, getTodayISO } from '@/utils/helpers';
import Button   from '@/components/ui/Button';
import Badge    from '@/components/ui/Badge';
import Spinner  from '@/components/ui/Spinner';
import toast    from 'react-hot-toast';

const MyBookingsPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [bookings,     setBookings]     = useState<Booking[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [activeTab,    setActiveTab]    = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [expandedId,   setExpandedId]   = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/my-bookings' } });
      return;
    }
    setIsLoading(true);
    bookingAPI
      .getMyBookings()
      .then(setBookings)
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(bookingId);
    try {
      const res = await bookingAPI.cancel(bookingId);
      setBookings((prev) =>
        prev.map((b) => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
      );
      toast.success(res.message);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cancellation failed';
      toast.error(msg);
    } finally {
      setCancellingId(null);
    }
  };

  const todayISO = getTodayISO();

  // ✅ FIX: Robust date comparison
  // If bus.date is empty/wrong, treat confirmed bookings as upcoming by default
  const getBusDate = (booking: Booking): string => {
    const d = booking.bus?.date;
    // Validate it looks like a date
    if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    return todayISO; // fallback — treat as today so it shows in upcoming
  };

  // ✅ FIX: Correct tab categorization
  const categorised = {
    upcoming:  bookings.filter((b) =>
      b.status === 'confirmed' && getBusDate(b) >= todayISO
    ),
    past:      bookings.filter((b) =>
      b.status === 'confirmed' && getBusDate(b) < todayISO
    ),
    cancelled: bookings.filter((b) => b.status === 'cancelled'),
  };

  const displayedBookings = categorised[activeTab];

  return (
    <div className="min-h-screen bg-[#f5f7fa] page-enter">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-2xl font-black text-[#1a1a2e]">My Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name}!</p>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 flex-wrap">
            {(['upcoming', 'past', 'cancelled'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-[#d63031] text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {tab} ({categorised[tab].length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : displayedBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-2xl border border-gray-100">
            <Bus className="w-16 h-16 text-gray-200" />
            <h3 className="text-lg font-bold text-[#1a1a2e]">
              No {activeTab} bookings
            </h3>
            <p className="text-gray-500 text-sm">
              {activeTab === 'upcoming'  ? 'Book your next trip to see it here' :
               activeTab === 'past'      ? 'Your completed trips will appear here' :
               'Cancelled bookings will appear here'}
            </p>
            {activeTab === 'upcoming' && (
              <Button onClick={() => navigate('/')}>Search Buses</Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Top bar */}
                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-gray-500">
                      PNR: <span className="font-bold text-[#1a1a2e]">{booking.pnr}</span>
                    </p>
                    <Badge
                      variant={booking.status === 'confirmed' ? 'green' : 'red'}
                      size="sm"
                    >
                      {booking.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400">
                    Booked: {formatDate(booking.bookingDate)}
                  </p>
                </div>

                {/* Main row */}
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center">

                    {/* Bus name */}
                    <div className="sm:w-44 flex-shrink-0">
                      <p className="font-bold text-[#1a1a2e]">{booking.bus.name}</p>
                      <p className="text-xs text-gray-500">{booking.bus.type}</p>
                    </div>

                    {/* Journey */}
                    <div className="flex items-center gap-3 flex-1">
                      <div>
                        <p className="text-lg font-black text-[#1a1a2e]">
                          {booking.bus.departureTime}
                        </p>
                        <p className="text-xs text-gray-500">{booking.bus.source}</p>
                      </div>
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-[#d63031] to-orange-400 mx-2" />
                      <div>
                        <p className="text-lg font-black text-[#1a1a2e]">
                          {booking.bus.arrivalTime}
                        </p>
                        <p className="text-xs text-gray-500">{booking.bus.destination}</p>
                      </div>
                    </div>

                    {/* Date & amount */}
                    <div className="sm:text-right">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 sm:justify-end">
                        <Calendar className="w-3.5 h-3.5" />
                        {/* ✅ FIX: Show travel date, fallback to booking date */}
                        {booking.bus.date
                          ? formatDate(booking.bus.date)
                          : formatDate(booking.bookingDate)}
                      </div>
                      <p className="text-xl font-black text-[#d63031] mt-1">
                        {formatPrice(booking.totalAmount)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {booking.selectedSeats.length} seat(s)
                      </p>
                    </div>
                  </div>

                  {/* Seat tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {booking.selectedSeats.map((seat) => (
                      <span
                        key={seat}
                        className="bg-red-50 text-[#d63031] text-xs font-bold px-2 py-0.5 rounded-lg border border-red-100"
                      >
                        {seat}
                      </span>
                    ))}
                  </div>

                  {/* Actions row */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === booking.id ? null : booking.id)
                      }
                      className="flex items-center gap-1 text-xs text-[#d63031] font-medium hover:underline"
                    >
                      {expandedId === booking.id ? 'Hide' : 'View'} Details
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          expandedId === booking.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Download className="w-3.5 h-3.5" />}
                        onClick={() => toast.success('Ticket downloaded!')}
                      >
                        Download
                      </Button>

                      {/* ✅ FIX: Show cancel for ALL confirmed bookings
                          Backend will validate if cancellation is allowed */}
                      {booking.status === 'confirmed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          isLoading={cancellingId === booking.id}
                          leftIcon={<XCircle className="w-3.5 h-3.5" />}
                          onClick={() => handleCancel(booking.id)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedId === booking.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-bold text-gray-500 text-xs uppercase mb-2">
                          Passengers
                        </p>
                        {booking.passengers.map((p, i) => (
                          <div key={i} className="flex items-center gap-2 mb-1.5">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-gray-700">
                              {p.name} · {p.age}y · {p.gender}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="font-bold text-gray-500 text-xs uppercase mb-2">
                          Journey Points
                        </p>
                        <div className="flex items-start gap-2 mb-2">
                          <MapPin className="w-3.5 h-3.5 text-[#d63031] mt-0.5" />
                          <div>
                            <p className="text-gray-700 font-medium">
                              {booking.boardingPoint?.name || '—'}
                            </p>
                            <p className="text-xs text-gray-400">
                              Boarding · {booking.boardingPoint?.time || ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-green-500 mt-0.5" />
                          <div>
                            <p className="text-gray-700 font-medium">
                              {booking.droppingPoint?.name || '—'}
                            </p>
                            <p className="text-xs text-gray-400">
                              Dropping · {booking.droppingPoint?.time || ''}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-gray-500 text-xs uppercase mb-2">
                          Contact
                        </p>
                        <p className="text-gray-700 text-xs">{booking.contactEmail}</p>
                        <p className="text-gray-700 text-xs mt-1">{booking.contactPhone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;