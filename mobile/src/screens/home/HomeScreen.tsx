import useSensors from "@/src/hooks/useSensors";
import { AppColors } from "@/src/constants/theme";
import {
  createDevice,
  getDevices,
  saveSelectedDevice,
  getSelectedDevice,
} from "@/src/services/deviceService";
import { sendSensorData } from "@/src/services/sensorService";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  View,
} from "react-native";

export default function HomeScreen() {
  const { accelerometer, gyroscope, location, isInactive } = useSensors();

  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [tracking, setTracking] = useState(false);
  const [lastSend, setLastSend] = useState("Henüz gönderilmedi");
  const [devices, setDevices] = useState<any[]>([]);
  const [deviceName, setDeviceName] = useState("");

  const sensorRef = useRef({
    accelerometer,
    gyroscope,
    location,
    accelerationMagnitude: 0,
  });

  const accelerationMagnitude = Math.sqrt(
    accelerometer.x ** 2 + accelerometer.y ** 2 + accelerometer.z ** 2
  );

  // Backend tarafındaki FALL_THRESHOLD (.env) ile aynı tutulmalı,
  // aksi halde telefonda "Normal" görünürken sunucu alarm üretebilir.
  const FALL_THRESHOLD = 1.6;
  const isFallSuspected = accelerationMagnitude > FALL_THRESHOLD;
  const riskStatus = isFallSuspected || isInactive;

  useEffect(() => {
    sensorRef.current = {
      accelerometer,
      gyroscope,
      location,
      accelerationMagnitude,
    };
  }, [accelerometer, gyroscope, location, accelerationMagnitude]);

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const savedDeviceId = await getSelectedDevice();
        const list = await getDevices();

        setDevices(list);

        if (savedDeviceId) {
          setDeviceId(savedDeviceId);
        } else if (list.length > 0) {
          setDeviceId(list[0].id);
          await saveSelectedDevice(list[0].id);
        }
      } catch (error) {
        Alert.alert(
          "Cihaz hatası",
          "Cihazlar getirilemedi. Backend ve giriş durumunu kontrol et."
        );
      }
    };

    loadDevices();
  }, []);

  useEffect(() => {
    if (!tracking || !deviceId) return;

    const interval = setInterval(async () => {
      try {
        const current = sensorRef.current;

        const res = await sendSensorData({
          deviceId,
          accelerometer: current.accelerometer,
          gyroscope: current.gyroscope,
          location: current.location,
          accelerationMagnitude: current.accelerationMagnitude,
          recordedAt: new Date().toISOString(), // zaman damgası (föy 5.1)
        });

        console.log("Sensör verisi gönderildi:", {
          deviceId,
          accelerationMagnitude: current.accelerationMagnitude,
          alerts: res.alerts?.length || 0,
        });

        setLastSend(
          `${new Date().toLocaleTimeString()} - alarm: ${
            res.alerts?.length || 0
          }`
        );
      } catch (e: any) {
        console.log("Sensör gönderim hatası:", e?.response?.data || e.message);
        setLastSend(
          "Gönderim hatası: " + (e?.response?.data?.message || e.message)
        );
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [tracking, deviceId]);

  const handleCreateDevice = async () => {
    try {
      if (!deviceName.trim()) {
        Alert.alert("Uyarı", "Cihaz adı gir.");
        return;
      }

      const newDevice = await createDevice(deviceName.trim());
      setDevices((prev) => [newDevice, ...prev]);
      setDeviceId(newDevice.id);
      setDeviceName("");
      Alert.alert("Başarılı", "Cihaz oluşturuldu ve seçildi.");
    } catch (error: any) {
      Alert.alert(
        "Cihaz oluşturulamadı",
        error?.response?.data?.message || error.message
      );
    }
  };

  const handleSelectDevice = async (id: string) => {
    setDeviceId(id);
    await saveSelectedDevice(id);
  };

  const handleToggleTracking = () => {
    if (!deviceId) {
      Alert.alert("Cihaz seçilmedi", "Önce cihaz oluştur veya seç.");
      return;
    }

    setTracking((prev) => !prev);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Canlı Sensör Verileri</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cihaz Yönetimi</Text>

        <TextInput
          placeholder="Cihaz adı: Örn. Aynur'un Telefonu"
          value={deviceName}
          onChangeText={setDeviceName}
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={handleCreateDevice}>
          <Text style={styles.buttonText}>Cihaz Oluştur</Text>
        </TouchableOpacity>

        {devices.map((device) => (
          <TouchableOpacity
            key={device.id}
            style={[
              styles.deviceItem,
              deviceId === device.id && styles.selectedDevice,
            ]}
            onPress={() => handleSelectDevice(device.id)}
          >
            <Text style={styles.deviceText}>
              {device.device_name} {deviceId === device.id ? "✓" : ""}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, tracking && styles.stopButton]}
        onPress={handleToggleTracking}
      >
        <Text style={styles.buttonText}>
          {tracking ? "Takibi Durdur" : "Takibi Başlat"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.small}>Cihaz ID: {deviceId || "seçilmedi"}</Text>
      <Text style={styles.small}>Son gönderim: {lastSend}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>İvmeölçer</Text>
        <Text>X: {accelerometer.x.toFixed(2)}</Text>
        <Text>Y: {accelerometer.y.toFixed(2)}</Text>
        <Text>Z: {accelerometer.z.toFixed(2)}</Text>
        <Text>Magnitude: {accelerationMagnitude.toFixed(2)}g</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Jiroskop</Text>
        <Text>X: {gyroscope.x.toFixed(2)}</Text>
        <Text>Y: {gyroscope.y.toFixed(2)}</Text>
        <Text>Z: {gyroscope.z.toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Risk Durumu</Text>
        <Text style={riskStatus ? styles.danger : styles.safe}>
          {riskStatus ? "Riskli durum algılandı!" : "Her şey normal"}
        </Text>
        <Text>Düşme: {isFallSuspected ? "Şüpheli" : "Normal"}</Text>
        <Text>Hareketsizlik: {isInactive ? "Algılandı" : "Normal"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Konum</Text>
        <Text>Lat: {location.latitude}</Text>
        <Text>Lng: {location.longitude}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    marginTop: 50,
    marginBottom: 16,
    color: AppColors.textDark,
  },
  card: {
    backgroundColor: AppColors.white,
    padding: 18,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
    color: AppColors.textDark,
  },
  danger: {
    fontSize: 16,
    fontWeight: "800",
    color: AppColors.danger,
  },
  safe: {
    fontSize: 16,
    fontWeight: "800",
    color: AppColors.success,
  },
  button: {
    backgroundColor: AppColors.primary,
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  stopButton: {
    backgroundColor: AppColors.danger,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "800",
  },
  small: {
    color: AppColors.textMuted,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  deviceItem: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    marginTop: 8,
  },
  selectedDevice: {
    borderWidth: 2,
    borderColor: AppColors.primary,
  },
  deviceText: {
    fontWeight: "700",
    color: AppColors.textDark,
  },
});