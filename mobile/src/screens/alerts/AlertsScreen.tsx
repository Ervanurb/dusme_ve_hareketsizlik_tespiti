import { StyleSheet, Text, View } from "react-native";

export default function AlertsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alarm Geçmişi</Text>

      <View style={styles.card}>
        <Text style={styles.alertTitle}>Düşme Şüphesi</Text>
        <Text style={styles.text}>Tarih: Henüz kayıt yok</Text>
        <Text style={styles.text}>Durum: Beklemede</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.alertTitle}>Hareketsizlik</Text>
        <Text style={styles.text}>Tarih: Henüz kayıt yok</Text>
        <Text style={styles.text}>Durum: Beklemede</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#F4F7FB",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 50,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#DC2626",
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    color: "#6B7280",
  },
});
