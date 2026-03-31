import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FEATURES } from '@/data/mockData';

const FEATURE_DETAILS: Record<number, { title: string; description: string; benefits: string[] }> = {
  1: {
    title: 'Free Cancellation',
    description: 'We understand that plans can change. That is why we offer free cancellation on eligible tickets.',
    benefits: ['Cancel up to 2 hours before departure', 'Instant refund to original payment method', 'No cancellation charges on selected tickets', 'Easy self-service cancellation in app'],
  },
  2: {
    title: 'Flex Ticket',
    description: 'Need to change your travel plans? Flex Ticket lets you modify your journey date without any hassle.',
    benefits: ['Modify date up to 4 hours before departure', 'No additional charges for date change', 'Valid for 12 months from booking', 'Applicable on selected operators only'],
  },
  3: {
    title: 'Booking for Women',
    description: 'Exclusive deals and priority services designed specifically for women travelers.',
    benefits: ['Special discounted fares for women', 'Priority customer support helpline', 'Women-only seats available', 'Dedicated safety features in the app'],
  },
  4: {
    title: 'Live Bus Tracking',
    description: 'Never miss your bus or worry about delays. Track your bus in real-time.',
    benefits: ['Real-time GPS tracking', 'Estimated arrival updates', 'Share live location with family', 'Get notified of any delays'],
  },
};

const FeatureCard: React.FC<{ feature: typeof FEATURES[0]; isExpanded: boolean; onToggle: () => void }> = ({ feature, isExpanded, onToggle }) => (
  <div
    className={`${feature.color} rounded-2xl p-5 border border-white transition-all duration-300 ${
      isExpanded ? 'ring-2 ring-[#d63031]' : 'hover:-translate-y-1 hover:shadow-md'
    }`}
  >
    <div className="flex items-start justify-between">
      <div>
        <div className="text-3xl mb-3">{feature.icon}</div>
        <h3 className="font-bold text-[#1a1a2e] text-sm">{feature.title}</h3>
        <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{feature.description}</p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="flex-shrink-0 p-1 hover:bg-white/50 rounded-lg transition-colors"
      >
        <ChevronDown 
          className={`w-5 h-5 text-[#d63031] transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} 
        />
      </button>
    </div>
    
    {isExpanded && FEATURE_DETAILS[feature.id] && (
      <div className="mt-4 pt-4 border-t border-gray-200/50">
        <p className="text-sm text-gray-600 font-medium">{FEATURE_DETAILS[feature.id].description}</p>
        <ul className="mt-3 space-y-2">
          {FEATURE_DETAILS[feature.id].benefits.map((b, i) => (
            <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 text-[10px]">✓</span> 
              {b}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

const WhatsNewSection: React.FC = () => {
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  console.log('expandedFeature:', expandedFeature);
  const toggleFeature = (id: number) => {
    setExpandedFeature(prev => (prev === id ? null : id));
  };

  return (
    <section className="py-6 md:py-10 bg-[#f5f7fa]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-lg md:text-xl font-bold text-[#1a1a2e] mb-4 px-4 sm:px-6 lg:px-8">
          What's new
        </h2>

        {/* Mobile: horizontal scroll */}
        <div
          className="md:hidden flex gap-3 overflow-x-auto pb-2 px-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {FEATURES.map((feature) => (
            <div key={feature.id} className="flex-shrink-0 w-[85%] snap-center">
              <FeatureCard
                feature={feature}
                isExpanded={expandedFeature === feature.id}
                onToggle={() => toggleFeature(feature.id)}
              />
            </div>
          ))}
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid grid-cols-4 gap-4 px-4 sm:px-6 lg:px-8">
          {FEATURES.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              isExpanded={expandedFeature === feature.id}
              onToggle={() => toggleFeature(feature.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatsNewSection;