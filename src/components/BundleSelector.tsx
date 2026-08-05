import React from 'react';
import { ProductBundle } from '../types';

interface BundleSelectorProps {
  bundles: ProductBundle[];
  selectedBundleId: string;
  onSelectBundle: (bundle: ProductBundle) => void;
}

export const BundleSelector: React.FC<BundleSelectorProps> = ({
  bundles,
  selectedBundleId,
  onSelectBundle
}) => {
  if (!bundles || bundles.length === 0) return null;

  return (
    <div className="space-y-3 my-3">
      <div className="text-xs font-bold text-gray-700 flex items-center justify-between">
        <span>প্যাকেজ বাছাই করুন (Select Package):</span>
        <span className="text-[11px] text-[#5E6A45] font-extrabold">স্পেশাল ছাড় অফার 🔥</span>
      </div>

      <div className="space-y-3">
        {bundles.map((bundle) => {
          const isSelected = selectedBundleId === bundle.id;

          return (
            <div
              key={bundle.id}
              onClick={() => onSelectBundle(bundle)}
              className={`relative rounded-2xl p-3.5 sm:p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-2 border-black bg-white shadow-md ring-1 ring-black/5'
                  : 'border border-gray-200 bg-white hover:border-gray-300 shadow-2xs'
              }`}
            >
              {/* Overlapping Save Badge */}
              {bundle.badgeText && (
                <div className="absolute -top-3 right-4 z-10 bg-[#E11D48] text-white text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-sm tracking-wide">
                  {bundle.badgeText}
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                {/* Left: Radio + Title + Tag */}
                <div className="flex items-center gap-3">
                  {/* Radio Button */}
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'border-black bg-white' : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                  </div>

                  {/* Title & Tag */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm sm:text-base text-[#0F172A]">
                      {bundle.title}
                    </span>

                    {bundle.tagText && (
                      <span className="bg-[#F1F5F9] text-[#475569] text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap">
                        {bundle.tagText}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Price & Original Price */}
                <div className="text-right shrink-0">
                  <div className="font-black text-sm sm:text-base text-[#0F172A] flex items-center justify-end gap-1">
                    <span>৳</span>
                    <span>{bundle.price.toLocaleString('bn-BD')}</span>
                  </div>

                  {bundle.originalPrice && bundle.originalPrice > bundle.price && (
                    <div className="text-[11px] sm:text-xs text-[#94A3B8] font-semibold line-through">
                      ৳ {bundle.originalPrice.toLocaleString('bn-BD')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
