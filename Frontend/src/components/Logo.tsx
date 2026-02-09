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

  const containerSizes = {
    xs: 'p-1 rounded-md',
    sm: 'p-1.5 rounded-lg',
    md: 'p-2 rounded-xl',
    lg: 'p-3 rounded-2xl',
  };

  const textSizeClasses = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className={cn("flex items-center group/logo", showText && (size === 'lg' ? "gap-4" : "gap-3"))}>
      <div className="relative">
        {/* Icon container with shimmer */}
        <div className={cn(
          "relative flex items-center justify-center bg-primary shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-white/20 overflow-hidden transition-all duration-500 group-hover/logo:shadow-[0_0_30px_rgba(37,99,235,0.6)] group-hover/logo:scale-110",
          containerSizes[size]
        )}>
          <GraduationCap className={cn("text-white transition-all duration-500 group-hover/logo:rotate-12 group-hover/logo:scale-110", sizeClasses[size])} />

          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/logo:translate-x-full transition-transform duration-700"></div>
        </div>
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={cn(
            textSizeClasses[size],
            "font-black tracking-tighter bg-gradient-to-r from-primary via-blue-500 to-purple-400 bg-clip-text text-transparent transition-all duration-300 group-hover/logo:scale-105"
          )}>
            Evalia
          </span>
          <span className={cn(
            size === 'lg' ? "text-xs" : "text-[10px]",
            "font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mt-1 transition-colors duration-300 group-hover/logo:text-muted-foreground/80"
          )}>
            Polytechnique Douala
          </span>
        </div>
      )}
    </div>
  );
}
