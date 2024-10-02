import Carousel from 'react-native-reanimated-carousel';
import React, {useRef, useEffect, useState, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BleManager, {Peripheral} from 'react-native-ble-manager';
import {useBle} from '../components/useBLE';
import {Alert} from 'react-native';
import {DotIndicator} from 'react-native-indicators';
import {BatteryStats} from '../components/BatteryStats';
import {BottomSheetModal, BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {SingleBatStats} from '../components/SingleBatStats';
import {useNavigation} from '@react-navigation/native';
import {CurrentStats} from '../components/CurrentStats';
import {SOCMain} from '../characteristics/SOCMain';

export function Batteries() {
  const [connected, setConnected] = useState(false); // change color battery icon
  const [isCarouselVisible, setIsCarouselVisible] = useState<boolean>(false); //visibility carousel
  const [connectionStatus, setConnectionStatus] = useState<
    'Connect' | 'Searching...' | 'Connecting' | 'Disconnecting' | 'Connected'
  >('Connect');
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(
    null,
  ); // dots
  const [selectedPeripheral, setSelectedPeripheral] =
    useState<Peripheral | null>(null); // peripheral selected
  const [pValue, setPValue] = useState(0);
  const [backButtonPressed, setBackButtonPressed] = useState(false);

  const navigation = useNavigation();

  const {
    isScanning,
    peripherals,
    addOrUpdatePeripheral,
    startScan,
    readCharacteristicsonScreen,
    handleStopScan,
    handleDisconnectedPeripheral,
    handleUpdateValueForCharacteristic,
    handleDiscoverPeripheral,
    retrieveConnected,
    connectPeripheral,
    disconnectPeripheral,
    socExt1Value,
    socExt2Value,
    socExt3Value,
    socValue,
    powerValue,
    voltageValue,
    minTempValue,
    maxTempValue,
    minTempExt1,
    minTempExt2,
    minTempExt3,
    maxTempExt1,
    maxTempExt2,
    maxTempExt3,
    bleManagerEmitter,
    // readCharacteristicsonScreen,
    writelLEDToPeripheral,
    writelLCDToPeripheral,
    ledBrightness,
    setLedBrightness,
    LCDBrightness,
    setLCDBrightness,
    connectingStatus,
    setPowerValue,
    setSocValue,
    setConnectingStatus,
    acOnOff,
    dcOnOff,
    systemOnOff,
    setSystemOnOff,
    setAcOnOFF,
    setDcOnFF,
  } = useBle();

  useEffect(() => {
    const handleBackPress = () => {
      if (connected) {
        // Option 'connect' is true, show an alert to disconnect
        Alert.alert(
          'Disconnect',
          'Please, disconnect your Cor Hub to continue.',
          [
            {
              text: 'Ok',
              onPress: () => {}, // Do nothing if the user cancels
              style: 'cancel',
            },
          ],
          {cancelable: false},
        );
      } else {
        // Option 'connect' is not true, simply navigate back
        navigation.goBack();
      }
      return true; // Return true to indicate that we've handled the back press
    };

    // Add event listener for the Android back button press
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => {
      // Remove the event listener when the component unmounts
      backHandler.remove();
    };
  }, [connected, navigation]); // Include 'connect' and 'navigation' in the dependency array

  const openCarousel = async () => {
    try {
      // Check if Bluetooth is enabled
      const isEnabled = await BleManager.checkState();
      if (isEnabled === 'on') {
        setIsCarouselVisible(true);
        startScan();
      } else {
        Alert.alert(
          'Bluetooth is Off',
          'Please enable Bluetooth to connect to devices.',
        );
      }
    } catch (error) {
      console.error('Error enabling Bluetooth:', error);
      // Handle error if there was a problem checking Bluetooth state
    }
  };

  const hideCarousel = (peripheral: Peripheral) => {
    setIsCarouselVisible(false);
    handleStopScan();
  };

  function sleep(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
  }

  const connectDevice = async (peripheral: Peripheral, index: number) => {
    try {
      if (connectionStatus === 'Connect') {
        console.log('Connecting...');
        const isEnabled = await BleManager.checkState();
        if (isEnabled !== 'on') {
          console.log('Bluetooth is off. Not connecting.');
          Alert.alert(
            'Bluetooth is Off',
            'Please enable Bluetooth to connect to devices.',
          );
          return; // Exit the function if Bluetooth is off
        }

        setConnectionStatus('Connecting');
        setSelectedItemIndex(index);
        setSelectedPeripheral(peripheral); // Show DotIndicator when connecting

        // connectPeripheral(peripheral)

        await addOrUpdatePeripheral(peripheral.id, {
          ...peripheral,
          connecting: true,
        });

        await BleManager.connect(peripheral.id);
        console.debug(`[connectPeripheral][${peripheral.id}] connected.`);

        await addOrUpdatePeripheral(peripheral.id, {
          ...peripheral,
          connecting: false,
          connected: true,
        });

        const peripheralData = await BleManager.retrieveServices(peripheral.id);

        console.log('Connected');
        setConnected(true);
        setSelectedPeripheral(null); // Hide DotIndicator when connected
        setConnectionStatus('Connected');
      } else if (connectionStatus === 'Connected') {
        console.log('Disconnecting...');
        setSelectedPeripheral(peripheral); // Show DotIndicator when disconnecting
        setSelectedItemIndex(index);
        setConnectionStatus('Disconnecting');

        console.debug(`[connect][${peripheral.id}] disconnected.`);

        disconnectPeripheral(peripheral);
        // await addOrUpdatePeripheral(peripheral.id, {
        //   ...peripheral,
        //   connected: false,
        // });

        // await BleManager.disconnect(peripheral.id);

        setPowerValue(0);
        setSocValue(0);

        setTimeout(() => {
          setConnectionStatus('Connect');
          setConnected(false);
          setSelectedPeripheral(null); // Hide DotIndicator when fully disconnected
        }, 1000);
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      if (error.message === 'Bluetooth is off') {
        Alert.alert(
          'Bluetooth is Off',
          'Please enable Bluetooth to connect to devices.',
        );
      } else {
        console.log('Disconnected due to connection failure');
        setConnectionStatus('Connect');
        setSelectedPeripheral(null);
      }
    }
  };

  const updateACCurrent = () => {
    const updatedAcOnOff = acOnOff === 0 ? 1 : 0;
    setAcOnOFF(updatedAcOnOff);
  };

  const updateDCCurrent = () => {
    const updatedDcOnOff = dcOnOff === 0 ? 1 : 0;
    setDcOnFF(updatedDcOnOff);
  };

  const [currentOnOff, setCurrentOnOff] = useState(false);

  const updateSystemCurrent = () => {
    setSystemOnOff(systemOnOff === 0 ? 1 : 0);
    setCurrentOnOff(currentOnOff === false ? true : false);
    setLCDBrightness(0);
    setLedBrightness(0);
  };

  const sliderWidth = Dimensions.get('window').width;
  const itemWidth = sliderWidth * 0.5;

  const firstTwoDigits = Math.floor(socValue / 10);

  return (
    <>
      <View className="bg-background flex-1">
        <View>
          <View className="absolute top-5 left-3 flex flex-row">
            <Text className=" text-white font-bold text-xl">COR Batteries</Text>
          </View>
          <View className="justify-center h-32 mt-12 flex flex-row relative">
            {isCarouselVisible ? (
              <>
                {isScanning ? (
                  <View>
                    <ActivityIndicator
                      style={{paddingTop: 15, paddingBottom: 10}}
                      size="large"
                      color="#2b7bbb"
                    />
                    <Text className="text-white text-center justify-center pb-5">
                      Searching for Hub...
                    </Text>
                  </View>
                ) : (
                  <>
                    {peripherals.size > 0 ? (
                      peripherals.size === 1 ? ( // Check if there is only one item
                        <View className="flex flex-1 flex-col relative justify-center">
                          <View className="absolute right-7 top-5 z-30">
                            <TouchableOpacity
                              onPress={() => {
                                if (systemOnOff) {
                                  readCharacteristicsonScreen();
                                }
                              }}>
                              <Ionicons name="sync" size={40} color="white" />
                            </TouchableOpacity>
                          </View>
                          <View
                            key={Array.from(peripherals)[0][1]}
                            className="items-center flex-grow">
                            {selectedPeripheral && (
                              <DotIndicator
                                color="white"
                                size={5}
                                style={{
                                  paddingBottom: 10,
                                  position: 'absolute',
                                  top: 8,
                                }}
                              />
                            )}
                            <TouchableOpacity
                              onPress={
                                () =>
                                  connectDevice(
                                    Array.from(peripherals)[0][1],
                                    0,
                                  ) // Pass the index as 0
                              }>
                              <MaterialCommunityIcons
                                name="battery"
                                size={40}
                                color={
                                  connected && selectedItemIndex === 0 // Set color based on selected item index
                                    ? '#2b7bbb'
                                    : 'gray'
                                }
                                style={{
                                  borderWidth: 1,
                                  borderColor: 'gray',
                                  borderRadius: 10,
                                  padding: 15,
                                }}
                              />
                            </TouchableOpacity>
                            <Text className="text-white">
                              {Array.from(peripherals)[0][1].name}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <Carousel
                          data={Array.from(peripherals)}
                          renderItem={({item, index}) => (
                            <View
                              key={item[0]}
                              className="flex flex-1 items-center justify-center">
                              {selectedPeripheral &&
                                selectedItemIndex === index && (
                                  <DotIndicator
                                    color="white"
                                    size={5}
                                    style={{
                                      paddingBottom: 10,
                                      position: 'absolute',
                                      top: 8,
                                    }}
                                  />
                                )}
                              <TouchableOpacity
                                onPress={() => connectDevice(item[1], index)} // Pass the index
                              >
                                <MaterialCommunityIcons
                                  name="battery"
                                  size={40}
                                  color={
                                    connected && selectedItemIndex === index // Set color based on selected item index
                                      ? '#2b7bbb'
                                      : 'gray'
                                  }
                                  style={{
                                    borderWidth: 1,
                                    borderColor: 'gray',
                                    borderRadius: 10,
                                    padding: 15,
                                  }}
                                />
                                <Text className="text-white text-center">
                                  {item[1].name}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                          width={itemWidth}
                          mode="parallax"
                          height={itemWidth / 2}
                        />
                      )
                    ) : (
                      <View className="flex">
                        <Text className="text-white mt-2 text-base">
                          Cor Hub not found. Try again.
                        </Text>
                        <TouchableOpacity
                          className="py-4 m-2 px-5 bg-button rounded-md"
                          onPress={openCarousel}>
                          <Text className="text-white font-bold text-center uppercase">
                            Connect
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
              </>
            ) : (
              <View className="justify-center">
                <TouchableOpacity
                  className="py-4 px-20 justify-center bg-button rounded-md"
                  onPress={openCarousel}>
                  <Text className="text-white font-bold uppercase">
                    Connect
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          {/* <BatteryStats powerValu={powerValue} soc={firstTwoDigits} /> */}
          {/* <SingleBatStats /> */}
          <CurrentStats
            acValue={acOnOff}
            dcValue={dcOnOff}
            systemIsOn={systemOnOff}
            SetAcValue={updateACCurrent}
            SetDcValue={updateDCCurrent}
            onSystemPress={updateSystemCurrent}
            enable={!connected}
          />
          <Text className="text-white">SocExt1{socExt1Value}</Text>
          <Text className="text-white">SocExt2{socExt2Value}</Text>
          <Text className="text-white">SocExt3{socExt3Value}</Text>
          <Text className="text-white">MinTempExt1{minTempExt1}</Text>
          <Text className="text-white">MinTempExt2{minTempExt2}</Text>
          <Text className="text-white">MinTempExt3{minTempExt3}</Text>
          <Text className="text-white">MaxTempExt1{maxTempExt1}</Text>
          <Text className="text-white">MaxTempExt2{maxTempExt2}</Text>
          <Text className="text-white">MaxTempExt3{maxTempExt3}</Text>
          <Text className="text-white">MAxTemp{maxTempValue}</Text>
          <Text className="text-white">MinTemp{minTempValue}</Text>
          <Text className="text-white">SOC{socValue}</Text>
        </View>
      </View>
    </>
  );
}
