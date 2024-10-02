import {NavigationContainer} from '@react-navigation/native';
import {AppRoutes} from './app.routes';
import React, {useEffect, useState} from 'react';
import {StackRoutes} from './stack.routes';
import {StatusBar, View} from 'react-native';
import 'react-native-get-random-values';
import {horizontalScale, verticalScale, moderateScale} from '../utils/Metric';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NativeBaseProvider} from 'native-base';

export function Routes() {
  return (
    // <View className="flex-1 bg-gray">
    <SafeAreaProvider>
      <NativeBaseProvider>
        <NavigationContainer>
          <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent
          />
          <StackRoutes />
        </NavigationContainer>
      </NativeBaseProvider>
    </SafeAreaProvider>
    // </View>
  );
}

//string(APPEND CMAKE_CXX_FLAGS " -fexceptions -fno-omit-frame-pointer -frtti -fstack-protector-all -std=c++${CMAKE_CXX_STANDARD} -Wall")
