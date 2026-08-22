import React from 'react';
import { ProductBundle } from '../types';
import { Flame, Sparkles } from 'lucide-react';

interface BundleSelectorProps {
  bundles: ProductBundle[];
  selectedBundleId: string;
  onSelectBundle: (bundle: ProductBundle) => void;
  bannerTitle?: string;
  bannerSubtitle?: string;
}

export const BundleSelector: React.FC<BundleSelectorProps> = ({
  bundles,
  selectedBundleId,
  onSelectBundle,
  bannerTitle,
  bannerSubtitle
}) => {
  if (!bundles || bundles.length === 0) return null;

  const defaultSub = 'একসাথে বেশি কিনুন – বেশি সাশ্রয় করুন!';
  const defaultTitle = 'একাধিক ফ্লেভার কিনলে পাবেন বিশেষ ছাড়';

  return (
    <div className="my-3.5 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#5E6A45] bg-white shadow-md">
      {/* Top Website-Matched Signature Green Banner */}
      <div className="bg-gradient-to-r from-[#5E6A45] via-[#4B5637] to-[#5E6A45] text-white py-3 px-4 text-center select-none shadow-inner">
        <p className="text-[11px] sm:text-xs font-semibold tracking-wide text-[#E7EFE0] flex items-center justify-center gap-1.5 opacity-95">
          <span>🎉</span>
          <span>{bannerSubtitle || defaultSub}</span>
        </p>
        <h3 className="text-sm sm:text-lg font-black tracking-tight text-white mt-0.5 leading-snug">
          {bannerTitle || defaultTitle}
        </h3>
      </div>

      {/* List of Bundle Tiers */}
      <div className="divide-y divide-[#E8E3D9]">
        {bundles.map((bundle, idx) => {
          const isSelected = selectedBundleId === bundle.id;

          // Calculate auto discount percentage if not provided in badgeText
          let discountText = bundle.badgeText;
          if (!discountText && bundle.originalPrice && bundle.originalPrice > bundle.price) {
            const pct = Math.round(((bundle.originalPrice - bundle.price) / bundle.originalPrice) * 100);
            if (pct > 0) {
              discountText = `${pct}% ছাড়`;
            }
          }

          // Determine Icon style
          const isFireIcon = bundle.iconType === 'fire' || (!bundle.iconType && idx >= 3);
          const isGoldDot = bundle.iconType === 'gold_dot' || (!bundle.iconType && (idx === 1 || idx === 2));
          const isGreenDot = bundle.iconType === 'green_dot' || (!bundle.iconType && idx === 0);
          const isStarIcon = bundle.iconType === 'star';

          return (
            <div
              key={bundle.id || idx}
              onClick={() => onSelectBundle(bundle)}
              className={`flex items-center justify-between gap-3 px-3 sm:px-4 py-3 cursor-pointer transition-all select-none ${
                isSelected
                  ? 'bg-[#F2F7EC] border-l-4 border-l-[#5E6A45]'
                  : 'bg-white hover:bg-[#FAF8F5]'
              }`}
            >
              {/* Left Column: Icon + Title & Tag + Subtitle */}
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                {/* Icon sphere / flame */}
                <div className="shrink-0 flex items-center justify-center w-6 h-6">
                  {isFireIcon ? (
                    <span className="text-lg leading-none" role="img" aria-label="fire">
                      🔥
                    </span>
                  ) : isStarIcon ? (
                    <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
                  ) : isGoldDot ? (
                    <span className="w-4.5 h-4.5 rounded-full bg-gradient-to-br from-[#F59E0B] via-[#D97706] to-[#B45309] shadow-sm border border-amber-300 block" />
                  ) : (
                    <span className="w-4.5 h-4.5 rounded-full bg-gradient-to-br from-[#8FA36B] via-[#5E6A45] to-[#434D31] shadow-sm border border-[#A8BC85] block" />
                  )}
                </div>

                {/* Text info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`font-extrabold text-xs sm:text-sm ${isSelected ? 'text-[#1F241E]' : 'text-gray-900'}`}>
                      {bundle.title}
                    </span>
                    {bundle.tagText && (
                      <span className="text-[#5E6A45] text-[11px] sm:text-xs font-black">
                        {bundle.tagText}
                      </span>
                    )}
                  </div>

                  {bundle.originalPrice && bundle.originalPrice > bundle.price && (
                    <div className="text-[10px] sm:text-[11px] text-gray-400 font-medium line-through mt-0.5">
                      আগের দাম: ৳{bundle.originalPrice.toLocaleString('bn-BD')}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Price + Discount Badge */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <span className="font-black text-sm sm:text-base text-[#5E6A45] tracking-tight">
                  ৳{bundle.price.toLocaleString('bn-BD')}
                </span>

                {discountText && (
                  <span className="bg-[#FFF1F2] border border-[#FECDD3] text-[#E11D48] text-[10px] sm:text-[11px] font-black px-1.5 sm:px-2 py-0.5 rounded-md whitespace-nowrap">
                    {discountText}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

