import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { AppColors } from "@/src/constants/theme";
import { login } from "@/src/services/authService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Eksik bilgi", "Lütfen e-posta ve şifre gir.");
      return;
    }

    try {
      setLoading(true);

      await login(email, password);

      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert(
        "Giriş başarısız",
        error?.response?.data?.message || "E-posta veya şifre hatalı.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>FD</Text>
      </View>

      <Text style={styles.title}>Mobil Düşme Tespit Sistemi</Text>
      <Text style={styles.subtitle}>Güvenli Takip</Text>

      <View style={styles.formCard}>
        <TextInput
          style={styles.input}
          placeholder="E-posta"
          placeholderTextColor={AppColors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Şifre"
          placeholderTextColor={AppColors.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={AppColors.white} />
          ) : (
            <Text style={styles.buttonText}>Giriş Yap</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/")}>
          <Text style={styles.registerText}>Hesabın yok mu? Kayıt ol</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Sensör verileri güvenli şekilde analiz edilir.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: AppColors.background,
  },
  logoBox: {
    width: 78,
    height: 78,
    borderRadius: 24,
    backgroundColor: AppColors.primary,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "900",
    color: AppColors.white,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
    color: AppColors.textDark,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 28,
    color: AppColors.textMuted,
  },
  formCard: {
    backgroundColor: AppColors.white,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  input: {
    backgroundColor: "#F8FAFC",
    padding: 15,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
    fontSize: 15,
  },
  button: {
    backgroundColor: AppColors.primary,
    padding: 16,
    borderRadius: 16,
    marginTop: 4,
  },
  buttonText: {
    color: AppColors.white,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
  },

  registerText: {
    textAlign: "center",
    color: AppColors.primaryDark,
    fontWeight: "700",
    marginTop: 18,
  },
  note: {
    textAlign: "center",
    color: AppColors.textMuted,
    marginTop: 16,
    fontSize: 13,
  },
});
