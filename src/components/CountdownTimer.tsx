import React, { useState, useEffect } from 'react';
import { Timer, Flame } from 'lucide-react';

interface CountdownTimerProps {
  title?: string;
  endTime?: string;
  hours?: number;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  title = 'অফারটি শেষ হতে বাকি:',
  endTime,
  hours = 24,
  className = ''
}) => {
  const calculateTimeLeft = () => {
    let targetMs: number;
    if (endTime && !isNaN(new Date(endTime).getTime())) {
      targetMs = new Date(endTime).getTime();
    } else {
      // Default 24 hours from today if no end time specified
      const now = new Date();
      targetMs = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59).getTime();
    }

    const diff = targetMs - Date.now();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    return { days, hours: hrs, minutes, seconds, total: diff };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime, hours]);

  // Convert numbers to Bengali digits
  const toBn = (num: number) => {
    const str = num.toString().padStart(2, '0');
    return str.replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]);
  };

  return (
    <div className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#212B18] via-[#354526] to-[#212B18] text-white border border-[#6B7A4F]/60 shadow-sm ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-1 sm:p-2 rounded-lg sm:rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Flame className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-semibold sm:font-bold text-amber-300 block leading-tight">{title}</span>
            <span className="text-[10px] sm:text-[11px] text-gray-300 font-normal leading-tight block">অফারের সময় সীমিত! দ্রুত অর্ডার করুন।</span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2 self-start sm:self-auto font-mono">
          {timeLeft.days > 0 && (
            <>
              <div className="flex flex-col items-center bg-[#11170D] border border-[#6B7A4F]/50 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-xl min-w-[34px] sm:min-w-[44px]">
                <span className="text-xs sm:text-lg font-bold sm:font-black text-white">{toBn(timeLeft.days)}</span>
                <span className="text-[8px] sm:text-[9px] text-amber-300 font-sans font-normal">দিন</span>
              </div>
              <span className="text-amber-400 font-bold text-xs sm:text-sm">:</span>
            </>
          )}

          <div className="flex flex-col items-center bg-[#11170D] border border-[#6B7A4F]/50 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-xl min-w-[34px] sm:min-w-[44px]">
            <span className="text-xs sm:text-lg font-bold sm:font-black text-white">{toBn(timeLeft.hours)}</span>
            <span className="text-[8px] sm:text-[9px] text-amber-300 font-sans font-normal">ঘণ্টা</span>
          </div>

          <span className="text-amber-400 font-bold text-xs sm:text-sm">:</span>

          <div className="flex flex-col items-center bg-[#11170D] border border-[#6B7A4F]/50 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-xl min-w-[34px] sm:min-w-[44px]">
            <span className="text-xs sm:text-lg font-bold sm:font-black text-white">{toBn(timeLeft.minutes)}</span>
            <span className="text-[8px] sm:text-[9px] text-amber-300 font-sans font-normal">মিঃ</span>
          </div>

          <span className="text-amber-400 font-bold text-xs sm:text-sm">:</span>

          <div className="flex flex-col items-center bg-[#11170D] border border-[#6B7A4F]/50 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-xl min-w-[34px] sm:min-w-[44px] animate-pulse">
            <span className="text-xs sm:text-lg font-bold sm:font-black text-amber-400">{toBn(timeLeft.seconds)}</span>
            <span className="text-[8px] sm:text-[9px] text-amber-300 font-sans font-normal">সেঃ</span>
          </div>
        </div>
      </div>
    </div>
  );
};
