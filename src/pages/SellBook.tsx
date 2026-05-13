import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Loader2 } from 'lucide-react';
import { categories } from '@/data/mockData';
import { BookCondition } from '@/data/types';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';

const conditions: BookCondition[] = ['Like New', 'Good', 'Fair', 'Acceptable'];

export default function SellBook() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [condition, setCondition] = useState<BookCondition | ''>('');
  const [categoryID, setCategoryID] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const addBook = useAppStore((state) => state.addBook);

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const urls = await Promise.all(Array.from(files).map((file) => fileToDataUrl(file)));
    setImages((prev) => [...prev, ...urls]);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!condition || !categoryID) {
      toast.error('Please choose a condition and category.');
      return;
    }

    const form = new FormData(e.currentTarget);
    setLoading(true);
    setTimeout(() => {
      addBook({
        variants: [{
          condition,
          price: Number(form.get('price') || 0),
          stock: Math.max(1, Math.floor(Number(form.get('stock') || 1))),
        }],
        title: String(form.get('title') || ''),
        author: String(form.get('author') || ''),
        price: Number(form.get('price') || 0),
        categoryID,
        imageURL: images[0] || '',
        condition,
        description: String(form.get('description') || ''),
        pages: Number(form.get('pages') || 0) || undefined,
        language: String(form.get('language') || 'English'),
        isbn: String(form.get('isbn') || '') || undefined,
      });
      setLoading(false);
      toast.success('Your book is now live on BookLoop!');
      navigate('/');
    }, 600);
  };

  const inputClass =
    'w-full rounded-xl glass border border-border/50 bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-32">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-1">
            List a <span className="text-primary glow-text">Book</span>
          </h1>
          <p className="text-muted-foreground mb-8">Share your book with the community</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.label
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/30 glass p-8 cursor-pointer hover:border-primary/60 transition-colors group"
          >
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Camera className="w-7 h-7 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Tap to add book photos
            </span>
            {images.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap justify-center">
                {images.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-16 h-16 rounded-lg object-cover border border-border/50" />
                ))}
              </div>
            )}
          </motion.label>

          <input required name="title" placeholder="Book Title" className={inputClass} />
          <input required name="author" placeholder="Author Name" className={inputClass} />

          <div className="grid grid-cols-2 gap-3">
            <input required name="price" type="number" min={1} placeholder="Price (EGP)" className={inputClass} />
            <input required name="stock" type="number" min={1} placeholder="Quantity in stock" className={inputClass} />
          </div>

          <input name="isbn" placeholder="ISBN" className={inputClass} />

          <textarea required name="description" placeholder="Description" rows={3} className={inputClass + ' min-h-[80px] resize-none'} />
          <textarea placeholder="Benefits / Key Takeaways" rows={3} className={inputClass + ' min-h-[80px] resize-none'} />

          <div className="grid grid-cols-2 gap-3">
            <input name="pages" type="number" min={1} placeholder="Pages" className={inputClass} />
            <input name="language" placeholder="Language" defaultValue="English" className={inputClass} />
          </div>

          <textarea placeholder="Condition Notes" rows={2} className={inputClass + ' min-h-[60px] resize-none'} />

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Condition</label>
            <div className="flex flex-wrap gap-2">
              {conditions.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setCondition(item)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    condition === item
                      ? 'bg-primary text-primary-foreground border-primary glow-border'
                      : 'glass border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/40'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategoryID(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    categoryID === cat.id
                      ? 'bg-primary text-primary-foreground border-primary glow-border'
                      : 'glass border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/40'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-display font-bold text-lg glow-border hover:bg-primary/90 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish Listing'
            )}
          </motion.button>
        </form>
      </main>
    </div>
  );
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
