import { getAlerts } from "@/src/services/alertService";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

type AlertItem = {
  id: string;
  alert_type: string;
  severity: string;
  message: string;
  created_at: string;
  is_resolved: boolean;
  device_name?: string;
};

function getAlertTitle(type: string) {
  if (type === "fall_suspected") return "Düşme Şüphesi";
  if (type === "inactivity") return "Hareketsizlik";
  return "Alarm";
}

function getSeverityText(severity: string) {
  if (severity === "high") return "Yüksek";
  if (severity === "medium") return "Orta";
  if (severity === "low") return "Düşük";
  return severity;
}

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await getAlerts();
        setAlerts(data);
      } catch (error) {
        console.log("Alarm geçmişi alınamadı:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();

    const interval = setInterval(loadAlerts, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alarm Geçmişi</Text>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Henüz alarm yok.</Text>}
        contentContainerStyle={alerts.length === 0 && styles.emptyContainer}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text
              style={[
                styles.alertTitle,
                item.alert_type === "inactivity" && styles.inactivityTitle,
              ]}
            >
              {getAlertTitle(item.alert_type)}
            </Text>

            <Text style={styles.message}>{item.message}</Text>

            <Text style={styles.text}>
              Şiddet: {getSeverityText(item.severity)}
            </Text>

            <Text style={styles.text}>Cihaz: {item.device_name || "-"}</Text>

            <Text style={styles.text}>
              Durum: {item.is_resolved ? "Çözüldü" : "Aktif"}
            </Text>

            <Text style={styles.date}>
              {new Date(item.created_at).toLocaleString("tr-TR")}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#F4F7FB",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F7FB",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 50,
    marginBottom: 24,
    color: "#111827",
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#DC2626",
    marginBottom: 8,
  },
  inactivityTitle: {
    color: "#D97706",
  },
  message: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 10,
    lineHeight: 21,
  },
  text: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 3,
  },
  date: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 8,
  },
  empty: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 16,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
