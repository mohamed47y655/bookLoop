import { Link, useLocation } from 'react-router-dom';
import { LogIn, LogOut, Shield, ShoppingCart, User, BookOpen, Search } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ onSearch }: { onSearch?: (q: string) => void }) {
  const cart = useAppStore((s) => s.cart);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const currentUser = useAppStore((s) => s.currentUser());
  const logout = useAppStore((s) => s.logout);
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center glow-border">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Book<span className="text-primary glow-text">Loop</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <AnimatePresence>
              {searchOpen && (
                <motion.input
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="h-9 rounded-lg bg-muted/50 border border-border px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Search books..."
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); onSearch?.(e.target.value); }}
                  autoFocus
                />
              )}
            </AnimatePresence>
            <button
              onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) { setQuery(''); onSearch?.(''); } }}
              className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              to="/cart"
              className="relative p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {currentUser ? (
              <>
                {currentUser.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`p-2 rounded-lg hover:bg-muted/50 transition-colors ${location.pathname === '/admin' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                    title="Admin"
                  >
                    <Shield className="w-5 h-5" />
                  </Link>
                )}
                <Link
                  to="/profile"
                  className={`p-2 rounded-lg hover:bg-muted/50 transition-colors ${location.pathname === '/profile' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                  title={currentUser.name}
                >
                  <User className="w-5 h-5" />
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className={`p-2 rounded-lg hover:bg-muted/50 transition-colors ${location.pathname === '/login' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                title="Login"
              >
                <LogIn className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
