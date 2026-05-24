import useSensors from "@/src//hooks/useSensors";
import { AppColors } from "@/src/constants/theme";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const { accelerometer, gyroscope, location, isInactive } = useSensors();

  const accelerationMagnitude = Math.sqrt(
    accelerometer.x ** 2 + accelerometer.y ** 2 + accelerometer.z ** 2,
  );

  const isFallSuspected = accelerationMagnitude > 1.5;

  const riskStatus = isFallSuspected || isInactive;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Canlı Sensör Verileri</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>İvmeölçer</Text>
        <Text>X: {accelerometer.x.toFixed(2)}</Text>
        <Text>Y: {accelerometer.y.toFixed(2)}</Text>
        <Text>Z: {accelerometer.z.toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Jiroskop</Text>
        <Text>X: {gyroscope.x.toFixed(2)}</Text>
        <Text>Y: {gyroscope.y.toFixed(2)}</Text>
        <Text>Z: {gyroscope.z.toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Genel Risk Durumu</Text>

        <Text style={riskStatus ? styles.danger : styles.safe}>
          {riskStatus ? "Riskli durum algılandı!" : "Her şey normal"}
        </Text>

        <Text style={isFallSuspected ? styles.danger : styles.safe}>
          Düşme: {isFallSuspected ? "Şüpheli" : "Normal"}
        </Text>

        <Text style={isInactive ? styles.danger : styles.safe}>
          Hareketsizlik: {isInactive ? "Algılandı" : "Normal"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Konum</Text>
        <Text>Lat: {location.latitude}</Text>
        <Text>Lng: {location.longitude}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: AppColors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    marginTop: 50,
    marginBottom: 24,
    color: AppColors.textDark,
  },
  card: {
    backgroundColor: AppColors.white,
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
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
});
