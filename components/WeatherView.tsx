import React from 'react';
import { WEATHER_DATA } from '../constants';
import { Sun, Cloud, CloudRain, Droplets } from 'lucide-react';

const WeatherView: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-6 pb-24">
      <h2 className="text-2xl font-bold text-stone-800 text-center mb-6">
        旅程天氣預報 (預測)
      </h2>
      
      <div className="grid grid-cols-1 gap-4">
        {WEATHER_DATA.map((day, idx) => (
          <div key={idx} className="bg-white rounded-2xl border-2 border-stone-800 shadow-sketch p-4 flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-autumn-500">{day.date}</div>
              <div className="text-3xl font-black text-stone-800 my-1 font-sans">{day.temp}</div>
              <div className="text-stone-500 text-sm flex items-center gap-1">
                <Droplets className="w-3 h-3" /> 濕度 {day.humidity}
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center w-20">
              {day.icon === 'sunny' && <Sun className="w-12 h-12 text-orange-400 animate-pulse" />}
              {day.icon === 'cloudy' && <Cloud className="w-12 h-12 text-gray-400" />}
              {day.icon === 'rainy' && <CloudRain className="w-12 h-12 text-blue-400" />}
              <span className="text-lg font-bold text-stone-600 mt-2">{day.condition}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-autumn-100 rounded-xl p-4 border-2 border-dashed border-autumn-300 mt-6">
        <h3 className="font-bold text-autumn-400 mb-2 text-xl">穿搭建議</h3>
        <p className="text-lg text-stone-700 leading-relaxed">
          12月的香港氣溫舒適偏涼 (15-20°C)，建議穿著長袖T恤、薄毛衣，早晚溫差大，
          務必攜帶一件防風外套或夾克。若去太平山頂或海邊，風會比較大，需注意保暖。
        </p>
      </div>
    </div>
  );
};

export default WeatherView;