import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  ClipboardList,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Visual/Layout States
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getInitials = (firstName: string, lastName: string) => {

    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'teacher':
        return 'Enseignant';
      case 'student':
        return 'Étudiant';
      default:
        return role;
    }
  };

  // Navigation items based on role
  const getNavItems = () => {
    const baseItems = [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    ];

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { to: '/dashboard/filieres', icon: GraduationCap, label: 'Filières' },
        { to: '/dashboard/students', icon: Users, label: 'Étudiants' },
        { to: '/dashboard/teachers', icon: User, label: 'Enseignants' },
        { to: '/dashboard/subjects', icon: BookOpen, label: 'Matières' },
        { to: '/dashboard/evaluations', icon: ClipboardList, label: 'Évaluations' },
        { to: '/dashboard/reports', icon: FileText, label: 'Rapports' },
        { to: '/dashboard/my-subjects', icon: BookOpen, label: 'Mes Matières' },
        { to: '/dashboard/grades', icon: ClipboardList, label: 'Saisie des Notes' },
        { to: '/dashboard/statistics', icon: FileText, label: 'Statistiques' },
      ];
    }

    if (user?.role === 'teacher') {
      return [
        ...baseItems,
        { to: '/dashboard/my-subjects', icon: BookOpen, label: 'Mes Matières' },
        { to: '/dashboard/grades', icon: ClipboardList, label: 'Saisie des Notes' },
        { to: '/dashboard/statistics', icon: FileText, label: 'Statistiques' },
      ];
    }

    // Student
    return [
      ...baseItems,
      { to: '/dashboard/my-grades', icon: ClipboardList, label: 'Mes Notes' },
      { to: '/dashboard/transcript', icon: FileText, label: 'Relevé de Notes' },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-500">
      {/* Tech Sidebar */}
      <aside className={cn(
        "h-screen sticky top-0 bg-card/40 backdrop-blur-3xl border-r border-white/5 flex flex-col transition-all duration-500 ease-in-out z-20",
        isCollapsed ? "w-24" : "w-64"
      )}>
        {/* Glow behind sidebar */}
        <div className="absolute inset-0 bg-primary/2 pointer-events-none" />

        {/* Logo */}
        <div className={cn(
          "h-20 border-b border-white/5 flex items-center justify-center transition-all duration-500 shrink-0",
          isCollapsed ? "px-2" : "px-6"
        )}>
          <Logo size={isCollapsed ? "xs" : "sm"} showText={!isCollapsed} />
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(true)}
              className="absolute right-4 text-muted-foreground/40 hover:text-primary transition-all hover:bg-white/5 rounded-xl group"
            >
              <ChevronLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
            </Button>
          )}
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 p-3 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-300 relative group overflow-hidden mb-1',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5',
                  isCollapsed && "justify-center px-0"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-transform duration-300 group-hover:scale-110 shrink-0",
                  isActive ? "text-primary-foreground" : "text-muted-foreground/60"
                )} />
                {!isCollapsed && <span>{item.label}</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-card/90 backdrop-blur-md text-foreground text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all scale-95 group-hover:scale-100 whitespace-nowrap z-50 shadow-2xl border border-white/10">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section - Fixed at bottom */}
        <div className={cn(
          "px-4 py-6 border-t border-white/5 bg-gradient-to-t from-primary/10 via-transparent to-transparent dark:from-white/5 transition-all duration-700 shrink-0 mt-auto overflow-hidden group/pod",
          isCollapsed ? "px-2" : "px-4"
        )}>
          {/* Animated Background Glow for the pod */}
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/pod:opacity-100 transition-opacity duration-700 blur-2xl -z-10" />

          <div className={cn(
            "flex items-center gap-3 p-2 rounded-2xl bg-white/5 dark:bg-white/2 border border-white/5 backdrop-blur-md transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 group/user relative cursor-pointer",
            isCollapsed && "justify-center p-1"
          )}>
            <div className="relative shrink-0">
              {/* Status Indicator */}
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background z-10">
                <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" />
              </div>

              <div className="absolute -inset-1 bg-gradient-to-tr from-primary via-purple-500 to-blue-400 rounded-full blur opacity-20 group-hover/user:opacity-60 transition duration-500 group-hover/user:rotate-180" />
              <Avatar className="relative h-11 w-11 border-2 border-white/20 shrink-0 transition-transform duration-500 group-hover/user:scale-110 shadow-xl">
                <AvatarFallback className="bg-gradient-to-br from-card to-muted text-primary text-sm font-black italic tracking-tighter">
                  {user ? getInitials(user.firstName, user.lastName) : '??'}
                </AvatarFallback>
              </Avatar>
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0 animate-fade-in-right">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black truncate tracking-tight text-foreground transition-colors group-hover/user:text-primary">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
                  <p className="text-[10px] text-muted-foreground font-bold truncate uppercase tracking-widest mt-0.5">
                    {user ? getRoleLabel(user.role) : ''}
                  </p>
                </div>
              </div>
            )}

            {!isCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg opacity-0 group-hover/user:opacity-100 transition-all hover:bg-white/10 hover:rotate-90 duration-500"
              >
                <div className="w-1 h-1 bg-muted-foreground rounded-full shadow-[0_4px_0_rgba(0,0,0,0.1),0_-4px_0_rgba(0,0,0,0.1)] scale-125" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-background">
        {/* Dynamic Background decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 animate-glow" />

        {/* Header */}
        <header className="h-20 bg-background/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-10 transition-all duration-500">
          <div className="flex items-center gap-4">
            {isCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(false)}
                className="text-primary hover:bg-primary/10 rounded-xl transition-all hover:scale-110"
              >
                <Menu className="h-6 w-6" />
              </Button>
            )}
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Navigation</span>
              <h1 className="text-2xl font-black tracking-tight">
                {navItems.find((item) => item.to === location.pathname)?.label || 'Dashboard'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-110 hover:rotate-12 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] group"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
              ) : (
                <Sun className="h-5 w-5 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5 transition-all duration-300 hover:scale-105 active:scale-95 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Avatar className="h-9 w-9 border-2 border-white/10 group-hover:border-primary/50 transition-all duration-300 shadow-lg group-hover:shadow-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xs font-black italic tracking-tighter group-hover:scale-110 transition-transform duration-300">
                      {user ? getInitials(user.firstName, user.lastName) : '??'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-card/90 backdrop-blur-xl border-white/10 p-2 rounded-2xl">
                <DropdownMenuLabel className="pb-3 pt-2">
                  <div className="flex flex-col gap-1 px-1">
                    <span className="font-black tracking-tight">{user?.firstName} {user?.lastName}</span>
                    <span className="text-xs font-medium text-muted-foreground italic">
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive font-bold focus:bg-destructive/10 rounded-xl mt-1">
                  <LogOut className="mr-3 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8 overflow-auto relative selection:bg-primary/30">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
