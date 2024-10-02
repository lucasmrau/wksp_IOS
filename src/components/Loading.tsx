import React from 'react';
import {View, ActivityIndicator, ImageBackground} from 'react-native';
import bgCOR from '../assets/bg_COR.png'; // Adjust the import path as needed

export function Loading() {
  return (
    // <View
    //   style={{
    //     flex: 1,
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //   }}>
    <ImageBackground source={bgCOR} style={{flex: 1}} />
    // </View>
  );
}
