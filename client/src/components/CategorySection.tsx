import React from 'react';
import { 
  Shield, 
  Fish, 
  Beef, 
  Drumstick, 
  UtensilsCrossed, 
  Package, 
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export interface CategoryItem {
  id: string;
  name: string;
  value: string;
  subtitle: string;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'all',
    name: 'All Cuts',
    value: 'All',
    subtitle: 'Live Sensor Hub',
    tag: '2.1°C Validated',
    icon: Shield,
    iconBg: 'bg-rose-100',
    iconColor: 'text-[#d11243]'
  },
  {
    id: 'fish',
    name: 'Fish & Seafood',
    value: 'Fish & Seafood',
    subtitle: '48 Chilled Cuts',
    tag: '0°–2°C Harbor Loaded',
    icon: Fish,
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-700'
  },
  {
    id: 'mutton',
    name: 'Tender Mutton',
    value: 'Tender Mutton',
    subtitle: '18 Pasture Cuts',
    tag: 'Grass-Fed Mandya',
    icon: Beef,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-800'
  },
  {
    id: 'chicken',
    name: 'Fresh Chicken',
    value: 'Fresh Chicken',
    subtitle: '24 Clean Cuts',
    tag: 'Zero Antibiotics',
    icon: Drumstick,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-700'
  },
  {
    id: 'ready_to_cook',
    name: 'Ready to Cook',
    value: 'Ready to Cook',
    subtitle: '16 Marinated Cuts',
    tag: 'Air-Fry & Grill',
    icon: UtensilsCrossed,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700'
  },
  {
    id: 'combos',
    name: 'Combos Box',
    value: 'Combo Box',
    subtitle: '8 Feasts • Value',
    tag: 'Up to 20% OFF',
    icon: Package,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-700'
  }
];

interface CategorySectionProps {
  selectedCategory: string;
  onSelectCategory: (categoryValue: string) => void;
  onViewAllSpecs?: () => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  selectedCategory,
  onSelectCategory,
  onViewAllSpecs
}) => {
  return (
    <section className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">
          Explore Categories
        </h2>

        <button
          onClick={onViewAllSpecs}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>View All Product Specs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Categories Cards Grid / Scrollable Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.value;
          const Icon = cat.icon;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.value)}
              className={`rounded-2xl p-4 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                isSelected
                  ? 'bg-[#d11243] text-white shadow-md shadow-rose-900/20 ring-2 ring-[#d11243] ring-offset-2'
                  : 'bg-white hover:bg-gray-50/80 text-gray-800 border border-gray-200/90 shadow-2xs hover:shadow-xs hover:border-gray-300'
              }`}
            >
              {/* Icon Container */}
              <div className="mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : `${cat.iconBg} ${cat.iconColor} group-hover:scale-105`
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              {/* Text Info */}
              <div className="space-y-1">
                <div
                  className={`font-black text-sm tracking-tight leading-tight ${
                    isSelected ? 'text-white' : 'text-gray-950'
                  }`}
                >
                  {cat.name}
                </div>

                <div
                  className={`text-[11px] font-medium leading-tight ${
                    isSelected ? 'text-rose-100' : 'text-gray-500'
                  }`}
                >
                  {cat.subtitle}
                </div>

                {/* Subtitle 2 / Micro Tag Pill */}
                <div className="pt-1.5">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold tracking-tight ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200/70'
                    }`}
                  >
                    {cat.tag}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
