
import React, { useState } from 'react';
import { GENERAL_INFO } from '../constants';
import { Plane, Home, Lightbulb, Info, Map, FileText } from 'lucide-react';

type InfoTab = 'flight' | 'hotel' | 'tips' | 'code';

// 登機證組件
const BoardingPass: React.FC<{
  type: 'Outbound' | 'Inbound';
  flightNo: string;
  date: string;
  fromCode: string;
  toCode: string;
  depTime: string;
  arrTime: string;
  terminal: string;
}> = ({ type, flightNo, date, fromCode, toCode, depTime, arrTime, terminal }) => {
  return (
    <div className="bg-white rounded-3xl border-2 border-stone-800 shadow-sketch relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
      {/* Top Section: Main Info */}
      <div className="p-5 pb-6 bg-white relative z-10">
        
        {/* Header: Logo & Tag */}
        <div className="flex justify-between items-center mb-4">
           {/* Cathay Logo - Smaller and Left Aligned */}
           <img 
              src="https://upload.wikimedia.org/wikipedia/en/thumb/1/17/Cathay_Pacific_logo.svg/300px-Cathay_Pacific_logo.svg.png" 
              alt="Cathay Pacific" 
              className="h-6 w-auto object-contain" 
           />
           
           <div className="bg-autumn-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
             {type}
           </div>
        </div>

        {/* Date + Flight No - Bold & Larger */}
        <div className="mb-5 border-b-2 border-dashed border-stone-100 pb-4">
           <div className="text-2xl font-black text-stone-800 leading-tight">
              {date} <span className="text-autumn-500 whitespace-nowrap">- {flightNo}</span>
           </div>
        </div>

        {/* Route Info */}
        <div className="flex justify-between items-center px-1">
          <div className="text-center">
            <div className="text-4xl font-black text-stone-800 font-sans tracking-wider">{fromCode}</div>
            <div className="text-xl font-bold text-stone-500 mt-1">{depTime}</div>
          </div>
          
          <div className="flex-1 px-4 flex flex-col items-center">
             <div className="w-full h-0.5 bg-stone-300 relative">
               <Plane className="w-5 h-5 text-autumn-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1 transform rotate-90" />
             </div>
             <div className="text-xs text-stone-400 mt-2 font-sans">2h 10m</div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-black text-stone-800 font-sans tracking-wider">{toCode}</div>
            <div className="text-xl font-bold text-stone-500 mt-1">{arrTime}</div>
          </div>
        </div>
      </div>

      {/* Divider with Cutouts */}
      <div className="relative h-6 bg-stone-50 border-t-2 border-dashed border-stone-300 flex items-center justify-between">
        <div className="w-4 h-4 bg-paper rounded-full border-r-2 border-stone-300 absolute -left-2 top-1/2 -translate-y-1/2"></div>
        <div className="w-4 h-4 bg-paper rounded-full border-l-2 border-stone-300 absolute -right-2 top-1/2 -translate-y-1/2"></div>
      </div>

      {/* Bottom Section: Footer Info */}
      <div className="bg-stone-50 p-4 pt-2 flex justify-between items-end border-t-0">
         <div className="flex gap-4">
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Terminal</span>
              <span className="text-lg font-bold text-stone-800">{terminal}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Gate</span>
              <span className="text-lg font-bold text-stone-800">--</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Seat</span>
              <span className="text-lg font-bold text-stone-800">--</span>
            </div>
         </div>
         
         {/* Fake Barcode */}
         <div className="h-8 flex items-end gap-[2px] opacity-60">
            {[...Array(15)].map((_,i) => (
              <div key={i} className={`bg-stone-800 h-full ${i%2===0 ? 'w-1' : 'w-0.5'}`}></div>
            ))}
         </div>
      </div>
    </div>
  );
};

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
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-stone-800 border-l-4 border-autumn-300 pl-3">航班資訊</h2>
            
            {/* Outbound */}
            <BoardingPass 
              type="Outbound"
              flightNo="CX407"
              date="2025 Dec 12"
              fromCode="TPE"
              toCode="HKG"
              depTime="08:20"
              arrTime="10:30"
              terminal="T1"
            />

            {/* Inbound */}
            <BoardingPass 
              type="Inbound"
              flightNo="CX402"
              date="2025 Dec 15"
              fromCode="HKG"
              toCode="TPE"
              depTime="18:30"
              arrTime="20:15"
              terminal="T1"
            />
            
            <div className="bg-stone-100 p-3 rounded-xl border border-stone-200 text-stone-500 text-xs text-center">
                請務必於起飛前 2.5 小時抵達機場辦理登機手續
            </div>
          </div>
        )}

        {/* Hotel Content */}
        {activeTab === 'hotel' && (
          <div className="space-y-4 animate-fadeIn">
             <h2 className="text-2xl font-bold text-stone-800 border-l-4 border-autumn-400 pl-3">住宿資訊</h2>
             
             {/* Hotel Card */}
             <div className="bg-white p-0 rounded-3xl border-2 border-stone-800 shadow-sketch overflow-hidden">
                {/* Hotel Image with Fallback */}
                <div className="h-48 w-full bg-stone-300 relative flex items-center justify-center overflow-hidden">
                   {/* Fallback Icon (Behind image, visible if image loads transparently or fails) */}
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Home className="w-12 h-12 text-stone-400 opacity-50" />
                   </div>
                   
                   <img 
                      src={GENERAL_INFO.accommodation.imageUrl} 
                      alt="The Cityview Hotel" 
                      className="w-full h-full object-cover relative z-10"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                   />
                   
                   {/* Gradient Overlay */}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 z-20">
                      <div className="text-white">
                         <h3 className="text-2xl font-bold leading-none">{GENERAL_INFO.accommodation.name}</h3>
                         <h4 className="text-sm font-sans opacity-90">{GENERAL_INFO.accommodation.enName}</h4>
                      </div>
                   </div>
                </div>

                <div className="p-5">
                   {/* Actions */}
                   <div className="flex gap-2 mb-4">
                      <a 
                        href={GENERAL_INFO.accommodation.googleMapLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-stone-800 text-white py-2.5 rounded-xl font-bold hover:bg-stone-700 transition-colors shadow-sm text-sm"
                      >
                          <Map className="w-4 h-4" />
                          <span>Google Map</span>
                      </a>
                      
                      {/* PDF Download Button */}
                      {/* Note: User must place 'booking.pdf' in the public folder */}
                      <a 
                        href="booking.pdf" 
                        target="_blank"
                        rel="noopener noreferrer"
                        download="booking.pdf"
                        className="flex-1 flex items-center justify-center gap-2 bg-autumn-100 text-autumn-600 border-2 border-autumn-200 py-2.5 rounded-xl font-bold hover:bg-autumn-200 transition-colors shadow-sm text-sm"
                      >
                          <FileText className="w-4 h-4" />
                          <span>Booking 訂單</span>
                      </a>
                   </div>

                   <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                      <div className="flex items-start gap-2 mb-2">
                         <Map className="w-4 h-4 text-autumn-400 mt-1 flex-shrink-0" />
                         <span className="text-stone-700 font-bold">{GENERAL_INFO.accommodation.location}</span>
                      </div>
                      <p className="text-stone-500 text-sm leading-relaxed whitespace-pre-line">
                          {GENERAL_INFO.accommodation.description}
                      </p>
                   </div>
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
