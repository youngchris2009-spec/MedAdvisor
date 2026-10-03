import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  Alert,
} from 'react-native';

import { Button, TextInput } from 'react-native-paper';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const LoginScreen = ({ navigation }) => {
  const screenWidth = Dimensions.get('window').width;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Remove extra spaces from email
    const cleanEmail = email.trim();

    // Check for empty fields
    if (!cleanEmail || !password) {
      Alert.alert(
        'Missing Information',
        'Please enter your email and password.'
      );
      return;
    }

    try {
      setLoading(true);

      // Firebase login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      const user = userCredential.user;

      console.log('LOGIN SUCCESSFUL');
      console.log('User UID:', user.uid);
      console.log('User Email:', user.email);

      // Go to your main screen
      navigation.navigate('Main');
    } catch (error) {
      console.log('LOGIN ERROR:', error.code);
      console.log('LOGIN ERROR MESSAGE:', error.message);

      let message = 'Unable to log in. Please check your email and password.';

      switch (error.code) {
        case 'auth/invalid-email':
          message = 'Please enter a valid email address.';
          break;

        case 'auth/invalid-credential':
          message = 'Incorrect email or password.';
          break;

        case 'auth/user-not-found':
          message = 'No account was found with this email.';
          break;

        case 'auth/wrong-password':
          message = 'Incorrect password.';
          break;

        case 'auth/user-disabled':
          message = 'This account has been disabled.';
          break;

        case 'auth/too-many-requests':
          message =
            'Too many login attempts. Please try again later.';
          break;

        default:
          message = 'Something went wrong. Please try again.';
      }

      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      <Image
        source={require('../assets/logo.png')}
        style={{
          width: screenWidth,
          height: screenWidth,
        }}
      />

      <View style={styles.inputContainer}>

        <TextInput
          mode="outlined"
          style={styles.input}
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          mode="outlined"
          style={styles.input}
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

      </View>

      <View style={styles.buttonContainer}>

        <Button
          mode="contained"
          style={styles.button}
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        <Button
          mode="contained"
          style={styles.button}
          onPress={() => navigation.navigate('Register')}
          disabled={loading}
        >
          Register
        </Button>

      </View>

    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 20,
  },

  inputContainer: {
    margin: 15,
  },

  input: {
    margin: 10,
  },

  buttonContainer: {
    flexDirection: 'row',
    marginTop: 80,
    justifyContent: 'space-around',
  },

  button: {
    width: 150,
  },
});
