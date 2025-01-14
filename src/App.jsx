import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen/HomeScreen';
import NotiScreen from './screens/NotiScreen/NotiScreen';
import LoginScreen from './screens/LoginScreen/LoginScreen';
import UserScreen from './screens/UserScreen/UserScreen';
import DocumentScreen from './screens/DocumentScreen/DocumentScreen';
import SettingScreen from './screens/SettingScreen/SettingScreen';
import LogScreen from './screens/LogScreen/LogScreen';
import * as NotiService from './services/NotiService';
import {useDispatch} from 'react-redux';
import {notiList} from './redux/slides/notiSlide';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';

const Stack = createStackNavigator();

import {Linking, ActivityIndicator} from 'react-native';

const App = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(state => state.notifications.notifications);
  const user = useSelector(state => state?.user);

  const handleGetAllNoti = async () => {
    const notifications = await NotiService.getAllNoti();
    dispatch(notiList({notifications}));
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notifications = await handleGetAllNoti();
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 20000); // 20 second

    fetchNotifications();

    return () => clearInterval(intervalId);
  }, []);

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
