import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import SignInScreen from "../Screen/SignIn";
import SignUpScreen from "../Screen/SignUp";

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
      <Stack.Screen name="SignInScreen" component={SignInScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
