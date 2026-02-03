import { GraduationCap } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-3">
      <div className="gradient-institutional rounded-lg p-2 shadow-institutional">
        <GraduationCap className={`${sizeClasses[size]} text-accent`} />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizeClasses[size]} font-bold text-primary`}>
            UniGrades
          </span>
          <span className="text-xs text-muted-foreground">
            Système de Gestion des Notes
          </span>
        </div>
      )}
    </div>
  );
}
