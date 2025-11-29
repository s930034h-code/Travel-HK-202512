
import React, { useState, useEffect } from 'react';
import { Droplets, RefreshCw, Thermometer, Umbrella, Sun, Cloud, CloudRain, CloudLightning, CloudSun, CloudFog, Loader2 } from 'lucide-react';

// 香港天文台 API 回傳的資料介面
interface HKOForecastItem {
  forecastDate: string; // YYYYMMDD
  week: string;
  forecastMaxtemp: { value: number; unit: 'C' | 'F' };
  forecastMintemp: { value: number; unit: 'C' | 'F' };
  forecastMaxrh: { value: number; unit: 'percent' };
  forecastMinrh: { value: number; unit: 'percent' };
  forecastWeather: string;
  ForecastIcon: number; 
  PSR: string; // "Low", "Medium", "High" 等
}

interface HKOWeatherResponse {
  generalSituation: string;
  weatherForecast: HKOForecastItem[];
  updateTime: string;
}

// 獨立的天氣圖示元件：負責處理 "本地圖片 vs 向量圖示" 的切換邏輯
const WeatherIconDisplay: React.FC<{ iconCode: number; altText: string }> = ({ iconCode, altText }) => {
  const [imageError, setImageError] = useState(false);

  // 建構圖片路徑 (假設圖片放在 public/weather_icons/ 資料夾下)
  const imagePath = `/weather_icons/pic${iconCode}.png`;

  // 當圖片載入失敗時 (例如使用者還沒放圖片進去)，呼叫此函式切換為向量圖
  const handleImageError = () => {
    console.warn(`[WeatherIcon] 無法讀取圖片: ${imagePath}，切換為備用圖示。`);
    setImageError(true);
  };

  // 用於除錯：確認是否有收到 iconCode
  useEffect(() => {
    if (iconCode) {
      // 如果您在 Console 看到這個，代表程式碼有收到 API 的代碼，問題出在圖片路徑
      // console.log(`[WeatherIcon] 嘗試讀取: ${imagePath}`);
    }
  }, [iconCode, imagePath]);

  // 如果圖片載入失敗，回傳對應的 Lucide 向量圖示
  if (imageError || iconCode === undefined) {
    // 50: 陽光充沛 (Sunny)
    if (iconCode === 50) return <Sun className="w-12 h-12 text-orange-500 animate-pulse" />;
    
    // 51, 52: 晴時多雲/短暫陽光
    if (iconCode === 51 || iconCode === 52) return <CloudSun className="w-12 h-12 text-orange-400" />;
    
    // 53, 54: 陽光下有陣雨
    if (iconCode === 53 || iconCode === 54) return <div className="relative"><CloudSun className="w-12 h-12 text-orange-300" /><Droplets className="w-5 h-5 text-blue-400 absolute bottom-0 right-0" /></div>;

    // 60, 61: 多雲/陰天 (Cloudy)
    if (iconCode === 60 || iconCode === 61) return <Cloud className="w-12 h-12 text-stone-400" />;
    
    // 62-65: 雨 (Rain)
    if (iconCode >= 62 && iconCode <= 65) return <CloudRain className="w-12 h-12 text-blue-500" />;
    
    // 70-77: 霧/薄霧 (Fog/Mist)
    if (iconCode >= 70 && iconCode <= 77) return <CloudFog className="w-12 h-12 text-stone-300" />;
    
    // 80-89: 其他降雨相關
    if (iconCode >= 80 && iconCode <= 89) return <CloudRain className="w-12 h-12 text-blue-500" />;
    
    // 90+: 雷暴 (Thunderstorm)
    if (iconCode >= 90) return <CloudLightning className="w-12 h-12 text-purple-600 animate-pulse" />;
    
    // Default Fallback
    return <Cloud className="w-12 h-12 text-stone-300" />;
  }

  // 預設回傳本地圖片
  // 注意：這裡使用絕對路徑 /weather_icons/... 這代表圖片必須放在專案的 public 資料夾內
  return (
    <img 
      src={imagePath}
      alt={altText}
      onError={handleImageError}
      className="w-14 h-14 object-contain filter drop-shadow-sm"
      loading="lazy"
    />
  );
};

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

  // 轉換降雨機率 (PSR) 為中文文字與顏色
  const getPSRData = (psr: string) => {
    const raw = (psr || '').trim();
    const map: Record<string, { text: string, color: string, bg: string }> = {
      'Low': { text: '低', color: 'text-green-600', bg: 'bg-green-50' },
      'Medium Low': { text: '中低', color: 'text-green-700', bg: 'bg-green-100' },
      'Medium': { text: '中', color: 'text-yellow-600', bg: 'bg-yellow-50' },
      'Medium High': { text: '中高', color: 'text-orange-600', bg: 'bg-orange-50' },
      'High': { text: '高', color: 'text-red-600', bg: 'bg-red-50' }
    };
    return map[raw] || { text: raw || '無資料', color: 'text-stone-400', bg: 'bg-stone-50' };
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
           <Loader2 className="w-10 h-10 text-autumn-300 animate-spin" />
           <p className="text-stone-400 animate-pulse">正在連線至香港天文台...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl text-center border border-red-200">
          {error}
          <button onClick={fetchWeather} className="block mx-auto mt-2 text-sm underline">重試</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 animate-fadeIn">
          {forecast.map((day, idx) => {
            const psrData = getPSRData(day.PSR);
            return (
              <div key={idx} className="bg-white rounded-2xl border-2 border-stone-800 shadow-sketch p-4 flex items-center justify-between group hover:-translate-y-1 transition-transform duration-300">
                {/* Date & Week */}
                <div className="w-20 flex-shrink-0 flex flex-col justify-center">
                  <div className="text-lg font-bold text-autumn-500 font-sans leading-none mb-1">
                    {formatDate(day.forecastDate)}
                  </div>
                  <div className="text-sm font-bold text-stone-400">
                    {translateWeek(day.week)}
                  </div>
                </div>

                {/* Main Data */}
                <div className="flex-1 px-3 flex flex-col justify-center border-l border-r border-stone-100 border-dashed mx-1">
                  <div className="flex items-center gap-1 mb-2 justify-center">
                    <Thermometer className="w-4 h-4 text-autumn-400" />
                    <span className="text-2xl font-black text-stone-800 font-sans">
                      {day.forecastMintemp.value}°-{day.forecastMaxtemp.value}°
                    </span>
                  </div>
                  
                  {/* Info Rows with explicit text */}
                  <div className="flex flex-col gap-1.5 w-full text-xs font-sans">
                    
                    {/* Humidity Row */}
                    <div className="flex items-center gap-2 bg-blue-50 px-2 py-1 rounded text-stone-600">
                      <Droplets className="w-3 h-3 text-blue-400 flex-shrink-0" /> 
                      <span>濕度: {day.forecastMinrh.value}-{day.forecastMaxrh.value}%</span>
                    </div>

                    {/* Rain Probability Row - Using direct HKO text */}
                    <div className={`flex items-center gap-2 px-2 py-1 rounded ${psrData.bg} ${psrData.color} font-bold`}>
                      <Umbrella className="w-3 h-3 flex-shrink-0" />
                      <span>降雨: {psrData.text}</span>
                    </div>

                  </div>
                </div>
                
                {/* Weather Icon (Priority: Local File -> Fallback: Vector Icon) */}
                <div className="flex flex-col items-center justify-center w-16 flex-shrink-0 text-center pl-1">
                  <WeatherIconDisplay 
                    iconCode={day.ForecastIcon} 
                    altText={day.forecastWeather} 
                  />
                </div>
              </div>
            );
          })}
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
