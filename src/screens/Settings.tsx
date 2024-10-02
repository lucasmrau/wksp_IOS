import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView} from 'react-native';
import {Peripheral} from 'react-native-ble-manager';
import {loadKnownPeripherals} from '../storage/storageDevices';

export function Settings() {
  const [knownPeripherals, setKnownPeripherals] = useState<Peripheral[]>([]);

  // Load peripherals when component mounts
  useEffect(() => {
    const fetchPeripherals = async () => {
      const peripheralsMap = await loadKnownPeripherals();
      setKnownPeripherals(Array.from(peripheralsMap.values()));
    };

    fetchPeripherals();
  }, []);

  return (
    <View className="bg-background flex-1 p-4">
      <ScrollView>
        {knownPeripherals.length > 0 ? (
          knownPeripherals.map(peripheral => (
            <View key={peripheral.id} className="p-4 mb-4 bg-white rounded-lg">
              <Text className="text-lg font-bold">ID: {peripheral.id}</Text>
              <Text>Name: {peripheral.name || 'Unknown'}</Text>
              <Text>RSSI: {peripheral.rssi}</Text>
            </View>
          ))
        ) : (
          <Text className="text-center mt-4">No known peripherals found.</Text>
        )}
      </ScrollView>
    </View>
  );
}
