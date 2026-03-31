import React, { useState, useRef } from 'react';
import { Tag, ChevronRight } from 'lucide-react';
import { OFFERS } from '@/data/mockData';
import { cn } from '@/utils/helpers';
import toast from 'react-hot-toast';

const ALL_OFFERS = [
  ...OFFERS,
  {
    id: 5,
    code: 'FESTIVE300',
    title: 'Save up to Rs 300 on bus tickets',
    description: 'Road to Summer Sale — Valid till 22 Mar',
    bgColor: 'from-orange-400 to-red-500',
    icon: '🚌',
    validTill: 'Valid till 22 Mar',
    tag: 'Bus',
  },
  {
    id: 6,
    code: 'TRAIN100',
    title: 'Book trains for festivals — Get ₹100 off',
    description: 'Use code FESTIVE · Authorised IRCTC partner',
    bgColor: 'from-purple-500 to-indigo-600',
    icon: '🚆',
    validTill: 'Valid till 30 Apr',
    tag: 'Train',
  },
];

const OffersSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'All' | 'Bus' | 'Train'>('All');
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast.success(`Code "${code}" copied!`);
    });
  };

  const filteredOffers = activeTab === 'All'
    ? ALL_OFFERS
    : ALL_OFFERS.filter((o) => (o as any).tag === activeTab || !('tag' in o));

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const scrollLeft = sliderRef.current.scrollLeft;
    const slideWidth = sliderRef.current.clientWidth;
    setCurrentSlide(Math.round(scrollLeft / slideWidth));
  };

  return (
    <section className="py-6 md:py-10 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-[#1a1a2e]">Offers for you</h2>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 px-4 sm:px-6 lg:px-8">
          {(['All', 'Bus', 'Train'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-colors border',
                tab === activeTab
                  ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]'
                  : 'border-gray-300 text-gray-600 hover:border-[#d63031] hover:text-[#d63031] bg-white'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── MOBILE: Horizontal Carousel ── */}
        <div className="md:hidden relative">
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 gap-3"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="flex-shrink-0 w-[calc(100%-32px)] snap-start"
              >
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                  {/* Tag */}
                  {'tag' in offer && (
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-md mb-3">
                      {(offer as any).tag}
                    </span>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="font-bold text-[#1a1a2e] text-base leading-snug">{offer.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{offer.validTill}</p>
                      <button
                        onClick={() => copyCode(offer.code)}
                        className="mt-3 flex items-center gap-2 border border-dashed border-gray-300 px-3 py-1.5 rounded-lg text-sm font-bold text-gray-700 hover:border-[#d63031] hover:text-[#d63031] transition-colors"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        {offer.code}
                      </button>
                    </div>
                    <div className="text-5xl flex-shrink-0">{offer.icon}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {filteredOffers.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  sliderRef.current?.scrollTo({ left: i * sliderRef.current.clientWidth, behavior: 'smooth' });
                  setCurrentSlide(i);
                }}
                className={cn(
                  'rounded-full transition-all duration-200',
                  i === currentSlide ? 'w-5 h-2 bg-[#d63031]' : 'w-2 h-2 bg-gray-300'
                )}
              />
            ))}
            <span className="ml-2 text-xs text-gray-400 font-medium">
              {currentSlide + 1}/{filteredOffers.length}
            </span>
          </div>
        </div>

        {/* ── DESKTOP: Grid ── */}
        <div className="hidden md:grid grid-cols-4 gap-4 px-4 sm:px-6 lg:px-8">
          {filteredOffers.slice(0, 4).map((offer) => (
            <div
              key={offer.id}
              className={cn(
                'relative rounded-2xl p-4 bg-gradient-to-br overflow-hidden',
                'hover:-translate-y-1 hover:shadow-lg transition-all duration-200',
                offer.bgColor
              )}
            >
              <div className="absolute top-2 right-2 text-3xl opacity-20">{offer.icon}</div>
              <div className="text-3xl mb-2">{offer.icon}</div>
              <p className="text-white font-bold text-sm leading-snug">{offer.title}</p>
              <p className="text-white/70 text-xs mt-1">{offer.validTill}</p>
              <button
                onClick={() => copyCode(offer.code)}
                className="mt-3 flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                <Tag className="w-3 h-3" />
                {offer.code}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OffersSection;