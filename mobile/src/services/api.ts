import axios from "axios";

import Constants from "expo-constants";

import * as SecureStore from "expo-secure-store";



const hostUri = Constants.expoConfig?.hostUri?.split(":")[0];

export const API_ORIGIN = hostUri ? `http://${hostUri}:5000` : "http://localhost:5000";

const api = axios.create({ baseURL: `${API_ORIGIN}/api`, timeout: 10000, headers: { "Content-Type": "application/json" } });



api.interceptors.request.use(async (config) => {

  const token = await SecureStore.getItemAsync("accessToken");

  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;

});



// Access token süresi dolduğunda (401) refresh token ile bir kez yenilemeyi dener,

// başarılıysa orijinal isteği tekrarlar. Refresh de başarısızsa oturum temizlenir.

api.interceptors.response.use(

  (response) => response,

  async (error) => {

    const original = error.config;

    if (error.response?.status === 401 && !original?._retry) {

      original._retry = true;

      try {

        const refreshToken = await SecureStore.getItemAsync("refreshToken");

        if (!refreshToken) throw new Error("Refresh token yok");



        // Döngüye girmemek için interceptor'sız çıplak axios kullanılır.

        const { data } = await axios.post(`${API_ORIGIN}/api/auth/refresh`, { refreshToken });

        await SecureStore.setItemAsync("accessToken", data.accessToken);



        original.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(original);

      } catch {

        await SecureStore.deleteItemAsync("accessToken");

        await SecureStore.deleteItemAsync("refreshToken");

      }

    }

    return Promise.reject(error);

  }

);



export default api;