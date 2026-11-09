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

// Helper function to smartly format and deduplicate Indian addresses (Swiggy / Zomato standard)
const formatIndianGpsAddress = (addr: any, fallbackCity: string) => {
  const road = (addr.road || addr.pedestrian || addr.street || addr.residential || '').trim();
  const locality = (addr.suburb || addr.neighbourhood || addr.subdistrict || addr.hamlet || '').trim();
  const countyRaw = (addr.county || '').replace(/\s+mandal\b/i, '').trim();
  const city = (addr.city || addr.town || addr.village || addr.municipality || addr.state_district || countyRaw || fallbackCity || 'Hyderabad').trim();
  const state = (addr.state || 'Telangana').trim();
  const pincode = (addr.postcode || (city.toLowerCase().includes('hyderabad') ? '500033' : '')).trim();

  // Determine cleanest primary area name
  let areaName = road || locality;
  if (!areaName) {
    if (countyRaw && countyRaw.toLowerCase() !== city.toLowerCase()) {
      areaName = countyRaw;
    } else {
      areaName = city;
    }
  }

  // Deduplicate parts cleanly:
  const parts: string[] = [];
  const seen = new Set<string>();
  const addPart = (text?: string) => {
    if (!text) return;
    const clean = text.trim();
    if (!clean) return;
    const lower = clean.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      parts.push(clean);
    }
  };

  addPart(road);
  addPart(locality);
  if (countyRaw && countyRaw.toLowerCase() !== city.toLowerCase()) {
    addPart(countyRaw);
  }
  addPart(city);
  if (pincode) addPart(pincode);
  if (state && !seen.has(state.toLowerCase())) addPart(state);

  const cleanFormatted = parts.join(', ');

  const newAddr: DeliveryAddress = {
    id: `addr_gps_${Date.now()}`,
    tag: 'Other',
    flatNo: '',
    building: areaName,
    street: road || locality || areaName,
    area: areaName,
    city: city,
    state: state,
    pincode: pincode,
    formattedAddress: cleanFormatted
  };

  return { newAddr, areaName, city, cleanFormatted };
};

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

  // Live Swiggy/Zomato-style Places Search Autocomplete
  const [livePlaces, setLivePlaces] = useState<{
    id: string;
    name: string;
    area: string;
    city: string;
    pincode: string;
    street: string;
    formattedAddress: string;
  }[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);

  // Debounced search for places/apartments/colonies across India using OpenStreetMap Nominatim
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setLivePlaces([]);
      setIsSearchingPlaces(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPlaces(true);
      try {
        const queryWithCountry = `${searchQuery.trim()}, India`;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryWithCountry)}&countrycodes=in&addressdetails=1&limit=6`
        );
        if (res.ok) {
          const list = await res.json();
          const mapped = list.map((item: any) => {
            const addr = item.address || {};
            const itemCity = addr.city || addr.town || addr.municipality || addr.state_district || selectedCity || 'Hyderabad';
            const itemArea = addr.suburb || addr.neighbourhood || addr.residential || addr.road || item.name;
            const itemPin = addr.postcode || '';
            const itemRoad = addr.road || '';
            const shortName = item.name || itemArea || itemCity;

            return {
              id: `place_${item.place_id || Math.random()}`,
              name: shortName,
              area: itemArea,
              city: itemCity,
              pincode: itemPin,
              street: itemRoad || itemArea,
              formattedAddress: item.display_name
            };
          });
          setLivePlaces(mapped);
        }
      } catch (err) {
        console.warn('Live places search error:', err);
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCity]);

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

  // Fallback to IP-based Geolocation if hardware GPS is not available or timed out
  const fallbackIpLocation = async () => {
    try {
      setGpsNotice('Acquiring location telemetry from network...');
      
      const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en');
      if (res.ok) {
        const data = await res.json();
        const cityDetected = data.city || data.principalSubdivision || selectedCity || 'Hyderabad';
        const localityDetected = data.locality || data.principalSubdivision || cityDetected;
        const stateDetected = data.principalSubdivision || 'Telangana';
        const pinDetected = data.postcode || (cityDetected.toLowerCase().includes('hyderabad') ? '500033' : '560038');
        
        // Deduplicate address parts cleanly
        const parts: string[] = [];
        const seen = new Set<string>();
        const addPart = (p?: string) => {
          if (!p) return;
          const clean = p.trim();
          if (!clean || seen.has(clean.toLowerCase())) return;
          seen.add(clean.toLowerCase());
          parts.push(clean);
        };

        addPart(localityDetected);
        addPart(cityDetected);
        addPart(pinDetected);
        addPart(stateDetected);

        const cleanFormatted = parts.join(', ');
        
        const newAddr: DeliveryAddress = {
          id: `addr_ip_${Date.now()}`,
          tag: 'Other',
          flatNo: '',
          building: localityDetected,
          street: localityDetected !== cityDetected ? `${localityDetected}, ${cityDetected}` : localityDetected,
          area: localityDetected,
          city: cityDetected,
          state: stateDetected,
          pincode: pinDetected,
          formattedAddress: cleanFormatted
        };

        onSelectAddress(newAddr);
        onCityChange(cityDetected);
        setGpsNotice(`✓ Detected Locality: ${cleanFormatted}`);
        setIsDetectingGps(false);
        setTimeout(() => {
          onClose();
        }, 900);
        return;
      }
    } catch (e) {
      console.warn('Network location fallback error:', e);
    }

    setIsDetectingGps(false);
    const fallbackCity = selectedCity || 'Hyderabad';
    const fallbackArea = fallbackCity === 'Hyderabad' ? 'Jubilee Hills' : 'Indiranagar';
    const fallbackPin = fallbackCity === 'Hyderabad' ? '500033' : '560038';
    const fallbackAddr: DeliveryAddress = {
      id: `addr_fb_${Date.now()}`,
      tag: 'Other',
      flatNo: '',
      building: fallbackArea,
      street: fallbackArea,
      area: fallbackArea,
      city: fallbackCity,
      pincode: fallbackPin,
      formattedAddress: `${fallbackArea}, ${fallbackCity} ${fallbackPin}`
    };
    onSelectAddress(fallbackAddr);
    onCityChange(fallbackCity);
    setGpsNotice(`✓ Set Location: ${fallbackArea}, ${fallbackCity}`);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  // Handle GPS detection matching Swiggy & Zomato high-accuracy standards
  const handleDetectLocation = async () => {
    setIsDetectingGps(true);
    setGpsNotice('Requesting GPS coordinates... Please click "Allow" on your browser prompt.');

    if (!navigator.geolocation) {
      fallbackIpLocation();
      return;
    }

    // Check Permissions API if supported in browser
    if ('permissions' in navigator) {
      try {
        const perm = await (navigator.permissions as any).query({ name: 'geolocation' });
        if (perm.state === 'denied') {
          setGpsNotice('⚠️ Location permission is blocked in browser. Using network locality...');
          fallbackIpLocation();
          return;
        }
      } catch (e) {}
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy || 15);
        setGpsNotice(`✓ GPS Acquired (±${accuracy}m accuracy). Resolving doorstep street & colony...`);

        try {
          // Reverse-geocode coordinates using OpenStreetMap Nominatim for exact street, colony & pincode
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const { newAddr, areaName, city: detectedCity, cleanFormatted } = formatIndianGpsAddress(addr, selectedCity);

            onSelectAddress(newAddr);
            onCityChange(detectedCity);
            setGpsNotice(`✓ Doorstep Location: ${cleanFormatted}`);
            setIsDetectingGps(false);
            setTimeout(() => {
              onClose();
            }, 900);
            return;
          }
        } catch (err) {
          console.warn('Nominatim reverse geocode error, trying BigDataCloud...', err);
        }

        // Secondary reverse geocode via BigDataCloud
        try {
          const res2 = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
          if (res2.ok) {
            const data2 = await res2.json();
            const detectedCity = data2.city || data2.principalSubdivision || selectedCity || 'Hyderabad';
            const detectedArea = data2.locality || data2.principalSubdivision || detectedCity;
            const detectedState = data2.principalSubdivision || 'Telangana';
            const detectedPin = data2.postcode || (detectedCity.toLowerCase().includes('hyderabad') ? '500033' : '560038');

            const parts: string[] = [];
            const seen = new Set<string>();
            const addPart = (p?: string) => {
              if (!p) return;
              const clean = p.trim();
              if (!clean || seen.has(clean.toLowerCase())) return;
              seen.add(clean.toLowerCase());
              parts.push(clean);
            };

            addPart(detectedArea);
            addPart(detectedCity);
            addPart(detectedPin);
            addPart(detectedState);

            const cleanFormatted = parts.join(', ');

            const newAddr: DeliveryAddress = {
              id: `addr_gps_${Date.now()}`,
              tag: 'Other',
              flatNo: '',
              building: detectedArea,
              street: detectedArea !== detectedCity ? `${detectedArea}, ${detectedCity}` : detectedArea,
              area: detectedArea,
              city: detectedCity,
              state: detectedState,
              pincode: detectedPin,
              formattedAddress: cleanFormatted
            };

            onSelectAddress(newAddr);
            onCityChange(detectedCity);
            setGpsNotice(`✓ Detected: ${cleanFormatted}`);
            setIsDetectingGps(false);
            setTimeout(() => {
              onClose();
            }, 900);
            return;
          }
        } catch (e2) {}

        setIsDetectingGps(false);
      },
      (err) => {
        setIsDetectingGps(false);
        if (err.code === 1) {
          setGpsNotice('⚠️ Location access was denied. Auto-detected approximate area via network.');
          fallbackIpLocation();
        } else if (err.code === 2) {
          setGpsNotice('⚠️ Device GPS signal unavailable. Auto-detected approximate area via network.');
          fallbackIpLocation();
        } else if (err.code === 3) {
          setGpsNotice('⚠️ GPS timed out. Auto-detected approximate area via network.');
          fallbackIpLocation();
        } else {
          fallbackIpLocation();
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
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
            className={`w-full p-3.5 rounded-xl border border-rose-200 dark:border-rose-950/80 bg-rose-50/70 dark:bg-rose-950/40 hover:bg-rose-100/70 text-[#d11243] dark:text-rose-400 font-bold flex items-center justify-between transition cursor-pointer shadow-2xs ${isDetectingGps ? 'opacity-80' : ''}`}
          >
            <div className="flex items-center gap-2.5">
              <Crosshair className={`w-4 h-4 text-[#d11243] ${isDetectingGps ? 'animate-spin' : ''}`} />
              <div className="text-left">
                <span className="block text-xs font-black">
                  {isDetectingGps ? 'Detecting Your Live Location...' : 'Use Current Location (GPS / Network)'}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-normal">
                  Instant real-time location detection & reverse geocode
                </span>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-lg bg-[#d11243] text-white font-extrabold flex items-center gap-1 shadow-xs">
              {isDetectingGps ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>Locating...</span>
                </>
              ) : (
                'GPS Detect'
              )}
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
              placeholder="Search apartment, colony, road, landmark, or pincode..."
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#d11243]"
            />
          </div>

          {/* Live Search Spinner & Results (Swiggy / Zomato Real-Time Geocoding) */}
          {isSearchingPlaces && (
            <div className="p-3 text-center text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2 bg-gray-50/60 dark:bg-slate-800/40 rounded-xl border border-gray-100 dark:border-slate-800">
              <div className="w-3.5 h-3.5 border-2 border-[#d11243] border-t-transparent rounded-full animate-spin" />
              <span>Searching live places & landmarks across India...</span>
            </div>
          )}

          {livePlaces.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#d11243] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#d11243]" />
                <span>Live Location Matches for "{searchQuery}":</span>
              </span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {livePlaces.map((place) => (
                  <div
                    key={place.id}
                    onClick={() => {
                      const newAddr: DeliveryAddress = {
                        id: `addr_${Date.now()}`,
                        tag: 'Other',
                        flatNo: '',
                        building: place.name,
                        street: place.street || place.area,
                        area: place.area,
                        city: place.city,
                        pincode: place.pincode,
                        formattedAddress: place.formattedAddress
                      };
                      onSelectAddress(newAddr);
                      onCityChange(place.city);
                      onClose();
                    }}
                    className="p-3 rounded-xl border border-rose-100 dark:border-rose-950/60 bg-white dark:bg-slate-900 hover:border-[#d11243] hover:bg-rose-50/40 dark:hover:bg-rose-950/20 flex items-start justify-between gap-3 cursor-pointer transition shadow-2xs group"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-[#d11243] shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-xs text-gray-900 dark:text-white block group-hover:text-[#d11243] transition-colors">
                          {place.name}
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5 leading-relaxed">
                          {place.formattedAddress}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 bg-[#d11243] text-white rounded-lg font-bold shrink-0 shadow-2xs group-hover:opacity-90">
                      Deliver Here &rarr;
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
