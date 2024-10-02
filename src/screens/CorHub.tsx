import Carousel from 'react-native-reanimated-carousel';
import React, {useRef, useEffect, useState, useMemo, useCallback} from 'react';
import CORLogo from '../assets/CORLogo.svg';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  ImageBackground,
  SafeAreaView,
  Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BleManager, {Peripheral} from 'react-native-ble-manager';
import {useBle} from '../components/useBLE';
import {Alert} from 'react-native';
import {DotIndicator} from 'react-native-indicators';
import {BatteryStats} from '../components/BatteryStats';
import {BottomSheetModal, BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Led} from '../components/Led';
import {CurrentStats} from '../components/CurrentStats';
import {DetailsButton} from '../components/DetailsButton';
import {Lcd} from '../components/Lcd';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import bgCOR from '../assets/bg_COR.png';
import {horizontalScale, verticalScale, moderateScale} from '../utils/Metric';
import '../assets/WireTitleCOR.png';
import {Button} from '../components/Button';
import {Icon, useToast} from 'native-base';
import {Loading} from '../components/Loading';
import {
  loadKnownPeripherals,
  saveKnownPeripherals,
} from '../storage/storageDevices';
import {ModalCOR} from '../components/ModalCor';

export function CorHub() {
  const [handleModal, setHandleModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'Connect' | 'Searching...' | 'Connecting' | 'Disconnecting' | 'Connected'
  >('Connect');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(
    null,
  );
  const [selectedPeripheral, setSelectedPeripheral] =
    useState<Peripheral | null>(null);
  const [knownPeripherals, setKnownPeripherals] = useState<
    Map<Peripheral['id'], Peripheral>
  >(new Map());
  const [backButtonPressed, setBackButtonPressed] = useState(false);
  const [currentOnOff, setCurrentOnOff] = useState(false);
  const navigation = useNavigation();
  const toast = useToast();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const {
    hasError,
    setHasError,
    isScanning,
    peripherals,
    setPeripherals,
    addOrUpdatePeripheral,
    startScan,
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
    bleManagerEmitter,
    readCharacteristicsonScreen,
    writelLEDToPeripheral,
    writelLCDToPeripheral,
    ledBrightness,
    setLedBrightness,
    LCDBrightness,
    setLCDBrightness,
    setPowerValue,
    setSocValue,
    acOnOff,
    dcOnOff,
    systemOnOff,
    setSystemOnOff,
    setAcOnOFF,
    setDcOnFF,
    writeCurrentToPeripheral,
    peripheralMAC,
    setPeripheralMAC,
  } = useBle();

  useEffect(() => {
    const loadStoredPeripherals = async () => {
      try {
        const storedPeripherals = await loadKnownPeripherals();
        setKnownPeripherals(storedPeripherals);

        // Check if any stored peripherals are found, set as available peripherals
        if (storedPeripherals.size > 0) {
          setPeripherals(storedPeripherals);
        }
      } catch (error) {
        console.error('Error loading known peripherals:', error);
      }
    };

    loadStoredPeripherals();
  }, []);

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
        duration: 2500, // Tempo de exibição do toast
        onCloseComplete: () => setIsToastVisible(false), // Redefine o estado quando o toast fecha
      });

      // Define o estado para indicar que o toast está visível
      setIsToastVisible(true);
    }
  };

  const showNoDeviceToast = () => {
    // Only show the toast if none is currently visible
    if (!isToastVisible) {
      setIsToastVisible(true); // Set the flag to prevent multiple toasts

      toast.show({
        title: 'No new COR Hub found',
        description: 'Please try scanning again.',
        backgroundColor: '#9e2f2f',
        alignItems: 'center',
        duration: 2500, // How long to show the toast
        onCloseComplete: () => {
          setIsToastVisible(false); // Reset the flag when toast is done
        },
      });
    }
  };

  const snapPoints = useMemo(() => ['50%', '50%'], []);

  const handlePresentModalPress = useCallback(async () => {
    try {
      // Check if Bluetooth is enabled
      const isEnabled = await BleManager.checkState();

      if (isEnabled === 'on') {
        // Load known peripherals from AsyncStorage
        const storedPeripherals = await loadKnownPeripherals();
        setKnownPeripherals(storedPeripherals);

        // Toggle modal state based on the current state
        if (isModalOpen) {
          // Close modal if it is currently open
          if (bottomSheetModalRef.current) {
            bottomSheetModalRef.current.close();
          }
          setIsModalOpen(false); // Update state to reflect closed modal
        } else {
          // Present modal if it is currently closed
          if (bottomSheetModalRef.current) {
            bottomSheetModalRef.current.present();
          }
          setIsModalOpen(true); // Update state to reflect open modal
        }
      } else {
        // If Bluetooth is off, show an alert to the user
        Alert.alert('Bluetooth is Off', 'Please enable Bluetooth to proceed.');
      }
    } catch (error) {
      console.error(
        'Error checking Bluetooth state or loading peripherals:',
        error,
      );
      Alert.alert(
        'Error',
        'Failed to check Bluetooth state or load peripherals.',
      );
    }
  }, [setKnownPeripherals, bottomSheetModalRef, isModalOpen]);

  const handleScan = async () => {
    toast.closeAll();
    setHandleModal(true);

    // Inicia o escaneamento
    await startScan();

    // Aguarda 4.5 segundos para o escaneamento coletar dispositivos
    await new Promise(resolve => setTimeout(resolve, 4500));

    // Excluir periféricos conhecidos
    const filteredPeripherals = Array.from(peripherals).filter(
      ([key, peripheral]) => !knownPeripherals.has(peripheral.id),
    );

    // Atualiza o estado para armazenar apenas os dispositivos desconhecidos
    setPeripherals(new Map(filteredPeripherals));

    // Verifica se o escaneamento terminou e não há dispositivos desconhecidos
    if (
      !isScanning &&
      filteredPeripherals.length === 0 // Nenhum dispositivo desconhecido encontrado
    ) {
      showNoDeviceToast(); // Mostrar toast quando nenhum dispositivo desconhecido for encontrado
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

      handleDiscoverPeripheral;

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
      setKnownPeripherals(prevKnownPeripherals => {
        const updatedPeripherals = new Map(prevKnownPeripherals);
        updatedPeripherals.set(peripheral.id, peripheral);
        saveKnownPeripherals(updatedPeripherals); // Persist the updated list
        return updatedPeripherals;
      });

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

      setPowerValue(0);
      setSocValue(0);

      setConnectionStatus('Connect');
      setSelectedPeripheral(null);
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
  const handleError = (peripheral: Peripheral, index: number) => {
    Alert.alert(
      'Error',
      'An error occurred. Please disconnect the device and try reconnecting.',
      [
        {
          text: 'Disconnect',
          onPress: () => disconnectDevice(peripheral, index), // Pass the index as 0
        },
      ],
    );
  };

  const handleImageLoad = () => {
    // Define que o carregamento da imagem terminou
    setIsLoading(false);
  };

  useEffect(() => {
    if (hasError) {
      handleError(Array.from(peripherals)[0][1], 0); // Pass the index as 0
    }
    setHasError(false);
  }, [hasError, peripherals]);

  useEffect(() => {
    if (connectionStatus === 'Connected') {
      const intervalId = setInterval(() => {
        readCharacteristicsonScreen();
      }, 2000);

      // Clean up function to clear the interval when the component unmounts or systemOnOff changess
      return () => clearInterval(intervalId);
    }
  });

  useEffect(() => {
    if (connectionStatus === 'Connected' && socValue === 0) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [connectionStatus, socValue]);

  const updateLedBrightness = (ledBrightness: number) => {
    setLedBrightness(ledBrightness);
  };

  const updateLCDBrightness = (lcdBrightness: number) => {
    writelLCDToPeripheral(lcdBrightness);
  };

  const upadateDCCurrent = async () => {
    const newDcOnOff = dcOnOff === 0 ? 1 : 0;
    setDcOnFF(newDcOnOff); // Mantive o nome original 'setDcOnFF'
    await writeCurrentToPeripheral(systemOnOff, acOnOff, newDcOnOff);
  };

  const upadateACCurrent = async () => {
    const newAcOnOff = acOnOff === 0 ? 1 : 0;
    setAcOnOFF(newAcOnOff); // Mantive o nome original 'setAcOnOFF'
    await writeCurrentToPeripheral(systemOnOff, newAcOnOff, dcOnOff);
  };

  const updateSystemCurrent = async () => {
    const newSystemState = systemOnOff === 0 ? 1 : 0;
    setSystemOnOff(newSystemState);
    await writeCurrentToPeripheral(newSystemState, acOnOff, dcOnOff);
    setCurrentOnOff(newSystemState === 1);
  };

  const sliderWidth = Dimensions.get('window').width;
  const itemWidth = sliderWidth * 0.5;

  const firstTwoDigits = Math.floor(socValue / 10);
  const powerRounded = Math.ceil(powerValue);

  useEffect(() => {
    const handleBackPress = () => {
      if (connectionStatus === 'Connected') {
        // Exibir alerta para desconectar o dispositivo
        Alert.alert(
          'Disconnect',
          'Please disconnect your Cor Hub before proceeding.',
          [
            {
              text: 'Cancel',
              onPress: () => {}, // Fazer nada se o usuário cancelar
              style: 'cancel',
            },
            {
              text: 'Ok',
              onPress: async () => {
                try {
                  // Desconectar o dispositivo ao pressionar "Ok"
                  await disconnectDevice(selectedPeripheral, selectedItemIndex);
                  navigation.goBack(); // Voltar após desconectar
                } catch (error) {
                  console.error('Erro ao desconectar:', error);
                }
              },
            },
          ],
          {cancelable: false},
        );
      } else {
        // Se não estiver conectado, apenas voltar
        navigation.goBack();
      }
      return true; // Indica que tratamos o evento do botão voltar
    };

    // Adicionar o listener para o botão voltar no Android
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => {
      // Remover o listener quando o componente desmontar
      backHandler.remove();
    };
  }, [connectionStatus, selectedPeripheral, selectedItemIndex, navigation]);

  return (
    <>
      <SafeAreaView className="flex-1">
        <GestureHandlerRootView className="flex-1">
          <ImageBackground source={bgCOR} style={{flex: 1}}>
            a
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
              {handleModal ? (
                <>
                  {isScanning ? (
                    // Searching state
                    <View
                      className="flex justify-center items-center"
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
                        Searching for COR HUB...
                      </Text>
                    </View>
                  ) : peripherals.size > 0 ? (
                    // Connected state (there are peripherals)
                    peripherals.size === 1 && connectionStatus ? (
                      <View
                        className="flex flex-1 flex-col relative"
                        style={{
                          height: verticalScale(100),
                          marginBottom: verticalScale(10),
                        }}>
                        <View className="absolute right-7">
                          <TouchableOpacity onPress={handlePresentModalPress}>
                            <View className="p-4 bg-banner rounded-full">
                              <Ionicons
                                name="bluetooth"
                                size={35}
                                color="white"
                              />
                            </View>
                          </TouchableOpacity>
                        </View>
                        <View
                          key={Array.from(peripherals)[0][1]}
                          className="items-center justify-start flex">
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
                          <View
                            className={`flex border-2  px-2 pb-2 pt-4 rounded-md 
                              ${
                                connectionStatus === 'Connected'
                                  ? 'border-blue'
                                  : 'border-text'
                              } ${
                              connectionStatus === 'Connecting'
                                ? 'opacity-50'
                                : 'opacity-100'
                            }`}>
                            <TouchableOpacity
                              onPress={() => {
                                if (hasError) {
                                  handleError(Array.from(peripherals)[0][1], 0);
                                } else {
                                  handleDevicePress(
                                    Array.from(peripherals)[0][1],
                                    0,
                                  );
                                }
                              }}>
                              <CORLogo width={70} height={40} />
                            </TouchableOpacity>
                          </View>
                          <Text
                            className="text-white"
                            style={{fontFamily: 'Poppins-Semibold'}}>
                            {Array.from(peripherals)[0][1].name}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <View className="flex w-full px-8 mb-12 flex-row">
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
                                    connectionStatus === 'Disconnecting') && (
                                    <DotIndicator color="white" size={5} />
                                  )}
                                <TouchableOpacity
                                  onPress={() => {
                                    if (hasError) {
                                      handleError(item[1], index);
                                    } else {
                                      handleDevicePress(item[1], index);
                                    }
                                  }}>
                                  <CORLogo width={80} />
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
                          <TouchableOpacity onPress={handlePresentModalPress}>
                            <View className="p-4 bg-banner rounded-full">
                              <Ionicons
                                name="bluetooth"
                                size={35}
                                color="white"
                              />
                            </View>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )
                  ) : (
                    // Fallback when no peripherals are found
                    <View
                      className="flex justify-center items-center"
                      style={{
                        height: verticalScale(100),
                        marginBottom: verticalScale(10),
                      }}>
                      <Button
                        color={'#120C1E'}
                        text={'CONNECT'}
                        disabled={isToastVisible}
                        textColor={'#A2B9DF'}
                        onPress={handlePresentModalPress}
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
              ) : peripherals.size === 0 ? (
                // Fallback when no peripherals are found
                <View
                  className="justify-center"
                  style={{
                    height: verticalScale(100),
                    marginBottom: verticalScale(10),
                  }}>
                  <Button
                    color={'#120C1E'}
                    text={'SCAN'}
                    disabled={isToastVisible}
                    textColor={'#A2B9DF'}
                    onPress={handleScan}
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
              ) : (
                // Fallback for when peripherals exist but not connected
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
                    onPress={handlePresentModalPress}
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
            <BatteryStats
              powerValu={powerRounded}
              soc={firstTwoDigits}
              isConnected={isConnected}
            />
            <CurrentStats
              systemIsOn={systemOnOff}
              onSystemPress={updateSystemCurrent}
              updateDCCurrent={upadateDCCurrent}
              updateACCurrent={upadateACCurrent}
              enable={connectionStatus !== 'Connected'}
              dcValue={dcOnOff}
              acValue={acOnOff}
            />
            <Led
              ledBrightness={ledBrightness}
              onSliderChange={updateLedBrightness}
              enable={currentOnOff}
              enableMode={!currentOnOff}
            />
            <Lcd
              lcdBrightness={LCDBrightness}
              onSliderChange={updateLCDBrightness}
              enable={currentOnOff}
            />
            {/* <DetailsButton setModalVisible={handlePresentModalPress} /> */}
            <BottomSheetModalProvider>
              <ModalCOR
                bottomSheetModalRef={bottomSheetModalRef}
                snapPoints={snapPoints}
                handleScan={handleScan}
                handleDevicePress={handleDevicePress}
                connectionStatus={connectionStatus}
                setConnectionStatus={setConnectionStatus}
                peripherals={peripherals} // Pass peripherals as a prop
                setPeripherals={setPeripherals}
                selectedItemIndex={selectedItemIndex}
                isToastVisible={isToastVisible}
                isScanning={isScanning}
                setIsModalOpen={setIsModalOpen}
              />
            </BottomSheetModalProvider>
          </ImageBackground>
        </GestureHandlerRootView>
      </SafeAreaView>
    </>
  );
}
