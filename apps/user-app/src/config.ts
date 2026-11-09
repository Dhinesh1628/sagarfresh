import { Platform } from 'react-native';

// Local Wi-Fi IP for physical mobile device testing
const LAN_IP = '192.168.29.228';
const PORT = '5000';

function getApiBaseUrl(): string {
  if (Platform.OS === 'web') {
    return `http://localhost:${PORT}/api`;
  }
  // On Android emulator, 10.0.2.2 maps to host machine localhost, but on real Wi-Fi device LAN_IP is universal
  return `http://${LAN_IP}:${PORT}/api`;
}

export const config = {
  apiBaseUrl: getApiBaseUrl(),
  appName: 'GoMeat',
  tagline: 'Fresh Quality. Delivered with Care.',
  coldBoxDeposit: 250,
  freeDeliveryThreshold: 499,
  standardDeliveryFee: 40,
  tempSafeRange: {
    min: 0,
    max: 4,
  },
};
