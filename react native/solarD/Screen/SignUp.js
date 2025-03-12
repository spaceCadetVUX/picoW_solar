import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Button,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FontAwesome } from '@expo/vector-icons';
import styles from './AuthStyle'

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [warningMessagePwd, setWarningMessagePwd] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const USER_REGEX = /^[a-zA-Z0-9._%+-]+@solar\.com$/;
  const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

  const validateInputs = () => {
    if (!USER_REGEX.test(email)) {
      setWarningMessage('Email must end with @solar.com');
      return false;
    } else if (!PWD_REGEX.test(password)) {
      setWarningMessagePwd(
        'Password must be 8-24 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%).'
      );
      return false;
    } else if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return false;
    }
    setWarningMessage('');
    setWarningMessagePwd('');
    return true;
  };

  const handleSignUp = () => {
    if (!validateInputs()) return;
  
    setLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setLoading(false);
        Alert.alert(
          'Success',
          'User signed up successfully!',
          [{ text: 'OK', onPress: () => navigation.navigate('SignInScreen') }] // Navigate to SignIn
        );
        console.log('User signed up:', userCredential.user);
      })
      .catch((error) => {
        setLoading(false);
        Alert.alert('Error', error.message);
        console.error('Error signing up:', error.message);
      });
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {warningMessage ? <Text style={styles.warning}>{warningMessage}</Text> : null}
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <FontAwesome
            name={showPassword ? 'eye' : 'eye-slash'}
            size={20}
            color="gray"
          />
        </TouchableOpacity>
      </View>
      {warningMessagePwd ? <Text style={styles.warning}>{warningMessagePwd}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Sign Up" onPress={handleSignUp} color="#2575fc" />
      )}
    </View>
  );
};


export default SignUpScreen;
