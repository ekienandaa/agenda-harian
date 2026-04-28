import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Checkbox({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn(
        'h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-brand-600 focus:ring-brand-400 focus:ring-offset-0 cursor-pointer',
        className,
      )}
      {...rest}
    />
  );
}
