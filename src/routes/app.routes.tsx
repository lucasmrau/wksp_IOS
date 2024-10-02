import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {LogBox} from 'react-native'; // ERROR CAUSED FOR NEW LIBRARIES
import {Loading} from '../components/Loading';
import {NativeWindStyleSheet} from 'nativewind';
import React from 'react';

import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {HomePage} from '../screens/HomePage';
import {Store} from '../screens/Store';
import 'react-native-get-random-values';
import {horizontalScale, verticalScale, moderateScale} from '../utils/Metric';

NativeWindStyleSheet.setOutput({
  default: 'native',
});

const Tab = createBottomTabNavigator();

LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message
LogBox.ignoreAllLogs();

export function AppRoutes() {
  const navigation = useNavigation();

  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen
        component={HomePage}
        name="Home"
        options={{
          title: 'Home',
          tabBarActiveTintColor: 'yellow',
          tabBarStyle: {
            backgroundColor: '#1D1F24',
            borderTopWidth: 0,
            height: 60,
            position: 'absolute', // Ensure the tab bar stays at the bottom
            bottom: 0, // Align tab bar to the bottom of the screen
          },
          tabBarShowLabel: false,
          tabBarIcon: ({size, color}) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="StorePage"
        component={Store}
        options={{
          title: 'Store',
          tabBarActiveTintColor: 'yellow',
          tabBarStyle: {backgroundColor: '#1D1F24'},
          tabBarIcon: ({size, color}) => (
            <Ionicons name="card-outline" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
