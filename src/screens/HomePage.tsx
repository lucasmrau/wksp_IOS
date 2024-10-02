import {
  Text,
  TouchableOpacity,
  View,
  Platform,
  PermissionsAndroid,
  ImageBackground,
  Image,
  StyleSheet,
} from 'react-native';
import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import bgScreen from '../assets/bg_mainScreen.png';
import CORLogo from '../assets/CORLogo.svg';
import MPPTLogo from '../assets/MPPTLogo.svg';
import BatteryLogo from '../assets/BatteryLogo.svg';
import {text} from 'stream/consumers';
import {horizontalScale, verticalScale, moderateScale} from '../utils/Metric';

export function HomePage() {
  const navigation = useNavigation(); // Use the useNavigation hook

  useEffect(() => {
    handleAndroidPermissions();
  }, []);

  const handleAndroidPermissions = () => {
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]).then(result => {
        if (result) {
          // console.debug(
          //   '[handleAndroidPermissions] User accepts runtime permissions android 12+',
          // );
        } else {
          // console.error(
          //   '[handleAndroidPermissions] User refuses runtime permissions android 12+',
          // );
        }
      });
    } else if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ).then(checkResult => {
        if (checkResult) {
          // console.debug(
          //   '[handleAndroidPermissions] runtime permission Android <12 already OK',
          // );
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ).then(requestResult => {
            if (requestResult) {
              // console.debug(
              //   '[handleAndroidPermissions] User accepts runtime permission android <12',
              // );
            } else {
              // console.error(
              //   '[handleAndroidPermissions] User refuses runtime permission android <12',
              // );
            }
          });
        }
      });
    }
  };

  function handleOpenCORHub() {
    navigation.navigate('CorHub' as never);
  }

  function handleBatteryPage() {
    navigation.navigate('Batteries' as never);
  }

  function handleMPPT() {
    navigation.navigate('MPPT' as never);
  }

  return (
    <ImageBackground source={bgScreen} style={{flex: 1}}>
      <View className="flex-1 flex-col items-center w-full justify-center space-y-[5%]">
        <TouchableOpacity onPress={handleOpenCORHub}>
          <View
            className="rounded-xl items-center justify-center"
            style={{
              borderColor: '#0076BD',
              borderWidth: 0.2,
              backgroundColor: 'transparent',
              width: horizontalScale(280),
              height: verticalScale(192),
              gap: moderateScale(8),
            }}>
            {/* <Image source={require('../assets/CORLogo.png')} /> */}
            <CORLogo />
            <Text
              className="text-text text-2xl"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              COR HUB
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleMPPT}>
          <View
            className="rounded-xl items-center gap-2 justify-center"
            style={{
              borderColor: '#0076BD',
              borderWidth: 0.2,
              backgroundColor: 'transparent',
              width: horizontalScale(280),
              height: verticalScale(192),
              gap: moderateScale(8),
            }}>
            <MPPTLogo />
            {/* <Image source={require('../assets/MPPTLogo.png')} /> */}
            <Text
              className="text-text text-2xl"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              MPPT
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleBatteryPage}>
          <View
            className="rounded-xl items-center gap-2 justify-center"
            style={{
              borderColor: '#0076BD',
              borderWidth: 0.2,
              backgroundColor: 'transparent',
              width: horizontalScale(280),
              height: verticalScale(192),
              gap: moderateScale(8),
            }}>
            <BatteryLogo />
            {/* <Image source={require('../assets/BatteryLogo.png')} /> */}
            <Text
              className="text-text text-2xl"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              BATTERIES
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}
