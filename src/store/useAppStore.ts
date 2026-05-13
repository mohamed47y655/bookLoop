import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Book, BookCondition, Order, OrderStatus, PaymentMethod, User } from '@/data/types';
import { books as seedBooks, mockOrders } from '@/data/mockData';
import { getBookVariants, getVariant, withNormalizedVariants } from '@/lib/bookVariants';

interface CartItem {
  bookID: string;
  condition: BookCondition;
  quantity: number;
}

type SignupDetails = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
};

type LoginResult = { ok: true } | { ok: false; message: string };

interface AppStore {
  users: User[];
  currentUserId: string | null;
  books: Book[];
  cart: CartItem[];
  orders: Order[];
  currentUser: () => User | null;
  isAdmin: () => boolean;
  signup: (details: SignupDetails) => LoginResult;
  login: (email: string, password: string) => LoginResult;
  logout: () => void;
  addToCart: (bookID: string, condition: BookCondition, quantity?: number) => LoginResult;
  updateCartQuantity: (bookID: string, condition: BookCondition, quantity: number) => void;
  removeFromCart: (bookID: string, condition: BookCondition) => void;
  clearCart: () => void;
  placeOrder: (details: { fullName: string; phone: string; address: string; paymentMethod: PaymentMethod }) => LoginResult;
  addBook: (book: Omit<Book, 'bookID' | 'seller'>) => void;
  updateBook: (bookID: string, book: Partial<Omit<Book, 'bookID' | 'seller'>>) => void;
  removeBook: (bookID: string) => void;
  removeUser: (userID: string) => void;
  updateOrderStatus: (orderID: string, status: OrderStatus) => void;
  removeOrder: (orderID: string) => void;
}

const adminUser: User = {
  userID: 'admin-1',
  name: 'BookLoop Admin',
  email: 'admin@bookloop.com',
  password: 'Admin@2026',
  role: 'admin',
  phone: '+20 100 000 0000',
  address: 'BookLoop HQ, Cairo',
};

const demoUser: User = {
  userID: 'u1',
  name: 'Mohamed Ahmed',
  email: 'mohamed@bookloop.com',
  password: 'Mohamed@123',
  role: 'customer',
  phone: '+20 100 123 4567',
  address: '15 Tahrir Street, Downtown, Cairo, Egypt',
};

const initialBooks = seedBooks.map(withNormalizedVariants);
const initialOrders = mockOrders.map((order) => {
  const book = initialBooks.find((item) => item.bookID === order.bookID);
  const variant = book ? getBookVariants(book)[0] : undefined;
  return {
    ...order,
    userID: demoUser.userID,
    condition: variant?.condition || 'Good',
    quantity: 1,
    unitPrice: order.total,
  };
});

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      users: [adminUser, demoUser],
      currentUserId: null,
      books: initialBooks,
      cart: [],
      orders: initialOrders,
      currentUser: () => get().users.find((user) => user.userID === get().currentUserId) || null,
      isAdmin: () => get().currentUser()?.role === 'admin',
      signup: (details) => {
        const email = details.email.trim().toLowerCase();
        if (get().users.some((user) => user.email.toLowerCase() === email)) {
          return { ok: false, message: 'This email already has an account.' };
        }

        const user: User = {
          userID: `user-${Date.now()}`,
          name: details.name.trim(),
          email,
          password: details.password,
          role: 'customer',
          phone: details.phone,
          address: details.address,
        };

        set((state) => ({
          users: [...state.users, user],
          currentUserId: user.userID,
          cart: [],
        }));
        return { ok: true };
      },
      login: (email, password) => {
        const user = get().users.find(
          (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase() && candidate.password === password,
        );

        if (!user) return { ok: false, message: 'Email or password is incorrect.' };

        set({ currentUserId: user.userID, cart: [] });
        return { ok: true };
      },
      logout: () => set({ currentUserId: null, cart: [] }),
      addToCart: (bookID, condition, quantity = 1) => {
        const book = get().books.find((item) => item.bookID === bookID);
        const variant = book ? getVariant(book, condition) : undefined;
        const requested = Math.max(1, Math.floor(quantity));
        if (!book || !variant) return { ok: false, message: 'This book is not available.' };
        if (variant.stock <= 0) return { ok: false, message: 'This condition is sold out.' };
        if (requested > variant.stock) return { ok: false, message: `Only ${variant.stock} left in stock.` };

        set((state) => {
          const exists = state.cart.find((item) => item.bookID === bookID && item.condition === condition);
          if (exists) {
            return {
              cart: state.cart.map((item) =>
                item.bookID === bookID && item.condition === condition
                  ? { ...item, quantity: Math.min(variant.stock, item.quantity + requested) }
                  : item,
              ),
            };
          }
          return { cart: [...state.cart, { bookID, condition, quantity: requested }] };
        });
        return { ok: true };
      },
      updateCartQuantity: (bookID, condition, quantity) =>
        set((state) => {
          const book = state.books.find((item) => item.bookID === bookID);
          const stock = book ? getVariant(book, condition)?.stock || 0 : 0;
          const nextQuantity = Math.max(1, Math.min(stock, Math.floor(quantity)));
          return {
            cart: state.cart.map((item) =>
              item.bookID === bookID && item.condition === condition ? { ...item, quantity: nextQuantity } : item,
            ),
          };
        }),
      removeFromCart: (bookID, condition) =>
        set((state) => ({ cart: state.cart.filter((item) => item.bookID !== bookID || item.condition !== condition) })),
      clearCart: () => set({ cart: [] }),
      placeOrder: (details) => {
        const currentUser = get().currentUser();
        if (!currentUser) return { ok: false, message: 'Please sign in before placing an order.' };
        const cart = get().cart;
        if (cart.length === 0) return { ok: false, message: 'Your cart is empty.' };

        for (const item of cart) {
          const book = get().books.find((candidate) => candidate.bookID === item.bookID);
          const variant = book ? getVariant(book, item.condition) : undefined;
          if (!book || !variant) return { ok: false, message: 'One of the selected books is no longer available.' };
          if (variant.stock < item.quantity) return { ok: false, message: `Only ${variant.stock} left for ${book.title} (${item.condition}).` };
        }

        const newOrders: Order[] = cart.map((item, i) => {
          const book = get().books.find((candidate) => candidate.bookID === item.bookID)!;
          const variant = getVariant(book, item.condition)!;
          return {
          orderID: `ord-${Date.now()}-${i}`,
          userID: currentUser.userID,
          bookID: item.bookID,
          condition: item.condition,
          quantity: item.quantity,
          unitPrice: variant.price,
          shippingAddress: details.address,
          phone: details.phone,
          fullName: details.fullName,
          paymentMethod: details.paymentMethod,
          orderStatus: 'Preparing',
          createdAt: new Date().toISOString(),
          total: variant.price * item.quantity,
          };
        });

        set((state) => ({
          orders: [...newOrders, ...state.orders],
          books: state.books.map((book) => ({
            ...book,
            variants: getBookVariants(book).map((variant) => {
              const cartItem = cart.find((item) => item.bookID === book.bookID && item.condition === variant.condition);
              return cartItem ? { ...variant, stock: Math.max(0, variant.stock - cartItem.quantity) } : variant;
            }),
          })),
          cart: [],
        }));
        return { ok: true };
      },
      addBook: (book) =>
        set((state) => {
          const seller = get().currentUser() || adminUser;
          return {
            books: [
              {
                ...withNormalizedVariants(book as Book),
                bookID: `book-${Date.now()}`,
                seller: { name: seller.name, rating: 5, sales: 0 },
              },
              ...state.books,
            ],
          };
        }),
      updateBook: (bookID, book) =>
        set((state) => ({
          books: state.books.map((item) => (item.bookID === bookID ? withNormalizedVariants({ ...item, ...book }) : item)),
        })),
      removeBook: (bookID) =>
        set((state) => ({
          books: state.books.filter((book) => book.bookID !== bookID),
          cart: state.cart.filter((item) => item.bookID !== bookID),
          orders: state.orders.filter((order) => order.bookID !== bookID),
        })),
      removeUser: (userID) =>
        set((state) => {
          const user = state.users.find((candidate) => candidate.userID === userID);
          if (!user || user.role === 'admin') return state;
          return {
            users: state.users.filter((candidate) => candidate.userID !== userID),
            orders: state.orders.filter((order) => order.userID !== userID),
            currentUserId: state.currentUserId === userID ? null : state.currentUserId,
          };
        }),
      updateOrderStatus: (orderID, status) =>
        set((state) => ({
          orders: state.orders.map((order) => (order.orderID === orderID ? { ...order, orderStatus: status } : order)),
        })),
      removeOrder: (orderID) =>
        set((state) => ({ orders: state.orders.filter((order) => order.orderID !== orderID) })),
    }),
    {
      name: 'bookloop-app',
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<AppStore>;
        return {
          ...state,
          books: state.books?.map(withNormalizedVariants),
          cart: [],
        };
      },
      partialize: (state) => ({
        users: state.users,
        currentUserId: state.currentUserId,
        books: state.books,
        cart: state.cart,
        orders: state.orders,
      }),
    },
  ),
);
