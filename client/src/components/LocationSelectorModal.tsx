import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  Crosshair, 
  X, 
  Home, 
  Briefcase, 
  Navigation, 
  Plus, 
  Check, 
  Trash2,
  Building,
  Sparkles
} from 'lucide-react';
import type { DeliveryAddress } from '../types';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAddress?: DeliveryAddress | null;
  onSelectAddress: (addr: DeliveryAddress) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
}

// Popular localities by city for quick search & selection
const POPULAR_LOCALITIES: Record<string, { area: string; pincode: string }[]> = {
  'Hyderabad': [
    { area: 'Jubilee Hills, Road No. 36', pincode: '500033' },
    { area: 'Banjara Hills, Road No. 12', pincode: '500034' },
    { area: 'Madhapur, Hitech City', pincode: '500081' },
    { area: 'Gachibowli, Financial District', pincode: '500032' },
    { area: 'Kondapur, Near Botanical Garden', pincode: '500084' },
    { area: 'Kukatpally, KPHB Colony', pincode: '500072' },
    { area: 'Begumpet, Prakash Nagar', pincode: '500016' }
  ],
  'Bengaluru': [
    { area: 'Indiranagar, 100ft Road', pincode: '560038' },
    { area: 'Koramangala, 4th Block', pincode: '560034' },
    { area: 'HSR Layout, Sector 2', pincode: '560102' },
    { area: 'Whitefield, ITPL Main Road', pincode: '560066' },
    { area: 'Bellandur, Green Glen Layout', pincode: '560103' },
    { area: 'JP Nagar, 7th Phase', pincode: '560078' },
    { area: 'Malleshwaram, Margosa Road', pincode: '560003' }
  ],
  'Mumbai': [
    { area: 'Bandra West, Pali Hill', pincode: '400050' },
    { area: 'Powai, Hiranandani Gardens', pincode: '400076' },
    { area: 'Juhu, JVPD Scheme', pincode: '400049' },
    { area: 'Andheri West, Lokhandwala', pincode: '400053' },
    { area: 'Lower Parel, Senapati Bapat Marg', pincode: '400013' }
  ],
  'Delhi NCR': [
    { area: 'Gurugram CyberCity, Phase 2', pincode: '122002' },
    { area: 'Golf Course Road, DLF Phase 5', pincode: '122009' },
    { area: 'Hauz Khas, South Extension', pincode: '110016' },
    { area: 'Noida Sector 62', pincode: '201309' },
    { area: 'Indirapuram, Vaibhav Khand', pincode: '201014' }
  ],
  'Pune': [
    { area: 'Koregaon Park, North Main Road', pincode: '411001' },
    { area: 'Kothrud, Paud Road', pincode: '411038' },
    { area: 'Viman Nagar, Datta Mandir Chowk', pincode: '411014' },
    { area: 'Hinjewadi, Phase 1 IT Park', pincode: '411057' }
  ],
  'Chennai': [
    { area: 'Adyar, Gandhi Nagar', pincode: '600020' },
    { area: 'Anna Nagar, 2nd Avenue', pincode: '600040' },
    { area: 'T Nagar, G N Chetty Road', pincode: '600017' },
    { area: 'OMR, Thoraipakkam', pincode: '600097' }
  ]
};

const CITIES = ['Hyderabad', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Pune', 'Chennai'];

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  onClose,
  currentAddress,
  onSelectAddress,
  selectedCity,
  onCityChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsNotice, setGpsNotice] = useState<string | null>(null);
  const [isManualFormOpen, setIsManualFormOpen] = useState(false);

  // Manual Form State
  const [manualTag, setManualTag] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [flatNo, setFlatNo] = useState(currentAddress?.flatNo || '');
  const [building, setBuilding] = useState(currentAddress?.building || '');
  const [street, setStreet] = useState(currentAddress?.street || '');
  const [area, setArea] = useState(currentAddress?.area || '');
  const [city, setCity] = useState(selectedCity || 'Hyderabad');
  const [pincode, setPincode] = useState(currentAddress?.pincode || '');

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem('gomeat_saved_addresses');
    if (raw) {
      try {
        setSavedAddresses(JSON.parse(raw));
      } catch (e) {
        // ignore
      }
    } else {
      // Default initial addresses so user has good examples
      const initial: DeliveryAddress[] = [
        {
          id: 'addr_1',
          tag: 'Home',
          flatNo: 'Flat 402, Lotus Residency',
          building: 'Road No. 36',
          street: 'Near Jubilee Hills Checkpost',
          area: 'Jubilee Hills',
          city: 'Hyderabad',
          pincode: '500033',
          formattedAddress: 'Flat 402, Lotus Residency, Road No. 36, Jubilee Hills, Hyderabad 500033'
        },
        {
          id: 'addr_2',
          tag: 'Work',
          flatNo: 'Building 12, Floor 5',
          building: 'Raheja Mindspace IT Park',
          street: 'Hitech City Main Road',
          area: 'Madhapur',
          city: 'Hyderabad',
          pincode: '500081',
          formattedAddress: 'Building 12, Floor 5, Raheja Mindspace, Madhapur, Hyderabad 500081'
        }
      ];
      setSavedAddresses(initial);
      localStorage.setItem('gomeat_saved_addresses', JSON.stringify(initial));
    }
  }, []);

  if (!isOpen) return null;

  // Filter localities based on search query
  const allLocalities: { city: string; area: string; pincode: string }[] = [];
  Object.entries(POPULAR_LOCALITIES).forEach(([c, list]) => {
    list.forEach(item => {
      allLocalities.push({ city: c, ...item });
    });
  });

  const filteredLocalities = allLocalities.filter(loc => {
    if (!searchQuery.trim()) {
      return loc.city === (city || selectedCity);
    }
    const q = searchQuery.toLowerCase();
    return (
      loc.area.toLowerCase().includes(q) ||
      loc.city.toLowerCase().includes(q) ||
      loc.pincode.includes(q)
    );
  });

  // Handle GPS detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGpsNotice('Geolocation not supported by this browser.');
      return;
    }
    setIsDetectingGps(true);
    setGpsNotice('Accessing GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGps(false);
        // Map detected coordinates or fallback to city center
        const detectedCity = selectedCity || 'Hyderabad';
        const detectedArea = detectedCity === 'Hyderabad' ? 'Jubilee Hills Checkpost' : 'Indiranagar 100ft Road';
        const detectedPin = detectedCity === 'Hyderabad' ? '500033' : '560038';

        const newAddr: DeliveryAddress = {
          id: `addr_gps_${Date.now()}`,
          tag: 'Other',
          flatNo: 'Current Location',
          building: `Lat: ${pos.coords.latitude.toFixed(4)}, Long: ${pos.coords.longitude.toFixed(4)}`,
          street: 'Live GPS Pin Drop',
          area: detectedArea,
          city: detectedCity,
          pincode: detectedPin,
          formattedAddress: `${detectedArea}, ${detectedCity} ${detectedPin} (GPS Verified)`
        };

        onSelectAddress(newAddr);
        onCityChange(detectedCity);
        setGpsNotice('✓ Location detected via GPS!');
        setTimeout(() => {
          onClose();
        }, 800);
      },
      () => {
        setIsDetectingGps(false);
        setGpsNotice('Could not acquire GPS location. Please select or type your area below.');
      },
      { timeout: 7000 }
    );
  };

  // Handle Selecting a Quick Locality
  const handleSelectQuickLocality = (item: { city: string; area: string; pincode: string }) => {
    const newAddr: DeliveryAddress = {
      id: `addr_${Date.now()}`,
      tag: 'Home',
      flatNo: '',
      building: '',
      street: item.area,
      area: item.area.split(',')[0],
      city: item.city,
      pincode: item.pincode,
      formattedAddress: `${item.area}, ${item.city} ${item.pincode}`
    };

    onSelectAddress(newAddr);
    onCityChange(item.city);
    onClose();
  };

  // Handle Saving Manual Address
  const handleSaveManualAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!area.trim() || !city.trim() || !pincode.trim()) {
      alert('Please enter at least Area, City and Pincode.');
      return;
    }

    const parts = [flatNo, building, street, area, city, pincode].filter(Boolean);
    const formatted = parts.join(', ');

    const newAddr: DeliveryAddress = {
      id: `addr_${Date.now()}`,
      tag: manualTag,
      flatNo: flatNo.trim(),
      building: building.trim(),
      street: street.trim(),
      area: area.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      formattedAddress: formatted
    };

    // Save to list
    const updated = [newAddr, ...savedAddresses.filter(a => a.formattedAddress !== formatted)];
    setSavedAddresses(updated);
    localStorage.setItem('gomeat_saved_addresses', JSON.stringify(updated));

    onSelectAddress(newAddr);
    onCityChange(city.trim());
    setIsManualFormOpen(false);
    onClose();
  };

  // Delete saved address
  const handleDeleteAddress = (id?: string) => {
    if (!id) return;
    const updated = savedAddresses.filter(a => a.id !== id);
    setSavedAddresses(updated);
    localStorage.setItem('gomeat_saved_addresses', JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity" 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 text-gray-800 dark:text-gray-100 z-10 space-y-4 text-xs shadow-2xl animate-fade-in max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#d11243]" />
              <h3 className="font-extrabold text-gray-950 dark:text-white text-base">
                Choose Delivery Address
              </h3>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Enter your manual home or office address for express 90-min chilled delivery
            </p>
          </div>

          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">

          {/* GPS Auto-Detect Button */}
          <button
            onClick={handleDetectLocation}
            disabled={isDetectingGps}
            className="w-full p-3.5 rounded-xl border border-rose-200 dark:border-rose-950/80 bg-rose-50/60 dark:bg-rose-950/30 hover:bg-rose-100/60 text-[#d11243] dark:text-rose-400 font-bold flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Crosshair className={`w-4 h-4 text-[#d11243] ${isDetectingGps ? 'animate-spin' : ''}`} />
              <div className="text-left">
                <span className="block text-xs font-black">Use Current Location (GPS)</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-normal">
                  Auto-detect using browser geolocation
                </span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#d11243] text-white font-bold">
              GPS Detect
            </span>
          </button>

          {gpsNotice && (
            <div className="p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-[11px] text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{gpsNotice}</span>
            </div>
          )}

          {/* Search Bar for Area / Pincode */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search area, landmark, apartment, or pincode..."
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#d11243]"
            />
          </div>

          {/* City Quick Pills */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Deliver In Metro City:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CITIES.map(c => (
                <button
                  key={c}
                  onClick={() => {
                    setCity(c);
                    onCityChange(c);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                    (city || selectedCity) === c
                      ? 'bg-[#d11243] text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Button for Add Full Address Manually */}
          <div className="pt-1">
            <button
              onClick={() => setIsManualFormOpen(!isManualFormOpen)}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#d11243] text-[#d11243] dark:text-rose-400 font-bold flex items-center justify-center gap-1.5 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isManualFormOpen ? 'Hide Manual Form' : '+ Add Complete Doorstep Address Manually'}</span>
            </button>
          </div>

          {/* Manual Address Input Form */}
          {isManualFormOpen && (
            <form onSubmit={handleSaveManualAddress} className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-gray-200 dark:border-slate-700">
                <span className="font-extrabold text-xs text-gray-950 dark:text-white">
                  Customer Address Details
                </span>
                
                {/* Tag Selector */}
                <div className="flex items-center gap-1">
                  {(['Home', 'Work', 'Other'] as const).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setManualTag(tag)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        manualTag === tag
                          ? 'bg-[#d11243] text-white'
                          : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-0.5">House / Flat / Door No.</label>
                  <input
                    type="text"
                    value={flatNo}
                    onChange={(e) => setFlatNo(e.target.value)}
                    placeholder="e.g. Flat 304, Tower 2"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#d11243]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Apartment / Society</label>
                  <input
                    type="text"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    placeholder="e.g. Lotus Heights"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#d11243]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Street / Road / Landmark</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. Road No. 36, Near Peddamma Temple"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#d11243]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Area / Locality *</label>
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="Jubilee Hills"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#d11243]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-0.5">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Hyderabad"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#d11243]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="500033"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#d11243]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#d11243] hover:bg-[#b80f3b] text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs transition"
              >
                Save & Deliver Here
              </button>
            </form>
          )}

          {/* Saved Addresses List */}
          {savedAddresses.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Saved Addresses ({savedAddresses.length}):
              </span>
              <div className="space-y-2">
                {savedAddresses.map((addr) => {
                  const isSelected = currentAddress?.formattedAddress === addr.formattedAddress;
                  return (
                    <div
                      key={addr.id || addr.formattedAddress}
                      className={`p-3 rounded-xl border transition flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'border-[#d11243] bg-rose-50/50 dark:bg-rose-950/20'
                          : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gray-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div 
                        onClick={() => {
                          onSelectAddress(addr);
                          onCityChange(addr.city);
                          onClose();
                        }}
                        className="flex items-start gap-2.5 flex-1 cursor-pointer"
                      >
                        <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-[#d11243] shrink-0 mt-0.5">
                          {addr.tag === 'Home' ? <Home className="w-3.5 h-3.5" /> : addr.tag === 'Work' ? <Briefcase className="w-3.5 h-3.5" /> : <Building className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-gray-950 dark:text-white">
                              {addr.tag}
                            </span>
                            {isSelected && (
                              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2 mt-0.5 leading-relaxed">
                            {addr.formattedAddress}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            onSelectAddress(addr);
                            onCityChange(addr.city);
                            onClose();
                          }}
                          className="px-2.5 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-[#d11243] hover:text-white text-gray-800 dark:text-gray-200 rounded-lg text-[10px] font-bold cursor-pointer transition"
                        >
                          Deliver Here
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded cursor-pointer"
                          title="Remove address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filtered Area / Neighborhood Suggestions */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Suggested Neighborhoods in {city || selectedCity}:
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {filteredLocalities.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectQuickLocality(item)}
                  className="p-2.5 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/40 hover:bg-rose-50/50 dark:hover:bg-slate-800 hover:border-rose-200 dark:hover:border-slate-700 flex items-center justify-between cursor-pointer transition"
                >
                  <div className="flex items-center gap-2">
                    <Navigation className="w-3.5 h-3.5 text-gray-400" />
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white text-xs block">
                        {item.area}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {item.city} • Pincode: {item.pincode}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#d11243] font-bold">
                    Select &rarr;
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
