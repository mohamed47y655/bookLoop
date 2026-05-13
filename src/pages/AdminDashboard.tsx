import { useEffect, useState } from 'react';
import type { FormEvent, InputHTMLAttributes } from 'react';
import Navbar from '@/components/Navbar';
import BookCover from '@/components/BookCover';
import { categories } from '@/data/mockData';
import { Book, BookCondition, OrderStatus } from '@/data/types';
import { useAppStore } from '@/store/useAppStore';
import { BOOK_CONDITIONS, getBookMinPrice, getBookTotalStock, getBookVariants } from '@/lib/bookVariants';
import { motion } from 'framer-motion';
import { BookOpen, Edit3, ImagePlus, Package, Plus, Save, Trash2, Users, X } from 'lucide-react';

const orderStatuses: OrderStatus[] = ['Preparing', 'In Transit', 'Delivered'];
type VariantFormState = Record<BookCondition, { enabled: boolean; price: string; stock: string }>;

type BookFormState = {
  title: string;
  author: string;
  categoryID: string;
  imageURL: string;
  variants: VariantFormState;
  description: string;
  pages: string;
  language: string;
  isbn: string;
};

const emptyBookForm: BookFormState = {
  title: '',
  author: '',
  categoryID: categories[0]?.id || 'programming',
  imageURL: '',
  variants: createEmptyVariants(),
  description: '',
  pages: '',
  language: 'English',
  isbn: '',
};

function createEmptyVariants(): VariantFormState {
  return BOOK_CONDITIONS.reduce((acc, condition) => {
    acc[condition] = { enabled: condition === 'Good', price: '', stock: condition === 'Good' ? '1' : '0' };
    return acc;
  }, {} as VariantFormState);
}

export default function AdminDashboard() {
  const users = useAppStore((state) => state.users);
  const books = useAppStore((state) => state.books);
  const orders = useAppStore((state) => state.orders);
  const addBook = useAppStore((state) => state.addBook);
  const updateBook = useAppStore((state) => state.updateBook);
  const removeBook = useAppStore((state) => state.removeBook);
  const removeUser = useAppStore((state) => state.removeUser);
  const removeOrder = useAppStore((state) => state.removeOrder);
  const updateOrderStatus = useAppStore((state) => state.updateOrderStatus);
  const [editingBookID, setEditingBookID] = useState<string | null>(null);

  const customerCount = users.filter((user) => user.role === 'customer').length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const editingBook = books.find((book) => book.bookID === editingBookID) || null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Admin <span className="text-primary glow-text">Dashboard</span>
          </h1>
          <p className="text-muted-foreground">Manage users, books, images, and customer orders.</p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Stat icon={Users} label="Customers" value={customerCount.toString()} />
          <Stat icon={BookOpen} label="Books" value={books.length.toString()} />
          <Stat icon={Package} label="Revenue" value={`${totalRevenue} EGP`} />
        </div>

        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">Book Editor</h2>
          <BookForm
            key={editingBook?.bookID || 'new-book'}
            book={editingBook}
            onCancel={editingBook ? () => setEditingBookID(null) : undefined}
            onSubmit={(payload) => {
              if (editingBook) {
                updateBook(editingBook.bookID, payload);
                setEditingBookID(null);
                return;
              }
              addBook(payload);
            }}
          />
        </section>

        <section className="mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">Orders</h2>
          <div className="space-y-3">
            {orders.length === 0 ? (
              <EmptyState text="No orders yet." />
            ) : (
              orders.map((order) => {
                const book = books.find((item) => item.bookID === order.bookID);
                const user = users.find((item) => item.userID === order.userID);
                return (
                  <div key={order.orderID} className="glass glow-border rounded-xl p-4 grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                    <div className="flex items-center gap-3 min-w-0">
                      {book && <BookCover src={book.imageURL} title={book.title} author={book.author} className="w-14 h-20 flex-none rounded-lg" />}
                      <div className="min-w-0">
                        <h3 className="font-display font-semibold text-foreground text-sm truncate">{book?.title || 'Unknown book'}</h3>
                        <p className="text-xs text-muted-foreground truncate">{user?.name || 'Deleted user'} - {order.fullName}</p>
                        <p className="text-xs text-muted-foreground">{order.condition || 'Good'} x {order.quantity || 1} - {order.total} EGP - {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <select
                      value={order.orderStatus}
                      onChange={(e) => updateOrderStatus(order.orderID, e.target.value as OrderStatus)}
                      className="h-10 rounded-lg bg-muted/30 border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <IconButton icon={Trash2} label="Delete order" onClick={() => removeOrder(order.orderID)} tone="danger" />
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Users</h2>
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.userID} className="glass glow-border-purple rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-display font-semibold text-foreground text-sm truncate">{user.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <p className="text-xs text-primary mt-1">{user.role}</p>
                  </div>
                  {user.role !== 'admin' && <IconButton icon={Trash2} label="Delete user" onClick={() => removeUser(user.userID)} tone="danger" />}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Books</h2>
            <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
              {books.map((book) => (
                <div key={book.bookID} className={`glass rounded-xl p-4 flex items-center justify-between gap-4 ${editingBookID === book.bookID ? 'glow-border-purple' : 'glow-border'}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <BookCover src={book.imageURL} title={book.title} author={book.author} className="w-12 h-16 flex-none rounded-lg" />
                    <div className="min-w-0">
                      <h3 className="font-display font-semibold text-foreground text-sm truncate">{book.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{book.author}</p>
                      <p className="text-xs text-primary mt-1">
                        {getBookTotalStock(book) > 0 ? `From ${getBookMinPrice(book)} EGP · ${getBookTotalStock(book)} in stock` : 'Sold out'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconButton icon={Edit3} label="Edit book" onClick={() => setEditingBookID(book.bookID)} />
                    <IconButton icon={Trash2} label="Delete book" onClick={() => removeBook(book.bookID)} tone="danger" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function BookForm({
  book,
  onSubmit,
  onCancel,
}: {
  book: Book | null;
  onSubmit: (book: Omit<Book, 'bookID' | 'seller'>) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<BookFormState>(() => bookToForm(book));

  useEffect(() => {
    setForm(bookToForm(book));
  }, [book]);

  const updateField = (key: Exclude<keyof BookFormState, 'variants'>, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateVariant = (condition: BookCondition, patch: Partial<VariantFormState[BookCondition]>) => {
    setForm((current) => ({
      ...current,
      variants: {
        ...current.variants,
        [condition]: { ...current.variants[condition], ...patch },
      },
    }));
  };

  const handleImageFile = async (file?: File) => {
    if (!file) return;
    updateField('imageURL', await fileToDataUrl(file));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const variants = BOOK_CONDITIONS
      .filter((condition) => form.variants[condition].enabled)
      .map((condition) => ({
        condition,
        price: Math.max(1, Number(form.variants[condition].price) || 1),
        stock: Math.max(0, Math.floor(Number(form.variants[condition].stock) || 0)),
      }));
    const firstVariant = variants[0] || { condition: 'Good' as BookCondition, price: 1, stock: 0 };

    onSubmit({
      title: form.title.trim(),
      author: form.author.trim(),
      price: firstVariant.price,
      categoryID: form.categoryID,
      imageURL: form.imageURL.trim(),
      condition: firstVariant.condition,
      variants,
      description: form.description.trim(),
      pages: Number(form.pages) || undefined,
      language: form.language.trim() || 'English',
      isbn: form.isbn.trim() || undefined,
    });
    if (!book) setForm(emptyBookForm);
  };

  return (
    <form onSubmit={handleSubmit} className="glass glow-border rounded-xl p-5 grid gap-5 lg:grid-cols-[180px_1fr]">
      <div className="space-y-3">
        <div className="aspect-[3/4] overflow-hidden rounded-xl glow-border">
          <BookCover src={form.imageURL} title={form.title || 'New book'} author={form.author} className="w-full h-full" />
        </div>
        <label className="h-10 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer">
          <ImagePlus className="w-4 h-4" />
          Upload Image
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e.target.files?.[0])} />
        </label>
      </div>

      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <Input required placeholder="Title" value={form.title} onChange={(value) => updateField('title', value)} />
          <Input required placeholder="Author" value={form.author} onChange={(value) => updateField('author', value)} />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <select value={form.categoryID} onChange={(e) => updateField('categoryID', e.target.value)} className={inputClass}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <Input placeholder="Image URL or uploaded image data" value={form.imageURL} onChange={(value) => updateField('imageURL', value)} />
        </div>

        <textarea required placeholder="Description" rows={3} value={form.description} onChange={(e) => updateField('description', e.target.value)} className={`${inputClass} min-h-[92px] resize-none`} />

        <div className="rounded-xl border border-border overflow-hidden">
          <div className="grid grid-cols-[1fr_90px_90px] sm:grid-cols-[1fr_130px_130px] gap-2 bg-muted/20 px-3 py-2 text-xs font-semibold text-muted-foreground">
            <span>Condition</span>
            <span>Price</span>
            <span>Quantity</span>
          </div>
          <div className="divide-y divide-border/60">
            {BOOK_CONDITIONS.map((condition) => (
              <div key={condition} className="grid grid-cols-[1fr_90px_90px] sm:grid-cols-[1fr_130px_130px] gap-2 items-center px-3 py-3">
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={form.variants[condition].enabled}
                    onChange={(e) => updateVariant(condition, { enabled: e.target.checked })}
                    className="accent-primary"
                  />
                  {condition}
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.variants[condition].price}
                  disabled={!form.variants[condition].enabled}
                  onChange={(e) => updateVariant(condition, { price: e.target.value })}
                  className={`${inputClass} px-2 disabled:opacity-40`}
                />
                <input
                  type="number"
                  min="0"
                  value={form.variants[condition].stock}
                  disabled={!form.variants[condition].enabled}
                  onChange={(e) => updateVariant(condition, { stock: e.target.value })}
                  className={`${inputClass} px-2 disabled:opacity-40`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <Input type="number" min="1" placeholder="Pages" value={form.pages} onChange={(value) => updateField('pages', value)} />
          <Input placeholder="Language" value={form.language} onChange={(value) => updateField('language', value)} />
          <Input placeholder="ISBN" value={form.isbn} onChange={(value) => updateField('isbn', value)} />
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-display font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity">
            {book ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {book ? 'Save Changes' : 'Add Book'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="h-11 px-5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors flex items-center gap-2">
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

function bookToForm(book: Book | null): BookFormState {
  if (!book) return emptyBookForm;
  const variants = createEmptyVariants();
  getBookVariants(book).forEach((variant) => {
    variants[variant.condition] = {
      enabled: true,
      price: String(variant.price),
      stock: String(variant.stock),
    };
  });
  return {
    title: book.title,
    author: book.author,
    categoryID: book.categoryID,
    imageURL: book.imageURL,
    variants,
    description: book.description,
    pages: book.pages ? String(book.pages) : '',
    language: book.language || 'English',
    isbn: book.isbn || '',
  };
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const inputClass =
  'w-full h-11 rounded-xl bg-muted/30 border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary';

function Input({
  onChange,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  onChange: (value: string) => void;
}) {
  return <input {...props} onChange={(e) => onChange(e.target.value)} className={inputClass} />;
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="glass glow-border rounded-xl p-5">
      <Icon className="w-5 h-5 text-primary mb-3" />
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="glass rounded-xl p-8 text-center text-muted-foreground">{text}</div>;
}

function IconButton({
  icon: Icon,
  label,
  onClick,
  tone = 'default',
}: {
  icon: typeof Trash2;
  label: string;
  onClick: () => void;
  tone?: 'default' | 'danger';
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${
        tone === 'danger'
          ? 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
          : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
