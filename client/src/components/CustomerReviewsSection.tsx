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
    locality: 'Indiranagar',
    city: 'Bengaluru',
    productPurchased: 'Surmai / Seer Fish (Steaks)',
    rating: 5,
    date: '2 days ago',
    comment: 'The fish arrived completely fresh with zero bad smell. The cold box kept it chilled properly. I handed the empty box back to the delivery partner and got my ₹250 refund in 5 minutes. Best fish delivery experience in town.',
    verifiedBuyer: true,
    avatarBg: 'bg-emerald-600'
  },
  {
    id: 'rev_2',
    name: 'Vikram Hegde',
    locality: 'HSR Layout',
    city: 'Bengaluru',
    productPurchased: 'Tender Goat Mutton (Curry Cut)',
    rating: 5,
    date: 'Yesterday',
    comment: 'Clean cuts with no bone chips or excess fat. Cooked quickly and tasted very tender. Also love the reusable box concept instead of messy plastic bags. GoMeat is now my regular Sunday choice.',
    verifiedBuyer: true,
    avatarBg: 'bg-rose-600'
  },
  {
    id: 'rev_3',
    name: 'Radhika Sen',
    locality: 'Koramangala',
    city: 'Bengaluru',
    productPurchased: 'Fresh Jumbo Prawns (Cleaned)',
    rating: 5,
    date: '4 days ago',
    comment: 'Prawns were big, clean, and perfectly deveined. Fresh and sweet taste, ready to cook straight out of the box. Delivery was right on time within 90 minutes.',
    verifiedBuyer: true,
    avatarBg: 'bg-indigo-600'
  },
  {
    id: 'rev_4',
    name: 'Karthik Iyer',
    locality: 'Whitefield',
    city: 'Bengaluru',
    productPurchased: 'Fresh Chicken Curry Cut',
    rating: 5,
    date: '1 week ago',
    comment: 'Ordered at 11 AM for lunch, delivered at 12:20 PM. Chicken was fresh, soft, and cleanly washed. Returning the box next day was super simple through the website.',
    verifiedBuyer: true,
    avatarBg: 'bg-amber-600'
  }
];

export const CustomerReviewsSection: React.FC = () => {
  return (
    <section className="mt-10 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 md:p-8 shadow-xs">
      {/* Header & Rating Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-2 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Customer Reviews</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Loved by Our Customers
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Real feedback from happy customers who order fresh meat and seafood daily.
          </p>
        </div>

        {/* Rating Badge */}
        <div className="flex items-center gap-4 bg-gray-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-gray-200 dark:border-slate-700 shrink-0">
          <div className="text-center pr-4 border-r border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-center gap-1 text-2xl font-black text-gray-900 dark:text-white">
              4.8 <span className="text-amber-500 text-lg">★</span>
            </div>
            <div className="flex gap-0.5 mt-0.5 justify-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1">
              <span>Customer Rating</span>
              <CheckCircle className="w-3.5 h-3.5 fill-blue-500 text-white" />
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400">Based on 1,480+ Reviews</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">99% Positive Rating</div>
          </div>
        </div>
      </div>

      {/* Grid of Verified Customer Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {REVIEWS.map((review) => (
          <div 
            key={review.id}
            className="p-4 bg-gray-50/70 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition flex flex-col justify-between card-light-hover"
          >
            <div>
              {/* Reviewer Header */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-full ${review.avatarBg} text-white font-bold flex items-center justify-center text-xs shadow-2xs`}>
                    {review.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                      <span>{review.name}</span>
                      {review.verifiedBuyer && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle className="w-2.5 h-2.5" /> Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
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
              <div className="inline-block bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 px-2 py-0.5 rounded text-[10px] text-gray-700 dark:text-gray-200 font-medium mb-2.5 shadow-2xs">
                Ordered: <span className="font-bold text-[#d11243] dark:text-rose-400">{review.productPurchased}</span>
              </div>

              {/* Review Text */}
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed italic">
                "{review.comment}"
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-gray-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-gray-400">
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                <ThumbsUp className="w-3 h-3" /> Recommends GoMeat
              </span>
              <span>Delivered in 90 Mins</span>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Highlights Strip */}
      <div className="mt-6 pt-5 border-t border-gray-100 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div className="p-2.5 bg-rose-50/50 dark:bg-rose-950/30 rounded-lg border border-rose-100 dark:border-rose-900/40">
          <div className="font-extrabold text-sm text-[#d11243] dark:text-rose-400">Always Chilled</div>
          <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">Never Thawed or Refrozen</div>
        </div>
        <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
          <div className="font-extrabold text-sm text-emerald-800 dark:text-emerald-400">₹250 Box Refund</div>
          <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">Get Deposit Back Promptly</div>
        </div>
        <div className="p-2.5 bg-amber-50/50 dark:bg-amber-950/30 rounded-lg border border-amber-100 dark:border-amber-900/40">
          <div className="font-extrabold text-sm text-amber-800 dark:text-amber-400">Cleaned & Safe</div>
          <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">No Chemicals or Preservatives</div>
        </div>
        <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
          <div className="font-extrabold text-sm text-indigo-800 dark:text-indigo-400">Eco-Friendly Box</div>
          <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">Reusable Cold Box Packaging</div>
        </div>
      </div>
    </section>
  );
};
