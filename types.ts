
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
  amountHKD: number; // The calculated amount in HKD (if original was TWD, this is converted)
  amountTWD: number; // The calculated amount in TWD (if original was HKD, this is converted)
  originalAmount: number; // What the user typed
  currency: 'HKD' | 'TWD'; // Currency of the original amount
  paidBy: string; // Who paid
  beneficiaries: string[]; // Who involves in this bill (for splitting)
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
