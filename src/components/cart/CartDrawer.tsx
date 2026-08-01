import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQty,
    subtotal,
    openCheckout
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer-modal">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-slideLeft">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-[#E5E3DA] flex items-center justify-between bg-[#F7F5EF]">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#6B7A4F]" />
              <h2 className="font-bold text-lg text-[#1A1A1A]">আপনার কার্ট ({cart.length})</h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 rounded-full text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#E5E3DA] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 divide-y divide-[#E5E3DA]/60">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#6B7A4F]/10 flex items-center justify-center text-[#6B7A4F] mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-[#1A1A1A]">আপনার কার্টটি খালি</h3>
                <p className="text-xs text-[#6B6B6B]">আপনার পছন্দের প্রোডাক্টটি কার্টে যোগ করুন</p>
                <button
                  onClick={closeCart}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-[#6B7A4F] text-white font-bold text-sm hover:bg-[#586640] transition-colors"
                >
                  প্রোডাক্ট দেখুন
                </button>
              </div>
            ) : (
              cart.map((item, idx) => {
                const itemPrice = item.product.discount_price || item.product.price;
                return (
                  <div key={idx} className="pt-4 first:pt-0 flex space-x-3">
                    <img
                      src={item.product.images?.[0]}
                      alt={item.product.name}
                      className="w-20 h-20 rounded-xl object-cover border border-[#E5E3DA] bg-[#F7F5EF]"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-sm text-[#1A1A1A] line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.selected_variant)}
                            className="text-[#6B6B6B] hover:text-red-600 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {item.selected_variant && (
                          <p className="text-xs text-[#6B7A4F] font-medium mt-0.5">
                            ভেরিয়েন্ট: {item.selected_variant}
                          </p>
                        )}

                        <div className="text-sm font-bold text-[#6B7A4F] mt-1">
                          <span className="text-[#6B7A4F]">৳</span>{itemPrice.toLocaleString('bn-BD')}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex items-center border border-[#E5E3DA] rounded-lg bg-[#F7F5EF]">
                          <button
                            onClick={() => updateQty(item.product.id, item.qty - 1, item.selected_variant)}
                            className="p-1 text-[#1A1A1A] hover:bg-white rounded-l-lg"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 font-bold text-xs text-[#1A1A1A]">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.product.id, item.qty + 1, item.selected_variant)}
                            className="p-1 text-[#1A1A1A] hover:bg-white rounded-r-lg"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-xs text-[#6B6B6B]">
                          মোট: <span className="text-[#6B7A4F] font-bold">৳{(itemPrice * item.qty).toLocaleString('bn-BD')}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-[#E5E3DA] bg-[#F7F5EF] space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#6B6B6B]">সাবটোটাল:</span>
                <span className="font-extrabold text-lg text-[#6B7A4F]">
                  <span className="text-[#6B7A4F]">৳</span>{subtotal.toLocaleString('bn-BD')}
                </span>
              </div>
              <p className="text-[11px] text-[#6B6B6B]">
                * ডেলিভারি চার্জ চেকআউট পেইজে এরিয়া অনুযায়ী যোগ হবে (ঢাকা ৳৬০, বাইরে ৳১২০)।
              </p>

              <button
                onClick={() => openCheckout()}
                className="w-full py-3.5 rounded-xl bg-[#6B7A4F] text-white font-bold text-base hover:bg-[#586640] transition-colors flex items-center justify-center space-x-2 shadow-lg active:scale-95"
              >
                <span>অর্ডার নিশ্চিত করতে এগিয়ে যান</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
