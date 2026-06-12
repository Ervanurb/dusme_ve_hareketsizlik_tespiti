const pool = require('../../config/db');
exports.listDevices = async (req, res, next) => {
  try {
    const q = req.user.role === 'admin'
      ? 'SELECT d.*, u.full_name, u.email FROM devices d JOIN users u ON u.id=d.user_id ORDER BY d.created_at DESC'
      : 'SELECT * FROM devices WHERE user_id=$1 ORDER BY created_at DESC';
    const params = req.user.role === 'admin' ? [] : [req.user.id];
    const { rows } = await pool.query(q, params);
    res.json(rows);
  } catch (e) { next(e); }
};
exports.createDevice = async (req, res, next) => {
  try {
    const { device_name, device_type = 'expo-phone' } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO devices(user_id, device_name, device_type) VALUES($1,$2,$3) RETURNING *',
      [req.user.id, device_name, device_type]
    );
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
};
exports.updateStatus = async (req, res, next) => {
  try {
    const { is_active } = req.body;
    const { rows } = await pool.query(
      'UPDATE devices SET is_active=$1 WHERE id=$2 AND (user_id=$3 OR $4=$5) RETURNING *',
      [Boolean(is_active), req.params.id, req.user.id, req.user.role, 'admin']
    );
    if (!rows[0]) return res.status(404).json({ message: 'Cihaz bulunamadı' });
    res.json(rows[0]);
  } catch (e) { next(e); }
};
