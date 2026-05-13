import { useAppStore } from '@/store/useAppStore';
import Navbar from '@/components/Navbar';
import BookCover from '@/components/BookCover';
import OrderStepper from '@/components/OrderStepper';
import { motion } from 'framer-motion';
import { User, MapPin, Phone, Mail, Package } from 'lucide-react';

export default function Profile() {
  const orders = useAppStore((s) => s.orders);
  const books = useAppStore((s) => s.books);
  const currentUser = useAppStore((s) => s.currentUser());
  const userOrders = orders.filter((order) => order.userID === currentUser?.userID);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass glow-border-purple rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
              <User className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">{currentUser?.name}</h1>
              <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
            </div>
          </div>
          <div className="neon-line w-full mb-4" />
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-4 h-4 text-primary" />{currentUser?.phone || 'No phone added'}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-4 h-4 text-primary" />{currentUser?.email}</div>
            <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2"><MapPin className="w-4 h-4 text-primary" />{currentUser?.address || 'No address added'}</div>
          </div>
        </motion.div>

        {/* Orders */}
        <h2 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" /> My Orders
        </h2>

        {userOrders.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No orders yet</p>
        ) : (
          <div className="space-y-4">
            {userOrders.map((order, i) => {
              const book = books.find((b) => b.bookID === order.bookID);
              return (
                <motion.div
                  key={order.orderID}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass glow-border rounded-2xl p-5 space-y-4"
                >
                  <div className="flex items-start gap-4">
                    {book && (
                      <BookCover src={book.imageURL} title={book.title} author={book.author} className="w-16 h-20 flex-none rounded-lg object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-foreground text-sm">{book?.title || 'Unknown'}</h3>
                      <p className="text-xs text-muted-foreground">{book?.author}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod === 'CC' ? 'Credit Card' : 'Vodafone Cash'}</span>
                        <span>{order.condition || 'Good'} x {order.quantity || 1}</span>
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="font-display font-bold text-primary mt-1 text-sm">{order.total} EGP</p>
                    </div>
                  </div>
                  <OrderStepper current={order.orderStatus} />
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
