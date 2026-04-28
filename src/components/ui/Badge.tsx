import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: string;
  variant?: 'solid' | 'soft' | 'outline';
}

export function Badge({
  color,
  variant = 'soft',
  className,
  style,
  ...rest
}: BadgeProps) {
  const inlineStyle = { ...style };
  let variantClass = '';
  if (color) {
    if (variant === 'solid') {
      inlineStyle.backgroundColor = color;
      inlineStyle.color = 'white';
    } else if (variant === 'outline') {
      inlineStyle.borderColor = color;
      inlineStyle.color = color;
      variantClass = 'border';
    } else {
      inlineStyle.backgroundColor = hexWithAlpha(color, 0.18);
      inlineStyle.color = color;
    }
  } else {
    variantClass =
      'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200';
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap',
        variantClass,
        className,
      )}
      style={inlineStyle}
      {...rest}
    />
  );
}

function hexWithAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
