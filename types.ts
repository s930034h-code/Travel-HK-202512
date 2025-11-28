
export interface ItineraryEvent {
  time: string;
  activity: string;
  location: string;
  transport?: string;
  notes?: string;
  icon?: 'food' | 'transport' | 'sightseeing' | 'shopping' | 'hotel' | 'flight';
  googleMapLink?: string;
  recommendedFood?: string;
  description?: string;
}

export interface DailyItinerary {
  day: number;
  date: string;
  title: string;
  suggestion: string;
  events: ItineraryEvent[];
}

export interface Expense {
  id: string;
  item: string;
  originalAmount: number; // 使用者輸入的原始金額
  currency: 'HKD' | 'TWD'; // 使用者輸入的幣別
  amountHKD?: number; // 計算後的港幣 (舊資料相容)
  amountTWD?: number; // 計算後的台幣 (舊資料相容)
  paidBy: string; // 誰付的錢
  beneficiaries: string[]; // 這筆錢是幫誰付的 (分帳用)
  category: 'food' | 'transport' | 'shopping' | 'other';
  date: string;
  paymentMethod: 'cash' | 'card' | 'applepay' | 'octopus';
  timestamp: number;
}

export interface WeatherForecast {
  date: string;
  temp: string;
  condition: string;
  icon: 'sunny' | 'cloudy' | 'rainy';
  humidity: string;
}

export interface GeneralInfo {
  flights: {
    outbound: string;
    inbound: string;
  };
  accommodation: {
    name: string;
    enName: string;
    location: string;
    description: string;
    googleMapLink: string;
  };
  tips: string[];
}
