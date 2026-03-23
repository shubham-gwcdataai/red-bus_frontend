import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bus, Calendar, Users, BookOpen, Plus, Trash2,
  Edit, BarChart3, LogOut, TrendingUp, AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { adminAPI, AdminBusPayload, AdminTripPayload } from '@/services/api';
import { formatPrice, formatDate } from '@/utils/helpers';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

type AdminTab = 'dashboard' | 'buses' | 'trips' | 'bookings' | 'users';

interface Stats {
  totalUsers:    number;
  totalBuses:    number;
  totalTrips:    number;
  totalBookings: number;
  totalRevenue:  number;
  todayBookings: number;
}

// ─── Add Bus Modal ────────────────────────────────────────────────
const AddBusModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState<AdminBusPayload>({
    name:               '',
    operatorName:       '',
    busType:            'AC Sleeper',
    totalSeats:         40,
    amenities:          [],
    cancellationPolicy: 'Free cancellation up to 2 hours before departure',
    refundPolicy:       '100% refund on cancellation 24h before',
  });
  const [amenityInput, setAmenityInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.operatorName) { setError('Name and operator are required'); return; }
    setIsLoading(true);
    try {
      await adminAPI.createBus(form);
      toast.success('Bus added successfully!');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add bus');
    } finally {
      setIsLoading(false);
    }
  };

  const addAmenity = () => {
    if (amenityInput.trim() && !form.amenities.includes(amenityInput.trim())) {
      setForm({ ...form, amenities: [...form.amenities, amenityInput.trim()] });
      setAmenityInput('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-[#1a1a2e] rounded-t-2xl px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold">Add New Bus</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-100 px-4 py-3 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4" />{error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Bus Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d63031]"
                placeholder="e.g. SRS Travels" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Operator Name *</label>
              <input value={form.operatorName} onChange={e => setForm({...form, operatorName: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d63031]"
                placeholder="e.g. SRS Travels Pvt. Ltd." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Bus Type *</label>
              <select value={form.busType} onChange={e => setForm({...form, busType: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d63031]">
                {['AC Sleeper','Non-AC Sleeper','AC Seater','Non-AC Seater','AC Semi-Sleeper'].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Total Seats *</label>
              <input type="number" value={form.totalSeats} min={20} max={60}
                onChange={e => setForm({...form, totalSeats: Number(e.target.value)})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d63031]" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Amenities</label>
            <div className="flex gap-2 mb-2">
              <input value={amenityInput} onChange={e => setAmenityInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAmenity(); } }}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d63031]"
                placeholder="e.g. WiFi" />
              <button type="button" onClick={addAmenity}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.amenities.map(a => (
                <span key={a} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                  {a}
                  <button type="button" onClick={() => setForm({...form, amenities: form.amenities.filter(x => x !== a)})}
                    className="text-blue-400 hover:text-blue-700">✕</button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Cancellation Policy</label>
            <input value={form.cancellationPolicy} onChange={e => setForm({...form, cancellationPolicy: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d63031]" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Refund Policy</label>
            <input value={form.refundPolicy} onChange={e => setForm({...form, refundPolicy: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d63031]" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" fullWidth onClick={onClose}>Cancel</Button>
            <Button type="submit" fullWidth isLoading={isLoading}>Add Bus</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Admin Page ───────────────────────────────────────────────────
const AdminPage: React.FC = () => {
  const navigate    = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [activeTab,    setActiveTab]    = useState<AdminTab>('dashboard');
  const [stats,        setStats]        = useState<Stats | null>(null);
  const [buses,        setBuses]        = useState<any[]>([]);
  const [trips,        setTrips]        = useState<any[]>([]);
  const [bookings,     setBookings]     = useState<any[]>([]);
  const [users,        setUsers]        = useState<any[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [showAddBus,   setShowAddBus]   = useState(false);

  // Guard: must be admin
  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    const storedUser = user as any;
    if (storedUser?.role !== 'admin') {
      toast.error('Access denied. Admin only.');
      navigate('/');
    }
  }, [isAuthenticated, user]);

  // Load dashboard stats
  useEffect(() => {
    if (activeTab === 'dashboard') {
      setIsLoading(true);
      adminAPI.getStats()
        .then(setStats)
        .catch(() => toast.error('Failed to load stats'))
        .finally(() => setIsLoading(false));
    }
    if (activeTab === 'buses') {
      setIsLoading(true);
      adminAPI.getAllBuses()
        .then(setBuses)
        .catch(() => toast.error('Failed to load buses'))
        .finally(() => setIsLoading(false));
    }
    if (activeTab === 'trips') {
      setIsLoading(true);
      adminAPI.getAllTrips()
        .then(setTrips)
        .catch(() => toast.error('Failed to load trips'))
        .finally(() => setIsLoading(false));
    }
    if (activeTab === 'bookings') {
      setIsLoading(true);
      adminAPI.getAllBookings()
        .then(setBookings)
        .catch(() => toast.error('Failed to load bookings'))
        .finally(() => setIsLoading(false));
    }
    if (activeTab === 'users') {
      setIsLoading(true);
      adminAPI.getAllUsers()
        .then(setUsers)
        .catch(() => toast.error('Failed to load users'))
        .finally(() => setIsLoading(false));
    }
  }, [activeTab]);

  const handleDeleteBus = async (id: string) => {
    if (!window.confirm('Delete this bus?')) return;
    try {
      await adminAPI.deleteBus(id);
      setBuses(prev => prev.filter(b => b.id !== id));
      toast.success('Bus deleted');
    } catch {
      toast.error('Failed to delete bus');
    }
  };

  const handleDeleteTrip = async (id: string) => {
    if (!window.confirm('Delete this trip?')) return;
    try {
      await adminAPI.deleteTrip(id);
      setTrips(prev => prev.filter(t => t.id !== id));
      toast.success('Trip deleted');
    } catch {
      toast.error('Failed to delete trip');
    }
  };

  const NAV_ITEMS: { id: AdminTab; label: string; Icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard',  Icon: BarChart3  },
    { id: 'buses',     label: 'Buses',      Icon: Bus        },
    { id: 'trips',     label: 'Trips',      Icon: Calendar   },
    { id: 'bookings',  label: 'Bookings',   Icon: BookOpen   },
    { id: 'users',     label: 'Users',      Icon: Users      },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex">

      {/* Sidebar */}
      <aside className="w-60 bg-[#1a1a2e] flex flex-col min-h-screen flex-shrink-0">
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#d63031] rounded-lg flex items-center justify-center">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-black text-xl">
              red<span className="text-[#d63031]">Bus</span>
            </span>
          </div>
          <p className="text-gray-400 text-xs mt-2">Admin Panel</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-[#d63031] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-5 py-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#d63031] flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-gray-400 text-xs">Administrator</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 w-full text-gray-400 hover:text-white text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">

          {/* ── Dashboard ── */}
          {activeTab === 'dashboard' && (
            <div>
              <h1 className="text-2xl font-black text-[#1a1a2e] mb-6">Dashboard</h1>
              {isLoading ? (
                <div className="flex justify-center py-20"><Spinner size="lg" /></div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: 'Total Users',    value: stats?.totalUsers    || 0, icon: Users,      color: 'bg-blue-500'  },
                    { label: 'Total Buses',    value: stats?.totalBuses    || 0, icon: Bus,        color: 'bg-orange-500'},
                    { label: 'Total Trips',    value: stats?.totalTrips    || 0, icon: Calendar,   color: 'bg-purple-500'},
                    { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: BookOpen,   color: 'bg-green-500' },
                    { label: 'Total Revenue',  value: formatPrice(stats?.totalRevenue || 0), icon: TrendingUp, color: 'bg-[#d63031]' },
                    { label: "Today's Bookings", value: stats?.todayBookings || 0, icon: BarChart3, color: 'bg-teal-500'  },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">{label}</p>
                          <p className="text-xl font-black text-[#1a1a2e]">{value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Buses ── */}
          {activeTab === 'buses' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black text-[#1a1a2e]">Buses</h1>
                <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddBus(true)}>
                  Add Bus
                </Button>
              </div>
              {isLoading ? (
                <div className="flex justify-center py-20"><Spinner size="lg" /></div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          {['Name','Operator','Type','Seats','Amenities','Actions'].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {buses.map((bus: any) => (
                          <tr key={bus.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-[#1a1a2e]">{bus.name}</td>
                            <td className="px-4 py-3 text-gray-600">{bus.operator_name}</td>
                            <td className="px-4 py-3">
                              <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-lg">
                                {bus.bus_type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{bus.total_seats}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs">
                              {(bus.amenities || []).slice(0, 3).join(', ')}
                              {bus.amenities?.length > 3 && ` +${bus.amenities.length - 3}`}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleDeleteBus(bus.id)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete bus"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {buses.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                              No buses found. Add one above.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Trips ── */}
          {activeTab === 'trips' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black text-[#1a1a2e]">Trips</h1>
              </div>
              {isLoading ? (
                <div className="flex justify-center py-20"><Spinner size="lg" /></div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          {['Route','Date','Departure','Price','Seats','Status','Actions'].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {trips.map((trip: any) => (
                          <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-[#1a1a2e]">
                              {trip.source} → {trip.destination}
                            </td>
                            <td className="px-4 py-3 text-gray-600">{formatDate(trip.travel_date?.slice(0,10))}</td>
                            <td className="px-4 py-3 text-gray-600">{trip.departure_time?.slice(0,5)}</td>
                            <td className="px-4 py-3 font-bold text-[#d63031]">{formatPrice(Number(trip.price))}</td>
                            <td className="px-4 py-3 text-gray-600">{trip.available_seats}/{trip.total_seats ?? 40}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${
                                trip.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {trip.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleDeleteTrip(trip.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete trip"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {trips.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                              No trips found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Bookings ── */}
          {activeTab === 'bookings' && (
            <div>
              <h1 className="text-2xl font-black text-[#1a1a2e] mb-6">All Bookings</h1>
              {isLoading ? (
                <div className="flex justify-center py-20"><Spinner size="lg" /></div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          {['PNR','User','Route','Date','Amount','Status'].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {bookings.map((b: any) => (
                          <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-bold text-[#1a1a2e] font-mono">{b.pnr}</td>
                            <td className="px-4 py-3 text-gray-600">{b.contact_email}</td>
                            <td className="px-4 py-3 text-gray-700">{b.source} → {b.destination}</td>
                            <td className="px-4 py-3 text-gray-600">{formatDate(b.travel_date?.slice(0,10))}</td>
                            <td className="px-4 py-3 font-bold text-[#d63031]">{formatPrice(Number(b.total_amount))}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                                b.status === 'confirmed' ? 'bg-green-50 text-green-700' :
                                b.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                                'bg-yellow-50 text-yellow-700'
                              }`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {bookings.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No bookings found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Users ── */}
          {activeTab === 'users' && (
            <div>
              <h1 className="text-2xl font-black text-[#1a1a2e] mb-6">All Users</h1>
              {isLoading ? (
                <div className="flex justify-center py-20"><Spinner size="lg" /></div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          {['Name','Email','Phone','Role','Joined'].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {users.map((u: any) => (
                          <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-[#1a1a2e]">{u.name}</td>
                            <td className="px-4 py-3 text-gray-600">{u.email}</td>
                            <td className="px-4 py-3 text-gray-600">{u.phone || '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${
                                u.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-600'
                              }`}>{u.role}</span>
                            </td>
                            <td className="px-4 py-3 text-gray-500">{formatDate(u.created_at?.slice(0,10))}</td>
                          </tr>
                        ))}
                        {users.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-gray-400">No users found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add Bus Modal */}
      {showAddBus && (
        <AddBusModal
          onClose={() => setShowAddBus(false)}
          onSuccess={() => {
            if (activeTab === 'buses') {
              adminAPI.getAllBuses().then(setBuses);
            }
          }}
        />
      )}
    </div>
  );
};

export default AdminPage;
