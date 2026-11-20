import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

import { cn } from '@/utils/cn';

import { Spinner } from './Feedback';

export type ButtonVariant = 'primary' | 'secondary' | 'tonal' | 'ghost' | 'danger' | 'outline' | 'white';
type Variant = ButtonVariant;
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-[-0.01em] transition disabled:cursor-not-allowed disabled:opacity-60';
const variants: Record<Variant, string> = {
  // Figma: primário #004ac6; secundário = surface-container com texto primário; tonal = primary-fixed-dim.
  primary: 'bg-primary-600 text-white hover:bg-primary-700',
  secondary: 'bg-surface-container text-primary-600 hover:bg-surface-high',
  tonal: 'bg-primary-300 text-primary-900 hover:bg-primary-200',
  outline: 'border border-outline-variant/50 bg-white text-ink hover:bg-surface-low',
  ghost: 'text-ink-variant hover:bg-surface-low hover:text-ink',
  danger: 'bg-danger-600 text-white hover:bg-danger-700',
  white: 'bg-white text-primary-600 shadow-elevated hover:bg-surface-low',
};
const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

export const buttonClass = (variant: Variant = 'primary', size: Size = 'md', className?: string) =>
  cn(base, variants[variant], sizes[size], className);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, block, className, children, disabled, type = 'button', ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      className={buttonClass(variant, size, cn(block && 'w-full', className))}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner className="h-4 w-4" /> : icon}
      {children}
    </button>
  )
);
Button.displayName = 'Button';

interface ButtonLinkProps extends LinkProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  block?: boolean;
}

export const ButtonLink = ({ variant = 'primary', size = 'md', icon, block, className, children, ...rest }: ButtonLinkProps) => (
  <Link className={buttonClass(variant, size, cn(block && 'w-full', className))} {...rest}>
    {icon}
    {children}
  </Link>
);
