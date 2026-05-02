import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}

        <input
          ref={ref}
          className={`h-[52px] w-full rounded-2xl border border-slate-200 bg-white px-4 text-[15px] outline-none transition placeholder:text-slate-300 focus:border-[#13234b] ${className}`}
          {...props}
        />

        {error ? (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        ) : helperText ? (
          <p className="mt-2 text-sm text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;