import React from 'react';
import SearchForm from '@/components/search/SearchForm';

const HeroSection: React.FC = () => (
  <section>

   
    <div className="hidden md:block ">
      <div className="relative w-full overflow-hidden" style={{ height: '270px' }}>
        <img src="./HomeBanner.webp" alt="" className='w-full h-full object-cover' />
        <div className="absolute top-8 left-8 lg:left-12">
          <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight" style={{textShadow:'0 2px 12px rgba(0,0,0,0.3)'}}>
            India's No. 1 online<br/>bus ticket booking site
          </h1>
        </div>
      </div>

      {/* Search card overlapping the hero bottom */}
      <div className="relative -mt-10 mx-6 lg:mx-10 xl:mx-16 z-20 pb-6">
        <SearchForm variant="hero" />
      </div>
    </div>

   
    <div className="md:hidden bg-white px-4 pt-5 pb-6">
      <h1 className="text-2xl font-black text-[#1a1a2e] mb-4">Bus Tickets</h1>
      <SearchForm variant="hero" />
    </div>

  </section>
);

export default HeroSection;