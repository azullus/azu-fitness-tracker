'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuickActionButtonProps {
  href: string;
  icon: LucideIcon;
  label: string;
  colorClass?: string;
}

export function QuickActionButton({ href, icon: Icon, label, colorClass = 'bg-blue-500' }: QuickActionButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center justify-center p-4 rounded-xl text-white transition-transform hover:scale-105',
        colorClass
      )}
    >
      <Icon className="w-6 h-6 mb-2" />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}

export interface ProgressBarProps {
  value: number;
  max: number;
  colorClass?: string;
}

export function ProgressBar({ value, max, colorClass = 'bg-blue-500' }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={cn('h-2 rounded-full transition-all', colorClass)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export interface DashboardWidgetProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  href?: string;
}

export function DashboardWidget({
  title,
  children,
  className,
  icon: Icon,
  iconBgColor = 'bg-gray-100',
  iconColor = 'text-gray-600',
  href,
}: DashboardWidgetProps) {
  const content = (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm', className)}>
      <div className="flex items-center gap-3 mb-3">
        {Icon && (
          <div className={cn('p-2 rounded-lg', iconBgColor)}>
            <Icon className={cn('w-5 h-5', iconColor)} />
          </div>
        )}
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
