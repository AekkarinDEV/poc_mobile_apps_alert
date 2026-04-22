import messaging from '@react-native-firebase/messaging';
import { fetchWithAuth } from './api';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    await getFCMToken();
  }
}

export async function getFCMToken() {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    await registerTokenWithBackend(token);
  } catch (error) {
    console.log('Error getting FCM token:', error);
  }
}

async function registerTokenWithBackend(token: string) {
  try {
    await fetchWithAuth('/fcm/register-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    console.log('Registered FCM token with backend');
  } catch (error) {
    console.error('Failed to register token with backend', error);
  }
}

messaging().onTokenRefresh(token => {
  registerTokenWithBackend(token);
});
