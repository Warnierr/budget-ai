'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Repeat,
  Target,
  Settings,
  LogOut,
  Brain,
  Wallet,
  Upload,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Comptes', href: '/dashboard/accounts', icon: Wallet },
  { name: 'Import CSV', href: '/dashboard/import', icon: Upload },
  { name: 'Revenus', href: '/dashboard/incomes', icon: TrendingUp },
  { name: 'Dépenses', href: '/dashboard/expenses', icon: TrendingDown },
  { name: 'Abonnements', href: '/dashboard/subscriptions', icon: Repeat },
  { name: 'Objectifs', href: '/dashboard/goals', icon: Target },
  { name: 'Assistant IA', href: '/dashboard/ai', icon: Brain },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col fixed bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">Budget AI</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-800 p-4 space-y-2">
        <Link href="/dashboard/settings">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <Settings className="mr-3 h-5 w-5" />
            Paramètres
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
}

