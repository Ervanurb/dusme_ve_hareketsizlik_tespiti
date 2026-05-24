import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";

import RegisterScreen from "@/src/screens/auth/RegisterScreen";

export default function Index() {
  useEffect(() => {
    const checkToken = async () => {
      const token = await SecureStore.getItemAsync("accessToken");

      if (token) {
        router.replace("/(tabs)");
      }
    };

    checkToken();
  }, []);

  return <RegisterScreen />;
}
