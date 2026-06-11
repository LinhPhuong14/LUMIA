import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <label className="flex w-full flex-col gap-2 text-sm font-medium text-matcha-deep" htmlFor={inputId}>
        {label ? <span>{label}</span> : null}
        <div className="relative">
          {leftIcon ? (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
              {leftIcon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-[20px] border border-matcha-soft bg-surface-glass px-6 py-4 text-base text-foreground outline-none transition",
              "focus:border-matcha focus:ring-4 focus:ring-matcha/20",
              error && "border-error focus:border-error focus:ring-error/20",
              leftIcon && "pl-11",
              rightIcon && "pr-11",
              className,
            )}
            {...props}
          />
          {rightIcon ? (
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted">
              {rightIcon}
            </span>
          ) : null}
        </div>
        {error ? <span className="text-sm font-normal text-error">{error}</span> : null}
        {hint && !error ? <span className="text-sm font-normal text-muted">{hint}</span> : null}
      </label>
    );
  },
);

Input.displayName = "Input";
