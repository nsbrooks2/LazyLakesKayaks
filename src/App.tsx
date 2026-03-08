import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  Waves, 
  Navigation, 
  Calendar, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  Menu, 
  X, 
  ChevronRight,
  Instagram,
  Facebook,
  CheckCircle2,
  Clock,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { PRICING, LOCATIONS, Booking } from './types';

// --- Configuration for GitHub Pages ---
// Get a free Form ID from https://formspree.io/
const FORMSPREE_ID = "xwvrpgwb"; 

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";

// Fix for Leaflet default marker icons in React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// --- Components ---

const KayakIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M2 12s4-3 10-3 10 3 10 3-4 3-10 3-10-3-10-3Z" />
    <path d="M12 9v6" />
    <path d="M9 12h6" />
  </svg>
);

const Navbar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const tabs = ['Home', 'About', 'Rentals', 'Book', 'Waiver', 'FAQ', 'Contact'];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('Home')}>
            <img 
              src="https://image2url.com/r2/default/images/1772999272617-606b620d-8e94-4e92-8327-826affa471e5.png" 
              alt="Lazy Lakes Kayaks Logo" 
              className="h-12 w-auto"
              referrerPolicy="no-referrer"
            />
            <span className="font-serif text-2xl font-bold text-lake-blue tracking-tight hidden sm:block">Lazy Lakes Kayaks</span>
          </div>
          
          <div className="hidden md:flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium transition-colors hover:text-lake-blue ${
                  activeTab === tab ? 'text-lake-blue' : 'text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-t border-gray-100 px-4 py-6 space-y-4"
          >
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setIsOpen(false); }}
                className="block w-full text-left text-lg font-medium text-gray-600"
              >
                {tab}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const MapSection = () => {
  const houghtonLake: [number, number] = [44.3083, -84.7684];
  const higginsLake: [number, number] = [44.4333, -84.7167];
  const cutRiver: [number, number] = [44.3667, -84.7833];
  
  return (
    <section className="py-24 bg-sand/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl mb-4 text-lake-blue">Explore the Lakes</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We serve the beautiful Houghton Lake and Higgins Lake areas. Check out our primary drop-off locations and paddling routes.
          </p>
        </div>
        
        <div className="h-[500px] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
          <MapContainer center={[44.37, -84.74]} zoom={11} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={houghtonLake}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lake-blue">Houghton Lake</h3>
                  <p className="text-sm">Michigan's largest inland lake. Great for families and fishing.</p>
                </div>
              </Popup>
            </Marker>
            <Marker position={higginsLake}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lake-blue">Higgins Lake</h3>
                  <p className="text-sm">Crystal clear water and sandy bottoms. Perfect for paddle boarding.</p>
                </div>
              </Popup>
            </Marker>
            <Marker position={cutRiver}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lake-blue">Cut River</h3>
                  <p className="text-sm">A peaceful, winding river connecting the lakes. Ideal for a relaxing float.</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="flex items-start gap-4 p-6 rounded-3xl bg-white shadow-sm">
            <div className="bg-lake-blue/10 p-3 rounded-2xl text-lake-blue">
              <MapPin size={24} />
            </div>
            <div>
              <h4 className="font-bold mb-1">Houghton Lake</h4>
              <p className="text-sm text-gray-500">Multiple drop-off points available along the north and south shores.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 rounded-3xl bg-white shadow-sm">
            <div className="bg-lake-blue/10 p-3 rounded-2xl text-lake-blue">
              <MapPin size={24} />
            </div>
            <div>
              <h4 className="font-bold mb-1">Higgins Lake</h4>
              <p className="text-sm text-gray-500">Serving both North and South State Parks and local access points.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 rounded-3xl bg-white shadow-sm">
            <div className="bg-lake-blue/10 p-3 rounded-2xl text-lake-blue">
              <MapPin size={24} />
            </div>
            <div>
              <h4 className="font-bold mb-1">Cut River</h4>
              <p className="text-sm text-gray-500">The best spot for a scenic 2-3 hour river trip through the woods.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const WeatherWidget = () => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Using a public weather API (Open-Meteo) which doesn't require a key for basic usage
    // Coordinates for Houghton Lake, MI: 44.3083° N, 84.7684° W
    fetch('https://api.open-meteo.com/v1/forecast?latitude=44.3083&longitude=-84.7684&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FNew_York')
      .then(res => res.json())
      .then(data => {
        setWeather(data.current);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse bg-white/10 h-24 rounded-2xl w-full"></div>;
  if (!weather) return null;

  const getWeatherIcon = (code: number) => {
    if (code === 0) return '☀️';
    if (code <= 3) return '🌤️';
    if (code <= 48) return '🌫️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '❄️';
    if (code <= 82) return '🌦️';
    return '⛈️';
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-white/20 bg-white/5 backdrop-blur-sm text-white flex items-center justify-between">
      <div>
        <div className="text-xs uppercase tracking-widest opacity-60 mb-1">Current Conditions</div>
        <div className="text-sm font-bold">Houghton Lake, MI</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-4xl">{getWeatherIcon(weather.weather_code)}</div>
        <div className="text-right">
          <div className="text-3xl font-serif">{Math.round(weather.temperature_2m)}°F</div>
          <div className="text-xs opacity-80">{weather.wind_speed_10m} mph wind</div>
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  const faqs = [
    {
      q: "What should I bring for my rental?",
      a: "We recommend bringing sunscreen, water, a towel, and a waterproof bag for your valuables. If you're paddling the Cut River, a hat and bug spray are also helpful!"
    },
    {
      q: "Do I need to be an experienced paddler?",
      a: "Not at all! Our kayaks and paddle boards are specifically chosen for their stability and ease of use, making them perfect for beginners and families."
    },
    {
      q: "What is your weather policy?",
      a: "Safety is our priority. If conditions are unsafe (high winds, lightning, or heavy rain), we will work with you to reschedule your rental or provide a full refund."
    },
    {
      q: "Is there an age limit?",
      a: "Children are welcome but must be accompanied by an adult. All paddlers must be able to properly fit into one of our provided life jackets or bring their own properly-fitting life jacket."
    },
    {
      q: "Where do we meet for the rental?",
      a: "We serve Houghton Lake and Higgins Lake. Once your booking is confirmed, we will coordinate the exact drop-off and pick-up location based on your preference and water conditions."
    },
    {
      q: "How do I pay for my rental?",
      a: "We accept Cash, Venmo, and PayPal. Payment is handled at the time of your rental, along with the required $100 deposit or driver's license hold."
    }
  ];

  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-4">
      <h1 className="font-serif text-5xl mb-12 text-center text-lake-blue">Frequently Asked Questions</h1>
      <div className="space-y-6">
        {faqs.map((faq, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="glass-card p-8 rounded-3xl border border-gray-100"
          >
            <h3 className="text-xl font-bold mb-3 text-lake-blue">{faq.q}</h3>
            <p className="text-gray-600 leading-relaxed">{faq.a}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Footer = ({ setActiveTab }: { setActiveTab: (t: string) => void }) => (
  <footer className="bg-lake-blue text-white py-16">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <img 
            src="https://image2url.com/r2/default/images/1772999272617-606b620d-8e94-4e92-8327-826affa471e5.png" 
            alt="Lazy Lakes Kayaks Logo" 
            className="h-16 w-auto brightness-0 invert"
            referrerPolicy="no-referrer"
          />
          <h3 className="font-serif text-2xl">Lazy Lakes Kayaks</h3>
        </div>
        <p className="text-blue-100/80 mb-6">
          Single-owner business operated by Nick Brooks. Serving the Houghton Lake & Higgins Lake area.
        </p>
        <div className="flex gap-4">
          <Instagram className="w-6 h-6 cursor-pointer hover:text-sunset-orange transition-colors" />
          <Facebook className="w-6 h-6 cursor-pointer hover:text-sunset-orange transition-colors" />
        </div>
      </div>
      <div>
        <h4 className="font-bold mb-4 uppercase tracking-widest text-sm">Contact</h4>
        <ul className="space-y-2 text-blue-100/80">
          <li className="flex items-center gap-2"><Phone size={16}/> 630-528-8103</li>
          <li className="flex items-center gap-2"><Mail size={16}/> lazylakeskayaks@yahoo.com</li>
          <li className="flex items-center gap-2"><MapPin size={16}/> Houghton Lake / Higgins Lake, MI</li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-4 uppercase tracking-widest text-sm">Payments</h4>
        <p className="text-blue-100/80 mb-4">We accept Cash, Venmo, and PayPal only.</p>
        <div className="flex justify-between items-end mt-8 border-t border-white/10 pt-8">
          <p className="text-xs text-blue-100/40">© 2026 Lazy Lakes Kayaks. All rights reserved.</p>
        </div>
      </div>
    </div>
  </footer>
);

// --- Pages ---

const Home = ({ onBook }: { onBook: () => void }) => {
  return (
    <div className="pt-20">
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://image2url.com/r2/default/images/1772999509698-c69d941d-9688-48f7-9fc1-a29a4fba81d7.jpg"
            alt="Houghton Lake Background"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-6xl md:text-8xl mb-6 drop-shadow-2xl"
          >
            Lazy Lakes Kayaks
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-3xl mb-12 font-light max-w-2xl drop-shadow-lg"
          >
            Beginner-friendly kayak and paddle board rentals in the heart of Michigan's lake country.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
          >
            <button onClick={onBook} className="btn-secondary text-xl px-12 py-4 bg-white text-lake-blue hover:bg-lake-blue hover:text-white border-none transition-all duration-300 shadow-xl">
              Book Your Kayak Today
            </button>
            <a href="tel:630-528-8103" className="btn-primary text-xl px-12 py-4 bg-transparent border-2 border-white text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
              Call or Text Now
            </a>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="max-w-md mx-auto w-full"
          >
            <WeatherWidget />
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl mb-6 text-lake-blue">Welcome to the Water</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            Lazy Lakes Kayaks is your gateway to the serene beauty of Houghton Lake, Higgins Lake, and the winding rivers of Northern Michigan. Established in Houghton Lake, we offer premium kayak and paddle board rentals for all skill levels. Whether you're looking for a peaceful morning float on the Cut River or a sunset paddle on the crystal-clear waters of Higgins Lake, we've got you covered.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {LOCATIONS.map(loc => (
              <div key={loc} className="flex items-center gap-2 text-river-green font-medium">
                <CheckCircle2 size={18} /> {loc}
              </div>
            ))}
          </div>
        </div>
      </section>

      <MapSection />
    </div>
  );
};

const About = () => (
  <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 text-center">
    <img 
      src="https://image2url.com/r2/default/images/1772999272617-606b620d-8e94-4e92-8327-826affa471e5.png" 
      alt="Lazy Lakes Kayaks Logo" 
      className="w-32 h-auto mx-auto mb-8"
      referrerPolicy="no-referrer"
    />
    <h1 className="font-serif text-5xl mb-12 text-lake-blue">Our Story</h1>
    <div className="space-y-6 text-lg text-gray-600 leading-relaxed text-left max-w-2xl mx-auto">
      <p>
        Lazy Lakes Kayaks is a small, locally-owned, single-owner business operated by <strong>Nick Brooks</strong>. What started as a personal passion for the peaceful waters of Northern Michigan has grown into a dedicated service helping others experience the same tranquility.
      </p>
      <p>
        We specialize in beginner-friendly kayaks that are stable and easy to maneuver. Our goal isn't just to rent equipment; it's to provide a relaxing experience where you can connect with nature, spot wildlife, and enjoy the legendary Michigan sunsets.
      </p>
      <p>
        As a small operation, we take pride in personal service. We provide life jackets with every rental, but we also encourage guests to bring their own if they prefer a specific fit or size.
      </p>
    </div>
  </div>
);

const Rentals = ({ onBook }: { onBook: () => void }) => (
  <div className="pt-32 pb-24 max-w-7xl mx-auto px-4">
    <h1 className="font-serif text-5xl mb-16 text-center text-lake-blue">Rental Options</h1>
    
    <div className="mb-24">
      <h2 className="font-serif text-3xl mb-8 text-lake-blue border-b border-lake-blue/10 pb-4">Kayak Rentals</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(PRICING.KAYAK).map(([duration, price]) => (
          <div key={duration} className="glass-card p-8 rounded-3xl text-center flex flex-col items-center">
            <Clock className="text-sunset-orange w-12 h-12 mb-4" />
            <h3 className="text-2xl font-bold mb-2">{duration}</h3>
            <div className="text-4xl font-serif text-lake-blue mb-6">${price}</div>
            <ul className="text-gray-500 space-y-2 mb-8 text-left w-full">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-river-green"/> Stable Kayak</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-river-green"/> Lightweight Paddle</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-river-green"/> Life Jacket Included</li>
            </ul>
            <button onClick={onBook} className="btn-primary w-full mt-auto">Select Plan</button>
          </div>
        ))}
      </div>
    </div>

    <div className="mb-24">
      <h2 className="font-serif text-3xl mb-8 text-lake-blue border-b border-lake-blue/10 pb-4">Paddle Board Rentals</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(PRICING.PADDLEBOARD).map(([duration, price]) => (
          <div key={duration} className="glass-card p-8 rounded-3xl text-center flex flex-col items-center border-river-green/20">
            <Waves className="text-river-green w-12 h-12 mb-4" />
            <h3 className="text-2xl font-bold mb-2">{duration}</h3>
            <div className="text-4xl font-serif text-lake-blue mb-6">${price}</div>
            <ul className="text-gray-500 space-y-2 mb-8 text-left w-full">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-river-green"/> Premium Paddle Board</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-river-green"/> Adjustable Paddle</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-river-green"/> Life Jacket Included</li>
            </ul>
            <button onClick={onBook} className="btn-primary w-full mt-auto bg-river-green hover:bg-river-green/90">Select Plan</button>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-river-green text-white p-12 rounded-[3rem] grid grid-cols-1 md:grid-cols-2 gap-12">
      <div>
        <h2 className="font-serif text-3xl mb-6">Booking Requirements</h2>
        <ul className="space-y-4">
          <li className="flex gap-4">
            <div className="bg-white/20 p-2 rounded-lg h-fit"><DollarSign /></div>
            <div>
              <p className="font-bold">Deposit Required</p>
              <p className="text-green-100/80">$100 refundable deposit OR valid driver’s license hold required for all rentals.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="bg-white/20 p-2 rounded-lg h-fit"><ShieldCheck /></div>
            <div>
              <p className="font-bold">Waiver & Safety</p>
              <p className="text-green-100/80">Rentals are only confirmed after the liability waiver is signed and submitted.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="bg-white/20 p-2 rounded-lg h-fit"><Navigation /></div>
            <div>
              <p className="font-bold">Payment Methods</p>
              <p className="text-green-100/80">We accept Cash, Venmo, and PayPal.</p>
            </div>
          </li>
        </ul>
      </div>
      <div className="bg-white/10 p-8 rounded-3xl border border-white/10">
        <h3 className="text-xl font-bold mb-4">Optional Add-Ons</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <span>Dry Bags (Keep your phone safe)</span>
            <span className="font-bold">+$5</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <span>Small Cooler (Fits 6 cans)</span>
            <span className="font-bold">+$10</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Guided Tour / Ride with Nick</span>
            <span className="font-bold">+$15/hr</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const BookingForm = ({ onComplete, formData, setFormData }: { onComplete: () => void, formData: Partial<Booking>, setFormData: (d: any) => void }) => {
  const getDurationHours = (d: string) => {
    if (d === '1-Hour') return 1;
    if (d === '2-Hour') return 2;
    if (d === '3-Hour') return 3;
    if (d === 'Half-Day (5h)') return 5;
    if (d === 'Full-Day (8h)') return 8;
    return 0;
  };

  const calculateTotal = () => {
    let total = 0;
    if (formData.duration) {
      if (formData.kayaks! > 0) {
        const kayakPrice = (PRICING.KAYAK as any)[formData.duration] || 0;
        total += kayakPrice * formData.kayaks!;
      }
      if (formData.paddleBoards! > 0) {
        const pbPrice = (PRICING.PADDLEBOARD as any)[formData.duration] || 0;
        total += pbPrice * formData.paddleBoards!;
      }
    }
    
    formData.addOns?.forEach(addon => {
      if (addon.includes('+$5')) total += 5;
      if (addon.includes('+$10')) total += 10;
    });
    if (formData.guidedTourHours) {
      total += formData.guidedTourHours * 15;
    }
    return total;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete();
  };

  return (
    <div className="pt-32 pb-24 max-w-3xl mx-auto px-4">
      <div className="glass-card p-8 md:p-12 rounded-[2.5rem] shadow-xl">
        <img 
          src="https://image2url.com/r2/default/images/1772999272617-606b620d-8e94-4e92-8327-826affa471e5.png" 
          alt="Lazy Lakes Kayaks Logo" 
          className="w-20 h-auto mb-6"
          referrerPolicy="no-referrer"
        />
        <h1 className="font-serif text-4xl mb-4 text-lake-blue">Book Your Adventure</h1>
        <p className="text-gray-500 mb-8">Fill out the details below to request your rental.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Full Name</label>
              <input 
                required
                type="text" 
                className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-lake-blue outline-none"
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Phone Number</label>
              <input 
                required
                type="tel" 
                className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-lake-blue outline-none"
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Email Address</label>
            <input 
              required
              type="email" 
              className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-lake-blue outline-none"
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Date</label>
              <input 
                required
                type="date" 
                className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-lake-blue outline-none"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Time</label>
              <select 
                required
                className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-lake-blue outline-none"
                onChange={e => setFormData({...formData, time: e.target.value})}
              >
                <option value="">Select Time</option>
                <option value="08:00 AM">08:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="06:00 PM">06:00 PM</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Number of Kayaks</label>
              <input 
                type="number" 
                min="0" 
                max="5"
                className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-lake-blue outline-none"
                value={formData.kayaks}
                onChange={e => setFormData({...formData, kayaks: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Number of Paddle Boards</label>
              <input 
                type="number" 
                min="0" 
                max="2"
                className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-lake-blue outline-none"
                value={formData.paddleBoards}
                onChange={e => setFormData({...formData, paddleBoards: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Location</label>
              <select 
                className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-lake-blue outline-none"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              >
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Duration</label>
              <select 
                className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-lake-blue outline-none"
                value={formData.duration}
                onChange={e => {
                  const newDuration = e.target.value;
                  const newHours = formData.guidedTourHours ? getDurationHours(newDuration) : 0;
                  setFormData({...formData, duration: newDuration, guidedTourHours: newHours});
                }}
              >
                {Array.from(new Set([
                  ...Object.keys(PRICING.KAYAK),
                  ...Object.keys(PRICING.PADDLEBOARD)
                ])).sort((a, b) => getDurationHours(a) - getDurationHours(b)).map(d => {
                  const hasKayak = (PRICING.KAYAK as any)[d];
                  const hasPB = (PRICING.PADDLEBOARD as any)[d];
                  const isAvailable = (formData.kayaks! > 0 ? hasKayak : true) && (formData.paddleBoards! > 0 ? hasPB : true);
                  
                  return (
                    <option key={d} value={d} disabled={!isAvailable}>
                      {d} {!isAvailable ? '(N/A for selection)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Payment Method</label>
              <select 
                className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-lake-blue outline-none"
                value={formData.paymentMethod}
                onChange={e => setFormData({...formData, paymentMethod: e.target.value as any})}
              >
                <option value="Cash">Cash</option>
                <option value="Venmo">Venmo</option>
                <option value="PayPal">PayPal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Optional Add-ons</label>
            <div className="flex flex-wrap gap-4">
              {['Dry Bag (+$5)', 'Small Cooler (+$10)'].map(addon => (
                <label key={addon} className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                  <input 
                    type="checkbox" 
                    checked={formData.addOns?.includes(addon)}
                    onChange={e => {
                      const current = formData.addOns || [];
                      if (e.target.checked) {
                        setFormData({...formData, addOns: [...current, addon]});
                      } else {
                        setFormData({...formData, addOns: current.filter(a => a !== addon)});
                      }
                    }}
                  />
                  <span className="text-sm">{addon}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Life Jacket Choice</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="lifeJacket" 
                  value="provided" 
                  checked={formData.lifeJacket === 'provided'}
                  onChange={() => setFormData({...formData, lifeJacket: 'provided'})}
                />
                <span>Provided by us</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="lifeJacket" 
                  value="own" 
                  checked={formData.lifeJacket === 'own'}
                  onChange={() => setFormData({...formData, lifeJacket: 'own'})}
                />
                <span>Bringing my own</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-4 uppercase tracking-wide">Guided Tour / Ride with Nick</label>
            <div className={`p-6 rounded-2xl border transition-all ${formData.guidedTourHours ? 'bg-lake-blue/10 border-lake-blue' : 'bg-lake-blue/5 border-lake-blue/10'}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <input 
                    type="checkbox" 
                    id="guidedTour"
                    className="w-6 h-6 rounded-lg border-gray-300 text-lake-blue focus:ring-lake-blue cursor-pointer"
                    checked={!!formData.guidedTourHours}
                    onChange={e => {
                      const hours = e.target.checked ? getDurationHours(formData.duration || '2-Hour') : 0;
                      setFormData({...formData, guidedTourHours: hours});
                    }}
                  />
                  <label htmlFor="guidedTour" className="cursor-pointer">
                    <p className="font-bold text-lake-blue">Add Guided Tour with Nick</p>
                    <p className="text-sm text-gray-500">Nicholas Brooks will guide your group for the full {getDurationHours(formData.duration || '2-Hour')} hours. $15 per hour.</p>
                  </label>
                </div>
                {formData.guidedTourHours ? (
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-widest opacity-60">Tour Cost</p>
                    <p className="font-bold text-lake-blue">+${formData.guidedTourHours * 15}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Optional Notes</label>
            <textarea 
              placeholder="Preferred routes, skill level, or special requests..."
              className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-lake-blue outline-none"
              rows={3}
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            ></textarea>
          </div>

          <div className="bg-lake-blue text-white p-6 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-sm uppercase tracking-widest opacity-80">Estimated Total</p>
              <p className="text-xs opacity-60">Pay at time of rental</p>
            </div>
            <div className="text-3xl font-serif">${calculateTotal()}</div>
          </div>

          <button 
            type="submit" 
            className="btn-secondary w-full text-lg py-4"
          >
            Continue to Waiver
          </button>
        </form>
      </div>
    </div>
  );
};

const Waiver = ({ formData, onComplete }: { formData: Partial<Booking>, onComplete: () => void }) => {
  const [signed, setSigned] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);

  const clearSignature = () => {
    sigCanvas.current?.clear();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signed || !name || sigCanvas.current?.isEmpty()) {
      alert('Please complete all signature requirements.');
      return;
    }
    setLoading(true);
    try {
      const signatureData = sigCanvas.current?.getCanvas().toDataURL('image/png');
      
      // Combine all data for Formspree
      const submissionData = {
        ...formData,
        waiver_name: name,
        waiver_signature_image: signatureData,
        _replyto: formData.email,
        _subject: `New Booking Request: ${formData.name} (${formData.date})`,
      };

      console.log('Sending submission to Formspree:', submissionData);

      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });

      if (res.ok) {
        onComplete();
      } else {
        const errorData = await res.json();
        console.error('Formspree Error:', errorData);
        throw new Error(errorData.error || 'Failed to send to Formspree');
      }
    } catch (err: any) {
      console.error('Submission Error:', err);
      alert(`Failed to submit booking: ${err.message || 'Please check your internet connection.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 max-w-3xl mx-auto px-4">
      <div className="glass-card p-8 md:p-12 rounded-[2.5rem] shadow-xl">
        <h1 className="font-serif text-4xl mb-6 text-lake-blue">Liability Waiver</h1>
        <div className="bg-gray-50 p-6 rounded-2xl h-96 overflow-y-auto mb-8 text-sm text-gray-600 space-y-4 border border-gray-200">
          <p className="font-bold text-gray-900 text-center text-lg">RELEASE OF LIABILITY, WAIVER OF CLAIMS, ASSUMPTION OF RISKS AND INDEMNITY AGREEMENT</p>
          <p className="font-bold text-red-600">BY SIGNING THIS DOCUMENT YOU WILL WAIVE CERTAIN LEGAL RIGHTS, INCLUDING THE RIGHT TO SUE OR CLAIM COMPENSATION FOLLOWING AN ACCIDENT. PLEASE READ CAREFULLY!</p>
          
          <p>
            <strong>TO:</strong> Lazy Lakes Kayaks, Nicholas Brooks, and their respective owners, operators, agents, employees, volunteers, independent contractors, representatives, successors and assigns (hereinafter collectively referred to as the "RELEASEES").
          </p>

          <p>
            <strong>DEFINITION:</strong> In this agreement, the term "Kayaking Activities" shall include all activities, services and use of equipment provided, arranged, or organized by the Releasees, including but not limited to: kayak rentals, paddling, transportation, orientation, and all other related activities.
          </p>

          <p>
            <strong>ASSUMPTION OF RISKS:</strong> I am aware that Kayaking Activities involve many risks, dangers and hazards including, but not limited to: accidents which occur during transportation or travel to and from the water; changing weather conditions; high winds; waves; currents; capsizing; drowning; hypothermia; collisions with watercraft, rocks, logs, or other objects; wildlife encounters; physical exertion; and negligence on the part of the Releasees. I freely accept and fully assume all such risks, dangers and hazards and the possibility of personal injury, death, property damage or loss resulting therefrom.
          </p>

          <p>
            <strong>RELEASE OF LIABILITY, WAIVER OF CLAIMS AND INDEMNITY AGREEMENT:</strong> In consideration of the Releasees allowing me to participate in Kayaking Activities and permitting my use of their equipment, I hereby agree as follows:
          </p>

          <ol className="list-decimal pl-5 space-y-2">
            <li><strong>TO WAIVE ANY AND ALL CLAIMS</strong> that I have or may in the future have against the Releasees and <strong>TO RELEASE THE RELEASEES</strong> from any and all liability for any loss, damage, expense or injury including death that I may suffer, or that my next of kin may suffer, as a result of my participation in Kayaking Activities, <strong>DUE TO ANY CAUSE WHATSOEVER, INCLUDING NEGLIGENCE, BREACH OF CONTRACT, OR BREACH OF ANY STATUTORY OR OTHER DUTY OF CARE</strong> on the part of the Releasees.</li>
            <li><strong>TO HOLD HARMLESS AND INDEMNIFY THE RELEASEES</strong> from any and all liability for any property damage or personal injury to any third party resulting from my participation in Kayaking Activities.</li>
            <li>This Agreement shall be effective and binding upon my heirs, next of kin, executors, administrators, assigns and representatives, in the event of my death or incapacity.</li>
            <li>This Agreement and any rights, duties and obligations as between the parties to this Agreement shall be governed by and interpreted solely in accordance with the laws of the State of Michigan.</li>
          </ol>

          <p>
            <strong>SAFETY & CONDUCT:</strong> I agree to wear a life jacket at all times while on the water. I agree not to consume alcohol or drugs while operating the rental equipment. I am responsible for any damage to the equipment beyond normal wear and tear.
          </p>

          <p>
            <strong>DEPOSIT & PAYMENT:</strong> I understand a $100 deposit or driver’s license hold is required. Payments are accepted via Cash, Venmo, or PayPal.
          </p>

          <p className="bg-lake-blue/5 p-4 rounded-xl border border-lake-blue/10">
            <strong>GUIDED TOUR NOTICE:</strong> Guided tour involves paddling with the owner, Nicholas Brooks. You assume all risk associated with the guided activity.
          </p>

          <p className="font-bold">I CONFIRM THAT I HAVE READ AND UNDERSTOOD THIS AGREEMENT PRIOR TO SIGNING IT, AND I AM AWARE THAT BY SIGNING THIS AGREEMENT I AM WAIVING CERTAIN LEGAL RIGHTS WHICH I OR MY HEIRS, NEXT OF KIN, EXECUTORS, ADMINISTRATORS, ASSIGNS AND REPRESENTATIVES MAY HAVE AGAINST THE RELEASEES.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wide">1. Typed Signature (Full Legal Name)</label>
            <input 
              required
              type="text" 
              className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-lake-blue outline-none italic font-serif text-xl"
              placeholder="Type your name to sign"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wide">2. Virtual Signature (Draw Below)</label>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
              <SignatureCanvas 
                ref={sigCanvas}
                penColor='black'
                canvasProps={{
                  className: 'w-full h-40 cursor-crosshair'
                }}
              />
            </div>
            <button 
              type="button" 
              onClick={clearSignature}
              className="mt-2 text-xs text-lake-blue font-bold uppercase tracking-widest hover:underline"
            >
              Clear Signature
            </button>
          </div>

          <div className="bg-lake-blue/5 p-6 rounded-2xl border border-lake-blue/10">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="mt-1 w-5 h-5 rounded border-gray-300 text-lake-blue focus:ring-lake-blue"
                checked={signed}
                onChange={e => setSigned(e.target.checked)}
              />
              <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                I acknowledge that I have read and agree to the terms of the liability waiver and rental agreement.
              </span>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={!signed || !name || loading}
            className="btn-primary w-full text-lg py-4 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Submitting...' : (
              <>
                <CheckCircle2 size={20} />
                I Agree & Confirm Booking
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const Contact = () => (
  <div className="pt-32 pb-24 max-w-7xl mx-auto px-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
      <div>
        <h1 className="font-serif text-5xl mb-8 text-lake-blue">Get in Touch</h1>
        <p className="text-gray-600 text-lg mb-12">
          Have questions about routes, availability, or special requests? Drop us a message or give us a call. We're here to help you plan your perfect day on the water.
        </p>
        
        <div className="space-y-8">
          <div className="flex gap-6">
            <div className="bg-lake-blue/10 p-4 rounded-2xl text-lake-blue"><Phone /></div>
            <div>
              <p className="font-bold">Call or Text</p>
              <p className="text-gray-500">630-528-8103</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="bg-lake-blue/10 p-4 rounded-2xl text-lake-blue"><Mail /></div>
            <div>
              <p className="font-bold">Email</p>
              <p className="text-gray-500">lazylakeskayaks@yahoo.com</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="bg-lake-blue/10 p-4 rounded-2xl text-lake-blue"><MapPin /></div>
            <div>
              <p className="font-bold">Service Area</p>
              <p className="text-gray-500">Houghton Lake / Higgins Lake, MI</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="glass-card p-8 rounded-[2.5rem] shadow-xl">
        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 uppercase">Name</label>
              <input type="text" className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-lake-blue" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 uppercase">Phone</label>
              <input type="tel" className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-lake-blue" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 uppercase">Email</label>
            <input type="email" className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-lake-blue" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 uppercase">Message</label>
            <textarea rows={4} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-lake-blue"></textarea>
          </div>
          <button type="button" className="btn-primary w-full">Send Message</button>
        </form>
      </div>
    </div>
  </div>
);

const Success = ({ onReset }: { onReset: () => void }) => (
  <div className="pt-32 pb-24 max-w-2xl mx-auto px-4 text-center">
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="glass-card p-12 rounded-[3rem] shadow-2xl"
    >
      <img 
        src="https://image2url.com/r2/default/images/1772999272617-606b620d-8e94-4e92-8327-826affa471e5.png" 
        alt="Lazy Lakes Kayaks Logo" 
        className="w-24 h-auto mx-auto mb-8"
        referrerPolicy="no-referrer"
      />
      <div className="bg-river-green/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 text-river-green">
        <CheckCircle2 size={48} />
      </div>
      <h1 className="font-serif text-4xl mb-4 text-lake-blue">Booking Received!</h1>
      <p className="text-gray-600 text-lg mb-8">
        Thank you for choosing Lazy Lakes Kayaks. Nicholas will reach out shortly to finalize the details.
      </p>
      
      <div className="bg-lake-blue/5 p-6 rounded-2xl mb-8 text-left border border-lake-blue/10">
        <p className="font-bold text-lake-blue mb-2">Have Questions?</p>
        <p className="text-sm text-gray-600 mb-4">
          Feel free to reach out to us directly:
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-lake-blue/10 p-2 rounded-lg text-lake-blue"><Phone size={16} /></div>
            <p className="text-sm font-medium">630-528-8103</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-lake-blue/10 p-2 rounded-lg text-lake-blue"><Mail size={16} /></div>
            <p className="text-sm font-medium">lazylakeskayaks@yahoo.com</p>
          </div>
        </div>
      </div>

      <div className="bg-sunset-orange/5 p-6 rounded-2xl mb-8 text-left border border-sunset-orange/10">
        <p className="font-bold text-sunset-orange mb-2">Important Reminders:</p>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• Bring a valid ID for the deposit hold.</li>
          <li>• Payment is accepted via Cash, Venmo, or PayPal.</li>
          <li>• Arrive 15 minutes early for safety briefing.</li>
        </ul>
      </div>
      <button onClick={onReset} className="btn-primary">Back to Home</button>
    </motion.div>
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [formData, setFormData] = useState<Partial<Booking>>({
    kayaks: 0,
    paddleBoards: 0,
    duration: '2-Hour',
    location: 'Houghton Lake',
    addOns: [],
    lifeJacket: 'provided',
    paymentMethod: 'Cash',
    guidedTourHours: 0,
    notes: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'Home': return <Home onBook={() => setActiveTab('Book')} />;
      case 'About': return <About />;
      case 'Rentals': return <Rentals onBook={() => setActiveTab('Book')} />;
      case 'Book': return <BookingForm formData={formData} setFormData={setFormData} onComplete={() => setActiveTab('Waiver')} />;
      case 'Waiver': return <Waiver formData={formData} onComplete={() => setActiveTab('Success')} />;
      case 'FAQ': return <FAQ />;
      case 'Contact': return <Contact />;
      case 'Success': return <Success onReset={() => {
        setFormData({
          kayaks: 0,
          paddleBoards: 0,
          duration: '2-Hour',
          location: 'Houghton Lake',
          addOns: [],
          lifeJacket: 'provided',
          paymentMethod: 'Cash',
          guidedTourHours: 0,
          notes: '',
          date: format(new Date(), 'yyyy-MM-dd')
        });
        setActiveTab('Home');
      }} />;
      default: return <Home onBook={() => setActiveTab('Book')} />;
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
