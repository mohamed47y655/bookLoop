import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import CategoryBar from '@/components/CategoryBar';
import BookCard from '@/components/BookCard';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

export default function Index() {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const books = useAppStore((state) => state.books);

  const filtered = useMemo(() => {
    let result = books;
    if (category !== 'all') result = result.filter((b) => b.categoryID === category);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
    }
    return result;
  }, [category, search]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearch={setSearch} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-2">
            Discover <span className="text-primary glow-text">Books</span>
          </h1>
          <p className="text-muted-foreground">Buy and sell pre-loved books across Egypt</p>
        </motion.div>

        <div className="mb-8">
          <CategoryBar active={category} onSelect={setCategory} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((book, i) => (
            <BookCard key={book.bookID} book={book} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No books found</p>
          </div>
        )}
      </main>
    </div>
  );
}
