
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
  originalAmount: number; // The amount typed by user
  currency: 'HKD' | 'TWD'; // The currency typed by user
  amountHKD?: number; // Optional: stored calculated value
  amountTWD?: number; // Optional: stored calculated value
  paidBy: string; // Who paid
  beneficiaries: string[]; // Who is this bill for? (Array of names)
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
