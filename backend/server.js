const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const app = require('./src/app');
const pool = require('./src/config/db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await pool.query('SELECT NOW()');
    console.log('PostgreSQL bağlantısı başarılı');

    const server = http.createServer(app);
    const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST', 'PATCH'] } });
    app.set('io', io);

    // Socket bağlantılarında JWT doğrulaması:
    // her kullanıcı kendi odasına (user:<id>) girer, adminler ayrıca "admins" odasına alınır.
    // Böylece canlı sensör/alarm yayını sadece verinin sahibine ve adminlere gider.
    io.use((socket, next) => {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Token gerekli'));
      try {
        socket.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
      } catch {
        next(new Error('Geçersiz token'));
      }
    });

    io.on('connection', socket => {
      socket.join(`user:${socket.user.id}`);
      if (socket.user.role === 'admin') socket.join('admins');
      console.log('Socket bağlandı:', socket.id, 'kullanıcı:', socket.user.id, 'rol:', socket.user.role);
      socket.on('disconnect', () => console.log('Socket ayrıldı:', socket.id));
    });

    server.listen(PORT, '0.0.0.0', () => console.log(`Sunucu ${PORT} portunda çalışıyor`));
  } catch (error) {
    console.error('Veritabanı bağlantı hatası:', error.message);
    process.exit(1);
  }
}
startServer();
