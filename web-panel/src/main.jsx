import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import { io } from "socket.io-client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "./style.css";

const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN || `http://${window.location.hostname}:5000`;

function getAlertLabel(type) {
  if (type === "fall_suspected") return "Düşme Şüphesi";
  if (type === "inactivity") return "Hareketsizlik";
  return "Alarm";
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // Giriş ve Kayıt formları için state'ler
  const [isLoginView, setIsLoginView] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");

  const [adminFullName, setAdminFullName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminMessage, setAdminMessage] = useState("");

  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [sensor, setSensor] = useState([]);
  const [error, setError] = useState("");

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: `${API_ORIGIN}/api`,
    });

    instance.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return instance;
  }, [token]);

  // KULLANICI GİRİŞ İŞLEMİ
  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setRegisterMessage("");

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setToken(response.data.accessToken);
      setUser(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  // YENİ KULLANICI KAYIT İŞLEMİ
  async function handleRegister(event) {
    event.preventDefault();
    setError("");
    setRegisterMessage("");

    try {
      // Backend'deki kayıt olma uç noktasının "/auth/register" olduğunu varsayıyoruz
      await api.post("/auth/register", {
        full_name: fullName,
        email,
        password,
      });

      setRegisterMessage("Kayıt başarılı! Lütfen giriş yapın.");
      setIsLoginView(true); // Kayıt başarılı olunca giriş ekranına yönlendir
      setPassword(""); // Güvenlik için şifre alanını temizle
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken("");
    setUser(null);
    setDevices([]);
    setAlerts([]);
    setSensor([]);
  }

  async function handleCreateAdmin(event) {
    event.preventDefault();
    setAdminMessage("");
    setError("");

    try {
      const response = await api.post("/admin/create-admin", {
        full_name: adminFullName,
        email: adminEmail,
        password: adminPassword,
      });

      setAdminMessage(response.data.message || "Yeni admin oluşturuldu");
      setAdminFullName("");
      setAdminEmail("");
      setAdminPassword("");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  // Alarmı "çözüldü" olarak işaretler (PATCH /api/alerts/:id/resolve)
  async function handleResolveAlert(alertId) {
    try {
      const response = await api.patch(`/alerts/${alertId}/resolve`);
      setAlerts((prev) =>
        prev.map((item) => (item.id === alertId ? response.data : item)),
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  async function loadDashboardData() {
    if (!token) return;

    try {
      const [deviceResponse, alertResponse, sensorResponse] = await Promise.all(
        [
          api.get("/devices"),
          api.get("/alerts?limit=50"),
          api.get("/sensor-data?limit=50"),
        ],
      );

      setDevices(deviceResponse.data);
      setAlerts(alertResponse.data);
      setSensor(sensorResponse.data.reverse());
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    // Socket bağlantısı JWT ile doğrulanır; sunucu kullanıcıyı kendi odasına alır.
    const socket = io(API_ORIGIN, { auth: { token } });

    socket.on("sensor:new", (row) => {
      setSensor((prev) => [...prev.slice(-49), row]);
    });

    socket.on("alert:new", (row) => {
      setAlerts((prev) => [row, ...prev]);
    });

    return () => socket.disconnect();
  }, [token]);

  // GİRİŞ VE KAYIT EKRANLARI
  if (!token) {
    return (
      <main className="login">
        {isLoginView ? (
          <form onSubmit={handleLogin} className="card login-card">
            <h1>Düşme / Hareketsizlik Paneli</h1>
            <h2>Giriş Yap</h2>
            
            {registerMessage && <p className="success" style={{color: 'green', marginBottom: '10px'}}>{registerMessage}</p>}
            
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="E-posta"
              type="email"
              required
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Şifre"
              type="password"
              required
            />
            <button>Giriş Yap</button>
            {error && <p className="err">{error}</p>}
            
            <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>
              Hesabın yok mu? <span style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { setIsLoginView(false); setError(""); setRegisterMessage(""); }}>Kayıt Ol</span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="card login-card">
            <h1>Düşme / Hareketsizlik Paneli</h1>
            <h2>Yeni Kayıt</h2>
            
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Ad Soyad"
              required
            />
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="E-posta"
              type="email"
              required
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Şifre"
              type="password"
              required
            />
            <button>Kayıt Ol</button>
            {error && <p className="err">{error}</p>}

            <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>
              Zaten hesabın var mı? <span style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { setIsLoginView(true); setError(""); }}>Giriş Yap</span>
            </p>
          </form>
        )}
      </main>
    );
  }

  const isAdmin = user?.role === "admin";

  const chartData = sensor.map((item) => ({
    ...item,
    time: new Date(item.recorded_at).toLocaleTimeString("tr-TR", {
      timeZone: "Europe/Istanbul",
    }),
  }));

  return (
    <main>
      <header>
        <div>
          <h1>{isAdmin ? "Admin İzleme Paneli" : "Kullanıcı Paneli"}</h1>
          <p className="subtitle">
            {isAdmin
              ? "Tüm kullanıcı, cihaz ve alarm kayıtları"
              : "Kendi cihazların ve alarm kayıtların"}
          </p>
        </div>

        <div className="header-actions">
          <span className="role-badge">{user?.role || "user"}</span>
          <button onClick={handleLogout}>Çıkış</button>
        </div>
      </header>

      {error && <p className="err">{error}</p>}

      {isAdmin && (
        <section className="card">
          <h2>Yeni Yönetici Oluştur</h2>

          <form onSubmit={handleCreateAdmin} className="admin-form">
            <input
              value={adminFullName}
              onChange={(event) => setAdminFullName(event.target.value)}
              placeholder="Ad Soyad"
            />

            <input
              value={adminEmail}
              onChange={(event) => setAdminEmail(event.target.value)}
              placeholder="Admin e-posta"
            />

            <input
              value={adminPassword}
              onChange={(event) => setAdminPassword(event.target.value)}
              placeholder="Şifre"
              type="password"
            />

            <button>Yeni Yönetici Oluştur</button>
          </form>

          {adminMessage && <p className="success">{adminMessage}</p>}
        </section>
      )}

      <section className="grid">
        <div className="card stat">
          <b>Cihaz</b>
          <span>{devices.length}</span>
        </div>

        <div className="card stat">
          <b>Alarm</b>
          <span>{alerts.length}</span>
        </div>

        <div className="card stat">
          <b>Son Veri</b>
          <span>{sensor.length}</span>
        </div>
      </section>

      <section className="card">
        <h2>İvme Zaman Serisi</h2>

        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line dataKey="acceleration_magnitude" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="two">
        <div className="card">
          <h2>{isAdmin ? "Tüm Cihazlar" : "Cihazlarım"}</h2>

          <table>
            <thead>
              <tr>
                <th>Cihaz Adı</th>
                <th>Tip</th>
                <th>Durum</th>
              </tr>
            </thead>

            <tbody>
              {devices.map((device) => (
                <tr key={device.id}>
                  <td>{device.device_name}</td>
                  <td>{device.device_type}</td>
                  <td>{device.is_active ? "Aktif" : "Pasif"}</td>
                </tr>
              ))}

              {devices.length === 0 && (
                <tr>
                  <td colSpan="3">Cihaz bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2>{isAdmin ? "Tüm Alarmlar" : "Alarmlarım"}</h2>

          <table>
            <thead>
              <tr>
                <th>Alarm</th>
                <th>Seviye</th>
                <th>Tarih</th>
                <th>Durum</th>
              </tr>
            </thead>

            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id}>
                  <td>
                    <b>{getAlertLabel(alert.alert_type)}</b>
                    <br />
                    {alert.message}
                  </td>
                  <td>{alert.severity}</td>
                  <td>
                    {new Date(alert.created_at).toLocaleString("tr-TR")}
                  </td>
                  <td>
                    {alert.is_resolved ? (
                      "Çözüldü"
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleResolveAlert(alert.id)}
                      >
                        Çözüldü işaretle
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {alerts.length === 0 && (
                <tr>
                  <td colSpan="4">Alarm kaydı yok.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);