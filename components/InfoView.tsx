
import React, { useState } from 'react';
import { GENERAL_INFO } from '../constants';
import { Plane, Home, Lightbulb, Info, Map } from 'lucide-react';

type InfoTab = 'flight' | 'hotel' | 'tips' | 'code';

const InfoView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InfoTab>('flight');

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex p-2 bg-autumn-100/50 border-b-2 border-stone-800 border-dashed gap-2 overflow-x-auto no-scrollbar">
        <TabButton 
          active={activeTab === 'flight'} 
          onClick={() => setActiveTab('flight')} 
          label="航班" 
          icon={<Plane className="w-4 h-4" />}
        />
        <TabButton 
          active={activeTab === 'hotel'} 
          onClick={() => setActiveTab('hotel')} 
          label="住宿" 
          icon={<Home className="w-4 h-4" />}
        />
        <TabButton 
          active={activeTab === 'tips'} 
          onClick={() => setActiveTab('tips')} 
          label="貼士" 
          icon={<Lightbulb className="w-4 h-4" />}
        />
        <TabButton 
          active={activeTab === 'code'} 
          onClick={() => setActiveTab('code')} 
          label="花碼" 
          icon={<Info className="w-4 h-4" />}
        />
      </div>

      {/* Content Container - Added h-full and overflow-y-auto to fix scrolling */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        
        {/* Flight Content */}
        {activeTab === 'flight' && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-2xl font-bold text-stone-800 border-l-4 border-autumn-300 pl-3">航班資訊</h2>
            <div className="bg-white p-5 rounded-2xl border-2 border-stone-800 shadow-sketch relative">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-stone-100 p-2 rounded-full">
                     <Plane className="w-6 h-6 text-stone-800" />
                  </div>
                  <div>
                    <div className="text-sm text-stone-500 font-bold mb-1">去程 Outbound</div>
                    <div className="font-bold text-stone-800 text-lg leading-relaxed">{GENERAL_INFO.flights.outbound}</div>
                  </div>
                </div>
                <div className="border-t-2 border-dashed border-stone-200"></div>
                <div className="flex items-start gap-4">
                  <div className="bg-stone-100 p-2 rounded-full">
                     <Plane className="w-6 h-6 text-stone-800 transform rotate-180" />
                  </div>
                  <div>
                    <div className="text-sm text-stone-500 font-bold mb-1">回程 Inbound</div>
                    <div className="font-bold text-stone-800 text-lg leading-relaxed">{GENERAL_INFO.flights.inbound}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-autumn-100 p-4 rounded-xl border border-autumn-300 text-stone-700 text-sm">
                請務必提早 2.5 小時抵達機場辦理登機手續。
            </div>
          </div>
        )}

        {/* Hotel Content */}
        {activeTab === 'hotel' && (
          <div className="space-y-4 animate-fadeIn">
             <h2 className="text-2xl font-bold text-stone-800 border-l-4 border-autumn-400 pl-3">住宿資訊</h2>
             <div className="bg-white p-6 rounded-2xl border-2 border-stone-800 shadow-sketch text-center">
                <div className="w-16 h-16 bg-autumn-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-stone-800">
                    <Home className="w-8 h-8 text-autumn-500" />
                </div>
                <h3 className="text-xl font-bold text-stone-800 mb-1">{GENERAL_INFO.accommodation.name}</h3>
                <h4 className="text-lg text-stone-600 font-sans mb-4">{GENERAL_INFO.accommodation.enName}</h4>
                <div className="inline-block bg-stone-100 px-4 py-2 rounded-lg text-stone-700 font-bold border border-stone-300">
                   📍 {GENERAL_INFO.accommodation.location}
                </div>
                <p className="mt-6 text-stone-500 text-sm">
                    {GENERAL_INFO.accommodation.description}
                </p>
                <div className="mt-6 pt-4 border-t border-stone-200">
                    <a 
                      href={GENERAL_INFO.accommodation.googleMapLink} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-stone-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-stone-700 transition-colors shadow-sm"
                    >
                        <Map className="w-4 h-4" />
                        <span>在 Google Maps 上查看</span>
                    </a>
                </div>
             </div>
          </div>
        )}

        {/* Tips Content */}
        {activeTab === 'tips' && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-2xl font-bold text-stone-800 border-l-4 border-autumn-200 pl-3">旅遊小貼士</h2>
            <div className="grid gap-3">
               {GENERAL_INFO.tips.map((tip, idx) => (
                 <div key={idx} className="bg-white p-4 rounded-xl border-2 border-stone-800 shadow-sm flex gap-3 items-start">
                   <div className="text-autumn-300 font-bold text-xl mt-[-2px]">{idx + 1}.</div>
                   <div className="text-stone-700 text-lg leading-snug">{tip}</div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* Flower Code Content */}
        {activeTab === 'code' && (
          <div className="space-y-4 animate-fadeIn">
             <h2 className="text-2xl font-bold text-stone-800 border-l-4 border-stone-500 pl-3">香港花碼字</h2>
             <div className="bg-stone-800 text-paper p-6 rounded-2xl shadow-sketch-lg">
                <p className="text-lg opacity-90 mb-6 leading-relaxed">
                  花碼字 (蘇州碼子) 是香港傳統街市或小巴價錢牌上常見的數字寫法，充滿懷舊情懷。
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                      { code: '〡', num: 1 }, { code: '〢', num: 2 },
                      { code: '〣', num: 3 }, { code: '〤', num: 4 },
                      { code: '〥', num: 5 }, { code: '〦', num: 6 },
                      { code: '〧', num: 7 }, { code: '〨', num: 8 },
                      { code: '〩', num: 9 }, { code: '十', num: 10 }
                  ].map((item) => (
                      <div key={item.num} className="bg-stone-700/50 p-3 rounded-lg flex items-center justify-between border border-stone-600">
                          <span className="text-3xl font-serif text-autumn-200">{item.code}</span>
                          <span className="text-xl font-bold opacity-50">{item.num}</span>
                      </div>
                  ))}
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

const TabButton: React.FC<{
    active: boolean;
    onClick: () => void;
    label: string;
    icon: React.ReactNode;
}> = ({ active, onClick, label, icon }) => (
    <button 
        onClick={onClick}
        className={`flex-1 min-w-[80px] py-2 px-3 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${
          active 
            ? 'bg-autumn-300 border-stone-800 text-white shadow-sketch' 
            : 'bg-white border-stone-300 text-stone-500 hover:bg-stone-50'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default InfoView;
