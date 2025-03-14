import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, Switch, StyleSheet,Alert} from "react-native";
import { FontAwesome, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { auth } from "../firebaseConfig"; // Firebase Auth
import { signOut } from "firebase/auth"; // Import signOut
const SettingsScreen = ({ navigation }) => {
  const [darkMode, setDarkMode] = useState(false);

  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const currentUser = auth.currentUser; // Get currently signed-in user
    if (currentUser) {
      setUserEmail(currentUser.email); // Set user email
    }
  }, []);
  
  const handleLogout = async () => {
      try {
        await signOut(auth); // Sign out user
        Alert.alert("Logged Out", "You have been signed out successfully.");
        navigation.replace("AuthStack"); // Navigate back to login screen
      } catch (error) {
        console.error("Logout Error:", error.message);
        Alert.alert("Error", error.message);
      }
    };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Settings</Text>

      {/* Account Section */}
      <TouchableOpacity style={styles.accountContainer}>
        <Image
          source={{ uri: "https://i.pinimg.com/474x/48/98/8e/48988ec1ea27980220b2a29d5adc2918.jpg" }} // Replace with actual user image
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{userEmail || "User Email"}</Text> 
          <Text style={styles.userInfo}>Personal Info</Text>
        </View>
        <FontAwesome name="chevron-right" size={18} color="#999" />
      </TouchableOpacity>

      {/* Settings Section */}
      <Text style={styles.sectionTitle}>Settings</Text>

      <TouchableOpacity style={styles.settingItem}>
        <Ionicons name="language-outline" size={22} color="#ff914d" />
        <Text style={styles.settingText}>Language</Text>
        <Text style={styles.settingValue}>English</Text>
        <FontAwesome name="chevron-right" size={18} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <Ionicons name="notifications-outline" size={22} color="#2db2ff" />
        <Text style={styles.settingText}>Notifications</Text>
        <FontAwesome name="chevron-right" size={18} color="#999" />
      </TouchableOpacity>

      <View style={styles.settingItem}>
        <MaterialCommunityIcons name="theme-light-dark" size={22} color="#7a42f4" />
        <Text style={styles.settingText}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>

      <TouchableOpacity style={styles.settingItem}>
        <FontAwesome name="question-circle" size={22} color="#ff4d4d" />
        <Text style={styles.settingText}>Help</Text>
        <FontAwesome name="chevron-right" size={18} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
        <FontAwesome name="sign-out" size={22} color="#ff4d4d" />
        <Text style={styles.settingText}>Sign Out</Text>
        <FontAwesome name="chevron-right" size={18} color="#999" />
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 20,
    marginBottom: 10,
  },
  accountContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 20,

      // Shadow for iOS
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 5,

  // Shadow for Android
  elevation: 5,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 15,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userInfo: {
    fontSize: 14,
    color: "#888",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  settingValue: {
    fontSize: 14,
    color: "#888",
    marginRight: 10,
  },
});

export default SettingsScreen;
