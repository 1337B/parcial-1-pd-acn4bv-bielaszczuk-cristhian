import { ReactNode } from 'react';
import { AppHeader, AppSidebar, Container } from '@/components/ui';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900">
      <AppHeader />
      <div className="flex">
        <AppSidebar />
        <Container>
          {children}
        </Container>
      </div>
    </div>
  );
}
