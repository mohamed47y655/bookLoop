import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { PaymentMethod } from '@/data/types';
import { CreditCard, Smartphone, Banknote, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getVariant } from '@/lib/bookVariants';

export default function CheckoutFlow({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState<PaymentMethod | ''>('');
  const cart = useAppStore((s) => s.cart);
  const books = useAppStore((s) => s.books);
  const placeOrder = useAppStore((s) => s.placeOrder);
  const navigate = useNavigate();
  const { toast } = useToast();

  const cartItems = cart
    .map((item) => {
      const book = books.find((b) => b.bookID === item.bookID);
      const variant = book ? getVariant(book, item.condition) : undefined;
      return book && variant ? { ...item, book, variant } : null;
    })
    .filter(Boolean);
  const total = cartItems.reduce((sum, item) => sum + item!.variant.price * item!.quantity, 0);

  const handleSubmit = () => {
    if (!payment) return;
    const result = placeOrder({
      fullName,
      phone,
      address,
      paymentMethod: payment,
    });
    if (!result.ok) {
      toast({ title: 'Could not place order', description: result.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Order Placed! 🎉', description: 'Your order is being prepared.' });
    onClose();
    navigate('/profile');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        className="glass-strong glow-border rounded-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 2 && <div className={`w-12 h-0.5 ${step > 1 ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="shipping" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
              <h2 className="font-display text-xl font-bold text-foreground">Shipping Details</h2>
              <div className="neon-line w-full" />
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="w-full h-11 rounded-xl bg-muted/30 border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" className="w-full h-11 rounded-xl bg-muted/30 border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Detailed Delivery Address (Location)" rows={3} className="w-full rounded-xl bg-muted/30 border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
              <button
                disabled={!fullName || !phone || !address}
                onClick={() => setStep(2)}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div key="payment" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} className="space-y-4">
              <h2 className="font-display text-xl font-bold text-foreground">Payment Method</h2>
              <div className="neon-line w-full" />
              {([
                { id: 'CC' as PaymentMethod, label: 'Credit Card', icon: CreditCard },
                { id: 'VfCash' as PaymentMethod, label: 'Vodafone Cash', icon: Smartphone },
                { id: 'COD' as PaymentMethod, label: 'Cash on Delivery', icon: Banknote },
              ]).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setPayment(opt.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${payment === opt.id ? 'glow-border bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'}`}
                >
                  <opt.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{opt.label}</span>
                </button>
              ))}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-display font-bold text-lg text-primary glow-text">{total} EGP</span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 h-11 rounded-xl border border-border text-muted-foreground font-medium flex items-center justify-center gap-2 hover:bg-muted/20 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  disabled={!payment}
                  onClick={handleSubmit}
                  className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Place Order <Check className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
