const pool = require('../../config/db');
const { analyze } = require('./anomaly.service');

exports.createSensorData = async (req, res, next) => {
  try {
    const { deviceId, accelerometer, gyroscope, location = {}, accelerationMagnitude, recordedAt } = req.body;
    const device = await pool.query('SELECT * FROM devices WHERE id=$1 AND (user_id=$2 OR $3=$4)', [deviceId, req.user.id, req.user.role, 'admin']);
    if (!device.rows[0]) return res.status(404).json({ message: 'Cihaz bulunamadı veya yetkiniz yok' });
    const mag = Number(accelerationMagnitude ?? Math.sqrt(accelerometer.x ** 2 + accelerometer.y ** 2 + accelerometer.z ** 2));
    // Veriler zaman damgası ile gönderilmeli. İstemci geçerli bir recordedAt
    // gönderdiyse onu kullan; göndermediyse sunucu saatine düş (geriye uyumlu).
    const recorded = recordedAt && !Number.isNaN(Date.parse(recordedAt)) ? new Date(recordedAt) : new Date();
    const { rows } = await pool.query(
      `INSERT INTO sensor_data(device_id, accelerometer_x, accelerometer_y, accelerometer_z, gyroscope_x, gyroscope_y, gyroscope_z, latitude, longitude, acceleration_magnitude, recorded_at)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [deviceId, accelerometer.x, accelerometer.y, accelerometer.z, gyroscope.x, gyroscope.y, gyroscope.z, location.latitude || null, location.longitude || null, mag, recorded]
    );
    const sensorData = rows[0];
    const ownerId = device.rows[0].user_id;
    const alerts = await analyze({ userId: ownerId, deviceId, sensorDataId: sensorData.id, accelerationMagnitude: mag });
    const io = req.app.get('io');
    if (io) {
      // Gizlilik: yayın sadece cihaz sahibinin odasına ve adminlere yapılır (io.emit ile herkese değil)
      const target = io.to(`user:${ownerId}`).to('admins');
      target.emit('sensor:new', sensorData);
      alerts.forEach(a => target.emit('alert:new', a));
    }
    res.status(201).json({ sensorData, alerts });
  } catch (e) { next(e); }
};
exports.listSensorData = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit || 100), 500);
    const q = req.user.role === 'admin'
      ? `SELECT sd.*, d.device_name FROM sensor_data sd JOIN devices d ON d.id=sd.device_id ORDER BY recorded_at DESC LIMIT $1`
      : `SELECT sd.*, d.device_name FROM sensor_data sd JOIN devices d ON d.id=sd.device_id WHERE d.user_id=$2 ORDER BY recorded_at DESC LIMIT $1`;
    const params = req.user.role === 'admin' ? [limit] : [limit, req.user.id];
    const { rows } = await pool.query(q, params);
    res.json(rows);
  } catch (e) { next(e); }
};
exports.latestSensorData = async (req, res, next) => {
  try {
    const q = req.user.role === 'admin'
      ? `SELECT DISTINCT ON (sd.device_id) sd.*, d.device_name FROM sensor_data sd JOIN devices d ON d.id=sd.device_id ORDER BY sd.device_id, sd.recorded_at DESC`
      : `SELECT DISTINCT ON (sd.device_id) sd.*, d.device_name FROM sensor_data sd JOIN devices d ON d.id=sd.device_id WHERE d.user_id=$1 ORDER BY sd.device_id, sd.recorded_at DESC`;
    const { rows } = await pool.query(q, req.user.role === 'admin' ? [] : [req.user.id]);
    res.json(rows);
  } catch (e) { next(e); }
};
