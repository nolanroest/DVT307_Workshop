import React from 'react';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
}

export const Heading: React.FC<HeadingProps> = ({
  level,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'font-bold text-gray-900';

  const levelClasses = {
    1: 'text-4xl md:text-5xl',
    2: 'text-3xl md:text-4xl',
    3: 'text-2xl md:text-3xl',
    4: 'text-xl md:text-2xl',
    5: 'text-lg md:text-xl',
    6: 'text-base md:text-lg',
  };

  const combinedClasses = `${baseClasses} ${levelClasses[level]} ${className}`;

  // Use a switch statement for type safety
  switch (level) {
    case 1:
      return <h1 className={combinedClasses} {...props}>{children}</h1>;
    case 2:
      return <h2 className={combinedClasses} {...props}>{children}</h2>;
    case 3:
      return <h3 className={combinedClasses} {...props}>{children}</h3>;
    case 4:
      return <h4 className={combinedClasses} {...props}>{children}</h4>;
    case 5:
      return <h5 className={combinedClasses} {...props}>{children}</h5>;
    case 6:
      return <h6 className={combinedClasses} {...props}>{children}</h6>;
    default:
      return <h1 className={combinedClasses} {...props}>{children}</h1>;
  }
};

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'body' | 'small' | 'caption';
  color?: 'primary' | 'secondary' | 'muted' | 'error' | 'success';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  children: React.ReactNode;
  className?: string;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'primary',
  weight = 'normal',
  children,
  className = '',
  ...props
}) => {
  const variantClasses = {
    body: 'text-base',
    small: 'text-sm',
    caption: 'text-xs',
  };

  const colorClasses = {
    primary: 'text-gray-900',
    secondary: 'text-gray-700',
    muted: 'text-gray-500',
    error: 'text-red-600',
    success: 'text-green-600',
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const combinedClasses = `
    ${variantClasses[variant]}
    ${colorClasses[color]}
    ${weightClasses[weight]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <p className={combinedClasses} {...props}>
      {children}
    </p>
  );
};