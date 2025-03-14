import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

const HomeScreen = ({ navigation }) => {
  const handleLogout = () => {
    // Navigate back to the sign-in screen (replace stack)
    navigation.replace("AuthStack");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>🏠 Welcome to Home!</Text>
      
      <TouchableOpacity onPress={handleLogout} style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 18, color: "red" }}>🚪 Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
