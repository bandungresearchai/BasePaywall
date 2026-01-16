import React from 'react';

export default function Button({
  children,
  className = '',
  variant = 'primary',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'default' }) {
  const base = 'btn';
  const variantClass = variant === 'primary' ? 'btn-primary' : 'btn';
  return (
    <button className={`${base} ${variantClass} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}
