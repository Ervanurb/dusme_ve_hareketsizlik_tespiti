const pool = require("../../config/db");

const FALL_THRESHOLD = Number(process.env.FALL_THRESHOLD || 1.6);
const INACTIVITY_SECONDS = Number(process.env.INACTIVITY_SECONDS || 30);
const MOVEMENT_EPSILON = Number(process.env.MOVEMENT_EPSILON || 0.08);
const INACTIVITY_COOLDOWN_SECONDS = Number(
  process.env.INACTIVITY_COOLDOWN_SECONDS || 120
);

async function createAlert({
  userId,
  deviceId,
  sensorDataId,
  alertType,
  severity,
  message,
}) {
  const { rows } = await pool.query(
    `INSERT INTO alerts(
      user_id,
      device_id,
      sensor_data_id,
      alert_type,
      severity,
      message,
      created_at
    )
     VALUES($1,$2,$3,$4,$5,$6,NOW())
     RETURNING *`,
    [userId, deviceId, sensorDataId, alertType, severity, message]
  );

  return rows[0];
}

async function analyze({
  userId,
  deviceId,
  sensorDataId,
  accelerationMagnitude,
}) {
  const alerts = [];

  if (accelerationMagnitude >= FALL_THRESHOLD) {
    alerts.push(
      await createAlert({
        userId,
        deviceId,
        sensorDataId,
        alertType: "fall_suspected",
        severity: "high",
        message: `Düşme şüphesi: ivme büyüklüğü ${accelerationMagnitude.toFixed(
          2
        )}g eşiği aştı.`,
      })
    );
  }

  const since = new Date(Date.now() - INACTIVITY_SECONDS * 1000);

  const { rows } = await pool.query(
    `SELECT acceleration_magnitude
     FROM sensor_data
     WHERE device_id=$1 AND recorded_at >= $2
     ORDER BY recorded_at DESC`,
    [deviceId, since]
  );

  if (rows.length >= 3) {
    const values = rows.map((r) => Number(r.acceleration_magnitude || 0));
    const max = Math.max(...values);
    const min = Math.min(...values);
    const diff = max - min;

    console.log("Hareketsizlik kontrol:", {
      count: rows.length,
      diff,
      threshold: MOVEMENT_EPSILON,
    });

    if (diff < MOVEMENT_EPSILON) {
      const cooldownSince = new Date(
        Date.now() - INACTIVITY_COOLDOWN_SECONDS * 1000
      );

      const recent = await pool.query(
        `SELECT id
         FROM alerts
         WHERE device_id=$1
           AND alert_type='inactivity'
           AND created_at >= $2
         LIMIT 1`,
        [deviceId, cooldownSince]
      );

      if (recent.rows.length === 0) {
        alerts.push(
          await createAlert({
            userId,
            deviceId,
            sensorDataId,
            alertType: "inactivity",
            severity: "medium",
            message: `${INACTIVITY_SECONDS} saniye boyunca belirgin hareket algılanmadı.`,
          })
        );
      }
    }
  }

  return alerts;
}

module.exports = { analyze };
