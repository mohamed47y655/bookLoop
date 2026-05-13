import { Book } from '@/data/types';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import BookCover from './BookCover';
import { getBookMinPrice, getBookTotalStock } from '@/lib/bookVariants';

export default function BookCard({ book, index = 0 }: { book: Book; index?: number }) {
  const totalStock = getBookTotalStock(book);
  const minPrice = getBookMinPrice(book);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link to={`/book/${book.bookID}`} className="block group">
        <div className="glass glow-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.4)] hover:scale-[1.02]">
          <div className="aspect-[3/4] overflow-hidden relative">
            <BookCover
              src={book.imageURL}
              title={book.title}
              author={book.author}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm ${totalStock > 0 ? 'bg-primary/20 text-primary border-primary/30' : 'bg-destructive/20 text-destructive border-destructive/30'}`}>
                {totalStock > 0 ? `${totalStock} in stock` : 'Sold out'}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-2">
            <h3 className="font-display font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {book.title}
            </h3>
            <p className="text-xs text-muted-foreground">{book.author}</p>
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-primary glow-text">
                From {minPrice} EGP
              </span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3 fill-primary text-primary" />
                {book.seller.rating}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
