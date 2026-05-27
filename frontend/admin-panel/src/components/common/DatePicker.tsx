"use client";

import { useState, useEffect, useRef } from "react";
import { CalendarDays } from "lucide-react";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  align?: "left" | "right";
}

export default function DatePicker({
  value,
  onChange,
  label,
  placeholder = "Select Date",
  className = "",
  align = "left",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial value to set view month
  useEffect(() => {
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        setViewMonth(parsed);
      }
    }
  }, [value]);

  // Click outside listener to close calendar popover
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days: (number | null)[] = [];
    // Padding empty cells before day 1
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    // Days in current month
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    return days;
  };

  const formatFriendlyDate = (dateStr: string) => {
    if (!dateStr) return placeholder;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return placeholder;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(viewMonth);
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const monthName = viewMonth.toLocaleString("en-US", { month: "long" });
  const year = viewMonth.getFullYear();
  const currentMonthIdx = viewMonth.getMonth();

  return (
    <div className="flex flex-col relative w-full" ref={containerRef}>
      {label && (
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className={`flex items-center justify-between w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-sm hover:border-slate-300 text-left cursor-pointer ${className}`}
      >
        <span className={!value ? "text-slate-400" : ""}>{formatFriendlyDate(value)}</span>
        <CalendarDays className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
      </button>

      {isOpen && (
        <div
          className={`absolute top-12 ${
            align === "right" ? "right-0" : "left-0"
          } z-50 w-72 bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-4 animate-in fade-in-50 zoom-in-95 duration-150`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Month/Year Navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors font-bold text-sm w-8 h-8 flex items-center justify-center cursor-pointer select-none"
            >
              &larr;
            </button>
            <span className="font-bold text-slate-800 text-sm select-none">
              {monthName} {year}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors font-bold text-sm w-8 h-8 flex items-center justify-center cursor-pointer select-none"
            >
              &rarr;
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {weekDays.map((d) => (
              <span
                key={d}
                className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1 select-none"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Day buttons grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-8 w-8" />;
              }

              const formattedMonth = String(currentMonthIdx + 1).padStart(2, "0");
              const formattedDay = String(day).padStart(2, "0");
              const dayStr = `${year}-${formattedMonth}-${formattedDay}`;

              const isSelected = value === dayStr;
              const isToday = new Date().toISOString().split("T")[0] === dayStr;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onChange(dayStr);
                    setIsOpen(false);
                  }}
                  className={`h-8 w-8 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
                      : isToday
                      ? "bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer quick action buttons */}
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                const todayStr = new Date().toISOString().split("T")[0];
                onChange(todayStr);
                setIsOpen(false);
              }}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Select Today
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
              }}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
