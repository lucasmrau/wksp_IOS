import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useBle} from '../components/useBLE';

interface ConnectProps {
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DetailsButton({setModalVisible}: ConnectProps) {
  const {
    isScanning,
    peripherals,
    addOrUpdatePeripheral,
    startScan,
    handleStopScan,
    handleDisconnectedPeripheral,
    handleUpdateValueForCharacteristic,
    handleDiscoverPeripheral,
    retrieveConnected,
    connectPeripheral,

    socValue,
    socExt1Value,
    socExt2Value,
    socExt3Value,
    voltageValue,
    powerValue,
    setPowerValue,
    minTempValue,
    maxTempValue,
    ledBrightness,
    setLedBrightness,
    setLCDBrightness,
    LCDBrightness,
    disconnectPeripheral,
    readCharacteristicsonScreen,
    connectingStatus,
  } = useBle();

  const navigation = useNavigation(); // Use the useNavigation hook

  function handleOpenSettings() {
    navigation.navigate('Settings' as never);
  }

  function handleOpenStatistcs() {
    navigation.navigate('Statistics' as never);
  }

  const handleHotSwapPress = () => {
    setModalVisible(true);
    if (connectingStatus) {
      readCharacteristicsonScreen();
    }
  };

  return (
    <View className="flex flex-row mt-2 px-5 items-center justify-center">
      <TouchableOpacity onPress={handleHotSwapPress}>
        <View className="bg-button py-4 px-20 rounded-md">
          {/* <Ionicons name="battery-full" style={{}} size={20} color="white" /> */}
          <Text className="text-white text-center font-bold uppercase">
            Details
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleOpenSettings}>
        <View className="p-4">
          <Ionicons name="settings" size={30} color="white" />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleOpenStatistcs}>
        <View className="p-4">
          <Ionicons name="stats-chart-outline" size={20} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
}
