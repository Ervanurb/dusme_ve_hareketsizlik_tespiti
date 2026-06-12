import * as SecureStore from "expo-secure-store";
import api from "./api";
export async function register(full_name: string, email: string, password: string) {
  const response = await api.post("/auth/register", { full_name, email, password });
  return response.data;
}
export async function login(email: string, password: string) {
  const response = await api.post("/auth/login", { email, password });
  await SecureStore.setItemAsync("accessToken", response.data.accessToken);
  await SecureStore.setItemAsync("refreshToken", response.data.refreshToken);
  await SecureStore.setItemAsync("user", JSON.stringify(response.data.user));
  return response.data;
}
export async function logout() {
  await SecureStore.deleteItemAsync("accessToken");
  await SecureStore.deleteItemAsync("refreshToken");
  await SecureStore.deleteItemAsync("user");
}
