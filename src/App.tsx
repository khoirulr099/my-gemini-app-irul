import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, User, LogIn, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

type Product = {
  sku: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  badge?: {
    text: string;
    color: 'red' | 'blue' | 'green' | 'yellow';
  };
  category: 'event' | 'pass' | 'diamonds';
  icon?: string;
};

type Game = {
  id: string;
  name: string;
  publisher: string;
  image: string;
};

type Promo = {
  id: number;
  title: string;
  desc: string;
  color: string;
};

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'product'>('home');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [userId, setUserId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [nickname, setNickname] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const games: Game[] = [
    { id: 'mlbb', name: 'Mobile Legends', publisher: 'Moonton', image: 'https://placehold.co/400x400/2563eb/white?text=MLBB' },
    { id: 'ff', name: 'Free Fire', publisher: 'Garena', image: 'https://placehold.co/400x400/ef4444/white?text=FF' },
    { id: 'pubgm', name: 'PUBG Mobile', publisher: 'Level Infinite', image: 'https://placehold.co/400x400/f59e0b/white?text=PUBG' },
    { id: 'valo', name: 'Valorant', publisher: 'Riot Games', image: 'https://placehold.co/400x400/dc2626/white?text=VALO' },
    { id: 'genshin', name: 'Genshin Impact', publisher: 'HoYoverse', image: 'https://placehold.co/400x400/3b82f6/white?text=GI' },
    { id: 'hok', name: 'Honor of Kings', publisher: 'Level Infinite', image: 'https://placehold.co/400x400/eab308/white?text=HOK' },
  ];

  const promos: Promo[] = [
    { id: 1, title: 'PROMO AWAL TAHUN!', desc: 'Top up Diamonds MLBB Cashback 10% khusus member.', color: 'from-blue-600 to-indigo-800' },
    { id: 2, title: 'WEEKEND DEALS', desc: 'Diskon 20% untuk semua produk Free Fire.', color: 'from-red-600 to-orange-600' },
    { id: 3, title: 'VALORANT NIGHT MARKET', desc: 'Bonus VP up to 15% via QRIS.', color: 'from-purple-600 to-pink-600' },
  ];

  const products: Product[] = [
    { sku: 'ML86', name: '86 Diamonds', description: '86 (78+8) Diamonds', price: 20100, originalPrice: 22500, badge: { text: 'HOT', color: 'red' }, category: 'diamonds', icon: 'https://img.icons8.com/fluency/48/diamond--v1.png' },
    { sku: 'ML172', name: '172 Diamonds', description: '172 (156+16) Diamonds', price: 40200, category: 'diamonds', icon: 'https://img.icons8.com/fluency/48/diamond--v1.png' },
    { sku: 'MLWDP', name: 'Weekly Pass', description: 'Weekly Diamond Pass', price: 28500, badge: { text: 'BEST VALUE', color: 'blue' }, category: 'pass', icon: 'https://img.icons8.com/fluency/48/diamond--v1.png' },
    { sku: 'ML257', name: '257 Diamonds', description: '257 (234+23) Diamonds', price: 60300, category: 'diamonds', icon: 'https://img.icons8.com/fluency/48/diamond--v1.png' },
    { sku: 'ML706', name: '706 Diamonds', description: '706 (642+64) Diamonds', price: 160000, category: 'diamonds', icon: 'https://img.icons8.com/fluency/48/diamond--v1.png' },
  ];

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  useEffect(() => {
    if (currentView !== 'home') return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentView, promos.length]);

  const handleGameClick = (game: Game) => {
    setSelectedGame(game);
    setCurrentView('product');
    setUserId('');
    setZoneId('');
    setNickname(null);
    setSelectedProduct(null);
    window.scrollTo(0, 0);
  };

  const handleHomeClick = () => {
    setCurrentView('home');
    window.scrollTo(0, 0);
  };

  const handleCheckNickname = async () => {
    if (!userId || !zoneId) {
      return alert('Masukkan User ID dan Zone ID terlebih dahulu');
    }
    
    setIsChecking(true);
    setNickname(null);
    
    try {
      const response = await fetch('/api/v1/check-nickname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, zoneId }),
      });
      
      const data = await response.json();
      if (data.success) {
        setNickname(data.nickname);
      } else {
        alert(data.message || 'Nickname tidak ditemukan');
      }
    } catch (error) {
      console.error('Error checking nickname:', error);
      alert('Terjadi kesalahan saat mengecek nickname');
    } finally {
      setIsChecking(false);
    }
  };

  const handleCheckout = async () => {
    if (!userId || !zoneId || !selectedProduct) {
      return alert('Lengkapi data dulu bos!');
    }
    if (!nickname) {
      return alert('Silakan cek nickname terlebih dahulu!');
    }
    
    try {
      const response = await fetch('/api/v1/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          zoneId,
          productId: selectedProduct.sku,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`Lanjut ke Pembayaran untuk: ${nickname} (${userId})\nOrder ID: ${data.orderId}\nPayment URL: ${data.paymentUrl}`);
      } else {
        alert(data.message || 'Gagal checkout');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Terjadi kesalahan saat checkout');
    }
  };

  const handleLoginToggle = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % promos.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + promos.length) % promos.length);

  return (
    <div className="min-h-screen bg-[#0b0e14] text-[#e2e8f0] font-sans flex flex-col">
      {/* NAVBAR */}
      <nav className="bg-[#161b22]/90 backdrop-blur-md border-b border-[#30363d] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <span onClick={handleHomeClick} className="text-2xl font-black text-blue-500 tracking-tighter cursor-pointer hover:text-blue-400 transition">IRUL STORE</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <button onClick={handleHomeClick} className="text-white hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition cursor-pointer">Beranda</button>
                <button className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition cursor-pointer">Cek Pesanan</button>
                <button className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition cursor-pointer">Daftar Harga</button>
              </div>
            </div>

            {/* Desktop Profile / Login */}
            <div className="hidden md:flex items-center">
              {isLoggedIn ? (
                <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition" onClick={handleLoginToggle}>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">Khoirul</div>
                    <div className="text-xs text-blue-400 font-medium">Member Platinum</div>
                  </div>
                  <img 
                    src="https://picsum.photos/seed/avatar/100/100" 
                    alt="Profile" 
                    className="h-10 w-10 rounded-full border-2 border-blue-500 object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <button 
                  onClick={handleLoginToggle}
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition shadow-lg shadow-blue-900/20 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Masuk / Daftar
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="-mr-2 flex md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white cursor-pointer"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#161b22] border-b border-[#30363d]">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button onClick={() => { handleHomeClick(); setIsMobileMenuOpen(false); }} className="text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">Beranda</button>
              <button className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">Cek Pesanan</button>
              <button className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">Daftar Harga</button>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-700">
              {isLoggedIn ? (
                <div className="flex items-center px-5 cursor-pointer" onClick={handleLoginToggle}>
                  <div className="flex-shrink-0">
                    <img 
                      className="h-10 w-10 rounded-full border-2 border-blue-500 object-cover" 
                      src="https://picsum.photos/seed/avatar/100/100" 
                      alt="Profile" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium leading-none text-white">Khoirul</div>
                    <div className="text-sm font-medium leading-none text-blue-400 mt-1">Member Platinum</div>
                  </div>
                </div>
              ) : (
                <div className="px-5">
                  <button 
                    onClick={handleLoginToggle}
                    className="flex w-full items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition shadow-lg shadow-blue-900/20 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Masuk / Daftar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-grow">
        {currentView === 'home' ? (
          <div className="max-w-6xl mx-auto px-4 py-8">
            {/* CAROUSEL BANNER */}
            <div className="relative w-full h-48 md:h-72 rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-blue-900/20 group">
              {promos.map((promo, idx) => (
                <div 
                  key={promo.id} 
                  className={`absolute inset-0 transition-opacity duration-1000 bg-gradient-to-r ${promo.color} flex items-center px-8 md:px-16 ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                  <div className="text-white max-w-xl">
                    <h2 className="text-3xl md:text-5xl font-black mb-3 tracking-tight">{promo.title}</h2>
                    <p className="text-white/90 font-medium md:text-lg">{promo.desc}</p>
                  </div>
                </div>
              ))}
              
              {/* Carousel Controls */}
              <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer backdrop-blur-sm">
                <ChevronLeft size={24} />
              </button>
              <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer backdrop-blur-sm">
                <ChevronRight size={24} />
              </button>
              
              {/* Carousel Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {promos.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${idx === currentSlide ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}`}
                  />
                ))}
              </div>
            </div>

            {/* GAME LIST */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-extrabold text-white">Pilih Game Favorit</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {games.map(game => (
                <div key={game.id} onClick={() => handleGameClick(game)} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-2xl aspect-square mb-3 shadow-lg border border-gray-800 group-hover:border-blue-500 transition-all duration-300">
                    <img src={game.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt={game.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                      <span className="text-white text-xs font-bold bg-blue-600 px-3 py-1 rounded-full">Top Up</span>
                    </div>
                  </div>
                  <p className="font-bold text-center text-gray-300 group-hover:text-blue-400 transition-colors">{game.name}</p>
                  <p className="text-center text-xs text-gray-500">{game.publisher}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <button onClick={handleHomeClick} className="mb-6 text-sm font-bold text-blue-500 hover:text-blue-400 flex items-center gap-2 transition cursor-pointer">
              <ChevronLeft size={16} /> Kembali ke Beranda
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* LEFT COLUMN: GAME INFO & SUMMARY */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-3xl shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={selectedGame?.image} alt={selectedGame?.name} className="w-16 h-16 rounded-2xl object-cover border border-gray-700" />
                    <div>
                      <h2 className="text-2xl font-black text-white leading-tight">{selectedGame?.name}</h2>
                      <p className="text-sm text-blue-400 font-medium">{selectedGame?.publisher}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Top up {selectedGame?.name} resmi hanya dalam hitungan detik. Cukup masukkan ID Anda, pilih nominal, dan bayar.
                  </p>
                </div>

                {/* RINGKASAN PESANAN (Sticky) */}
                <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-3xl shadow-sm sticky top-24 hidden lg:block">
                  <h2 className="text-xl font-bold mb-4 italic">Ringkasan Pesanan</h2>
                  <div className="text-gray-400 text-sm space-y-3 mb-6">
                    {nickname && (
                      <div className="flex justify-between text-white border-b border-gray-700 pb-2">
                        <span>Player:</span> <span className="font-bold text-blue-400">{nickname}</span>
                      </div>
                    )}
                    {selectedProduct ? (
                      <>
                        <div className="flex justify-between text-white">
                          <span>Produk:</span> <span>{selectedProduct.name}</span>
                        </div>
                        <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-gray-700">
                          <span>Total:</span>{' '}
                          <span className="text-green-400">
                            Rp {selectedProduct.price.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p>Belum ada produk dipilih</p>
                    )}
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest transition shadow-lg shadow-blue-900/20 cursor-pointer"
                  >
                    Bayar Sekarang
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: FORM TOP UP */}
              <div className="lg:col-span-2 space-y-6">
                {/* STEP 1: LENGKAPI DATA */}
                <div className="bg-[#161b22] border border-[#30363d] p-6 md:p-8 rounded-3xl shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 font-extrabold text-lg">
                      1
                    </span>
                    <h2 className="text-2xl font-extrabold tracking-tight">Lengkapi Data</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      value={userId}
                      onChange={(e) => { setUserId(e.target.value); setNickname(null); }}
                      placeholder="User ID"
                      className="p-4 bg-gray-800/50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 text-white transition"
                    />
                    <input
                      type="text"
                      value={zoneId}
                      onChange={(e) => { setZoneId(e.target.value); setNickname(null); }}
                      placeholder="(Zone ID)"
                      className="p-4 bg-gray-800/50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 text-white transition"
                    />
                  </div>
                  <button
                    onClick={handleCheckNickname}
                    disabled={isChecking || !userId || !zoneId}
                    className="w-full py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-xl font-semibold transition flex items-center justify-center cursor-pointer"
                  >
                    {isChecking ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                    {isChecking ? 'Mengecek...' : 'Cek Nickname'}
                  </button>
                  
                  {nickname && (
                    <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-xl flex items-center text-green-400">
                      <CheckCircle2 className="mr-3" size={24} />
                      <div>
                        <div className="text-xs text-green-500/70 uppercase font-bold tracking-wider">Nickname Ditemukan</div>
                        <div className="font-bold text-lg">{nickname}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* STEP 2: PILIH NOMINAL */}
                <div className="bg-[#161b22] border border-[#30363d] p-6 md:p-8 rounded-3xl shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 font-extrabold text-lg">
                      2
                    </span>
                    <h2 className="text-2xl font-extrabold tracking-tight">Pilih Nominal</h2>
                  </div>

                  <div className="inline-flex items-center gap-2 bg-pink-500/10 text-pink-400 px-4 py-2 rounded-2xl mb-8 border border-pink-500/20 shadow-sm">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                    </span>
                    <span className="text-sm font-bold">1.774.216+ item terjual hari ini!</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2">
                    {['all', 'event', 'pass', 'diamonds'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-2.5 rounded-full border text-sm font-semibold transition-all cursor-pointer ${
                          activeCategory === cat
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-700 text-gray-300 hover:border-blue-500'
                        }`}
                      >
                        {cat === 'all' ? 'Semua' : cat === 'event' ? 'Event' : cat === 'pass' ? 'MLBB Pass' : 'Diamonds'}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.sku}
                        onClick={() => setSelectedProduct(product)}
                        className={`group relative cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 ${
                          selectedProduct?.sku === product.sku
                            ? 'border-blue-500 bg-blue-500/10 shadow-[0_10px_20px_-5px_rgba(59,130,246,0.2)] -translate-y-1'
                            : 'border-gray-700 bg-gray-800/40 hover:border-blue-500 hover:-translate-y-1 hover:shadow-lg'
                        }`}
                      >
                        {selectedProduct?.sku === product.sku && (
                          <div className="absolute -top-3 -right-3 bg-white rounded-full p-0.5 shadow-lg z-10">
                            <CheckCircle2 size={24} className="text-white fill-blue-500" />
                          </div>
                        )}

                        <div className="flex items-start justify-between mb-4">
                          <img src={product.icon || "https://img.icons8.com/fluency/48/diamond--v1.png"} alt="icon" className="w-10 h-10" />
                          {product.badge && (
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase ${
                              product.badge.color === 'red' ? 'bg-red-500/20 text-red-400' :
                              product.badge.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {product.badge.text}
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                          {product.description}
                        </div>
                        <div className="mt-1 font-extrabold text-lg text-blue-500">
                          Rp {product.price.toLocaleString('id-ID')}
                        </div>
                        {product.originalPrice && (
                          <div className="text-xs text-slate-500 line-through mt-0.5">
                            Rp {product.originalPrice.toLocaleString('id-ID')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* RINGKASAN PESANAN (Mobile Only) */}
                <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-3xl shadow-sm lg:hidden mt-6">
                  <h2 className="text-xl font-bold mb-4 italic">Ringkasan Pesanan</h2>
                  <div className="text-gray-400 text-sm space-y-3 mb-6">
                    {nickname && (
                      <div className="flex justify-between text-white border-b border-gray-700 pb-2">
                        <span>Player:</span> <span className="font-bold text-blue-400">{nickname}</span>
                      </div>
                    )}
                    {selectedProduct ? (
                      <>
                        <div className="flex justify-between text-white">
                          <span>Produk:</span> <span>{selectedProduct.name}</span>
                        </div>
                        <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-gray-700">
                          <span>Total:</span>{' '}
                          <span className="text-green-400">
                            Rp {selectedProduct.price.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p>Belum ada produk dipilih</p>
                    )}
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest transition shadow-lg shadow-blue-900/20 cursor-pointer"
                  >
                    Bayar Sekarang
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#161b22] border-t border-[#30363d] py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <h2 className="text-2xl font-black text-blue-500 tracking-tighter mb-4">IRUL STORE</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Platform top-up game termurah, tercepat, dan terpercaya di Indonesia. Proses otomatis 24/7 tanpa hari libur.
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Metode Pembayaran</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white text-blue-800 font-extrabold px-3 py-1.5 rounded-lg text-xs border border-gray-200 shadow-sm">BCA</span>
                <span className="bg-white text-blue-600 font-extrabold px-3 py-1.5 rounded-lg text-xs border border-gray-200 shadow-sm">Mandiri</span>
                <span className="bg-white text-red-600 font-extrabold px-3 py-1.5 rounded-lg text-xs border border-gray-200 shadow-sm">QRIS</span>
                <span className="bg-white text-blue-500 font-extrabold px-3 py-1.5 rounded-lg text-xs border border-gray-200 shadow-sm">DANA</span>
                <span className="bg-white text-orange-500 font-extrabold px-3 py-1.5 rounded-lg text-xs border border-gray-200 shadow-sm">ShopeePay</span>
                <span className="bg-white text-green-500 font-extrabold px-3 py-1.5 rounded-lg text-xs border border-gray-200 shadow-sm">GoPay</span>
                <span className="bg-white text-purple-600 font-extrabold px-3 py-1.5 rounded-lg text-xs border border-gray-200 shadow-sm">OVO</span>
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Bantuan & Dukungan</h3>
              <ul className="text-gray-400 text-sm space-y-3">
                <li><a href="#" className="hover:text-blue-400 transition flex items-center gap-2">Hubungi Kami (WhatsApp)</a></li>
                <li><a href="#" className="hover:text-blue-400 transition flex items-center gap-2">Syarat & Ketentuan</a></li>
                <li><a href="#" className="hover:text-blue-400 transition flex items-center gap-2">Kebijakan Privasi</a></li>
                <li><a href="#" className="hover:text-blue-400 transition flex items-center gap-2">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#30363d] mt-10 pt-8 flex flex-col md:flex-row items-center justify-between text-gray-500 text-sm">
            <p>&copy; 2026 Irul Store. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Dibuat dengan ❤️ untuk Gamers Indonesia</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
