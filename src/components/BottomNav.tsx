import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, PlusCircle, User, Shield, LogIn } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function BottomNav() {
  const location = useLocation();
  const cart = useAppStore((s) => s.cart);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const currentUser = useAppStore((s) => s.currentUser());
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/cart', icon: ShoppingCart, label: 'Cart' },
    { to: '/sell', icon: PlusCircle, label: 'Sell', accent: true },
    currentUser?.role === 'admin'
      ? { to: '/admin', icon: Shield, label: 'Admin' }
      : currentUser
      ? { to: '/profile', icon: User, label: 'Profile' }
      : { to: '/login', icon: LogIn, label: 'Login' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border/30 sm:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ to, icon: Icon, label, accent }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 text-xs transition-colors relative ${
                accent
                  ? 'text-primary'
                  : active
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {accent ? (
                <div className="w-12 h-12 -mt-6 rounded-full bg-primary flex items-center justify-center glow-border shadow-lg">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
              ) : (
                <Icon className="w-5 h-5" />
              )}
              {to === '/cart' && cartCount > 0 && (
                <span className="absolute -top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
              <span className={accent ? 'mt-1' : ''}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
