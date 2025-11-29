
import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, Droplets, RefreshCw, Thermometer } from 'lucide-react';

// 香港天文台 API 回傳的資料介面
interface HKOForecastItem {
  forecastDate: string; // YYYYMMDD
  week: string;
  forecastMaxtemp: { value: number; unit: 'C' | 'F' };
  forecastMintemp: { value: number; unit: 'C' | 'F' };
  forecastMaxrh: { value: number; unit: 'percent' };
  forecastMinrh: { value: number; unit: 'percent' };
  forecastWeather: string;
  forecastIcon: number;
}

interface HKOWeatherResponse {
  generalSituation: string;
  weatherForecast: HKOForecastItem[];
  updateTime: string;
}

const WeatherView: React.FC = () => {
  const [forecast, setForecast] = useState<HKOForecastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState('');

  const fetchWeather = async () => {
    setLoading(true);
    setError('');
    try {
      // 呼叫香港天文台 9天天氣預報 API (繁體中文)
      const response = await fetch('https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=fnd&lang=tc');
      if (!response.ok) throw new Error('無法取得天氣資料');
      
      const data: HKOWeatherResponse = await response.json();
      setForecast(data.weatherForecast);
      
      // 格式化更新時間
      const date = new Date();
      setLastUpdate(`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`);
      
    } catch (err) {
      console.error(err);
      setError('暫時無法連線至香港天文台');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  // 根據天文台 Icon 編號回傳對應圖示
  // 參考: https://www.hko.gov.hk/textonly/v2/explain/wxicon_e.htm
  const getWeatherIcon = (iconCode: number) => {
    if (iconCode >= 50 && iconCode <= 54) return <Sun className="w-10 h-10 text-orange-400 animate-pulse" />;
    if (iconCode >= 60 && iconCode <= 65) return <Cloud className="w-10 h-10 text-stone-400" />;
    if (iconCode >= 80 && iconCode <= 93) return <CloudRain className="w-10 h-10 text-blue-400" />;
    if (iconCode > 90) return <CloudLightning className="w-10 h-10 text-purple-500" />;
    return <Cloud className="w-10 h-10 text-stone-400" />;
  };

  // 格式化日期 (e.g., 20251212 -> 12/12)
  const formatDate = (dateStr: string) => {
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${month}/${day}`;
  };

  // 轉換星期幾 (English -> 中文)
  const translateWeek = (week: string) => {
    const map: Record<string, string> = {
      'Monday': '週一', 'Tuesday': '週二', 'Wednesday': '週三',
      'Thursday': '週四', 'Friday': '週五', 'Saturday': '週六', 'Sunday': '週日'
    };
    return map[week] || week;
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6 pb-24 font-hand">
      <div className="flex justify-between items-end mb-4 px-2">
        <div>
           <h2 className="text-2xl font-black text-stone-800 flex items-center gap-2">
             香港即時預報
             <span className="text-[10px] bg-stone-800 text-white px-1.5 py-0.5 rounded font-sans font-normal">LIVE</span>
           </h2>
           <p className="text-xs text-stone-500 mt-1">資料來源：香港天文台 (HKO)</p>
        </div>
        <button 
          onClick={fetchWeather} 
          disabled={loading}
          className="text-stone-400 hover:text-autumn-300 transition-colors flex items-center gap-1 text-xs"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          {lastUpdate ? `更新於 ${lastUpdate}` : '更新'}
        </button>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
           <div className="w-12 h-12 border-4 border-autumn-200 border-t-autumn-400 rounded-full animate-spin"></div>
           <p className="text-stone-400 animate-pulse">正在連線至香港天文台...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl text-center border border-red-200">
          {error}
          <button onClick={fetchWeather} className="block mx-auto mt-2 text-sm underline">重試</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 animate-fadeIn">
          {forecast.map((day, idx) => (
            <div key={idx} className="bg-white rounded-2xl border-2 border-stone-800 shadow-sketch p-4 flex items-center justify-between group hover:-translate-y-1 transition-transform duration-300">
              {/* Date & Week */}
              <div className="w-24 flex-shrink-0">
                <div className="text-lg font-bold text-autumn-500 font-sans">
                  {formatDate(day.forecastDate)}
                </div>
                <div className="text-sm font-bold text-stone-400">
                  {translateWeek(day.week)}
                </div>
              </div>

              {/* Temp & Humidity */}
              <div className="flex-1 px-2 flex flex-col items-center border-l border-r border-stone-100 border-dashed mx-2">
                <div className="flex items-center gap-1">
                   <Thermometer className="w-4 h-4 text-autumn-400" />
                   <span className="text-2xl font-black text-stone-800 font-sans">
                     {day.forecastMintemp.value}°-{day.forecastMaxtemp.value}°
                   </span>
                </div>
                <div className="text-stone-500 text-xs flex items-center gap-1 mt-1 font-sans">
                  <Droplets className="w-3 h-3 text-blue-400" /> 
                  {day.forecastMinrh.value}-{day.forecastMaxrh.value}%
                </div>
              </div>
              
              {/* Icon & Desc */}
              <div className="flex flex-col items-center justify-center w-20 flex-shrink-0 text-center">
                {getWeatherIcon(day.forecastIcon)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Static Info Block for December Trip */}
      <div className="bg-autumn-100/80 rounded-2xl p-5 border-2 border-dashed border-autumn-300 mt-8 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-10">
           <Sun className="w-32 h-32 text-autumn-500" />
        </div>
        <h3 className="font-bold text-autumn-500 mb-2 text-lg flex items-center gap-2 relative z-10">
           <span className="bg-autumn-400 text-white text-xs px-2 py-1 rounded-full">Note</span>
           12月旅遊穿搭建議
        </h3>
        <p className="text-stone-700 leading-relaxed text-sm relative z-10">
          雖然上方顯示的是即時天氣，但提醒您 **12月的香港** 通常氣溫舒適偏涼 (15-20°C)。
          <br/><br/>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>建議穿著：<span className="font-bold">長袖 T 恤 + 薄毛衣</span>。</li>
            <li>早晚溫差大，務必攜帶<span className="font-bold">防風外套</span>。</li>
            <li>若行程有安排太平山頂看夜景，山上風大請多帶一條圍巾。</li>
          </ul>
        </p>
      </div>
    </div>
  );
};

export default WeatherView;
