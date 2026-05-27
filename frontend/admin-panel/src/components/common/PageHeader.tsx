"use client";

import { LucideIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  buttonOnClick?: () => void;
  buttonIcon?: LucideIcon;
  icon?: LucideIcon;
  children?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  buttonLabel,
  buttonOnClick,
  buttonIcon: ButtonIcon = Plus,
  icon: Icon,
  children,
}: PageHeaderProps) {
  return (
    <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/80 animate-in fade-in slide-in-from-top-4 duration-500 ease-out">

      <div className="flex items-start sm:items-center gap-4">
        {Icon && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-600 dark:from-slate-800/80 dark:to-slate-800/40 dark:text-teal-400 shrink-0 shadow-sm border border-blue-100/30 dark:border-slate-700/50 flex items-center justify-center">
            <Icon className="h-6 w-6 stroke-[2]" />
          </div>
        )}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && (
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {buttonLabel && buttonOnClick && !children && (
        <Button
          onClick={buttonOnClick}
          className="group h-11 rounded-2xl px-5 font-black text-sm tracking-wide shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 active:scale-98 hover:-translate-y-0.5 transition-all duration-300 ease-out flex items-center gap-2 shrink-0 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white border border-blue-500/10"
        >
          <ButtonIcon className="h-4.5 w-4.5 group-hover:rotate-90 group-hover:scale-110 transition-all duration-300 ease-out" />
          <span>{buttonLabel}</span>
        </Button>
      )}

      {children && (
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-start sm:justify-end">
          {children}
        </div>
      )}
    </div>
  );
}
