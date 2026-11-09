import { Platform } from 'react-native';

const LAN_IP = '192.168.29.228';
const PORT = '5000';

function getApiBaseUrl(): string {
  if (Platform.OS === 'web') {
    return `http://localhost:${PORT}/api`;
  }
  return `http://${LAN_IP}:${PORT}/api`;
}

export const config = {
  apiBaseUrl: getApiBaseUrl(),
  appName: 'GoMeat Fleet',
  riderPerDropIncentive: 45,
  coolerReturnIncentive: 15,
  coldSafeTempMax: 4.0,
};
