import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", isLoading, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none";
    const variants = {
      primary:
        "bg-primary text-white hover:bg-primary-hover shadow-card-sm",
      outline:
        "border border-border-strong bg-transparent hover:bg-background-secondary text-foreground",
      ghost: "bg-transparent hover:bg-background-secondary text-foreground",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? "Cargando..." : children}
      </button>
    );
  }
);
Button.displayName = "Button";
