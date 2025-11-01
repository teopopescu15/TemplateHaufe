import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Sidebar from './Sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
    console.log('🔍 [LAYOUT DEBUG] Layout component mounted');
    console.log('🔍 [LAYOUT DEBUG] User:', user);
  }, [user]);

  // Determine if we should default the sidebar to open based on screen size
  // On desktop (>=1024px), sidebar should be expanded by default
  const defaultSidebarOpen = typeof window !== 'undefined' && window.innerWidth >= 1024;

  return (
    <SidebarProvider defaultOpen={defaultSidebarOpen}>
      <div className="flex min-h-screen w-full bg-[#020617]">
        <Sidebar />
        <SidebarInset className="flex-1">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
