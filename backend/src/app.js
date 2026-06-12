const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/devices', require('./modules/devices/device.routes'));
app.use('/api/sensor-data', require('./modules/sensorData/sensor.routes'));
app.use('/api/alerts', require('./modules/alerts/alert.routes'));
app.use('/api/admin', require('./modules/admin/admin.routes'));

app.get('/', (req, res) => res.json({ message: 'Düşme ve Hareketsizlik Tespiti API çalışıyor' }));
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Sunucu hatası' });
});
module.exports = app;
