import * as React from "react";
import { cn } from "@/lib/utils";

interface DetailRowProps {
  icon?: React.ElementType;
  label: string;
  value: React.ReactNode;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
}

export function DetailRow({
  icon: Icon,
  label,
  value,
  className,
  iconClassName,
  labelClassName,
  valueClassName,
}: DetailRowProps) {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div className={cn("flex items-start gap-3 py-2.5", className)}>
      {Icon && (
        <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800", iconClassName)}>
          <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className={cn("text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500", labelClassName)}>
          {label}
        </div>
        <div className={cn("mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-200 break-words", valueClassName)}>
          {value}
        </div>
      </div>
    </div>
  );
}

export default DetailRow;
