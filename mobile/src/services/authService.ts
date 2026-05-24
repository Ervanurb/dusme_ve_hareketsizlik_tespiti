import * as SecureStore from "expo-secure-store";
import api from "./api";

export async function register(
  full_name: string,
  email: string,
  password: string,
) {
  try {
    const response = await api.post("/auth/register", {
      full_name,
      email,
      password,
    });

    return response.data;
  } catch (error) {
    console.log("Register backend hazır değil, mock kayıt kullanılıyor.");

    const mockUser = {
      id: "mock-user-id",
      full_name,
      email,
      role: "user",
    };

    await SecureStore.setItemAsync(
      "mockRegisteredUser",
      JSON.stringify(mockUser),
    );

    return {
      message: "Mock kayıt başarılı",
      user: mockUser,
      mock: true,
    };
  }
}

export async function login(email: string, password: string) {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    await SecureStore.setItemAsync("accessToken", response.data.accessToken);
    await SecureStore.setItemAsync("refreshToken", response.data.refreshToken);
    await SecureStore.setItemAsync("user", JSON.stringify(response.data.user));

    return response.data;
  } catch (error) {
    console.log("Login backend hazır değil, mock giriş kullanılıyor.");

    const storedMockUser = await SecureStore.getItemAsync("mockRegisteredUser");

    let mockUser = {
      id: "mock-user-id",
      full_name: "Demo Kullanıcı",
      email,
      role: "user",
    };

    if (storedMockUser) {
      const parsedUser = JSON.parse(storedMockUser);

      mockUser = {
        ...parsedUser,
        email,
      };
    }

    await SecureStore.setItemAsync("accessToken", "mock-access-token");
    await SecureStore.setItemAsync("refreshToken", "mock-refresh-token");
    await SecureStore.setItemAsync("user", JSON.stringify(mockUser));

    return {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: mockUser,
      mock: true,
    };
  }
}

export async function logout() {
  await SecureStore.deleteItemAsync("accessToken");
  await SecureStore.deleteItemAsync("refreshToken");
  await SecureStore.deleteItemAsync("user");
}
