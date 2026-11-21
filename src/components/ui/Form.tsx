// FE-06: campos de formulário com rótulo, dica e erro (acessíveis: aria-invalid/aria-describedby).
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: (props: { id: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }) => ReactNode;
}

export const Field = ({ label, hint, error, required, className, children }: FieldProps) => {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-label text-ink-variant">
          {label}
          {required ? <span className="text-danger-600"> *</span> : null}
        </label>
      ) : null}
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-danger-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="break-words text-xs text-ink-variant">
          {hint}
        </p>
      ) : null}
    </div>
  );
};

// Figma: campos em surface-container-low (#f1f3ff), raio 8px, sem borda; foco com anel primário.
const control =
  'w-full rounded-lg border border-transparent bg-surface-low px-4 text-ink placeholder:text-ink-subtle/70 transition focus:border-primary-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-danger-600';

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: ReactNode; hint?: ReactNode; error?: string; containerClassName?: string };

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, hint, error, required, containerClassName, className, ...rest }, ref) => (
  <Field label={label} hint={hint} error={error} required={required} className={containerClassName}>
    {(a11y) => <input ref={ref} required={required} className={cn(control, 'h-12', className)} {...a11y} {...rest} />}
  </Field>
));
Input.displayName = 'Input';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label?: ReactNode; hint?: ReactNode; error?: string; containerClassName?: string };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, hint, error, required, containerClassName, className, children, ...rest }, ref) => (
  <Field label={label} hint={hint} error={error} required={required} className={containerClassName}>
    {(a11y) => (
      <select ref={ref} required={required} className={cn(control, 'h-12 pr-8', className)} {...a11y} {...rest}>
        {children}
      </select>
    )}
  </Field>
));
Select.displayName = 'Select';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: ReactNode; hint?: ReactNode; error?: string; containerClassName?: string };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, hint, error, required, containerClassName, className, ...rest }, ref) => (
  <Field label={label} hint={hint} error={error} required={required} className={containerClassName}>
    {(a11y) => <textarea ref={ref} required={required} className={cn(control, 'min-h-[96px] py-3', className)} {...a11y} {...rest} />}
  </Field>
));
Textarea.displayName = 'Textarea';

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; error?: string };

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ label, error, className, ...rest }, ref) => {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-2 text-sm text-ink-variant">
        <input ref={ref} id={id} type="checkbox" className="mt-0.5 h-4 w-4 rounded border-outline-variant accent-primary-600" aria-invalid={error ? true : undefined} {...rest} />
        <span>{label}</span>
      </label>
      {error ? <p className="mt-1 text-xs font-medium text-danger-600">{error}</p> : null}
    </div>
  );
});
Checkbox.displayName = 'Checkbox';
