import api from "./api";

export async function getAlerts() {
  try {
    const response = await api.get("/alerts");
    return response.data;
  } catch (error) {
    return [
      {
        id: "mock-1",
        alert_type: "fall_suspected",
        severity: "high",
        message: "Düşme şüphesi algılandı",
        created_at: new Date().toISOString(),
        is_resolved: false,
      },
      {
        id: "mock-2",
        alert_type: "inactivity",
        severity: "medium",
        message: "Uzun süreli hareketsizlik algılandı",
        created_at: new Date().toISOString(),
        is_resolved: false,
      },
    ];
  }
}
