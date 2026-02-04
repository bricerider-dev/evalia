import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  };

  const textSizeClasses = {
    xs: 'text-base',
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={cn("flex items-center", showText && "gap-3")}>
      <div className="flex items-center justify-center bg-white rounded-lg overflow-hidden shadow-sm border border-slate-100 p-0.5">
        <img
          src="/enspd-logo.jpg"
          alt="ENSPD Logo"
          className={cn("object-contain", sizeClasses[size])}
        />
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={cn(textSizeClasses[size], "font-black text-primary tracking-tighter")}>
            Evalia
          </span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Polytechnique Douala
          </span>
        </div>
      )}
    </div>
  );
}
