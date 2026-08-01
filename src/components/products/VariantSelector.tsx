import React from 'react';
import { ProductVariant } from '../../types';

interface VariantSelectorProps {
  variants?: ProductVariant[];
  selectedVariant?: string;
  onSelectVariant: (variantOption: string) => void;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariant,
  onSelectVariant
}) => {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="space-y-3 my-3">
      {variants.map((v, vIdx) => (
        <div key={vIdx} className="space-y-1.5">
          <label className="text-xs md:text-sm font-semibold text-[#1A1A1A] flex items-center space-x-1">
            <span>{v.name}:</span>
            <span className="text-[#6B7A4F] font-bold">{selectedVariant || v.options[0]}</span>
          </label>

          <div className="flex flex-wrap gap-2">
            {v.options.map((option, oIdx) => {
              const isSelected = selectedVariant === option || (!selectedVariant && oIdx === 0);
              return (
                <button
                  key={oIdx}
                  type="button"
                  onClick={() => onSelectVariant(option)}
                  className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all border ${
                    isSelected
                      ? 'bg-[#6B7A4F] text-white border-[#6B7A4F] shadow-sm'
                      : 'bg-white text-[#1A1A1A] border-[#E5E3DA] hover:border-[#6B7A4F] hover:bg-[#F7F5EF]'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
