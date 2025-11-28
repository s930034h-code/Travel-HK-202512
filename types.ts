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
  amountHKD: number;
  paidBy: string;
  category: 'food' | 'transport' | 'shopping' | 'other';
  date: string;
  paymentMethod: 'cash' | 'card' | 'applepay' | 'octopus';
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