import React, { useState } from 'react';
import ItineraryView from './components/ItineraryView';
import WeatherView from './components/WeatherView';
import ExpenseTracker from './components/ExpenseTracker';
import InfoView from './components/InfoView';
import { CalendarDays, CloudSun, Wallet, Info } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'weather' | 'expense' | 'info'>('itinerary');

  return (
    <div className="w-full h-screen bg-paper text-ink flex flex-col max-w-md mx-auto relative shadow-2xl overflow-hidden font-hand">
      {/* Header */}
      <header className="pt-8 pb-4 px-6 bg-autumn-200 rounded-b-[2rem] shadow-md border-b-2 border-stone-800 z-10 flex-shrink-0 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-stone-800 tracking-wide leading-none">
            香港 <span className="text-white text-3xl inline-block drop-shadow-md ml-1 font-hand">Trip 2025</span>
          </h1>
          <p className="text-stone-700 font-bold mt-2 ml-1 text-lg">Dec 12 - Dec 15</p>
        </div>

        {/* HK Food Illustration (Dim Sum Basket) */}
        <div className="absolute -right-6 -top-2 opacity-100 transform rotate-[-10deg] pointer-events-none">
          <svg width="140" height="140" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Steam */}
            <path d="M30 15 Q35 5 30 0" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" className="animate-pulse"/>
            <path d="M50 12 Q55 2 50 -3" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" className="animate-pulse"/>
            <path d="M70 15 Q75 5 70 0" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" className="animate-pulse"/>
            
            {/* Chopsticks */}
            <rect x="82" y="5" width="4" height="90" rx="2" transform="rotate(15 82 5)" fill="#44403C" stroke="#2B2B2B" strokeWidth="1" />
            <rect x="92" y="5" width="4" height="90" rx="2" transform="rotate(8 92 5)" fill="#44403C" stroke="#2B2B2B" strokeWidth="1" />

            {/* Basket Body (Back) */}
            <path d="M15 45 L22 85 Q50 95 78 85 L85 45 Z" fill="#FDE6D2" stroke="#2B2B2B" strokeWidth="2.5" />
            
            {/* Texture Lines */}
            <path d="M17 55 Q50 65 83 55" stroke="#2B2B2B" strokeWidth="1" fill="none" opacity="0.3"/>
            <path d="M20 70 Q50 80 80 70" stroke="#2B2B2B" strokeWidth="1" fill="none" opacity="0.3"/>

            {/* Buns */}
            <circle cx="35" cy="40" r="10" fill="white" stroke="#2B2B2B" strokeWidth="2" />
            <circle cx="65" cy="40" r="10" fill="white" stroke="#2B2B2B" strokeWidth="2" />
            <circle cx="50" cy="50" r="11" fill="white" stroke="#2B2B2B" strokeWidth="2" />
            
            {/* Basket Rim (Front) */}
            <ellipse cx="50" cy="45" rx="38" ry="12" fill="none" stroke="#2B2B2B" strokeWidth="2.5" />
            <path d="M12 45 Q50 65 88 45" stroke="none" fill="#F08A5D" opacity="0.1" />
          </svg>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'itinerary' && <ItineraryView />}
        {activeTab === 'weather' && <WeatherView />}
        {activeTab === 'expense' && <ExpenseTracker />}
        {activeTab === 'info' && <InfoView />}
      </main>

      {/* Bottom Navigation */}
      <nav className="h-20 bg-white border-t-2 border-stone-800 flex justify-around items-center px-2 pb-2 absolute bottom-0 w-full z-20">
        <NavButton 
          active={activeTab === 'itinerary'} 
          onClick={() => setActiveTab('itinerary')} 
          icon={<CalendarDays />} 
          label="行程" 
        />
        <NavButton 
          active={activeTab === 'weather'} 
          onClick={() => setActiveTab('weather')} 
          icon={<CloudSun />} 
          label="天氣" 
        />
        <NavButton 
          active={activeTab === 'expense'} 
          onClick={() => setActiveTab('expense')} 
          icon={<Wallet />} 
          label="記帳" 
        />
        <NavButton 
          active={activeTab === 'info'} 
          onClick={() => setActiveTab('info')} 
          icon={<Info />} 
          label="資訊" 
        />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 ${
      active 
        ? 'bg-autumn-300 text-white -translate-y-4 shadow-sketch border-2 border-stone-800' 
        : 'text-stone-400 hover:text-stone-600'
    }`}
  >
    <div className={`${active ? 'scale-110' : 'scale-100'} transition-transform`}>
      {React.cloneElement(icon as React.ReactElement<any>, { size: 24, strokeWidth: active ? 3 : 2 })}
    </div>
    <span className={`text-xs font-bold mt-1 ${active ? 'opacity-100' : 'opacity-0'} transition-opacity absolute bottom-1`}>
      {label}
    </span>
  </button>
);

export default App;