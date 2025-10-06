import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <main className={`flex-1 p-6 bg-gray-50 overflow-auto ${className}`}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </main>
  );
}
