import React from 'react';
import { Star, CheckCircle, ShieldCheck, ThumbsUp, MapPin, Award } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  locality: string;
  city: string;
  productPurchased: string;
  rating: number;
  date: string;
  comment: string;
  verifiedBuyer: boolean;
  avatarBg: string;
}

const REVIEWS: Review[] = [
  {
    id: 'rev_1',
    name: 'Ananya Deshmukh',
    locality: '100ft Road, Indiranagar',
    city: 'Bengaluru',
    productPurchased: 'Seer Fish / Surmai (Large Steaks)',
    rating: 5,
    date: '2 days ago',
    comment: 'The Seer Fish steaks were immaculate! Absolutely zero ammoniacal or fishy smell because the box arrived chilled to 1.8°C. I emptied the fish into my tray, handed the ThermalVault box right back to the delivery partner, and the ₹250 refund pinged on GPay within 5 minutes. Best seafood experience in Bangalore.',
    verifiedBuyer: true,
    avatarBg: 'bg-emerald-600'
  },
  {
    id: 'rev_2',
    name: 'Vikram Hegde',
    locality: 'Sector 3, HSR Layout',
    city: 'Bengaluru',
    productPurchased: 'Rich Tender Goat (Biryani & Curry Cut)',
    rating: 5,
    date: 'Yesterday',
    comment: 'Finally a meat brand that does not give you 10 layers of non-recyclable plastic and melted ice bags! The Mandya goat meat was fresh, pink, and bone-dust free. Cooked in 3 whistles with authentic village aroma. GoMeat is officially my Sunday meat staple over Licious.',
    verifiedBuyer: true,
    avatarBg: 'bg-rose-600'
  },
  {
    id: 'rev_3',
    name: 'Chef Radhika Sen',
    locality: '5th Block, Koramangala',
    city: 'Bengaluru',
    productPurchased: 'Sea Tiger Prawns (Jumbo Cleaned)',
    rating: 5,
    date: '4 days ago',
    comment: 'As a private culinary consultant, cold-chain temperature control is non-negotiable. Seeing the live IoT probe graph right on the website holding 2.1°C during Bengaluru traffic was remarkable. The prawns were sweet, firm, and thoroughly deveined with tails intact.',
    verifiedBuyer: true,
    avatarBg: 'bg-indigo-600'
  },
  {
    id: 'rev_4',
    name: 'Karthik Iyer',
    locality: 'Prestige Shantiniketan, Whitefield',
    city: 'Bengaluru',
    productPurchased: 'Amritsari Fish Tikka & Desi Nati Koli',
    rating: 5,
    date: '1 week ago',
    comment: 'Ordered at 11:15 AM for a family get-together, delivered by 12:35 PM inside the thermal vault box. The Amritsari fish tikka cooked in 8 minutes on my tawa, crisp outside and juicy inside. Scheduled the cooler box pickup next morning from building security easily.',
    verifiedBuyer: true,
    avatarBg: 'bg-amber-600'
  }
];

export const CustomerReviewsSection: React.FC = () => {
  return (
    <section className="mt-10 bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs">
      {/* Header & Google Rating Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Verified Customer Experience</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
            Loved by 45,000+ Meat & Seafood Lovers
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Real feedback from households across Bengaluru & Mumbai ordering fresh harbor catch and pasture mutton.
          </p>
        </div>

        {/* Google Reviews Badge */}
        <div className="flex items-center gap-4 bg-gray-50 p-3.5 rounded-xl border border-gray-200 shrink-0">
          <div className="text-center pr-4 border-r border-gray-200">
            <div className="flex items-center justify-center gap-1 text-2xl font-black text-gray-900">
              4.8 <span className="text-amber-500 text-lg">★</span>
            </div>
            <div className="flex gap-0.5 mt-0.5 justify-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 flex items-center gap-1">
              <span>Google Reviews</span>
              <CheckCircle className="w-3.5 h-3.5 fill-blue-500 text-white" />
            </div>
            <div className="text-[11px] text-gray-500">Based on 1,480+ Ratings</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">99.4% Positive Sentiment</div>
          </div>
        </div>
      </div>

      {/* Grid of Verified Customer Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {REVIEWS.map((review) => (
          <div 
            key={review.id}
            className="p-4 bg-gray-50/70 rounded-xl border border-gray-200 hover:border-gray-300 transition flex flex-col justify-between"
          >
            <div>
              {/* Reviewer Header */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-full ${review.avatarBg} text-white font-bold flex items-center justify-center text-xs shadow-2xs`}>
                    {review.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                      <span>{review.name}</span>
                      {review.verifiedBuyer && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded-full">
                          <CheckCircle className="w-2.5 h-2.5" /> Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                      <MapPin className="w-2.5 h-2.5 text-gray-400" />
                      <span>{review.locality}, {review.city}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="flex gap-0.5">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-0.5">{review.date}</span>
                </div>
              </div>

              {/* Product Badge */}
              <div className="inline-block bg-white border border-gray-200 px-2 py-0.5 rounded text-[10px] text-gray-700 font-medium mb-2.5 shadow-2xs">
                Bought: <span className="font-bold text-[#d11243]">{review.productPurchased}</span>
              </div>

              {/* Review Text */}
              <p className="text-xs text-gray-600 leading-relaxed italic">
                "{review.comment}"
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-gray-200/60 flex items-center justify-between text-[10px] text-gray-400">
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <ThumbsUp className="w-3 h-3" /> Recommends GoMeat
              </span>
              <span>Delivered in 90 Mins</span>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Highlights Strip */}
      <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div className="p-2.5 bg-rose-50/50 rounded-lg border border-rose-100">
          <div className="font-extrabold text-sm text-[#d11243]">0°C to 4°C</div>
          <div className="text-[10px] text-gray-600 mt-0.5">Never Thawed or Refrozen</div>
        </div>
        <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
          <div className="font-extrabold text-sm text-emerald-800">₹250 UPI Refund</div>
          <div className="text-[10px] text-gray-600 mt-0.5">Instant Deposit Reversal</div>
        </div>
        <div className="p-2.5 bg-amber-50/50 rounded-lg border border-amber-100">
          <div className="font-extrabold text-sm text-amber-800">100% RO Washed</div>
          <div className="text-[10px] text-gray-600 mt-0.5">No Formalin / Chemicals</div>
        </div>
        <div className="p-2.5 bg-indigo-50/50 rounded-lg border border-indigo-100">
          <div className="font-extrabold text-sm text-indigo-800">Zero Thermocol</div>
          <div className="text-[10px] text-gray-600 mt-0.5">100% Reusable Cold Vault</div>
        </div>
      </div>
    </section>
  );
};
