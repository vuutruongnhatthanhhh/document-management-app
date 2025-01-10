import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen/HomeScreen';
import NotiScreen from './screens/NotiScreen/NotiScreen';
import LoginScreen from './screens/LoginScreen/LoginScreen';
import UserScreen from './screens/UserScreen/UserScreen';
import DocumentScreen from './screens/DocumentScreen/DocumentScreen';
import SettingScreen from './screens/SettingScreen/SettingScreen';
import LogScreen from './screens/LogScreen/LogScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Noti"
        component={NotiScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="User"
        component={UserScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Document"
        component={DocumentScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Setting"
        component={SettingScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Log"
        component={LogScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default App;
