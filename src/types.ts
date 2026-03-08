export interface Booking {
  id?: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  kayaks: number;
  paddleBoards: number;
  duration: string;
  location: string;
  addOns: string[];
  lifeJacket: 'provided' | 'own';
  paymentMethod: 'Cash' | 'Venmo' | 'PayPal';
  guidedTourHours?: number;
  notes?: string;
  waiverSigned?: boolean;
}

export interface Waiver {
  bookingId?: number;
  name: string;
  signature: string;
}

export interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  approved: boolean;
  created_at: string;
}

export const PRICING = {
  KAYAK: {
    '2-Hour': 30,
    'Half-Day (5h)': 50,
    'Full-Day (8h)': 70,
  },
  PADDLEBOARD: {
    '1-Hour': 20,
    '2-Hour': 30,
    '3-Hour': 45,
  }
};

export const INVENTORY = {
  KAYAKS: 5, // Assuming 5 based on previous context or common sense, but prompt says 2 for paddle boards.
  PADDLEBOARDS: 2
};

export const LOCATIONS = [
  'Houghton Lake',
  'Higgins Lake',
  'Muskegon River',
  'Cut River',
  'Dead Stream',
];
