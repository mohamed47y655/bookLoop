import { Book, BookCondition, BookVariant } from '@/data/types';

export const BOOK_CONDITIONS: BookCondition[] = ['Like New', 'Good', 'Fair', 'Acceptable'];

export function normalizeCondition(condition?: string): BookCondition {
  if (condition === 'Like New' || condition === 'Good' || condition === 'Fair' || condition === 'Acceptable') {
    return condition;
  }
  return 'Like New';
}

export function makeDefaultVariants(price: number, preferredCondition?: string): BookVariant[] {
  const base = Math.max(1, Number(price) || 1);
  const preferred = normalizeCondition(preferredCondition);
  return BOOK_CONDITIONS.map((condition) => ({
    condition,
    price: condition === 'Like New' ? base : condition === 'Good' ? Math.max(1, Math.round(base * 0.85)) : condition === 'Fair' ? Math.max(1, Math.round(base * 0.7)) : Math.max(1, Math.round(base * 0.55)),
    stock: condition === preferred ? 3 : condition === 'Like New' ? 2 : condition === 'Good' ? 4 : condition === 'Fair' ? 2 : 1,
  }));
}

export function getBookVariants(book: Book): BookVariant[] {
  const byCondition = new Map<BookCondition, BookVariant>();
  const source = book.variants?.length ? book.variants : makeDefaultVariants(book.price, book.condition);

  source.forEach((variant) => {
    const condition = normalizeCondition(variant.condition);
    byCondition.set(condition, {
      condition,
      price: Math.max(1, Number(variant.price) || Number(book.price) || 1),
      stock: Math.max(0, Math.floor(Number(variant.stock) || 0)),
    });
  });

  return BOOK_CONDITIONS.map((condition) => byCondition.get(condition)).filter(Boolean) as BookVariant[];
}

export function getVariant(book: Book, condition: BookCondition) {
  return getBookVariants(book).find((variant) => variant.condition === condition);
}

export function getAvailableVariants(book: Book) {
  return getBookVariants(book).filter((variant) => variant.stock > 0);
}

export function getDefaultVariant(book: Book) {
  return getAvailableVariants(book)[0] || getBookVariants(book)[0];
}

export function getBookMinPrice(book: Book) {
  const prices = getAvailableVariants(book).map((variant) => variant.price);
  if (prices.length === 0) return getBookVariants(book)[0]?.price || book.price;
  return Math.min(...prices);
}

export function getBookTotalStock(book: Book) {
  return getBookVariants(book).reduce((sum, variant) => sum + variant.stock, 0);
}

export function withNormalizedVariants(book: Book): Book {
  const variants = getBookVariants(book);
  const primary = getDefaultVariant({ ...book, variants });
  return {
    ...book,
    condition: primary?.condition || normalizeCondition(book.condition),
    price: primary?.price || book.price,
    variants,
  };
}
