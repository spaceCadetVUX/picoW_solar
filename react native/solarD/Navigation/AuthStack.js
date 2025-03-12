import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import SignInScreen from "../Screen/SignIn";
import SignUpScreen from "../Screen/SignUp";

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
   
    </Stack.Navigator>
  );
};

export default AuthStack;
