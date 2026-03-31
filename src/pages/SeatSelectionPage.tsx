import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Users, Pencil } from 'lucide-react';
import { busAPI } from '@/services/api';
import { useBooking } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import { Passenger } from '@/types';
import SeatLayout from '@/components/booking/SeatLayout';
import BookingSummary from '@/components/booking/BookingSummary';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Input from '@/components/ui/Input';
import { formatPrice } from '@/utils/helpers';
import toast from 'react-hot-toast';

const SeatSelectionPage: React.FC = () => {
  const { busId } = useParams<{ busId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    selectedBus, seats, setSeats, selectedSeats,
    passengers, setPassengers,
    boardingPoint, setBoardingPoint,
    droppingPoint, setDroppingPoint,
    totalAmount, isWomenOnly, setWomenOnly,
    toggleSeat, deselectSeat,
  } = useBooking();

  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<'seats' | 'passengers' | 'boarding'>('seats');
  const seatsLoadedRef = useRef(false);
  const prevSelectedSeatsRef = useRef<string[]>([]);
  const busIdRef = useRef<string | undefined>(undefined);

  // Load seats only once when busId changes
  useEffect(() => {
    if (!busId || !selectedBus) return;
    if (busIdRef.current === busId && seatsLoadedRef.current) return;
    
    busIdRef.current = busId;
    seatsLoadedRef.current = true;
    prevSelectedSeatsRef.current = [];
    
    const loadSeats = async () => {
      setIsLoading(true);
      try {
        const fetchedSeats = await busAPI.getSeats(busId);
        setSeats(fetchedSeats);
      } catch {
        toast.error('Failed to load seats');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSeats();
  }, [busId, selectedBus?.id, setSeats]);

  // Sync passengers when selected seats change - only when on passengers step
  useEffect(() => {
    if (step !== 'passengers' && step !== 'boarding') return;
    
    const currentSeatIds = selectedSeats.map(s => s.id);
    const prevSeatIds = prevSelectedSeatsRef.current;
    
    // Check if seats actually changed
    if (JSON.stringify(currentSeatIds) === JSON.stringify(prevSeatIds)) return;
    
    prevSelectedSeatsRef.current = currentSeatIds;
    
    if (selectedSeats.length > passengers.length) {
      // Added a seat
      const newPassengers: Passenger[] = selectedSeats.map((seat, i) => ({
        name: passengers[i]?.name || '',
        age: passengers[i]?.age || 0,
        gender: isWomenOnly ? 'Female' : (passengers[i]?.gender || 'Male') as Passenger['gender'],
        seatNumber: seat.seatNumber,
      }));
      setPassengers(newPassengers);
    } else if (selectedSeats.length < passengers.length) {
      // Removed a seat - keep passenger data for remaining seats
      const newPassengers = passengers.slice(0, selectedSeats.length);
      setPassengers(newPassengers);
    }
  }, [selectedSeats.length, step]);

  // Update passengers when women only changes
  useEffect(() => {
    if (step !== 'passengers' && step !== 'boarding') return;
    if (!isWomenOnly) return;
    
    const updatedPassengers = passengers.map(p => ({ ...p, gender: 'Female' as const }));
    setPassengers(updatedPassengers);
  }, [isWomenOnly]);

  const handleRemovePassenger = (index: number) => {
    if (passengers.length <= 1) {
      toast.error('At least one passenger is required');
      return;
    }
    const removedPassenger = passengers[index];
    const newPassengers = passengers.filter((_, i) => i !== index);
    setPassengers(newPassengers);
    
    // Deselect the seat
    if (removedPassenger) {
      const seat = selectedSeats.find(s => s.seatNumber === removedPassenger.seatNumber);
      if (seat) {
        deselectSeat(seat.id);
      }
    }
    toast.success('Passenger and seat removed');
  };

  const handleContinue = () => {
    if (step === 'seats') {
      if (selectedSeats.length === 0) { toast.error('Please select at least one seat'); return; }
      setStep('passengers');
    } else if (step === 'passengers') {
      if (isWomenOnly) {
        const hasNonFemale = passengers.some((p) => p.gender !== 'Female');
        if (hasNonFemale) {
          toast.error('Women-only booking: All passengers must be female');
          return;
        }
      }
      const valid = passengers.every((p) => p.name.trim().length >= 2 && p.age > 0 && p.age < 120);
      if (!valid) { toast.error('Please fill in all passenger details correctly'); return; }
      setStep('boarding');
    } else {
      if (!boardingPoint) { toast.error('Please select a boarding point'); return; }
      if (!droppingPoint) { toast.error('Please select a dropping point'); return; }
      if (!isAuthenticated) {
        navigate('/login', { state: { from: `/seat-selection/${busId}` } });
        return;
      }
      navigate('/booking/confirm');
    }
  };

  if (!selectedBus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No bus selected.</p>
          <Button className="mt-4" onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] page-enter">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#d63031] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-[#1a1a2e]">{selectedBus.name}</h1>
              <p className="text-xs text-gray-500">{selectedBus.source} → {selectedBus.destination} · {selectedBus.departureTime} – {selectedBus.arrivalTime}</p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mt-4">
            {[
              { id: 'seats', label: 'Select Seats' },
              { id: 'passengers', label: 'Passenger Details' },
              { id: 'boarding', label: 'Boarding/Dropping' },
            ].map(({ id, label }, idx) => (
              <React.Fragment key={id}>
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === id ? 'bg-[#d63031] text-white' :
                    ['seats', 'passengers', 'boarding'].indexOf(step) > idx ? 'bg-green-500 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>{idx + 1}</div>
                  <span className={`text-xs font-medium hidden sm:block ${step === id ? 'text-[#d63031]' : 'text-gray-400'}`}>{label}</span>
                </div>
                {idx < 2 && <div className={`flex-1 h-0.5 ${['seats', 'passengers', 'boarding'].indexOf(step) > idx ? 'bg-green-400' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* ── Left Panel ── */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center py-20"><Spinner size="lg" /></div>
            ) : (
              <>
                {/* STEP 1: Seat Selection */}
                {step === 'seats' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h2 className="font-bold text-[#1a1a2e] mb-4">Choose Your Seats</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SeatLayout seats={seats} deck="lower" />
                      <SeatLayout seats={seats} deck="upper" />
                    </div>
                  </div>
                )}

                {/* STEP 2: Passenger Details */}
                {step === 'passengers' && (
                  <div className="space-y-4">
                    {/* Edit Seats Button */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Selected Seats</p>
                          <p className="font-bold text-[#1a1a2e]">{selectedSeats.map(s => s.seatNumber).join(', ')}</p>
                        </div>
                        <button
                          onClick={() => setStep('seats')}
                          className="flex items-center gap-2 px-4 py-2 bg-[#d63031] text-white rounded-xl hover:bg-[#b71c1c] transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                          <span className="text-sm font-medium">Edit Seats</span>
                        </button>
                      </div>
                    </div>

                    {/* Passenger Details */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-[#1a1a2e]">Passenger Details</h2>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setStep('seats')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                          >
                            <Plus className="w-4 h-4" />
                            Add Seat
                          </button>
                          <label className="flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-xl cursor-pointer hover:bg-pink-100 transition-colors">
                            <input
                              type="checkbox"
                              checked={isWomenOnly}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setWomenOnly(checked);
                                if (checked) {
                                  const updatedPassengers = passengers.map(p => ({ ...p, gender: 'Female' as const }));
                                  setPassengers(updatedPassengers);
                                }
                              }}
                              className="w-4 h-4 accent-pink-500"
                            />
                            <Users className="w-4 h-4 text-pink-500" />
                            <span className="text-sm font-semibold text-pink-600">Women Only</span>
                          </label>
                        </div>
                      </div>
                      {isWomenOnly && (
                        <div className="mb-4 p-3 bg-pink-50 rounded-xl border border-pink-100">
                          <p className="text-xs text-pink-600">
                            Women-only booking! Priority helpline: 1800-123-5556. All passengers must be female.
                          </p>
                        </div>
                      )}
                      <div className="space-y-4">
                        {passengers.map((p, i) => (
                          <div key={i} className={`border rounded-xl p-4 ${isWomenOnly && p.gender !== 'Female' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-7 h-7 rounded-full bg-[#d63031] text-white flex items-center justify-center text-xs font-bold">
                                {i + 1}
                              </div>
                              <p className="font-semibold text-sm text-[#1a1a2e]">Passenger {i + 1} — Seat {p.seatNumber}</p>
                              {isWomenOnly ? (
                                <span className="ml-auto text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-medium">Female Only</span>
                              ) : (
                                <button
                                  onClick={() => handleRemovePassenger(i)}
                                  className="ml-auto flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium"
                                >
                                  <Minus className="w-3 h-3" />
                                  Remove
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <Input
                                label="Full Name"
                                placeholder="Enter name"
                                value={p.name}
                                onChange={(e) => {
                                  const updated = [...passengers];
                                  updated[i] = { ...updated[i], name: e.target.value };
                                  setPassengers(updated);
                                }}
                              />
                              <Input
                                label="Age"
                                type="number"
                                placeholder="25"
                                min={1}
                                max={120}
                                value={p.age || ''}
                                onChange={(e) => {
                                  const updated = [...passengers];
                                  updated[i] = { ...updated[i], age: Number(e.target.value) };
                                  setPassengers(updated);
                                }}
                              />
                              <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-[#1a1a2e]">Gender</label>
                                <select
                                  value={p.gender}
                                  disabled={isWomenOnly}
                                  onChange={(e) => {
                                    const updated = [...passengers];
                                    updated[i] = { ...updated[i], gender: e.target.value as Passenger['gender'] };
                                    setPassengers(updated);
                                  }}
                                  className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                                    isWomenOnly 
                                      ? 'bg-pink-100 border-pink-200 text-pink-600 cursor-not-allowed' 
                                      : 'border-gray-200 bg-white text-[#1a1a2e] focus:ring-[#d63031]'
                                  }`}
                                >
                                  <option value="Female">Female</option>
                                  {!isWomenOnly && <option value="Male">Male</option>}
                                  {!isWomenOnly && <option value="Other">Other</option>}
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {passengers.length < selectedSeats.length && (
                        <div className="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-100">
                          <p className="text-xs text-orange-600">
                            Note: {selectedSeats.length - passengers.length} seat(s) need passenger details. 
                            <button onClick={() => {
                              const newPassengers: Passenger[] = selectedSeats.map((seat, i) => ({
                                name: passengers[i]?.name || '',
                                age: passengers[i]?.age || 0,
                                gender: isWomenOnly ? 'Female' : (passengers[i]?.gender || 'Male') as Passenger['gender'],
                                seatNumber: seat.seatNumber,
                              }));
                              setPassengers(newPassengers);
                            }} className="font-semibold ml-1 hover:underline">Add all</button>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 3: Boarding/Dropping */}
                {step === 'boarding' && (
                  <div className="space-y-4">
                    {/* Edit Seats & Passengers Button */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Seats</p>
                            <p className="font-semibold text-sm text-[#1a1a2e]">{selectedSeats.map(s => s.seatNumber).join(', ')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Passengers</p>
                            <p className="font-semibold text-sm text-[#1a1a2e]">{passengers.length}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setStep('passengers')}
                          className="flex items-center gap-2 px-4 py-2 bg-[#d63031] text-white rounded-xl hover:bg-[#b71c1c] transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                          <span className="text-sm font-medium">Edit</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-6">
                      <div>
                        <h2 className="font-bold text-[#1a1a2e] mb-3">Select Boarding Point</h2>
                        <div className="space-y-2">
                          {selectedBus.boardingPoints.map((bp) => (
                            <label key={bp.id} className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-colors ${boardingPoint?.id === bp.id ? 'border-[#d63031] bg-red-50' : 'border-gray-100 hover:border-gray-200'}`}>
                              <input type="radio" name="boarding" checked={boardingPoint?.id === bp.id} onChange={() => setBoardingPoint(bp)} className="mt-1 accent-[#d63031]" />
                              <div>
                                <p className="font-semibold text-sm text-[#1a1a2e]">{bp.time} — {bp.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{bp.address}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h2 className="font-bold text-[#1a1a2e] mb-3">Select Dropping Point</h2>
                        <div className="space-y-2">
                          {selectedBus.droppingPoints.map((dp) => (
                            <label key={dp.id} className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-colors ${droppingPoint?.id === dp.id ? 'border-[#d63031] bg-red-50' : 'border-gray-100 hover:border-gray-200'}`}>
                              <input type="radio" name="dropping" checked={droppingPoint?.id === dp.id} onChange={() => setDroppingPoint(dp)} className="mt-1 accent-[#d63031]" />
                              <div>
                                <p className="font-semibold text-sm text-[#1a1a2e]">{dp.time} — {dp.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{dp.address}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Continue Button */}
            <div className="mt-4 flex justify-between items-center bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              {step !== 'seats' && (
                <button 
                  onClick={() => {
                    const backStep = step === 'boarding' ? 'passengers' : 'seats';
                    setStep(backStep);
                  }} 
                  className="text-sm text-gray-500 hover:text-[#d63031] font-medium flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
              <div className={step === 'seats' ? 'ml-auto' : ''}>
                <Button size="lg" onClick={handleContinue} disabled={isLoading}>
                  {step === 'boarding' ? `Pay ${formatPrice(totalAmount)}` : 'Continue →'}
                </Button>
              </div>
            </div>

            {/* Mobile Booking Summary */}
            <div className="lg:hidden mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">
                    {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected
                  </p>
                  {selectedSeats.length > 0 && (
                    <p className="font-semibold text-sm text-[#1a1a2e]">
                      {selectedSeats.map(s => s.seatNumber).join(', ')}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-black text-xl text-[#d63031]">{formatPrice(totalAmount)}</p>
                  {isWomenOnly && (
                    <p className="text-xs text-pink-500 font-medium">Women Only</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Booking Summary ── */}
          <div className="w-72 flex-shrink-0 hidden lg:block">
            <BookingSummary />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;