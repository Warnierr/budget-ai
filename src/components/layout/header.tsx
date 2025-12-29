'use client';

import { useSession } from 'next-auth/react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';

export function Header() {
  const { data: session } = useSession();
  const { theme } = useTheme();

  return (
    <header className={cn(
      "h-16 border-b flex items-center justify-between px-6 sticky top-0 z-30",
      theme.glassBackground,
      theme.glassBackdrop,
      theme.glassBorder
    )}>
      <div>
        <h2 className={cn("text-xl font-semibold", theme.textPrimary)}>
          Bienvenue, {session?.user?.name || 'Utilisateur'} !
        </h2>
        <p className={cn("text-sm", theme.textSecondary)}>
          Gérez votre budget intelligemment
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}

