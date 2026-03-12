/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Settings, 
  Package, 
  ClipboardList, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  Clock, 
  Truck,
  X,
  LogOut,
  ChevronRight,
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Instagram,
  Send,
  MessageCircle
} from 'lucide-react';

// Types
interface CatalogItem {
  id: number;
  name: string;
  size: number;
  price: number;
  stock: number;
}

interface Order {
  id: number;
  buyer_name: string;
  aroma: string;
  size: string | number;
  quantity: number;
  order_date: string;
  status: string;
  delivery_date: string | null;
  is_custom: number;
}

export default function App() {
  const [view, setView] = useState<'buyer' | 'admin'>('buyer');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data
  const fetchData = async () => {
    try {
      const [catalogRes, ordersRes] = await Promise.all([
        fetch('/api/catalog'),
        fetch('/api/orders')
      ]);
      const catalogData = await catalogRes.json();
      const ordersData = await ordersRes.json();
      setCatalog(catalogData);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfcfb]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#5A5A40] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="serif text-xl italic text-[#5A5A40]">Memuat Putri Parfume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#5A5A40]/10">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('buyer')}>
            <div className="w-10 h-10 bg-[#5A5A40] rounded-full flex items-center justify-center text-white">
              <ShoppingBag size={20} />
            </div>
            <h1 className="serif text-2xl font-semibold tracking-tight text-[#2d2a26]">PUTRI PARFUME</h1>
          </div>
          
          <div className="flex items-center gap-6">
            {view === 'buyer' ? (
              <button 
                onClick={() => setView('admin')}
                className="text-sm font-medium text-[#5A5A40] hover:text-[#3d3d2b] transition-colors flex items-center gap-2"
              >
                <Settings size={16} />
                Admin Dashboard
              </button>
            ) : (
              <button 
                onClick={() => setView('buyer')}
                className="text-sm font-medium text-[#5A5A40] hover:text-[#3d3d2b] transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Kembali ke Toko
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {view === 'buyer' ? (
          <BuyerView catalog={catalog} onOrderSuccess={fetchData} />
        ) : (
          <AdminView 
            catalog={catalog} 
            orders={orders} 
            isLoggedIn={isAdminLoggedIn} 
            onLogin={() => setIsAdminLoggedIn(true)}
            onLogout={() => setIsAdminLoggedIn(false)}
            onDataChange={fetchData}
          />
        )}
      </main>

      <footer className="bg-white border-t border-[#5A5A40]/10 py-12 mt-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="serif italic text-lg text-[#5A5A40] mb-2">"Wangi yang memikat, pesona yang abadi."</p>
          <p className="text-xs uppercase tracking-widest text-[#2d2a26]/40">© 2026 Putri Parfume. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// --- BUYER VIEW ---

function BuyerView({ catalog, onOrderSuccess }: { catalog: CatalogItem[], onOrderSuccess: () => void }) {
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomRequest, setIsCustomRequest] = useState(false);
  const [customAroma, setCustomAroma] = useState('');
  const [customSize, setCustomSize] = useState('');

  const readyItems = catalog.filter(item => item.stock > 0);

  // Form validation
  const isFormValid = buyerName.trim() !== '' && 
    (isCustomRequest ? (customAroma.trim() !== '' && customSize.trim() !== '') : selectedItem !== null) && 
    quantity > 0;

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer_name: buyerName,
          aroma: isCustomRequest ? customAroma : selectedItem?.name,
          size: isCustomRequest ? customSize : selectedItem?.size,
          quantity: quantity,
          is_custom: isCustomRequest
        })
      });
      if (res.ok) {
        setIsOrderModalOpen(false);
        setBuyerName('');
        setQuantity(1);
        setSelectedItem(null);
        setIsCustomRequest(false);
        setCustomAroma('');
        setCustomSize('');
        onOrderSuccess();
        setIsSuccessModalOpen(true);
      }
    } catch (error) {
      console.error("Order error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-16 flex items-center justify-center group">
        <img 
          src="https://i.postimg.cc/Z57vV3b8/Gemini-Generated-Image-28toeo28toeo28to.png" 
          alt="Putri Parfume Banner" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
        <div className="relative z-10 text-white text-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 inline-block"
          >
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto border border-white/30">
              <Sparkles size={40} className="text-white" />
            </div>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="serif text-5xl md:text-8xl font-light mb-4 drop-shadow-lg"
          >
            Putri Parfume
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-2xl font-light max-w-2xl mx-auto italic opacity-90 drop-shadow-md"
          >
            "Wangi yang memikat, pesona yang abadi."
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10"
          >
            <button 
              onClick={() => {
                setSelectedItem(null);
                setIsOrderModalOpen(true);
              }}
              className="px-8 py-4 bg-white text-[#5A5A40] rounded-full font-semibold hover:bg-[#f5f5f0] transition-all shadow-xl flex items-center gap-2 mx-auto"
            >
              Mulai Belanja
              <ChevronRight size={20} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Catalog Grid */}
      <section>
        <div className="flex items-center justify-between mb-10">
          <h3 className="serif text-3xl text-[#2d2a26]">Katalog Parfum</h3>
          <div className="h-px flex-1 bg-[#5A5A40]/10 mx-8 hidden md:block"></div>
          <span className="text-sm uppercase tracking-widest text-[#5A5A40] font-medium">Ready Stock</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {readyItems.map((item) => (
            <motion.div 
              key={item.id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-8 card-shadow border border-[#5A5A40]/5 flex flex-col justify-between"
            >
              <div className="mb-8">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="serif text-3xl text-[#2d2a26] leading-tight">{item.name}</h4>
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#5A5A40] bg-[#5A5A40]/5 px-3 py-1 rounded-full">{item.size}ml</span>
                </div>
                <div className="h-px w-12 bg-[#5A5A40]/20 mb-6"></div>
                <p className="text-[#5A5A40] font-light text-2xl tracking-tight">
                  Rp {item.price.toLocaleString('id-ID')}
                </p>
              </div>
              <button 
                onClick={() => {
                  setSelectedItem(item);
                  setIsCustomRequest(false);
                  setIsOrderModalOpen(true);
                }}
                className="w-full py-4 border border-[#5A5A40] text-[#5A5A40] rounded-xl font-medium hover:bg-[#5A5A40] hover:text-white transition-all flex items-center justify-center gap-2 group"
              >
                Pesan Sekarang
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}

          {/* Custom Request Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#5A5A40]/5 rounded-2xl p-8 border border-dashed border-[#5A5A40]/30 flex flex-col justify-between"
          >
            <div className="mb-8">
              <h4 className="serif text-3xl text-[#2d2a26] leading-tight mb-4">Aroma Khusus?</h4>
              <p className="text-[#5A5A40] font-light">
                Ingin aroma yang tidak ada di stok? Anda bisa request aroma dan ukuran pilihan Anda di sini.
              </p>
            </div>
            <button 
              onClick={() => {
                setSelectedItem(null);
                setIsCustomRequest(true);
                setIsOrderModalOpen(true);
              }}
              className="w-full py-4 bg-[#5A5A40] text-white rounded-xl font-medium hover:bg-[#3d3d2b] transition-all flex items-center justify-center gap-2"
            >
              Request Aroma
              <Plus size={18} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="bg-white rounded-3xl p-10 card-shadow border border-[#5A5A40]/5">
        <div className="text-center mb-10">
          <h3 className="serif text-3xl text-[#2d2a26] mb-2">Hubungi Kami</h3>
          <p className="text-[#5A5A40]">Punya pertanyaan? Kami siap membantu Anda melalui saluran berikut.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a 
            href="https://instagram.com/putri_parfumee" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center md:flex-col md:text-center gap-4 md:gap-2 p-4 rounded-2xl hover:bg-[#f5f5f0] transition-all group border border-[#5A5A40]/5"
          >
            <div className="w-12 h-12 bg-[#5A5A40]/10 rounded-full flex items-center justify-center text-[#5A5A40] group-hover:bg-[#5A5A40] group-hover:text-white transition-all shrink-0">
              <Instagram size={24} />
            </div>
            <div>
              <span className="block font-medium text-[#2d2a26]">Instagram</span>
              <span className="text-[#5A5A40] text-sm">@putri_parfumee</span>
            </div>
          </a>

          <a 
            href="https://wa.me/855963386810" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center md:flex-col md:text-center gap-4 md:gap-2 p-4 rounded-2xl hover:bg-[#f5f5f0] transition-all group border border-[#5A5A40]/5"
          >
            <div className="w-12 h-12 bg-[#5A5A40]/10 rounded-full flex items-center justify-center text-[#5A5A40] group-hover:bg-[#5A5A40] group-hover:text-white transition-all shrink-0">
              <MessageCircle size={24} />
            </div>
            <div>
              <span className="block font-medium text-[#2d2a26]">Whatsapp</span>
              <span className="text-[#5A5A40] text-sm">+855 96 338 6810</span>
            </div>
          </a>

          <a 
            href="https://t.me/putri_parfume" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center md:flex-col md:text-center gap-4 md:gap-2 p-4 rounded-2xl hover:bg-[#f5f5f0] transition-all group border border-[#5A5A40]/5"
          >
            <div className="w-12 h-12 bg-[#5A5A40]/10 rounded-full flex items-center justify-center text-[#5A5A40] group-hover:bg-[#5A5A40] group-hover:text-white transition-all shrink-0">
              <Send size={24} />
            </div>
            <div>
              <span className="block font-medium text-[#2d2a26]">Telegram</span>
              <span className="text-[#5A5A40] text-sm">@putri_parfume</span>
            </div>
          </a>
        </div>
      </section>

      {/* Order Modal */}
      <AnimatePresence>
        {isOrderModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOrderModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl p-8 max-w-md w-full card-shadow max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsOrderModalOpen(false)}
                className="absolute top-6 right-6 text-[#2d2a26]/40 hover:text-[#2d2a26] transition-colors"
              >
                <X size={24} />
              </button>

              <h3 className="serif text-3xl text-[#2d2a26] mb-2">
                {isCustomRequest ? 'Request Aroma Khusus' : 'Form Pemesanan'}
              </h3>
              <p className="text-[#5A5A40] mb-8">
                {isCustomRequest 
                  ? 'Beri tahu kami aroma dan ukuran yang Anda inginkan.' 
                  : 'Silakan lengkapi data pesanan Anda di bawah ini.'}
              </p>

              {selectedItem && !isCustomRequest && (
                <div className="bg-[#f5f5f0] p-6 rounded-2xl mb-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="serif text-2xl text-[#2d2a26]">{selectedItem.name}</p>
                      <p className="text-sm text-[#5A5A40] uppercase tracking-widest font-medium mt-1">{selectedItem.size}ml</p>
                    </div>
                    <p className="text-xl font-light text-[#5A5A40]">Rp {selectedItem.price.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleOrder} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#2d2a26] mb-2">Nama Pembeli</label>
                  <input 
                    type="text" 
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="w-full px-4 py-3 rounded-xl border border-[#5A5A40]/20 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40] transition-all"
                  />
                </div>

                {isCustomRequest ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#2d2a26] mb-2">Nama Aroma yang Diinginkan</label>
                      <input 
                        type="text" 
                        required
                        value={customAroma}
                        onChange={(e) => setCustomAroma(e.target.value)}
                        placeholder="Contoh: Baccarat Rouge 540"
                        className="w-full px-4 py-3 rounded-xl border border-[#5A5A40]/20 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2d2a26] mb-2">Ukuran (ml)</label>
                      <input 
                        type="text" 
                        required
                        value={customSize}
                        onChange={(e) => setCustomSize(e.target.value)}
                        placeholder="Contoh: 30ml, 50ml, atau 100ml"
                        className="w-full px-4 py-3 rounded-xl border border-[#5A5A40]/20 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40] transition-all"
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsCustomRequest(false)}
                      className="text-sm text-[#5A5A40] hover:underline"
                    >
                      Pilih dari stok ready
                    </button>
                  </>
                ) : (
                  <>
                    {!selectedItem ? (
                      <div>
                        <label className="block text-sm font-medium text-[#2d2a26] mb-2">Jenis Parfum</label>
                        <select
                          required
                          onChange={(e) => {
                            const item = readyItems.find(i => i.id === parseInt(e.target.value));
                            setSelectedItem(item || null);
                          }}
                          className="w-full px-4 py-3 rounded-xl border border-[#5A5A40]/20 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40] transition-all"
                        >
                          <option value="">Pilih Aroma</option>
                          {readyItems.map(item => (
                            <option key={item.id} value={item.id}>{item.name} ({item.size}ml)</option>
                          ))}
                        </select>
                        <button 
                          type="button"
                          onClick={() => setIsCustomRequest(true)}
                          className="mt-2 text-sm text-[#5A5A40] hover:underline"
                        >
                          Aroma tidak ada? Request di sini
                        </button>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-[#2d2a26] mb-2">Jenis Parfum & Ukuran</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            disabled
                            value={`${selectedItem.name} (${selectedItem.size}ml)`}
                            className="flex-1 px-4 py-3 rounded-xl border border-[#5A5A40]/10 bg-gray-50 text-gray-500"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              setSelectedItem(null);
                              setIsCustomRequest(true);
                            }}
                            className="px-4 py-3 text-sm border border-[#5A5A40]/20 rounded-xl hover:bg-gray-50"
                          >
                            Ubah
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#2d2a26] mb-2">Jumlah Pesanan</label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 rounded-xl border border-[#5A5A40]/20 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40] transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting || !isFormValid}
                  className="w-full py-4 bg-[#5A5A40] text-white rounded-xl font-medium hover:bg-[#3d3d2b] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Memproses...' : 'Pesan Sekarang'}
                  {!isSubmitting && <CheckCircle2 size={18} />}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Notification Modal */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSuccessModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl p-10 max-w-sm w-full card-shadow text-center"
            >
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
                <Sparkles size={40} />
              </div>
              <h3 className="serif text-3xl text-[#2d2a26] mb-4">Thank's For Order Putri Parfume</h3>
              <p className="text-[#5A5A40] mb-8">Pesanan Anda telah kami terima dan akan segera diproses oleh tim kami.</p>
              <button 
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-full py-4 bg-[#5A5A40] text-white rounded-xl font-medium hover:bg-[#3d3d2b] transition-all shadow-md"
              >
                Tutup
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- ADMIN VIEW ---

function AdminView({ 
  catalog, 
  orders, 
  isLoggedIn, 
  onLogin, 
  onLogout, 
  onDataChange 
}: { 
  catalog: CatalogItem[], 
  orders: Order[], 
  isLoggedIn: boolean, 
  onLogin: () => void,
  onLogout: () => void,
  onDataChange: () => void
}) {
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'catalog'>('orders');
  
  // Catalog Form State
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [catalogForm, setCatalogForm] = useState({ name: '', size: 30, price: 0, stock: 0 });

  // Order Update State
  const [updatingOrder, setUpdatingOrder] = useState<Order | null>(null);
  const [orderUpdateForm, setOrderUpdateForm] = useState({ status: '', delivery_date: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Simple password
      onLogin();
    } else {
      alert('Password salah!');
    }
  };

  const handleSaveCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem ? { ...catalogForm, id: editingItem.id } : catalogForm)
      });
      if (res.ok) {
        setIsCatalogModalOpen(false);
        setEditingItem(null);
        setCatalogForm({ name: '', size: 30, price: 0, stock: 0 });
        onDataChange();
      }
    } catch (error) {
      console.error("Save catalog error:", error);
    }
  };

  const handleDeleteCatalog = async (id: number) => {
    try {
      const res = await fetch(`/api/catalog/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setIsDeleteConfirmOpen(false);
        setItemToDelete(null);
        onDataChange();
      }
    } catch (error) {
      console.error("Delete catalog error:", error);
    }
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingOrder) return;
    try {
      const res = await fetch(`/api/orders/${updatingOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderUpdateForm)
      });
      if (res.ok) {
        setUpdatingOrder(null);
        onDataChange();
      }
    } catch (error) {
      console.error("Update order error:", error);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl card-shadow border border-[#5A5A40]/10 text-center"
        >
          <div className="w-16 h-16 bg-[#5A5A40]/10 rounded-full flex items-center justify-center text-[#5A5A40] mx-auto mb-6">
            <Settings size={32} />
          </div>
          <h3 className="serif text-3xl text-[#2d2a26] mb-2">Admin Login</h3>
          <p className="text-[#5A5A40] mb-8 text-sm">Masukkan kata sandi untuk mengakses dashboard manajemen.</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (admin123)"
              className="w-full px-4 py-3 rounded-xl border border-[#5A5A40]/20 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40] transition-all"
            />
            <button 
              type="submit"
              className="w-full py-4 bg-[#5A5A40] text-white rounded-xl font-medium hover:bg-[#3d3d2b] transition-all"
            >
              Masuk Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="serif text-4xl text-[#2d2a26] mb-1">Dashboard Admin</h2>
          <p className="text-[#5A5A40]">Kelola katalog produk dan pantau pesanan pelanggan.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white p-1 rounded-xl border border-[#5A5A40]/10 flex">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'orders' ? 'bg-[#5A5A40] text-white shadow-md' : 'text-[#5A5A40] hover:bg-[#f5f5f0]'}`}
            >
              <ClipboardList size={16} />
              Pesanan
            </button>
            <button 
              onClick={() => setActiveTab('catalog')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'catalog' ? 'bg-[#5A5A40] text-white shadow-md' : 'text-[#5A5A40] hover:bg-[#f5f5f0]'}`}
            >
              <Package size={16} />
              Katalog
            </button>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-[#2d2a26]/40 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut size={24} />
          </button>
        </div>
      </div>

      {activeTab === 'orders' ? (
        <div className="bg-white rounded-3xl card-shadow border border-[#5A5A40]/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f5f5f0] border-b border-[#5A5A40]/10">
                  <th className="px-6 py-4 text-xs uppercase tracking-widest text-[#5A5A40] font-semibold">Pembeli</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-widest text-[#5A5A40] font-semibold">Produk</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-widest text-[#5A5A40] font-semibold text-center">Qty</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-widest text-[#5A5A40] font-semibold">Tanggal</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-widest text-[#5A5A40] font-semibold">Status</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-widest text-[#5A5A40] font-semibold">Estimasi</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-widest text-[#5A5A40] font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#5A5A40]/5">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#fdfcfb] transition-colors">
                    <td className="px-6 py-4 font-medium text-[#2d2a26]">{order.buyer_name}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{order.aroma}</p>
                          {order.is_custom === 1 && (
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase rounded tracking-tighter">Custom</span>
                          )}
                        </div>
                        <p className="text-[#5A5A40]">{order.size}{typeof order.size === 'number' ? 'ml' : ''}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-[#2d2a26]">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5A5A40]">
                      {new Date(order.order_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'Selesai' ? 'bg-green-100 text-green-700' : 
                        order.status === 'Dikirim' ? 'bg-blue-100 text-blue-700' : 
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {order.status === 'Selesai' ? <CheckCircle2 size={12} /> : 
                         order.status === 'Dikirim' ? <Truck size={12} /> : 
                         <Clock size={12} />}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5A5A40]">
                      {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          setUpdatingOrder(order);
                          setOrderUpdateForm({ status: order.status, delivery_date: order.delivery_date || '' });
                        }}
                        className="p-2 text-[#5A5A40] hover:bg-[#5A5A40]/10 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#5A5A40] italic">Belum ada pesanan masuk.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button 
              onClick={() => {
                setEditingItem(null);
                setCatalogForm({ name: '', size: 30, price: 0, stock: 0 });
                setIsCatalogModalOpen(true);
              }}
              className="px-6 py-3 bg-[#5A5A40] text-white rounded-xl font-medium hover:bg-[#3d3d2b] transition-all flex items-center gap-2 shadow-md"
            >
              <Plus size={18} />
              Tambah Aroma Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalog.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-2xl card-shadow border border-[#5A5A40]/10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="serif text-2xl text-[#2d2a26]">{item.name}</h4>
                    <p className="text-sm text-[#5A5A40]">{item.size}ml • Rp {item.price.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setEditingItem(item);
                        setCatalogForm({ name: item.name, size: item.size, price: item.price, stock: item.stock });
                        setIsCatalogModalOpen(true);
                      }}
                      className="p-2 text-[#5A5A40] hover:bg-[#5A5A40]/10 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        setItemToDelete(item.id);
                        setIsDeleteConfirmOpen(true);
                      }}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#5A5A40]/5">
                  <span className="text-xs uppercase tracking-widest text-[#5A5A40] font-semibold">Stok Ready</span>
                  <span className={`text-lg font-semibold ${item.stock === 0 ? 'text-red-500' : 'text-[#2d2a26]'}`}>
                    {item.stock} unit
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl p-8 max-w-sm w-full card-shadow text-center"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="serif text-2xl text-[#2d2a26] mb-2">Hapus Item?</h3>
              <p className="text-[#5A5A40] mb-8">Tindakan ini tidak dapat dibatalkan. Item akan dihapus permanen dari katalog.</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 py-3 bg-[#f5f5f0] text-[#2d2a26] rounded-xl font-medium hover:bg-[#e5e5e0] transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={() => itemToDelete && handleDeleteCatalog(itemToDelete)}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all shadow-md"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Catalog Modal */}
      <AnimatePresence>
        {isCatalogModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCatalogModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl p-8 max-w-md w-full card-shadow"
            >
              <button 
                onClick={() => setIsCatalogModalOpen(false)}
                className="absolute top-6 right-6 text-[#2d2a26]/40 hover:text-[#2d2a26] transition-colors"
              >
                <X size={24} />
              </button>

              <h3 className="serif text-3xl text-[#2d2a26] mb-8">{editingItem ? 'Edit Aroma' : 'Tambah Aroma'}</h3>

              <form onSubmit={handleSaveCatalog} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#2d2a26] mb-2">Nama Aroma</label>
                  <input 
                    type="text" 
                    required
                    value={catalogForm.name}
                    onChange={(e) => setCatalogForm({ ...catalogForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#5A5A40]/20 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40] transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2d2a26] mb-2">Ukuran (ml)</label>
                    <input 
                      type="number" 
                      required
                      value={catalogForm.size}
                      onChange={(e) => setCatalogForm({ ...catalogForm, size: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-[#5A5A40]/20 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2d2a26] mb-2">Stok</label>
                    <input 
                      type="number" 
                      required
                      value={catalogForm.stock}
                      onChange={(e) => setCatalogForm({ ...catalogForm, stock: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-[#5A5A40]/20 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2d2a26] mb-2">Harga (Rp)</label>
                  <input 
                    type="number" 
                    required
                    value={catalogForm.price}
                    onChange={(e) => setCatalogForm({ ...catalogForm, price: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-[#5A5A40]/20 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40] transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-[#5A5A40] text-white rounded-xl font-medium hover:bg-[#3d3d2b] transition-all"
                >
                  Simpan Perubahan
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Update Modal */}
      <AnimatePresence>
        {updatingOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUpdatingOrder(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl p-8 max-w-md w-full card-shadow"
            >
              <button 
                onClick={() => setUpdatingOrder(null)}
                className="absolute top-6 right-6 text-[#2d2a26]/40 hover:text-[#2d2a26] transition-colors"
              >
                <X size={24} />
              </button>

              <h3 className="serif text-3xl text-[#2d2a26] mb-2">Update Pesanan</h3>
              <p className="text-[#5A5A40] mb-8">Update status dan estimasi pengiriman untuk {updatingOrder.buyer_name}.</p>

              <form onSubmit={handleUpdateOrder} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#2d2a26] mb-2">Status Pesanan</label>
                  <select 
                    value={orderUpdateForm.status}
                    onChange={(e) => setOrderUpdateForm({ ...orderUpdateForm, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#5A5A40]/20 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40] transition-all"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Dikirim">Dikirim</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2d2a26] mb-2">Estimasi Pengiriman</label>
                  <input 
                    type="date" 
                    value={orderUpdateForm.delivery_date}
                    onChange={(e) => setOrderUpdateForm({ ...orderUpdateForm, delivery_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#5A5A40]/20 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40] transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-[#5A5A40] text-white rounded-xl font-medium hover:bg-[#3d3d2b] transition-all"
                >
                  Update Pesanan
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
