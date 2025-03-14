import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { auth } from "../firebaseConfig"; // Firebase Auth
import { signInWithEmailAndPassword } from "firebase/auth";
import { FontAwesome } from "@expo/vector-icons";
import styles from "./AuthStyle";

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const offset = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(1)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Retrieve last used email
    const loadSavedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("savedEmail");
        if (savedEmail) {
          setEmail(savedEmail);
        }
      } catch (error) {
        console.error("Failed to load email:", error);
      }
    };

    loadSavedEmail();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      Animated.parallel([
        Animated.timing(offset, { toValue: -150, duration: 300, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(logoTranslateY, { toValue: -50, duration: 300, useNativeDriver: true }),
      ]).start();
    });

    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      Animated.parallel([
        Animated.timing(offset, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(logoTranslateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [offset, logoOpacity, logoTranslateY]);

  const validateInputs = () => {
    if (!email || !password) {
      Alert.alert("Error", "Both fields are required.");
      return false;
    }
    return true;
  };

  const handleSignIn = async () => {
    if (!validateInputs()) return;
  
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        setLoading(false);
        Alert.alert('Success', 'You have signed in successfully!');
        console.log('User signed in:', userCredential.user);
  
        // Get existing login history
        let history = await AsyncStorage.getItem('signInHistory');
        history = history ? JSON.parse(history) : [];
  
        // Add new entry
        history.push({
          email: email,
          time: new Date().toISOString(),
        });
  
        // Save updated history
        await AsyncStorage.setItem('signInHistory', JSON.stringify(history));
  
        // Navigate to main screen
        navigation.replace("MainTabs"); 
      })
      .catch((error) => {
        setLoading(false);
        Alert.alert('Error', error.message);
        console.error('Error signing in:', error.message);
      });
  };

  return (
    <KeyboardAvoidingView
      style={styles.containerKey}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <Image source={require("../images/login_uath.png")} style={styles.authBackgroundIn} />

        {/* Animated Logo */}
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ translateY: logoTranslateY }],
          }}
        >
          <Image source={require("../images/whaleLogo.png")} style={styles.logoAuth} />
        </Animated.View>

        <Animated.View style={[styles.containerAnimated, { transform: [{ translateY: offset }] }]}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1, marginTop: 12, height: "100%" }]}
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <FontAwesome name={showPassword ? "eye" : "eye-slash"} size={20} color="gray" />
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <TouchableOpacity style={styles.Button} onPress={handleSignIn}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => navigation.navigate("SignUpScreen")}>
            <Text style={styles.linkText}>Create an account? Sign up?</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignInScreen;
