import React, { useState } from 'react';

interface CalendarProps {
  selectedDate: string;
  onChange: (date: string) => void;
  primaryColor?: string;
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onChange, primaryColor = '#1d4ed8' }) => {
  const [weekOffset, setWeekOffset] = useState(0);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + (weekOffset * 7) + i);
    return d.toISOString().split('T')[0];
  });

  const getFriendlyDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' });
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString('es-ES', { month: 'short' });
    return {
      weekday: dayName.charAt(0).toUpperCase() + dayName.slice(1).replace('.', ''),
      day: dayNum,
      month: monthName.replace('.', '')
    };
  };

  const handleNextWeek = () => setWeekOffset((prev) => prev + 1);
  const handlePrevWeek = () => setWeekOffset((prev) => Math.max(0, prev - 1));

  return (
    <div className="my-6">
      <div className="flex justify-between items-center mb-3">
        <label className="text-zinc-400 font-semibold text-sm tracking-wide uppercase">
          Selecciona el Día
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePrevWeek}
            disabled={weekOffset === 0}
            className={`p-1.5 rounded-lg border transition-colors ${
              weekOffset === 0
                ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500 cursor-pointer'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            type="button"
            onClick={handleNextWeek}
            className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-zinc-500 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
        {days.map((date) => {
          const isSelected = selectedDate === date;
          const { weekday, day, month } = getFriendlyDate(date);
          return (
            <button
              key={date}
              type="button"
              onClick={() => onChange(date)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'text-zinc-950 font-bold shadow-lg'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100'
              }`}
              style={isSelected ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
            >
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 mb-1">{weekday}</span>
              <span className="text-xl font-extrabold">{day}</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider opacity-60 mt-0.5">{month}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
