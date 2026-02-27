import express from "express";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";

// Simulasi Database Sederhana (In-Memory)
const ordersDb: Record<string, any> = {};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API 1: Cek Nickname (Simulasi)
  app.post('/api/v1/check-nickname', async (req, res) => {
    const { userId, zoneId } = req.body;
    
    if (!userId || !zoneId) {
      return res.status(400).json({ success: false, message: 'User ID dan Zone ID wajib diisi' });
    }

    try {
      // Simulasi delay API (Seolah-olah memanggil API pihak ketiga / VIP Reseller)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulasi response sukses
      res.json({
        success: true,
        nickname: `Savage_Player${userId.slice(-3)}`,
        message: 'Nickname berhasil ditemukan'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Gagal mengecek nickname' });
    }
  });

  // API 2: Checkout & Integrasi Digiflazz
  app.post('/api/v1/checkout', async (req, res) => {
      const { userId, zoneId, productId } = req.body;
      
      const refId = "INV-" + Date.now();
      
      // --- SIMULASI INTEGRASI DIGIFLAZZ ---
      const digiflazzUsername = process.env.DIGIFLAZZ_USERNAME || 'mock_username';
      const digiflazzApiKey = process.env.DIGIFLAZZ_API_KEY || 'mock_apikey';
      
      // 1. Membuat Signature Digiflazz (MD5: username + apiKey + refId)
      const sign = crypto.createHash('md5').update(digiflazzUsername + digiflazzApiKey + refId).digest('hex');

      // 2. Payload untuk API Digiflazz
      const digiflazzPayload = {
        username: digiflazzUsername,
        buyer_sku_code: productId, // Kode SKU dari Digiflazz (misal: ML86)
        customer_no: `${userId}${zoneId}`, // Format tujuan MLBB
        ref_id: refId,
        sign: sign
      };

      console.log("Mengirim request ke Digiflazz:", digiflazzPayload);

      // Simulasi response sukses dari Digiflazz
      const isDigiflazzSuccess = true; 

      if (isDigiflazzSuccess) {
        // 3. Request ke Payment Gateway (Midtrans/Tripay)
        // ... Logika Payment Gateway ...
        
        // Simpan ke database simulasi
        ordersDb[refId] = {
          orderId: refId,
          userId,
          zoneId,
          productId,
          status: 'PENDING',
          createdAt: new Date().toISOString()
        };

        res.json({
            success: true,
            orderId: refId,
            paymentUrl: `https://checkout.gate.com/pay/${refId}`,
            message: "Transaksi berhasil dibuat"
        });
      } else {
        res.status(500).json({ success: false, message: "Gagal melakukan order ke provider" });
      }
  });

  // API 3: Webhook Payment Gateway (Simulasi Tripay/Midtrans)
  app.post('/api/v1/webhook/payment', async (req, res) => {
    try {
      // 1. Ambil data dari request body (Payload dari Payment Gateway)
      const { reference, status, amount, signature } = req.body;
      
      console.log(`[WEBHOOK] Menerima notifikasi pembayaran untuk Order ID: ${reference}, Status: ${status}`);

      // 2. Validasi Signature (Keamanan Wajib)
      // Di dunia nyata, Anda harus memvalidasi signature dari Payment Gateway
      // menggunakan API Key rahasia Anda untuk memastikan request ini asli.
      const mySecretKey = process.env.PAYMENT_SECRET_KEY || 'rahasia123';
      const expectedSignature = crypto.createHmac('sha256', mySecretKey).update(reference + status + amount).digest('hex');
      
      // Simulasi: Kita anggap signature selalu valid untuk keperluan demo
      // if (signature !== expectedSignature) {
      //   return res.status(403).json({ success: false, message: 'Invalid signature' });
      // }

      // 3. Cek apakah pesanan ada di database
      const order = ordersDb[reference];
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
      }

      // 4. Update status pesanan berdasarkan notifikasi
      if (status === 'PAID' || status === 'SETTLED') {
        // Jika pembayaran berhasil
        order.status = 'PAID';
        console.log(`[WEBHOOK] Order ${reference} berhasil DIBAYAR!`);
        
        // Di sini Anda biasanya akan memanggil API Digiflazz lagi untuk 
        // mengecek status top-up (apakah sukses masuk ke akun game atau gagal).
        // ... Logika Cek Status Digiflazz ...
        
      } else if (status === 'EXPIRED' || status === 'FAILED') {
        // Jika pembayaran gagal/kadaluarsa
        order.status = 'FAILED';
        console.log(`[WEBHOOK] Order ${reference} GAGAL/KADALUARSA.`);
      }

      // 5. Berikan response 200 OK ke Payment Gateway agar mereka tahu
      // notifikasi sudah kita terima dengan baik.
      res.status(200).json({ success: true, message: 'Webhook diterima' });

    } catch (error) {
      console.error('[WEBHOOK ERROR]', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // API 4: Cek Status Pesanan (Untuk Frontend)
  app.get('/api/v1/order/:id', (req, res) => {
    const order = ordersDb[req.params.id];
    if (order) {
      res.json({ success: true, data: order });
    } else {
      res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
