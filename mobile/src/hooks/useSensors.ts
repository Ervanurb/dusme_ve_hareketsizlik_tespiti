import * as Location from "expo-location";
import { Accelerometer, Gyroscope } from "expo-sensors";
import { useEffect, useRef, useState } from "react";

export default function useSensors() {
  const [accelerometer, setAccelerometer] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const [gyroscope, setGyroscope] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const [location, setLocation] = useState({
    latitude: 0,
    longitude: 0,
  });

  const [isInactive, setIsInactive] = useState(false);
  const lastMovementTime = useRef(Date.now());

  useEffect(() => {
    Accelerometer.setUpdateInterval(1000);
    Gyroscope.setUpdateInterval(1000);

    const accSubscription = Accelerometer.addListener((data) => {
      setAccelerometer(data);

      const magnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
      const movement = Math.abs(magnitude - 1);

      if (movement > 0.2) {
        lastMovementTime.current = Date.now();
        setIsInactive(false);
      }

      const inactiveDuration = Date.now() - lastMovementTime.current;

      if (inactiveDuration > 10000) {
        setIsInactive(true);
      }
    });

    const gyroSubscription = Gyroscope.addListener((data) => {
      setGyroscope(data);
    });

    async function getLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    }

    getLocation();

    return () => {
      accSubscription.remove();
      gyroSubscription.remove();
    };
  }, []);

  return {
    accelerometer,
    gyroscope,
    location,
    isInactive,
  };
}
