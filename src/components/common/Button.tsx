import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  disabled = false,
  ...props
}, ref) => {
  const baseClasses = `
    inline-flex
    items-center
    justify-center
    font-medium
    rounded-lg
    transition-all
    duration-200
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    disabled:opacity-50
    disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  const variantClasses = {
    primary: `
      bg-blue-600
      text-white
      hover:bg-blue-700
      focus:ring-blue-500
      disabled:hover:bg-blue-600
    `,
    secondary: `
      bg-gray-600
      text-white
      hover:bg-gray-700
      focus:ring-gray-500
      disabled:hover:bg-gray-600
    `,
    outline: `
      bg-transparent
      text-gray-700
      border-2
      border-gray-300
      hover:bg-gray-50
      focus:ring-gray-500
      disabled:hover:bg-transparent
    `,
    danger: `
      bg-red-600
      text-white
      hover:bg-red-700
      focus:ring-red-500
      disabled:hover:bg-red-600
    `,
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <button
      ref={ref}
      className={combinedClasses}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;