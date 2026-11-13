import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface LoginScreenProps {
  onLogin: (userData: any) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (username.trim()) {
      const userData = {
        name: username.toUpperCase(),
        email: `${username.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: `+33 6 ${Math.floor(10 + Math.random() * 90)} ${Math.floor(10 + Math.random() * 90)} ${Math.floor(10 + Math.random() * 90)} ${Math.floor(10 + Math.random() * 90)}`,
        avatar: `https://ui-avatars.com/api/?name=${username.replace(' ', '+')}&background=3b82f6&color=fff&size=128`
      };
      onLogin(userData);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
        <Image  
              style={styles.logoImage}
              source={require('../../assets/mainicon.png')} 
             
        />
        </View>
        <Text style={styles.title}>OPLA</Text>
        <Text style={styles.subtitle}>Commence dès maintenant</Text>
        <Text style={styles.subtitle}>à booster ta productivité !</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          {/* <Text style={styles.label}>Prénom</Text> */}
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Entre ton prénom"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* <View style={styles.inputContainer}>
          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Entrez votre mot de passe"
            placeholderTextColor="#9ca3af"
            secureTextEntry
          />
        </View> */}

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>C’est parti !</Text>
        </TouchableOpacity>

        {/* <View style={styles.registerContainer}>
          <Text style={styles.registerText}>
            Pas de compte?{' '}
            <Text style={styles.registerLink}>S'inscrire</Text>
          </Text>
        </View> */}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    //borderRadius: 40,
    //backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 30,
  },
  logoImage : {
    width: 150,
    height: 150,
  },
  logoText: {
    color: '#fff',
    fontSize: 80,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#00aee4',
    marginBottom: 10,
    //fontFamily: 'calibri',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#1f2937',
  },
  loginButton: {
    backgroundColor: '#FF6E2A',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  registerLink: {
    color: '#fe5410',
    fontWeight: 'bold',
  },
}); 