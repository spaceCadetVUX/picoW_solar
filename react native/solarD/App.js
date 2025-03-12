import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignIn from './Screen/SignIn'
import signUp from './Screen/SignUp';

import { Provider as PaperProvider } from 'react-native-paper';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="signUp"
          screenOptions={{
            headerShown: false, // Hide headers
            animation: 'flip', // Native stack slide animation
            transitionSpec: {
              open: { animation: 'timing', config: { duration: 2000 } },
              close: { animation: 'timing', config: { duration: 2000 } },
            },
          }}
        >
          <Stack.Screen name="signUp" component={signUp} />
          <Stack.Screen name="SignIn" component={SignIn} />

        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;