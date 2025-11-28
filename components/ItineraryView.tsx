import React, { useState } from 'react';
import { ITINERARY_DATA } from '../constants';
import { MapPin, Utensils, Bus, ShoppingBag, BedDouble, Plane, Sparkles, Map, Info } from 'lucide-react';

const IconMap = {
  food: <Utensils className="w-4 h-4" />,
  transport: <Bus className="w-4 h-4" />,
  sightseeing: <MapPin className="w-4 h-4" />,
  shopping: <ShoppingBag className="w-4 h-4" />,
  hotel: <BedDouble className="w-4 h-4" />,
  flight: <Plane className="w-4 h-4" />,
};

const ItineraryView: React.FC = () => {
  const [activeDay, setActiveDay] = useState(1);

  const currentItinerary = ITINERARY_DATA.find(d => d.day === activeDay);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Day Selector */}
      <div className="flex overflow-x-auto p-4 gap-3 bg-autumn-100/50 border-b-2 border-stone-800 border-dashed">
        {ITINERARY_DATA.map((day) => (
          <button
            key={day.day}
            onClick={() => setActiveDay(day.day)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl border-2 font-bold transition-all ${
              activeDay === day.day
                ? 'bg-autumn-300 border-stone-800 text-white shadow-sketch'
                : 'bg-white border-stone-400 text-stone-500'
            }`}
          >
            Day {day.day}
            <span className="block text-xs font-normal">{day.date.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        <h2 className="text-2xl font-bold text-stone-800 border-b-4 border-autumn-200 inline-block">
          {currentItinerary?.title}
        </h2>
        
        <div className="relative border-l-2 border-stone-400 ml-4 space-y-8">
          {currentItinerary?.events.map((event, idx) => (
            <div key={idx} className="relative pl-6">
              {/* Timeline Dot */}
              <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-stone-800 ${
                event.icon === 'food' ? 'bg-autumn-400' : 
                event.icon === 'shopping' ? 'bg-autumn-500' : 'bg-autumn-300'
              }`}></div>

              {/* Card */}
              <div className="bg-white p-3 rounded-2xl border-2 border-stone-800 shadow-sketch relative group hover:-translate-y-1 transition-transform">
                <div className="flex justify-between items-start mb-1">
                  <span className="inline-block px-2 py-0.5 bg-stone-200 rounded-md text-xs font-bold text-stone-700">
                    {event.time}
                  </span>
                  <div className="flex gap-2">
                     {event.googleMapLink && (
                       <a href={event.googleMapLink} target="_blank" rel="noreferrer" className="text-stone-400 hover:text-autumn-300 transition-colors">
                          <Map className="w-4 h-4" />
                       </a>
                     )}
                     <div className="text-stone-500">
                        {event.icon && IconMap[event.icon]}
                     </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-stone-900 leading-tight mb-1">
                  {event.activity}
                </h3>
                
                <div className="flex items-center text-stone-600 text-sm mb-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  {event.location}
                </div>
                
                {/* Description / Highlights */}
                {event.description && (
                  <div className="mt-2 text-stone-600 text-sm flex items-start gap-1 bg-stone-50 p-2 rounded-lg border border-stone-100">
                     <Info className="w-4 h-4 text-autumn-300 flex-shrink-0 mt-0.5" />
                     <span>{event.description}</span>
                  </div>
                )}

                {/* Recommended Food */}
                {event.recommendedFood && (
                  <div className="mt-2 text-stone-600 text-sm flex items-start gap-1 bg-autumn-50 p-2 rounded-lg border border-autumn-100">
                     <Utensils className="w-4 h-4 text-autumn-400 flex-shrink-0 mt-0.5" />
                     <span><span className="font-bold text-autumn-400">必點：</span>{event.recommendedFood}</span>
                  </div>
                )}

                {(event.transport || event.notes) && (
                  <div className="mt-2 pt-2 border-t border-stone-200 text-xs text-stone-500 space-y-1">
                    {event.transport && (
                      <div className="flex items-center">
                        <Bus className="w-3 h-3 mr-1 inline" /> 
                        {event.transport}
                      </div>
                    )}
                    {event.notes && (
                      <div className="italic text-autumn-400">
                        "{event.notes}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Suggestion Block */}
        {currentItinerary?.suggestion && (
          <div className="bg-stone-800 text-paper p-4 rounded-2xl shadow-sketch-lg relative mt-8">
             <div className="flex items-center gap-2 mb-2 text-autumn-300">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold">導遊小叮嚀</h3>
             </div>
             <p className="text-sm leading-relaxed opacity-90">
               {currentItinerary.suggestion}
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryView;