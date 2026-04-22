import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { requestUserPermission } from '../../src/services/fcm';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      const loadUser = async () => {
        const userInfo = await AsyncStorage.getItem('userInfo');
        if (!userInfo) {
          router.replace('/login');
          return;
        }
        setUser(JSON.parse(userInfo));
        // Once user is loaded and verified, request FCM permission and get token
        requestUserPermission();
      };
      loadUser();
    }, [])
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userInfo');
    router.replace('/login');
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {user.username}!</Text>
      <Text>Role: {user.role}</Text>
      <Text>Team ID: {user.teamId || 'None'}</Text>
      <View style={{ marginTop: 20 }}>
        <Button title="Logout" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcome: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 }
});
