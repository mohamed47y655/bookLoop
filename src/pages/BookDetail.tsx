import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import Navbar from '@/components/Navbar';
import BookCover from '@/components/BookCover';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Star, BookOpen, Globe, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getBookVariants, getDefaultVariant, getVariant } from '@/lib/bookVariants';
import { BookCondition } from '@/data/types';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const books = useAppStore((s) => s.books);
  const book = books.find((b) => b.bookID === id);
  const addToCart = useAppStore((s) => s.addToCart);
  const cart = useAppStore((s) => s.cart);
  const currentUser = useAppStore((s) => s.currentUser());
  const { toast } = useToast();
  const defaultVariant = book ? getDefaultVariant(book) : undefined;
  const [selectedCondition, setSelectedCondition] = useState<BookCondition>(defaultVariant?.condition || 'Good');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (defaultVariant) {
      setSelectedCondition(defaultVariant.condition);
      setQuantity(1);
    }
  }, [book?.bookID]);

  if (!book) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Book not found</div>;

  const variants = getBookVariants(book);
  const selectedVariant = getVariant(book, selectedCondition) || variants[0];
  const inCart = cart.some((c) => c.bookID === book.bookID && c.condition === selectedCondition);
  const soldOut = !selectedVariant || selectedVariant.stock <= 0;
  const maxQuantity = Math.max(1, selectedVariant?.stock || 1);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="aspect-[3/4] rounded-2xl overflow-hidden glow-border">
            <BookCover src={book.imageURL} title={book.title} author={book.author} className="w-full h-full" loading="eager" />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30 mb-3">
                {soldOut ? 'Sold out' : selectedCondition}
              </span>
              <h1 className="font-display text-3xl font-bold text-foreground mb-1">{book.title}</h1>
              <p className="text-muted-foreground">by {book.author}</p>
            </div>

            <div className="font-display text-4xl font-bold text-primary glow-text">
              {selectedVariant?.price || book.price} <span className="text-lg">EGP</span>
            </div>

            <div className="space-y-3">
              <h3 className="font-display font-semibold text-foreground text-sm">Choose condition</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {variants.map((variant) => (
                  <button
                    type="button"
                    key={variant.condition}
                    disabled={variant.stock <= 0}
                    onClick={() => {
                      setSelectedCondition(variant.condition);
                      setQuantity(1);
                    }}
                    className={`rounded-xl border p-3 text-left transition-all disabled:opacity-45 disabled:cursor-not-allowed ${
                      selectedCondition === variant.condition
                        ? 'glow-border bg-primary/10 border-primary/60'
                        : 'border-border hover:border-primary/40 bg-muted/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm font-semibold text-foreground">{variant.condition}</span>
                      <span className="text-sm font-bold text-primary">{variant.price} EGP</span>
                    </div>
                    <p className={`text-xs mt-1 ${variant.stock > 0 && variant.stock < 5 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {variant.stock <= 0 ? 'Sold out' : variant.stock < 5 ? `Only ${variant.stock} left` : `${variant.stock} available`}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-muted-foreground" htmlFor="book-quantity">Quantity</label>
              <input
                id="book-quantity"
                type="number"
                min={1}
                max={maxQuantity}
                value={quantity}
                disabled={soldOut}
                onChange={(e) => setQuantity(Math.max(1, Math.min(maxQuantity, Number(e.target.value) || 1)))}
                className="h-10 w-24 rounded-lg bg-muted/30 border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
              {selectedVariant?.stock && selectedVariant.stock < 5 ? (
                <span className="text-xs text-primary">Only {selectedVariant.stock} left in stock</span>
              ) : null}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">{book.description}</p>

            <div className="glass glow-border rounded-xl p-4 space-y-3">
              <h3 className="font-display font-semibold text-foreground text-sm">Book Specs</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {book.pages && <div className="flex items-center gap-2 text-muted-foreground"><BookOpen className="w-4 h-4 text-primary" />{book.pages} pages</div>}
                {book.language && <div className="flex items-center gap-2 text-muted-foreground"><Globe className="w-4 h-4 text-primary" />{book.language}</div>}
                {book.isbn && <div className="flex items-center gap-2 text-muted-foreground col-span-2"><Hash className="w-4 h-4 text-primary" />{book.isbn}</div>}
              </div>
            </div>

            <div className="glass glow-border-purple rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                  {book.seller.name[0]}
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{book.seller.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Star className="w-3 h-3 fill-primary text-primary" /> {book.seller.rating} · {book.seller.sales} sales
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (!currentUser) { navigate('/login', { state: { from: `/book/${book.bookID}` } }); return; }
                if (inCart) { navigate('/cart'); return; }
                const result = addToCart(book.bookID, selectedCondition, quantity);
                if (!result.ok) {
                  toast({ title: 'Could not add to cart', description: result.message, variant: 'destructive' });
                  return;
                }
                toast({ title: 'Added to cart!', description: `${quantity} x ${book.title} (${selectedCondition}) has been added.` });
              }}
              disabled={soldOut}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-display font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <ShoppingCart className="w-5 h-5" />
              {soldOut ? 'Sold Out' : inCart ? 'View Cart' : 'Add to Cart'}
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
