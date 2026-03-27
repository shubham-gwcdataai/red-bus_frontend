import React from 'react';
import SearchForm from '@/components/search/SearchForm';

const HeroSection: React.FC = () => (
  <section>

    {/* ── DESKTOP (md+): full banner image + overlapping search card ── */}
    <div className="hidden md:block">
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

    {/* ── MOBILE (<md): gradient hero + search card ── */}
    <div className="md:hidden">
      {/* Gradient hero banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#2d1b4e] to-[#d63031]" style={{ minHeight: '160px' }}>
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white opacity-5" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white opacity-5" />
        <div className="absolute top-4 right-1/3 w-16 h-16 rounded-full bg-[#d63031] opacity-20" />

        <div className="relative z-10 px-5 pt-6 pb-16">
          <p className="text-[11px] font-bold uppercase tracking-widest text-red-300 mb-1">India's No. 1</p>
          <h1 className="text-2xl font-black text-white leading-tight">
            Online bus ticket<br/>booking site
          </h1>
          <p className="text-sm text-white/60 mt-2">Book tickets fast. Travel safe.</p>
        </div>
      </div>

      {/* Search card — pulled up over the hero */}
      <div className="relative -mt-8 mx-3 z-20 pb-4">
        <SearchForm variant="hero" />
      </div>
    </div>

  </section>
);

export default HeroSection;