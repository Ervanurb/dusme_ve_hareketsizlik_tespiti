import api from "./api";
export type SensorPayload = {
  deviceId: string;
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  location: { latitude: number; longitude: number };
  accelerationMagnitude: number;
  recordedAt?: string;
};
export async function sendSensorData(payload: SensorPayload) {
  const response = await api.post("/sensor-data", payload);
  return response.data;
}
