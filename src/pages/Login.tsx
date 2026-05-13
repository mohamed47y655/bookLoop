import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, LogIn, UserPlus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const login = useAppStore((state) => state.login);
  const signup = useAppStore((state) => state.signup);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as { from?: string } | null)?.from || '/';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result =
      mode === 'login'
        ? login(email, password)
        : signup({ name, email, password, phone, address });

    if (!result.ok) {
      toast({ title: 'Could not sign in', description: result.message, variant: 'destructive' });
      return;
    }

    toast({
      title: mode === 'login' ? 'Welcome back!' : 'Account created!',
      description: 'You are now signed in to BookLoop.',
    });
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center glow-border">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-bold text-2xl text-foreground">
            Book<span className="text-primary glow-text">Loop</span>
          </span>
        </Link>

        <div className="glass-strong glow-border rounded-2xl p-6">
          <div className="grid grid-cols-2 rounded-xl bg-muted/30 p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`h-10 rounded-lg text-sm font-semibold transition-colors ${mode === 'login' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`h-10 rounded-lg text-sm font-semibold transition-colors ${mode === 'signup' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full h-11 rounded-xl bg-muted/30 border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            )}
            <input
              required
              type="text"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full h-11 rounded-xl bg-muted/30 border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              required
              minLength={6}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full h-11 rounded-xl bg-muted/30 border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {mode === 'signup' && (
              <>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full h-11 rounded-xl bg-muted/30 border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Address"
                  rows={3}
                  className="w-full rounded-xl bg-muted/30 border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </>
            )}

            <button type="submit" className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-display font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              {mode === 'login' ? 'Login' : 'Create account'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
