import AsyncStorage from '@react-native-async-storage/async-storage';
import {Peripheral} from 'react-native-ble-manager';

// Save known peripherals to AsyncStorage
export const saveKnownPeripherals = async (
  peripheralsMap: Map<Peripheral['id'], Peripheral>,
) => {
  try {
    const peripheralsArray = Array.from(peripheralsMap.values());
    await AsyncStorage.setItem(
      'knownPeripherals',
      JSON.stringify(peripheralsArray),
    );
    console.log('Known peripherals saved:', peripheralsArray);
  } catch (error) {
    console.error('Error saving known peripherals:', error);
  }
};

// Load known peripherals from AsyncStorage
export const loadKnownPeripherals = async () => {
  try {
    const peripheralsString = await AsyncStorage.getItem('knownPeripherals');
    if (peripheralsString) {
      const peripheralsArray: Peripheral[] = JSON.parse(peripheralsString);
      const peripheralsMap = new Map<Peripheral['id'], Peripheral>();
      peripheralsArray.forEach(peripheral => {
        peripheralsMap.set(peripheral.id, peripheral);
      });
      return peripheralsMap; // Return the loaded map
    }
    return new Map();
  } catch (error) {
    console.error('Error loading known peripherals:', error);
    return new Map();
  }
};

// Delete a specific peripheral from AsyncStorage by ID
export const deletePeripheral = async (id: Peripheral['id']) => {
  try {
    const peripheralsString = await AsyncStorage.getItem('knownPeripherals');
    if (peripheralsString) {
      const peripheralsArray: Peripheral[] = JSON.parse(peripheralsString);
      const filteredArray = peripheralsArray.filter(
        peripheral => peripheral.id !== id,
      );
      await AsyncStorage.setItem(
        'knownPeripherals',
        JSON.stringify(filteredArray),
      );
      console.log('Peripheral deleted:', id);
    }
  } catch (error) {
    console.error('Error deleting peripheral:', error);
  }
};
