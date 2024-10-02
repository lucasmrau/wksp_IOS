import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {MpptComponent} from '../components/Mppt_component';
import BleManager, {Peripheral} from 'react-native-ble-manager';
import {useBleMPPT} from '../components/useBLE_MPPT';
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Carousel from 'react-native-reanimated-carousel';
import {DotIndicator} from 'react-native-indicators';
import {GraphStats} from '../components/graphStats';
import {RealmProvider, syncConfig} from '../libs/realm';
import 'react-native-get-random-values';
import Realm from 'realm';
import {UserProvider} from '@realm/react';
import {Loading} from '../components/Loading';
import bgCOR from '../assets/bg_COR.png';
import {horizontalScale, verticalScale} from '../utils/Metric';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  loadKnownPeripherals,
  saveKnownPeripherals,
} from '../storage/storageDevices';
import {Icon, useToast} from 'native-base';
import {Button} from '../components/Button';

export function Mppt() {
  const navigation = useNavigation();

  const sliderWidth = Dimensions.get('window').width;
  const itemWidth = sliderWidth * 0.5;

  const [isCarouselVisible, setIsCarouselVisible] = useState<boolean>(false); //visibility carousel
  const [connectionStatus, setConnectionStatus] = useState<
    'Connect' | 'Searching...' | 'Connecting' | 'Disconnecting' | 'Connected'
  >('Connect');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(
    null,
  ); // dots & color
  const [selectedPeripheral, setSelectedPeripheral] =
    useState<Peripheral | null>(null); // peripheral selected
  const [backButtonPressed, setBackButtonPressed] = useState(false);
  const [knownPeripherals, setKnownPeripherals] = useState<
    Map<Peripheral['id'], Peripheral>
  >(new Map());
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    isScanning,
    peripherals,
    addOrUpdatePeripheral,
    startScan,
    solarPower,
    voltageMppt,
    setSolarPower,
    setVoltageMppt,
    controlSignal,
    setControlSignal,
    writeControl,
    // writeReset,
    readCharacteristicsonScreenMPPT,
    modeSelector,
    setModeSelector,
    tempValue1,
    tempValue2,
    readPoweronScreen,
    setTempValue1,
    setTempValue2,
    readControlSignalonScreen,
    peripheralMPPT,
    MPPT_UUID,
    MPPT_POWER_VOLTAGE_CHAR,
    MPPT_TEMP,
    hasErrorMPPT,
    setHasErrorMPPT,
  } = useBleMPPT();

  const [powerArray, setPowerArray] = useState<number[]>([]);
  const toast = useToast();

  const [variable, setVariable] = useState(0); // Initialize your variable

  const handleImageLoad = () => {
    // Define que o carregamento da imagem terminou
    setIsLoading(false);
  };

  //login anonymous
  useEffect(() => {
    const login = async () => {
      const app = new Realm.App({id: 'worksport_app-cnndywz'});
      const credentials = Realm.Credentials.anonymous();
      try {
        const user = await app.logIn(credentials);
      } catch (err) {
        console.error('Failed to log in', err);
      }
    };
    login();
  }, []);

  useEffect(() => {
    setPowerArray([solarPower]);
  }, [solarPower]);

  useEffect(() => {
    setModeSelector(modeSelector);
  }, [modeSelector]);

  // functions to convert voltage to 2 number
  const voltage2number = Number((voltageMppt / 10).toFixed(2));

  const temp1Fixed =
    tempValue1 === 0 ? 0 : Number((tempValue1 / 10 - 40).toFixed(1));
  const temp2Fixed =
    tempValue2 === 0 ? 0 : Number((tempValue2 / 10 - 40).toFixed(1));

  useEffect(() => {
    if (modeSelector !== 0) {
      writeControl(controlSignal, modeSelector);
    }
  }, [modeSelector]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setVariable(prevVariable => prevVariable + 1); // Change the variable every 30 seconds
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (connectionStatus === 'Connected') {
        readControlSignalonScreen();
        setControlSignal(controlSignal);
      }
    }, 2000); // 2000 milliseconds = 2 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [connectionStatus, controlSignal]); //

  useEffect(() => {
    if (controlSignal) {
      const intervalId = setInterval(() => {
        readCharacteristicsonScreenMPPT();
      }, 2000);

      return () => clearInterval(intervalId);
    }
  });

  useEffect(() => {
    if (controlSignal) {
      const intervalId = setInterval(() => {
        readPoweronScreen();
      }, 29000);
      return () => clearInterval(intervalId);
    }
  }, [variable]);

  useEffect(() => {
    readPoweronScreen();
  }, [controlSignal]);

  useEffect(() => {
    if (connectionStatus === 'Connected' && solarPower === 0) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [connectionStatus, solarPower]);

  useEffect(() => {
    const handleBackPress = () => {
      if (connectionStatus === 'Connected') {
        // Option 'connect' is true, show an alert to disconnect
        Alert.alert(
          'Disconnect',
          'Please, disconnect your MPPT to continue.',
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
  }, [connectionStatus === 'Connected', navigation]);

  const openCarousel = async () => {
    try {
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
    }
  };

  //// ORIGINAL

  const updateSystemOnOff = async () => {
    if (controlSignal === 0) {
      setControlSignal(1);
      await writeControl(1, modeSelector);
    } else {
      setControlSignal(0);
      await writeControl(0, modeSelector);
    }
  };

  // Connect to the peripheral

  const connectDevice = async (peripheral: Peripheral, index: number) => {
    try {
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

      addOrUpdatePeripheral(peripheral.id, {
        ...peripheral,
        connecting: true,
      });

      await BleManager.connect(peripheral.id);
      console.debug(`[connectPeripheral][${peripheral.id}] connected.`);

      addOrUpdatePeripheral(peripheral.id, {
        ...peripheral,
        connecting: false,
        connected: true,
      });

      await BleManager.retrieveServices(peripheral.id);

      // Add peripheral to knownPeripherals and save
      // setKnownPeripherals(prevKnownPeripherals => {
      //   const updatedPeripherals = new Map(prevKnownPeripherals);
      //   updatedPeripherals.set(peripheral.id, peripheral);
      //   saveKnownPeripherals(updatedPeripherals); // Persist the updated list
      //   return updatedPeripherals;
      // });

      console.log('Connected');
      setSelectedPeripheral(null); // Hide DotIndicator when connected
      setConnectionStatus('Connected');
      toast.closeAll();
    } catch (error: any) {
      console.error('Connection error:', error);
      if (error.message === 'Bluetooth is off') {
        Alert.alert(
          'Bluetooth is Off',
          'Please enable Bluetooth to connect to devices.',
        );
      } else {
        showToast();
        setConnectionStatus('Connect');
        setSelectedPeripheral(null);
        setSelectedItemIndex(null); // Reset the selected item index

        console.log('Disconnected due to connection failure');
      }
    }
  };

  // Disconnect from the peripheral
  const disconnectDevice = async (peripheral: Peripheral, index: number) => {
    try {
      console.log('Disconnecting...');
      setSelectedPeripheral(peripheral);
      setSelectedItemIndex(index);
      setConnectionStatus('Disconnecting');

      console.debug(`[connect][${peripheral.id}] disconnected.`);

      await BleManager.disconnect(peripheral.id);

      // disconnectPeripheral(peripheral);
      addOrUpdatePeripheral(peripheral.id, {
        ...peripheral,
        connecting: false,
        connected: false,
      });

      setSolarPower(0);
      setVoltageMppt(0);
      setTempValue1(0);
      setTempValue2(0);

      setTimeout(() => {
        setConnectionStatus('Connect');
        setSelectedPeripheral(null);
      }, 1000);
    } catch (error: any) {
      console.error('Disconnection error:', error);
    }
  };

  const handleDevicePress = async (peripheral: Peripheral, index: number) => {
    toast.closeAll();
    if (connectionStatus === 'Connect') {
      await connectDevice(peripheral, index);
    } else if (connectionStatus === 'Connected') {
      await disconnectDevice(peripheral, index);
    }
  };

  // Define the handleError function
  // const handleErrorMPPT = (peripheral: Peripheral, index: number) => {
  //   Alert.alert(
  //     'Error',
  //     'An error occurred. Please disconnect the device and try reconnecting.',
  //     [
  //       {
  //         text: 'Disconnect',
  //         onPress: () => disconnectDevice(peripheral, index), // Pass the index as 0
  //       },
  //     ],
  //   );
  // };

  const showToast = () => {
    // Verifica se já existe um toast ativo
    if (!isToastVisible) {
      // Fecha todos os toasts abertos
      toast.closeAll();

      // Exibe um novo toast
      toast.show({
        title: 'Connection failure',
        description: 'Please try again.',
        backgroundColor: '#9e2f2f',
        alignItems: 'center',
        duration: 2000, // Tempo de exibição do toast
        onCloseComplete: () => setIsToastVisible(false), // Redefine o estado quando o toast fecha
      });

      // Define o estado para indicar que o toast está visível
      setIsToastVisible(true);
    }
  };

  // const handlePresentModalPress = useCallback(async () => {
  //   try {
  //     // Check if Bluetooth is enabled
  //     const isEnabled = await BleManager.checkState();

  //     if (isEnabled === 'on') {
  //       // Load known peripherals from AsyncStorage
  //       const storedPeripherals = await loadKnownPeripherals();
  //       setKnownPeripherals(storedPeripherals);

  //       // If the modal reference exists, present it
  //       if (bottomSheetModalRef.current) {
  //         bottomSheetModalRef.current.present();
  //       }
  //     } else {
  //       // If Bluetooth is off, show an alert to the user
  //       Alert.alert('Bluetooth is Off', 'Please enable Bluetooth to proceed.');
  //     }
  //   } catch (error) {
  //     console.error(
  //       'Error checking Bluetooth state or loading peripherals:',
  //       error,
  //     );
  //     Alert.alert(
  //       'Error',
  //       'Failed to check Bluetooth state or load peripherals.',
  //     );
  //   }
  // }, [setKnownPeripherals, bottomSheetModalRef]);

  useEffect(() => {
    // Simulate a loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200); // Adjust the delay as needed

    return () => clearTimeout(timer);
  }, []);

  // useEffect(() => {
  //   if (hasErrorMPPT) {
  //     handleErrorMPPT(Array.from(peripherals)[0][1], 0);
  //   }
  //   setHasErrorMPPT(false);
  // }, [hasErrorMPPT, peripherals]);

  return (
    <UserProvider fallback={Loading}>
      <RealmProvider sync={syncConfig} fallback={Loading}>
        <View className="flex-1">
          <ImageBackground source={bgCOR} style={{flex: 1}}>
            <View
              className="flex w-full justify-end"
              style={{
                height: verticalScale(80),
                marginBottom: verticalScale(10),
                marginTop: verticalScale(20),
                paddingLeft: horizontalScale(10),
              }}>
              <Image
                style={{
                  width: horizontalScale(140),
                  height: verticalScale(40),
                }}
                source={require('../assets/WireTitleCOR.png')}
              />
            </View>
            <View className="justify-center flex flex-row relative">
              {isCarouselVisible ? (
                <>
                  {isScanning ? (
                    <View
                      style={{
                        height: verticalScale(100),
                        marginBottom: verticalScale(10),
                      }}>
                      <ActivityIndicator
                        style={{paddingTop: 15, paddingBottom: 10}}
                        size="large"
                        color="#2b7bbb"
                      />
                      <Text className="text-white text-center justify-center">
                        Searching for MPPT...
                      </Text>
                    </View>
                  ) : (
                    <>
                      {peripherals.size > 0 ? (
                        peripherals.size === 1 ? ( // Check if there is only one item
                          <View
                            className="flex flex-1 flex-col relative justify-center"
                            style={{
                              height: verticalScale(100),
                              marginBottom: verticalScale(10),
                            }}>
                            <View className="absolute right-7 top-5">
                              <TouchableOpacity
                                onPress={() => {
                                  disconnectDevice(
                                    Array.from(peripherals)[0][1],
                                    0,
                                  );
                                  startScan();
                                }}>
                                <View style={{alignItems: 'center'}}>
                                  <Ionicons
                                    name="sync"
                                    size={40}
                                    color="white"
                                  />
                                  <Text
                                    className="text-white text-center w-14"
                                    style={{fontFamily: 'Poppins-SemiBold'}}>
                                    Rescan
                                  </Text>
                                </View>
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
                                onPress={() => {
                                  // if (hasErrorMPPT) {
                                  //   handleErrorMPPT(
                                  //     Array.from(peripherals)[0][1],
                                  //     0,
                                  //   ); // Pass the index as 0
                                  // } else {
                                  handleDevicePress(
                                    Array.from(peripherals)[0][1],
                                    0,
                                  ); // Pass the index as 0
                                  //}
                                }}>
                                <MaterialCommunityIcons
                                  name="battery"
                                  size={40}
                                  color={
                                    connectionStatus === 'Connected' &&
                                    selectedItemIndex === 0
                                      ? // && !hasErrorMPPT
                                        '#2b7bbb'
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
                          <View className="flex w-full px-8 mb-12 bg- flex-row">
                            <View className="flex flex-1 justify-center items-center">
                              <Carousel
                                data={Array.from(peripherals)}
                                renderItem={({item, index}) => (
                                  <View
                                    key={item[0]}
                                    className="flex items-center justify-center">
                                    {selectedPeripheral &&
                                      selectedItemIndex === index &&
                                      (connectionStatus === 'Connecting' ||
                                        connectionStatus ===
                                          'Disconnecting') && (
                                        <DotIndicator color="white" size={5} />
                                      )}
                                    <TouchableOpacity
                                      onPress={() => {
                                        // if (hasErrorMPPT) {
                                        //   handleErrorMPPT(item[1], index);
                                        // } else {
                                        handleDevicePress(item[1], index);
                                        //}
                                      }}>
                                      <MaterialCommunityIcons
                                        name="battery"
                                        size={40}
                                        color={
                                          connectionStatus === 'Connected' &&
                                          selectedItemIndex === index
                                            ? //&& !hasErrorMPPT
                                              '#2b7bbb'
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
                            </View>
                            <View className="flex">
                              <TouchableOpacity
                                onPress={() => {
                                  disconnectDevice(
                                    Array.from(peripherals)[0][1],
                                    0,
                                  );
                                  startScan();
                                }}>
                                <View style={{alignItems: 'center'}}>
                                  <Ionicons
                                    name="sync"
                                    size={40}
                                    color="white"
                                  />
                                  <Text
                                    className="text-white text-center w-14"
                                    style={{fontFamily: 'Poppins-SemiBold'}}>
                                    Rescan
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            </View>
                          </View>
                        )
                      ) : (
                        <View
                          className="flex justify-center items-center"
                          style={{
                            height: verticalScale(100),
                            marginBottom: verticalScale(10),
                          }}>
                          <Text
                            className="text-white text-base mb-2"
                            style={{fontFamily: 'Poppins-SemiBold'}}>
                            MPPT not found. Try again.
                          </Text>
                          <Button
                            color={'#120C1E'}
                            text={'CONNECT'}
                            textColor={'#A2B9DF'}
                            onPressIn={openCarousel}
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
                          />
                        </View>
                      )}
                    </>
                  )}
                </>
              ) : (
                <View
                  className="justify-center"
                  style={{
                    height: verticalScale(100),
                    marginBottom: verticalScale(10),
                  }}>
                  <Button
                    color={'#120C1E'}
                    text={'CONNECT'}
                    textColor={'#A2B9DF'}
                    onPress={openCarousel} //openCarousel
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
                  />
                </View>
              )}
            </View>

            <MpptComponent
              isConnected={isConnected}
              controlSignal={controlSignal} /// chage for controlSignal
              modeSelector={modeSelector}
              setControlSignal={updateSystemOnOff}
              setModeSelector={setModeSelector}
              enable={connectionStatus === 'Connected'}
              tempValue1={temp1Fixed}
              tempValue2={temp2Fixed}
              solarPower={solarPower}
              voltageValueMppt={voltage2number}
              peripheralMPPT={peripheralMPPT}
              MPPT_UUID={MPPT_UUID}
              MPPT_POWER_VOLTAGE_CHAR={MPPT_POWER_VOLTAGE_CHAR}
              MPPT_TEMP={MPPT_TEMP}
            />
            <GraphStats power={powerArray} />
          </ImageBackground>
        </View>
      </RealmProvider>
    </UserProvider>
  );
}
