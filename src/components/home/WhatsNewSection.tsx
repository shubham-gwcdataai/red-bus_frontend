import React from 'react';
import { FEATURES } from '@/data/mockData';

const WhatsNewSection: React.FC = () => (
  <section className="py-6 md:py-10 bg-[#f5f7fa]">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-lg md:text-xl font-bold text-[#1a1a2e] mb-4 px-4 sm:px-6 lg:px-8">
        What's new
      </h2>

      {/* Mobile: horizontal scroll */}
      <div
        className="md:hidden flex gap-3 overflow-x-auto pb-2 px-4 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {FEATURES.map((feature) => (
          <div
            key={feature.id}
            className={`flex-shrink-0 w-44 ${feature.color} rounded-2xl p-4 border border-white shadow-sm`}
          >
            <div className="text-3xl mb-2">{feature.icon}</div>
            <h3 className="font-bold text-[#1a1a2e] text-sm leading-tight">{feature.title}</h3>
            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed line-clamp-3">
              {feature.description}
            </p>
            <button className="mt-2 text-xs text-[#d63031] font-semibold">Know More →</button>
          </div>
        ))}
      </div>

      {/* Desktop: grid */}
      <div className="hidden md:grid grid-cols-4 gap-4 px-4 sm:px-6 lg:px-8">
        {FEATURES.map((feature) => (
          <div
            key={feature.id}
            className={`${feature.color} rounded-2xl p-5 border border-white hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer`}
          >
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h3 className="font-bold text-[#1a1a2e] text-sm">{feature.title}</h3>
            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{feature.description}</p>
            <button className="mt-3 text-xs text-[#d63031] font-semibold hover:underline">
              Know More →
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhatsNewSection;