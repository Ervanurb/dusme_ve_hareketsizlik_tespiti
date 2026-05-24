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
import { register } from "@/src/services/authService";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert("Eksik bilgi", "Lütfen tüm alanları doldur.");
      return;
    }

    try {
      setLoading(true);

      await register(fullName, email, password);

      Alert.alert("Başarılı", "Kayıt oluşturuldu. Şimdi giriş yapabilirsin.");
      router.push("/login");
    } catch (error: any) {
      Alert.alert(
        "Kayıt başarısız",
        error?.response?.data?.message || "Bir hata oluştu.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hesap Oluştur</Text>
      <Text style={styles.subtitle}>Mobil Takip</Text>

      <View style={styles.formCard}>
        <TextInput
          style={styles.input}
          placeholder="Ad Soyad"
          placeholderTextColor={AppColors.textMuted}
          value={fullName}
          onChangeText={setFullName}
        />

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
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={AppColors.white} />
          ) : (
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/login" as any)}>
          <Text style={styles.loginText}>Zaten hesabın var mı? Giriş yap</Text>
        </TouchableOpacity>
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
  title: {
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
    color: AppColors.textDark,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
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
    backgroundColor: AppColors.secondary,
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
  loginText: {
    textAlign: "center",
    color: AppColors.primaryDark,
    fontWeight: "700",
    marginTop: 18,
  },
});
