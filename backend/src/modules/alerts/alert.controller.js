const pool = require('../../config/db');
exports.listAlerts = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit || 100), 500);
    const q = req.user.role === 'admin'
      ? `SELECT a.*, d.device_name, u.full_name FROM alerts a LEFT JOIN devices d ON d.id=a.device_id JOIN users u ON u.id=a.user_id ORDER BY a.created_at DESC LIMIT $1`
      : `SELECT a.*, d.device_name FROM alerts a LEFT JOIN devices d ON d.id=a.device_id WHERE a.user_id=$2 ORDER BY a.created_at DESC LIMIT $1`;
    const { rows } = await pool.query(q, req.user.role === 'admin' ? [limit] : [limit, req.user.id]);
    res.json(rows);
  } catch (e) { next(e); }
};
exports.resolveAlert = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `UPDATE alerts SET is_resolved=true WHERE id=$1 AND (user_id=$2 OR $3=$4) RETURNING *`,
      [req.params.id, req.user.id, req.user.role, 'admin']
    );
    if (!rows[0]) return res.status(404).json({ message: 'Alarm bulunamadı' });
    res.json(rows[0]);
  } catch (e) { next(e); }
};
