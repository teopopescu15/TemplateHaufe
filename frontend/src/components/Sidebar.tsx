import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, ChevronLeft, Menu, Code2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';

// Navigation items defined outside component to prevent re-creation
const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Code2, label: 'Monaco Editor', path: '/monaco-editor' },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { state, toggleSidebar, isMobile, openMobile } = useSidebar();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const isActive = (path: string) => location.pathname === path;
  const isExpanded = state === 'expanded';

  useEffect(() => {
    console.log('🎯 [SIDEBAR DEBUG] Sidebar component mounted');
    console.log('🎯 [SIDEBAR DEBUG] User in Sidebar:', user);
    console.log('🎯 [SIDEBAR DEBUG] Sidebar state:', state);
    console.log('🎯 [SIDEBAR DEBUG] Is expanded:', isExpanded);
    console.log('🎯 [SIDEBAR DEBUG] Is Mobile:', isMobile);
    console.log('🎯 [SIDEBAR DEBUG] Open Mobile:', openMobile);
    console.log('🎯 [SIDEBAR DEBUG] Window Width:', window.innerWidth);
  }, [user, state, isExpanded, isMobile, openMobile]);

  return (
    <ShadcnSidebar
        collapsible="icon"
        variant="inset"
        className="border-r border-slate-800/50 bg-gradient-to-b from-[#0a0e1a] to-[#020617]"
        style={{ boxShadow: '0 0 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(96, 165, 250, 0.1)' }}
      >
      {/* Header */}
      <SidebarHeader className="border-b border-slate-800/50 min-h-[8rem] relative flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6 pb-4">
          <div
            className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-glow-blue-lg animate-glow-pulse group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 transition-all"
            style={{ boxShadow: '0 0 30px rgba(96, 165, 250, 0.6), 0 0 60px rgba(96, 165, 250, 0.3)' }}
          >
            <LayoutDashboard className="w-7 h-7 text-white group-data-[collapsible=icon]:w-6 group-data-[collapsible=icon]:h-6" />
          </div>
          <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 animate-shimmer bg-[length:200%_auto] group-data-[collapsible=icon]:hidden">
            Dashboard
          </span>
        </div>

        {/* Toggle Button - Positioned at top right with proper spacing */}
        <button
          onClick={toggleSidebar}
          className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg flex items-center justify-center shadow-glow-blue transition-all duration-300 hover:scale-110 group-data-[collapsible=icon]:right-2 z-10"
          style={{ boxShadow: '0 0 15px rgba(96, 165, 250, 0.4)' }}
        >
          {isExpanded ? (
            <ChevronLeft className="w-5 h-5 text-white" />
          ) : (
            <Menu className="w-5 h-5 text-white" />
          )}
        </button>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      isActive={active}
                      tooltip={item.label}
                      className={`h-14 group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                        active
                          ? 'bg-gradient-to-br from-blue-500/20 via-blue-600/20 to-cyan-500/20 shadow-glow-blue-lg'
                          : 'bg-slate-900/30 hover:bg-slate-800/50 hover:shadow-glow-blue'
                      } border ${
                        active ? 'border-blue-500/40' : 'border-slate-800/50 hover:border-blue-500/30'
                      }`}
                      style={active ? { boxShadow: '0 0 25px rgba(96, 165, 250, 0.4), inset 0 0 20px rgba(96, 165, 250, 0.1)' } : {}}
                    >
                      {/* Active indicator glow */}
                      {active && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 animate-shimmer bg-[length:200%_auto]" />
                      )}

                      {/* Icon */}
                      <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                        active
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-glow-blue'
                          : 'bg-slate-800/50 group-hover:bg-blue-500/20'
                      }`}>
                        <Icon
                          className={`w-6 h-6 transition-all duration-300 ${
                            active
                              ? 'text-white scale-110'
                              : 'text-slate-400 group-hover:text-blue-400 group-hover:scale-110'
                          }`}
                        />
                      </div>

                      {/* Label */}
                      <span className={`text-base font-bold transition-all duration-300 group-data-[collapsible=icon]:hidden ${
                        active
                          ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300'
                          : 'text-slate-300 group-hover:text-blue-300'
                      }`}>
                        {item.label}
                      </span>

                      {/* Hover glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with Logout */}
      <SidebarFooter className="border-t border-slate-800/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Logout"
              className="h-14 group relative overflow-hidden rounded-2xl transition-all duration-300 bg-gradient-to-br from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 border border-red-500/30 hover:border-red-500/50 hover:shadow-[0_0_25px_rgba(239,68,68,0.4)]"
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/20 group-hover:bg-red-500/30 transition-all duration-300">
                <LogOut className="w-6 h-6 text-red-400 group-hover:text-red-300 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
              </div>

              {/* Label */}
              <span className="text-base font-bold text-red-400 group-hover:text-red-300 transition-all duration-300 group-data-[collapsible=icon]:hidden">
                Logout
              </span>

              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Rail for toggling */}
      <SidebarRail />
    </ShadcnSidebar>
  );
};

export default Sidebar;
