import * as SecureStore from "expo-secure-store";
import api from "./api";

export async function createDevice(device_name: string) {
  const response = await api.post("/devices", {
    device_name,
    device_type: "expo-phone",
  });

  await SecureStore.setItemAsync("deviceId", response.data.id);
  return response.data;
}

export async function getDevices() {
  const response = await api.get("/devices");
  return response.data;
}

export async function saveSelectedDevice(deviceId: string) {
  await SecureStore.setItemAsync("deviceId", deviceId);
}

export async function getSelectedDevice() {
  return SecureStore.getItemAsync("deviceId");
}