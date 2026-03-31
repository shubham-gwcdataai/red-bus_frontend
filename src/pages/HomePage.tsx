import React, { useState } from 'react';
import HeroSection from '@/components/home/HeroSection';
import OffersSection from '@/components/home/OffersSection';
import WhatsNewSection from '@/components/home/WhatsNewSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import { Star, Smartphone } from 'lucide-react';

const FAQ_DATA = [
  {
    question: 'How can I track the location of my booked bus online?',
    answer: 'Once you have booked your ticket, you can track your bus in real-time using our live tracking feature. Simply go to "My Bookings", select your trip, and tap "Track Bus" to see the current location on a map. This feature helps you plan your pickup and drop-off times accurately.',
  },
  {
    question: 'What are the advantages of bus ticket booking with redBus?',
    answer: 'redBus offers several advantages: 1) Best price guarantee with exclusive deals, 2) Free cancellation on selected tickets, 3) Real-time bus tracking, 4) Wide range of bus operators and routes, 5) 24/7 customer support, 6) Multiple payment options including UPI, cards, and wallets.',
  },
  {
    question: 'Why book bus tickets online on redBus?',
    answer: 'Booking online through redBus saves time and offers convenience. You can compare prices from multiple operators, read reviews, choose your preferred seats, and receive instant confirmation. Plus, you get access to exclusive discounts and offers not available at bus counters.',
  },
  {
    question: 'Do I need to create an account on the redBus site to book bus ticket?',
    answer: 'Yes, you need to create an account to book tickets. This ensures your booking details are saved, you can track your trips, and receive instant notifications about your journey. Registration is free and takes just a minute.',
  },
  {
    question: 'Does bus booking online cost me more?',
    answer: 'No, booking online through redBus does not cost more. In fact, you often pay less than counter prices due to exclusive online discounts and cashback offers. We also have a best price guarantee - if you find a lower price elsewhere, we will match it.',
  },
  {
    question: 'How can I get the discounts on the bus booking?',
    answer: 'You can get discounts through: 1) First-time user coupons, 2) Bank-specific offers on payment, 3) Promo codes during checkout, 4) Seasonal sales and festival offers, 5) Loyalty rewards for repeat bookings. Check our offers section regularly for the latest deals.',
  },
  {
    question: "What's New in Bus Booking on redBus?",
    answer: 'We have introduced several new features: 1) Flex Ticket - modify travel dates up to 4 hours before departure, 2) Live Bus Tracking - real-time location updates, 3) Booking for Women - exclusive deals with priority helplines, 4) Instant Refunds - faster cancellation refunds, 5) Multiple Payment Options - including all major UPI apps.',
  },
  {
    question: 'Can I book a Government bus ticket on redBus?',
    answer: 'Yes! redBus is an authorized partner for booking government bus services including KSRTC (Karnataka), APSRTC (Andhra Pradesh), TSRTC (Telangana), and Kerala RTC. You can book these government bus tickets just like any other operator with the same convenience and safety features.',
  },
];

const GovernmentBuses = [
  { name: 'KSRTC',      state: 'Karnataka',       services: 290,  color: 'text-red-600',    bg: 'bg-red-50'    },
  { name: 'APSRTC',     state: 'Andhra Pradesh',  services: 1039, color: 'text-blue-600',   bg: 'bg-blue-50'   },
  { name: 'TSRTC',      state: 'Telangana',       services: 1650, color: 'text-green-600',  bg: 'bg-green-50'  },
  { name: 'Kerala RTC', state: 'Kerala',          services: 842,  color: 'text-orange-600', bg: 'bg-orange-50' },
];

const HomePage: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
  <div className="page-enter">

    {/* ── Hero (dark bg) ── */}
    <HeroSection />
    <div className="bg-[#f5f7fa]">

      {/* Offers */}
      <div className="bg-white">
        <OffersSection />
      </div>

      {/* What's New */}
      <WhatsNewSection />

      {/* Government Buses */}
      <section className="py-8 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-2xl font-bold text-[#1a1a2e] mb-6">Government Buses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GovernmentBuses.map((bus) => (
              <div
                key={bus.name}
                className={`${bus.bg} rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer border border-transparent hover:border-gray-100`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-black text-lg ${bus.color}`}>{bus.name}</span>
                  <span className="flex items-center gap-1 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                    <Star className="w-2.5 h-2.5 fill-white" /> 4.2
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-medium mb-1">{bus.state}</p>
                <p className="text-xs text-gray-500 leading-snug">
                  {bus.services} services including popular routes
                </p>
                <p className="text-[10px] text-gray-400 mt-3 uppercase tracking-wider font-semibold">Official booking partner</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <div className="bg-white">
        <TestimonialsSection />
      </div>

      {/* App Download Banner */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-[#1a1a2e] to-[#2d2d44] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full mb-4">
                <span className="text-red-400 text-xs font-bold uppercase tracking-widest">📱 Mobile Exclusive</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                Grab <span className="text-[#d63031]">10% off</span> <br className="hidden md:block" /> on your first ride
              </h2>
              <p className="text-gray-400 mt-4 text-base max-w-md mx-auto lg:mx-0">
                Download the app to unlock this exclusive offer. Use code:{' '}
                <span className="text-white font-mono bg-white/10 px-2 py-1 rounded ml-1 font-bold">APP10</span>
              </p>
              
              <div className="flex flex-wrap items-center gap-6 mt-8 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <div className="bg-green-500/20 p-2 rounded-lg">
                    <Star className="w-5 h-5 text-green-500 fill-green-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold text-sm">4.6/5</p>
                    <p className="text-xs text-gray-500">10Cr+ Downloads</p>
                  </div>
                </div>
                <div className="w-px h-8 bg-gray-700 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <Star className="w-5 h-5 text-blue-500 fill-blue-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold text-sm">4.7/5</p>
                    <p className="text-xs text-gray-500">1.5Cr+ Reviews</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <a
                href="#"
                className="flex items-center gap-3 bg-black text-white px-6 py-3.5 rounded-2xl hover:bg-gray-900 transition-all border border-gray-800 hover:border-gray-700 shadow-xl"
              >
                <Smartphone className="w-6 h-6" />
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Get it on</p>
                  <p className="text-base font-bold">Google Play</p>
                </div>
              </a>
              
              <a
                href="#"
                className="flex items-center gap-3 bg-black text-white px-6 py-3.5 rounded-2xl hover:bg-gray-900 transition-all border border-gray-800 hover:border-gray-700 shadow-xl"
              >
                <Smartphone className="w-6 h-6" />
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Download on</p>
                  <p className="text-base font-bold">App Store</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-12 md:py-20 bg-[#f5f7fa]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 mt-2 text-sm md:text-base">Everything you need to know about booking bus tickets on redBus.</p>
          </div>
          
          <div className="space-y-3">
            {FAQ_DATA.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl border border-gray-100 group shadow-sm overflow-hidden transition-all duration-300">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-5 md:px-6 py-5 text-sm md:text-base font-semibold text-[#1a1a2e] cursor-pointer list-none flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  {faq.question}
                  <span className={`text-[#d63031] text-2xl transition-transform duration-300 flex-shrink-0 ml-4 leading-none ${openFaqIndex === index ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                {openFaqIndex === index && (
                  <div className="px-5 md:px-6 pb-6 text-sm md:text-base text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  </div>
);
};
export default HomePage;
