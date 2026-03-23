import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, Download, Clock, MapPin, User,
  Phone, Mail, Bus, CreditCard, Lock, AlertCircle, Loader,
} from 'lucide-react';
import { Booking } from '@/types';
import { paymentAPI, bookingAPI } from '@/services/api';
import { useBooking } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, formatDate } from '@/utils/helpers';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface ContactForm {
  email: string;
  phone: string;
}

// ── Mock Razorpay inline payment widget ──────────────────────────
interface MockPaymentProps {
  amount:    number;
  onSuccess: () => void;
  onFailure: () => void;
  isLoading: boolean;
}

const MockPaymentWidget: React.FC<MockPaymentProps> = ({
  amount, onSuccess, onFailure, isLoading,
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry,     setExpiry]     = useState('');
  const [cvv,        setCvv]        = useState('');
  const [cardError,  setCardError]  = useState('');

  const handlePay = () => {
    setCardError('');
    // Basic validation
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      setCardError('Enter a valid 16-digit card number');
      return;
    }
    if (!expiry.match(/^\d{2}\/\d{2}$/)) {
      setCardError('Enter expiry as MM/YY');
      return;
    }
    if (cvv.length < 3) {
      setCardError('Enter a valid CVV');
      return;
    }

    // Simulate: card ending in 0000 fails, everything else succeeds
    if (cardNumber.replace(/\s/g, '').endsWith('0000')) {
      toast.error('Payment declined by bank. Try another card.');
      onFailure();
      return;
    }

    onSuccess();
  };

  const formatCard = (val: string) =>
    val.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);

  const formatExpiry = (val: string) => {
    const d = val.replace(/\D/g, '');
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2, 4)}` : d;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#d63031]/10 rounded-lg flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-[#d63031]" />
          </div>
          <h3 className="font-bold text-[#1a1a2e]">Secure Payment</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Lock className="w-3.5 h-3.5 text-green-600" />
          <span>256-bit SSL encrypted</span>
        </div>
      </div>

      {/* Demo notice */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
        <p className="text-xs text-blue-700 font-medium">
          🧪 Demo Mode — Use any 16-digit card. Card ending in <strong>0000</strong> simulates failure.
        </p>
      </div>

      {/* Amount */}
      <div className="flex items-center justify-between mb-5 p-4 bg-gray-50 rounded-xl">
        <div>
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="text-2xl font-black text-[#d63031]">{formatPrice(amount)}</p>
          <p className="text-xs text-gray-400">Inclusive of all taxes</p>
        </div>
        <div className="flex gap-2">
          {/* Card logos (decorative) */}
          {['💳', '🏦'].map((icon, i) => (
            <div key={i} className="w-10 h-7 bg-white rounded border border-gray-200 flex items-center justify-center text-base">
              {icon}
            </div>
          ))}
        </div>
      </div>

      {/* Card form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Card Number</label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCard(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d63031]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Expiry</label>
            <input
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM/YY"
              maxLength={5}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d63031]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] mb-1">CVV</label>
            <input
              type="password"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="•••"
              maxLength={4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d63031]"
            />
          </div>
        </div>

        {cardError && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {cardError}
          </div>
        )}

        <Button
          type="button"
          fullWidth
          size="lg"
          isLoading={isLoading}
          onClick={handlePay}
          leftIcon={isLoading ? undefined : <Lock className="w-4 h-4" />}
        >
          {isLoading ? 'Processing Payment...' : `Pay ${formatPrice(amount)} Securely`}
        </Button>
      </div>
    </div>
  );
};

// ── Main Booking Confirmation Page ────────────────────────────────
const BookingConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const {
    selectedBus, selectedSeats, passengers,
    boardingPoint, droppingPoint, totalAmount,
    setContact, clearBooking,
  } = useBooking();

  const [booking,    setBooking]    = useState<Booking | null>(null);
  const [isLoading,  setIsLoading]  = useState(false);
  const [step,       setStep]       = useState<'contact' | 'payment' | 'confirmed'>('contact');
  const [contactData, setContactData] = useState({ email: '', phone: '' });

  const { register, handleSubmit, formState: { errors } } = useForm<ContactForm>({
    defaultValues: { email: user?.email || '', phone: user?.phone || '' },
  });

  // Step 1: Collect contact details
  const onContactSubmit = (data: ContactForm) => {
    setContactData(data);
    setContact(data.email, data.phone);
    setStep('payment');
  };

  // Step 2: Payment success callback
  const handlePaymentSuccess = async () => {
    if (!selectedBus || selectedSeats.length === 0 || !boardingPoint || !droppingPoint) {
      toast.error('Missing booking details. Please start over.');
      navigate('/');
      return;
    }

    setIsLoading(true);

    try {
      // Use mock-pay endpoint (in production, use verify-and-book with real Razorpay signatures)
      const result = await paymentAPI.mockPay({
        busId:           selectedBus.id,
        selectedSeats:   selectedSeats.map((s) => s.seatNumber),
        passengers,
        boardingPointId: boardingPoint.id,
        droppingPointId: droppingPoint.id,
        contactEmail:    contactData.email,
        contactPhone:    contactData.phone,
        totalAmount,
      });

      setBooking(result);
      setStep('confirmed');
      toast.success('Booking confirmed! Your ticket is ready 🎉');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Booking failed';
      toast.error(msg);
      // Stay on payment step so user can retry
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentFailure = () => {
    // Stay on payment step, user can try again
    setIsLoading(false);
  };

  if (!selectedBus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No booking in progress.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] page-enter">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Step indicator ── */}
        {step !== 'confirmed' && (
          <div className="flex items-center gap-2 mb-6">
            {[
              { id: 'contact', label: 'Contact' },
              { id: 'payment', label: 'Payment' },
            ].map(({ id, label }, idx) => (
              <React.Fragment key={id}>
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === id ? 'bg-[#d63031] text-white' :
                    (step === 'payment' && id === 'contact') ? 'bg-green-500 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>{idx + 1}</div>
                  <span className={`text-xs font-medium ${step === id ? 'text-[#d63031]' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </div>
                {idx < 1 && (
                  <div className={`flex-1 h-0.5 ${step === 'payment' ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* ── STEP 1: Contact Details ── */}
        {step === 'contact' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-[#1a1a2e] rounded-t-2xl px-6 py-4">
              <h1 className="text-white font-bold text-lg">Review Your Booking</h1>
            </div>

            <div className="p-6 space-y-5">
              {/* Bus info */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Bus className="w-5 h-5 text-[#d63031]" />
                </div>
                <div>
                  <p className="font-bold text-[#1a1a2e]">{selectedBus.name}</p>
                  <p className="text-sm text-gray-500">{selectedBus.type}</p>
                  <p className="text-sm font-medium text-gray-700 mt-1">
                    {selectedBus.source} → {selectedBus.destination}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(selectedBus.date)} · {selectedBus.departureTime} – {selectedBus.arrivalTime}
                  </p>
                </div>
              </div>

              {/* Passengers */}
              <div>
                <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wide mb-3">Passengers</h3>
                {passengers.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1a1a2e]">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.age} yrs · {p.gender} · Seat {p.seatNumber}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Boarding/Dropping */}
              <div className="grid grid-cols-2 gap-4">
                {boardingPoint && (
                  <div className="p-3 bg-red-50 rounded-xl">
                    <p className="text-xs font-bold text-[#d63031] mb-1">📍 BOARDING</p>
                    <p className="text-sm font-semibold text-[#1a1a2e]">{boardingPoint.name}</p>
                    <p className="text-xs text-gray-500">{boardingPoint.time}</p>
                  </div>
                )}
                {droppingPoint && (
                  <div className="p-3 bg-green-50 rounded-xl">
                    <p className="text-xs font-bold text-green-600 mb-1">📍 DROPPING</p>
                    <p className="text-sm font-semibold text-[#1a1a2e]">{droppingPoint.name}</p>
                    <p className="text-xs text-gray-500">{droppingPoint.time}</p>
                  </div>
                )}
              </div>

              {/* Contact form */}
              <form onSubmit={handleSubmit(onContactSubmit)} className="space-y-4">
                <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wide">
                  Contact Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#1a1a2e] mb-1 block">Email</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d63031]"
                      {...register('email', { required: 'Email is required' })}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#1a1a2e] mb-1 block">Phone</label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile"
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d63031]"
                      {...register('phone', {
                        required: 'Phone is required',
                        pattern:  { value: /^[0-9]{10}$/, message: 'Enter 10-digit number' },
                      })}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{selectedSeats.length} seat(s)</p>
                    <p className="text-2xl font-black text-[#d63031]">{formatPrice(totalAmount)}</p>
                  </div>
                  <Button type="submit" size="lg">
                    Proceed to Payment →
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── STEP 2: Payment ── */}
        {step === 'payment' && (
          <div className="space-y-4">
            {/* Booking summary mini */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
              <div>
                <p className="font-bold text-[#1a1a2e]">{selectedBus.name}</p>
                <p className="text-sm text-gray-500">
                  {selectedBus.source} → {selectedBus.destination} ·{' '}
                  {selectedSeats.length} seat(s) · {formatDate(selectedBus.date)}
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xl font-black text-[#d63031]">{formatPrice(totalAmount)}</p>
              </div>
            </div>

            <MockPaymentWidget
              amount={totalAmount}
              onSuccess={handlePaymentSuccess}
              onFailure={handlePaymentFailure}
              isLoading={isLoading}
            />

            <button
              onClick={() => setStep('contact')}
              className="w-full text-center text-sm text-gray-500 hover:text-[#d63031] transition-colors py-2"
            >
              ← Back to contact details
            </button>
          </div>
        )}

        {/* ── STEP 3: Confirmed ── */}
        {step === 'confirmed' && booking && (
          <div className="space-y-4">
            {/* Success banner */}
            <div className="bg-green-500 rounded-2xl p-6 text-center text-white">
              <CheckCircle className="w-14 h-14 mx-auto mb-3 fill-white text-green-500" />
              <h1 className="text-2xl font-black">Booking Confirmed! 🎉</h1>
              <p className="text-green-100 mt-1">
                Your ticket has been booked and payment received.
              </p>
            </div>

            {/* Ticket card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-[#1a1a2e] px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">PNR Number</p>
                  <p className="text-white font-black text-2xl tracking-wider">{booking.pnr}</p>
                </div>
                <Badge variant="green" size="md">✓ Confirmed</Badge>
              </div>

              <div className="p-6 space-y-4">
                {/* Journey timeline */}
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-black text-[#1a1a2e]">{booking.bus.departureTime}</p>
                    <p className="text-sm text-gray-500">{booking.bus.source}</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <p className="text-xs text-gray-400">{booking.bus.duration}</p>
                    <div className="w-full h-0.5 bg-gradient-to-r from-[#d63031] to-orange-400 my-1" />
                    <p className="text-xs text-gray-400">🚌 {booking.bus.name}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-[#1a1a2e]">{booking.bus.arrivalTime}</p>
                    <p className="text-sm text-gray-500">{booking.bus.destination}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-500 text-center">
                  {formatDate(booking.bus.date, 'EEEE, dd MMMM yyyy')}
                </p>

                {/* Passengers */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Passengers & Seats
                  </p>
                  {booking.passengers.map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-[#1a1a2e]">
                          {p.name} ({p.age}, {p.gender})
                        </span>
                      </div>
                      <span className="text-sm font-bold text-[#d63031] bg-red-50 px-2 py-0.5 rounded-lg">
                        {p.seatNumber}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Boarding/Dropping */}
                <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-xs text-gray-500">Boarding</p>
                    <p className="text-sm font-semibold text-[#1a1a2e]">{booking.boardingPoint.name}</p>
                    <p className="text-xs text-gray-400">{booking.boardingPoint.time}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Dropping</p>
                    <p className="text-sm font-semibold text-[#1a1a2e]">{booking.droppingPoint.name}</p>
                    <p className="text-xs text-gray-400">{booking.droppingPoint.time}</p>
                  </div>
                </div>

                {/* Contact + amount */}
                <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />{booking.contactEmail}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />{booking.contactPhone}
                    </span>
                  </div>
                  <p className="text-lg font-black text-[#d63031]">
                    {formatPrice(booking.totalAmount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                fullWidth
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() => toast.success('Ticket downloaded!')}
              >
                Download Ticket
              </Button>
              <Button
                size="lg"
                fullWidth
                onClick={() => { clearBooking(); navigate('/my-bookings'); }}
              >
                View My Bookings
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
