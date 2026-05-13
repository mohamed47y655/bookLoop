import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import Navbar from '@/components/Navbar';
import CheckoutFlow from '@/components/CheckoutFlow';
import BookCover from '@/components/BookCover';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getVariant } from '@/lib/bookVariants';

export default function Cart() {
  const cart = useAppStore((s) => s.cart);
  const books = useAppStore((s) => s.books);
  const removeFromCart = useAppStore((s) => s.removeFromCart);
  const updateCartQuantity = useAppStore((s) => s.updateCartQuantity);
  const [showCheckout, setShowCheckout] = useState(false);

  const cartItems = cart
    .map((item) => {
      const book = books.find((b) => b.bookID === item.bookID);
      const variant = book ? getVariant(book, item.condition) : undefined;
      return book && variant ? { ...item, book, variant } : null;
    })
    .filter(Boolean);
  const total = cartItems.reduce((sum, item) => sum + item!.variant.price * item!.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <h1 className="font-display text-3xl font-bold text-foreground mb-6">
          Your <span className="text-primary glow-text">Cart</span>
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Link to="/" className="text-primary hover:underline text-sm">Browse books</Link>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={`${item!.bookID}-${item!.condition}`}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="glass glow-border rounded-xl p-4 flex gap-4"
                >
                  <BookCover src={item!.book.imageURL} title={item!.book.title} author={item!.book.author} className="w-20 h-28 flex-none rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-foreground text-sm truncate">{item!.book.title}</h3>
                    <p className="text-xs text-muted-foreground">{item!.book.author}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item!.condition} · {item!.variant.price} EGP each</p>
                    {item!.variant.stock < 5 && <p className="text-xs text-primary mt-1">Only {item!.variant.stock} left</p>}
                    <p className="font-display font-bold text-primary mt-2">{item!.variant.price * item!.quantity} EGP</p>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item!.bookID, item!.condition, item!.quantity - 1)}
                        className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={item!.variant.stock}
                        value={item!.quantity}
                        onChange={(e) => updateCartQuantity(item!.bookID, item!.condition, Number(e.target.value) || 1)}
                        className="h-8 w-16 rounded-lg bg-muted/30 border border-border text-center text-sm text-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item!.bookID, item!.condition, item!.quantity + 1)}
                        disabled={item!.quantity >= item!.variant.stock}
                        className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary disabled:opacity-40"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item!.bookID, item!.condition)} className="p-2 h-fit rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="glass-strong glow-border rounded-xl p-5 mt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground">Total ({cartItems.reduce((sum, item) => sum + item!.quantity, 0)} items)</span>
                <span className="font-display text-2xl font-bold text-primary glow-text">{total} EGP</span>
              </div>
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-display font-semibold hover:opacity-90 transition-opacity"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showCheckout && <CheckoutFlow onClose={() => setShowCheckout(false)} />}
      </AnimatePresence>
    </div>
  );
}
