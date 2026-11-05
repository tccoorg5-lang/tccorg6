import * as React from 'react';
import { cn } from '@/lib/utils';
import { Search, Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, hint, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';
    const computedType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label className="block text-xs font-serif-formal font-semibold tracking-wider text-[#C5A059] uppercase">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={computedType}
            className={cn(
              'w-full bg-[#161A22] text-xs text-[#E9E2D3] placeholder:text-[#8993A3]/70 px-3.5 py-2.5 rounded-[4px] border border-[#262C3A] transition-all focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] focus:shadow-[0_0_12px_rgba(197,160,89,0.15)] disabled:opacity-50 disabled:cursor-not-allowed',
              isPassword && 'pr-10',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
            ref={ref}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8993A3] hover:text-[#E9E2D3] transition-colors p-0.5"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
        {hint && !error && <p className="text-[0.6875rem] text-[#8993A3]">{hint}</p>}
        {error && <p className="text-[0.6875rem] text-red-400 font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8993A3] pointer-events-none" />
        <input
          type="text"
          className={cn(
            'w-full bg-[#161A22] text-xs text-[#E9E2D3] placeholder:text-[#8993A3]/70 pl-8 pr-3.5 py-2 rounded-[4px] border border-[#262C3A] transition-all focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] focus:shadow-[0_0_12px_rgba(197,160,89,0.15)]',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label className="block text-xs font-serif-formal font-semibold tracking-wider text-[#C5A059] uppercase">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            'w-full bg-[#161A22] text-xs text-[#E9E2D3] placeholder:text-[#8993A3]/70 p-3 rounded-[4px] border border-[#262C3A] transition-all focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] focus:shadow-[0_0_12px_rgba(197,160,89,0.15)] min-h-[90px] resize-y',
            error && 'border-red-500 focus:border-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-[0.6875rem] text-red-400 font-medium">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Input, SearchInput, Textarea };
