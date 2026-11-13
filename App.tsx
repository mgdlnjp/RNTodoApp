import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  StatusBar,
  Platform
} from 'react-native';
import LoginScreen from './src/components/LoginScreen';
import MainScreen from './src/components/MainScreen';
import ProfileScreen from './src/components/ProfileScreen';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: ''
  });

  const handleLogin = (userData: any) => {
    setUserData(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUserData({
      name: '',
      email: '',
      phone: '',
      avatar: ''
    });
    setIsLoggedIn(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {!isLoggedIn ? (
        <LoginScreen onLogin={handleLogin} />
      ) : showProfile ? (
        <ProfileScreen 
          userData={userData} 
          onBack={() => setShowProfile(false)}
          onLogout={handleLogout}
        />
      ) : (
        <MainScreen 
          userData={userData}
          onShowProfile={() => setShowProfile(true)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});
