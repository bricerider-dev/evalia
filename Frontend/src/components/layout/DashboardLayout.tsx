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
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
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
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-500 ease-in-out shadow-2xl z-20 relative",
        isCollapsed ? "w-24" : "w-64"
      )}>
        {/* Logo */}
        <div className={cn(
          "h-20 border-b border-sidebar-border flex items-center justify-center transition-all duration-500 relative",
          isCollapsed ? "px-2" : "px-6"
        )}>
          <Logo size={isCollapsed ? "xs" : "sm"} showText={false} />
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(true)}
              className="absolute right-4 text-sidebar-foreground/40 hover:text-sidebar-foreground transition-all hover:bg-white/10 rounded-xl"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative group overflow-hidden',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg scale-[1.02]'
                    : 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/30',
                  isCollapsed && "justify-center px-0"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r-full" />
                )}
                <item.icon className={cn(
                  "h-5 w-5 transition-transform duration-300 group-hover:scale-110 shrink-0",
                  isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/60"
                )} />
                {!isCollapsed && <span>{item.label}</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1 bg-sidebar text-sidebar-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-sidebar-border">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className={cn(
          "p-4 border-t border-sidebar-border bg-black/5 transition-all duration-500",
          isCollapsed ? "px-1" : "px-4"
        )}>
          <div className={cn(
            "flex items-center gap-2 px-1",
            isCollapsed && "justify-center"
          )}>
            <Avatar className="h-10 w-10 border-2 border-sidebar-primary/30 ring-2 ring-transparent hover:ring-accent transition-all duration-300 shrink-0">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm font-bold">
                {user ? getInitials(user.firstName, user.lastName) : '??'}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2">
                <p className="text-sm font-bold text-sidebar-foreground truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-sidebar-foreground/60 font-medium truncate uppercase tracking-wider">
                  {user ? getRoleLabel(user.role) : ''}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-50">
        {/* Animated Background decorative element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 animate-blob"></div>

        {/* Top bar */}
        <header className="h-20 glass border-b border-black/5 flex items-center justify-between px-8 sticky top-0 z-10 transition-all duration-500">
          <div className="flex items-center gap-4">
            {isCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(false)}
                className="text-primary hover:bg-primary/5 rounded-xl transition-all hover:scale-110"
              >
                <Menu className="h-6 w-6" />
              </Button>
            )}
            <h1 className="text-2xl font-black text-primary tracking-tight">
              {navItems.find((item) => item.to === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {user ? getInitials(user.firstName, user.lastName) : '??'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.firstName} {user?.lastName}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
