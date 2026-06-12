# Düşme ve Hareketsizlik Tespiti - Çalıştırma

## Backend
```bash
cd backend
npm install
cp .env.example .env   # değerleri kendi ortamına göre doldur
npm run dev
```

## Veritabanı
- Sıfırdan kurulum: `database/schema.sql` dosyasını PostgreSQL'de çalıştır.
- Mevcut (veri içeren) veritabanı: `database/migration_timestamptz.sql` dosyasını
  **bir kez** çalıştır (timestamp kolonlarını TIMESTAMPTZ'ye çevirir ve eski
  alarm kayıtlarındaki +3 saat kaymasını düzeltir).

## Mobil
```bash
cd mobile
npm install
npx expo start
```
Mobil cihaz ve bilgisayar aynı Wi-Fi ağında olmalı.

## Web Panel
```bash
cd web-panel
npm install
npm run dev
```
Panel: `http://localhost:5173`

## API Uç Noktaları (özet)
- `POST /api/auth/register` — kayıt (rol her zaman `user`)
- `POST /api/auth/login` — giriş (access + refresh token)
- `POST /api/auth/refresh` — refresh token ile yeni access token
- `GET/POST /api/devices`, `PATCH /api/devices/:id/status`
- `POST /api/sensor-data` (zaman damgalı), `GET /api/sensor-data`, `GET /api/sensor-data/latest`
- `GET /api/alerts`, `PATCH /api/alerts/:id/resolve`
- `POST /api/admin/create-admin` — sadece admin (rol middleware ile korumalı)

## Gerçek Zamanlı Yayın
Socket.io bağlantısı JWT ile doğrulanır (`auth: { token }`). Her kullanıcı kendi
odasına alınır; `sensor:new` ve `alert:new` olayları yalnızca verinin sahibine
ve admin kullanıcılara iletilir.

## Notlar
- `.env` dosyası teslim paketine / git'e EKLENMEMELİDİR (`.env.example` kullanın).
- Mobil ve backend düşme eşiği aynı değerde tutulmalıdır (varsayılan 1.6g).
