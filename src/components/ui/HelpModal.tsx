import React from 'react';
import { X, Phone, Mail, MessageCircle, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const faqs = [
    { q: 'How do I book a bus ticket?', a: 'Search for your route, select a bus, choose seats, and complete payment to book.' },
    { q: 'How do I cancel my booking?', a: 'Go to My Bookings, select the booking, and click Cancel. Cancellation fees may apply.' },
    { q: 'How do I track my bus?', a: 'After booking, go to My Bookings and use the Track Bus option for real-time updates.' },
    { q: 'What payment methods are accepted?', a: 'We accept Credit/Debit cards, UPI (Google Pay, PhonePe, Paytm), Net Banking, and Wallets.' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
        <div className="bg-[#d63031] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Help & Support</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          <p className="text-gray-600 text-sm">
            Need help with your booking? We are here to assist you 24/7.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center text-center">
              <Phone className="w-8 h-8 text-[#d63031] mb-2" />
              <p className="font-semibold text-[#1a1a2e]">Call Us</p>
              <p className="text-xs text-gray-500 mt-1">1800-123-5555</p>
              <p className="text-xs text-gray-400">Mon-Sun, 8AM-10PM</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center text-center">
              <Mail className="w-8 h-8 text-[#d63031] mb-2" />
              <p className="font-semibold text-[#1a1a2e]">Email</p>
              <p className="text-xs text-gray-500 mt-1">support@redbus.com</p>
              <p className="text-xs text-gray-400">Response in 24h</p>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-[#1a1a2e] mb-3">Quick Help</h3>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-[#1a1a2e]">{faq.q}</p>
                  <p className="text-xs text-gray-500 mt-1">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1a1a2e] rounded-xl p-4 text-white">
            <p className="font-semibold mb-1">Women Safety Helpline</p>
            <p className="text-xs text-gray-300">
              Dedicated support for women travelers: <span className="font-bold">1800-123-5556</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">Available 24/7 • Priority Response</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
