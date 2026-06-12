import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { AppColors } from "@/src/constants/theme";
import { logout } from "@/src/services/authService";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const storedUser = await SecureStore.getItemAsync("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Ad Soyad</Text>
        <Text style={styles.value}>{user?.full_name || "Kullanıcı"}</Text>

        <Text style={styles.label}>Rol</Text>
        <Text style={styles.value}>{user?.role || "user"}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
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
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: AppColors.textMuted,
    marginTop: 10,
  },
  value: {
    fontSize: 17,
    fontWeight: "800",
    color: AppColors.textDark,
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: AppColors.danger,
    padding: 16,
    borderRadius: 16,
  },
  logoutText: {
    color: AppColors.white,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
  },
});
