import React from 'react';
import { Star } from 'lucide-react';
import { TESTIMONIALS } from '@/data/mockData';

const TestimonialsSection: React.FC = () => (
  <section className="py-6 md:py-10 bg-white">
    <div className="max-w-7xl mx-auto">
      <div className="mb-5 px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg md:text-xl font-bold text-[#1a1a2e]">Testimonials</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Hear from our satisfied customers in their own words.
        </p>
      </div>

      <div
        className="md:hidden flex gap-3 overflow-x-auto pb-2 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {TESTIMONIALS.map((t) => (
          <div
            key={t.id}
            className="flex-shrink-0 w-56 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
          >
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">"{t.text}"</p>
            <div className="mt-4">
              <p className="text-sm font-bold text-[#1a1a2e]">{t.name}</p>
              <p className="text-xs text-gray-400">{t.joined}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── DESKTOP: Grid ── */}
      <div className="hidden md:grid grid-cols-4 gap-4 px-4 sm:px-6 lg:px-8">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.id}
            className="bg-[#f5f7fa] rounded-2xl p-5 hover:-translate-y-1 hover:shadow-md transition-all duration-200"
          >
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed italic">"{t.text}"</p>
            <div className="mt-4">
              <p className="text-sm font-bold text-[#1a1a2e]">{t.name}</p>
              <p className="text-xs text-gray-500">{t.joined}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;