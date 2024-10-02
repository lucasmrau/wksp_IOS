import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Button} from './Button';
import {Icon} from 'native-base';
import {
  saveKnownPeripherals,
  loadKnownPeripherals,
  deletePeripheral,
} from '../storage/storageDevices';
import {Peripheral} from 'react-native-ble-manager';
import COR from '../assets/CORLogo.svg';
import {horizontalScale, verticalScale} from '../utils/Metric';
import {useNavigation} from '@react-navigation/native';

interface ModalCORProps {
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
  snapPoints: string[];
  peripherals: Map<Peripheral['id'], Peripheral>; // New prop
  setPeripherals: React.Dispatch<
    React.SetStateAction<Map<Peripheral['id'], Peripheral>>
  >; // New setter prop
  handleScan: () => void;
  handleDevicePress: (peripheral: Peripheral, index: number) => Promise<void>;
  connectionStatus: string;
  setConnectionStatus: React.Dispatch<
    React.SetStateAction<
      'Connecting' | 'Connect' | 'Searching...' | 'Disconnecting' | 'Connected'
    >
  >;
  selectedItemIndex: number | null;
  isToastVisible: boolean;
  isScanning: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ModalCOR({
  bottomSheetModalRef,
  snapPoints,
  handleScan,
  handleDevicePress,
  connectionStatus,
  setConnectionStatus,
  selectedItemIndex,
  isToastVisible,
  isScanning,
  setIsModalOpen,
}: ModalCORProps) {
  const [peripherals, setPeripherals] = useState<
    Map<Peripheral['id'], Peripheral>
  >(new Map());
  const [loadingPeripheralId, setLoadingPeripheralId] = useState<string | null>(
    null,
  );
  const navigation = useNavigation();

  const handleDelete = async (id: string) => {
    await deletePeripheral(id); // Delete from AsyncStorage
    setPeripherals(prev => {
      const updated = new Map(prev);
      updated.delete(id); // Remove from local state
      return updated;
    });
  };

  function handleOpenCORHub() {
    navigation.navigate('Settings' as never);
  }

  // Fetch peripherals when modal loads
  useEffect(() => {
    const fetchKnownPeripherals = async () => {
      const knownPeripherals = await loadKnownPeripherals();
      setPeripherals(knownPeripherals);
    };
    fetchKnownPeripherals();
  }, [connectionStatus]);

  const closeModal = useCallback(() => {
    if (bottomSheetModalRef.current) {
      bottomSheetModalRef.current.close();
    }
    setIsModalOpen(false);
  }, [bottomSheetModalRef]);

  const onDevicePress = async (peripheral: Peripheral, index: number) => {
    setLoadingPeripheralId(peripheral.id); // Start loading
    try {
      await handleDevicePress(peripheral, index);
    } finally {
      setLoadingPeripheralId(null); // Stop loading
    }
  };

  useEffect(() => {
    if (connectionStatus === 'Connected') {
      setIsModalOpen(false);
    }
  }, [connectionStatus]);

  const renderItem = ({
    item: peripheral,
    index,
  }: {
    item: Peripheral;
    index: number;
  }) => {
    const isConnected =
      connectionStatus === 'Connected' && selectedItemIndex === index;
    const isConnecting =
      connectionStatus === 'Connecting' && selectedItemIndex === index;

    return (
      <View>
        <TouchableOpacity
          key={peripheral.id}
          onPress={() => onDevicePress(peripheral, index)}
          disabled={loadingPeripheralId === peripheral.id}
          className={`rounded-lg border-2 mb-1 p-4 justify-center items-center ${
            isConnected ? 'border-blue' : 'border-text'
          } ${
            loadingPeripheralId === peripheral.id ? 'opacity-50' : 'opacity-100'
          } mx-2 w-52 h-40`}>
          {loadingPeripheralId === peripheral.id ? (
            <View className="w-52 h-40 justify-center items-center p-4">
              <ActivityIndicator size="large" color="#a2b9df" />
            </View>
          ) : (
            <View className="justify-center items-center flex">
              <COR height={verticalScale(100)} />
              <Text className="text-white">{peripheral.name || 'Unknown'}</Text>
              <Text className="text-white">ID: {peripheral.id}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      handleIndicatorStyle={{backgroundColor: 'grey'}}
      handleStyle={{
        backgroundColor: '#120c1e',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
      }}
      style={{
        backgroundColor: '#120c1e',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
      }}
      backgroundStyle={{display: 'none'}}
      onDismiss={() => setIsModalOpen(false)}>
      <View className="flex justify-center items-center text-center">
        <Ionicons
          name="close"
          size={30}
          color="#a2b9df"
          onPress={closeModal}
          style={{
            alignSelf: 'flex-end',
            backgroundColor: '#1E172C',
            padding: 5,
            borderRadius: 50,
            marginRight: 10,
            marginBottom: 25,
          }}
        />

        {/* {peripherals.size === 0 ? (
          <Text
            style={{
              color: 'white',
              textAlign: 'center',
              marginVertical: 20,
              fontFamily: 'Poppins-SemiBold',
            }}>
            No COR Hub found. Please scan for connecting.
          </Text>
        ) : ( */}
        <FlatList
          data={Array.from(peripherals.values())}
          renderItem={renderItem}
          horizontal={true}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: 10}}
        />
        {/* )} */}

        <View className="flex-row gap-5 mt-3 justify-center flex items-center">
          <Button
            disabled={isToastVisible || isScanning} // Certifique-se de que 'toastVisible' é uma variável booleana
            color={'#120C1E'}
            text={'SCAN'}
            textColor={'#A2B9DF'}
            borderColor={'#0076BD'}
            borderWidth={1}
            leftIcon={
              <Icon
                as={Ionicons}
                name="bluetooth"
                size="lg"
                color={'#A2B9DF'}
              />
            }
            className="w-52"
            onPress={handleScan}
          />
          <TouchableOpacity
            onPress={handleOpenCORHub}
            // onPress={() => handleDelete(peripheral.id)}
            className="p-2 rounded-full justify-center items-center bg-blue w-12 h-12">
            <Ionicons name="settings" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheetModal>
  );
}
