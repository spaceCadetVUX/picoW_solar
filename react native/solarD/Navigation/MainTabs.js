import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { FontAwesome } from "@expo/vector-icons"; // Import FontAwesome

import HomeScreen from "../Screen/Home";
import ProfileScreen from "../Screen/Profile";
import SettingsScreen from "../Screen/Setting";
import chard from "../Screen/chardTest";
import { View, Text, StyleSheet } from 'react-native';

// Create a stack navigator for the Home screen (optional)
const HomeStack = createStackNavigator();
const HomeStackScreen = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeMain" component={HomeScreen} />
  </HomeStack.Navigator>
);

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = "home";
          } 
          else if (route.name === "Profile") {
            iconName = "user";
          } 
          else if (route.name === "chard") {
            iconName = "bar-chart";
          }else if (route.name === "Settings") {
            iconName = "cog";
          }


          return <FontAwesome name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#3a81f7",  // Active tab color
        tabBarInactiveTintColor: "gray",  // Inactive tab color
        tabBarStyle: { backgroundColor: "white" }
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="chard" component={chard} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  //  justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#edf1fc',
    padding: 20,
  },

});


export default MainTabs;
