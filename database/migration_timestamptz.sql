-- Mevcut (veri içeren) veritabanını yeni şemaya taşımak için migration.
-- Sıfırdan kurulumda buna gerek yok; schema.sql zaten TIMESTAMPTZ kullanıyor.
-- Not: Eski alerts kayıtlarında created_at, +3 saat kaydırılmış olarak yazılmıştı.
-- Aşağıdaki UPDATE bu kaymayı geri alır; sadece BİR KEZ çalıştırın.

BEGIN;

-- Eski +3 saat hilesini geri al (yalnızca eski kayıtlar için, bir kez!)
UPDATE alerts SET created_at = created_at - INTERVAL '3 hours';

-- Kolonları saat dilimi bilgisi taşıyan tipe çevir.
-- Sunucu/DB UTC çalıştığı için mevcut değerler UTC kabul edilir.
ALTER TABLE users            ALTER COLUMN created_at  TYPE TIMESTAMPTZ USING created_at  AT TIME ZONE 'UTC';
ALTER TABLE devices          ALTER COLUMN created_at  TYPE TIMESTAMPTZ USING created_at  AT TIME ZONE 'UTC';
ALTER TABLE sensor_data      ALTER COLUMN recorded_at TYPE TIMESTAMPTZ USING recorded_at AT TIME ZONE 'UTC';
ALTER TABLE alerts           ALTER COLUMN created_at  TYPE TIMESTAMPTZ USING created_at  AT TIME ZONE 'UTC';
ALTER TABLE refresh_tokens   ALTER COLUMN expires_at  TYPE TIMESTAMPTZ USING expires_at  AT TIME ZONE 'UTC';
ALTER TABLE refresh_tokens   ALTER COLUMN created_at  TYPE TIMESTAMPTZ USING created_at  AT TIME ZONE 'UTC';
ALTER TABLE emergency_contacts ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';
ALTER TABLE user_locations   ALTER COLUMN recorded_at TYPE TIMESTAMPTZ USING recorded_at AT TIME ZONE 'UTC';
ALTER TABLE activity_sessions ALTER COLUMN started_at TYPE TIMESTAMPTZ USING started_at  AT TIME ZONE 'UTC';
ALTER TABLE activity_sessions ALTER COLUMN ended_at   TYPE TIMESTAMPTZ USING ended_at    AT TIME ZONE 'UTC';
ALTER TABLE notification_logs ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at  AT TIME ZONE 'UTC';
ALTER TABLE alert_rules      ALTER COLUMN created_at  TYPE TIMESTAMPTZ USING created_at  AT TIME ZONE 'UTC';

COMMIT;
