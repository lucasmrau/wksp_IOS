import React, {useEffect, useRef, useState} from 'react';
import {Text, View, Dimensions} from 'react-native';
import {useQuery, useRealm} from '../libs/realm';
import {Data} from '../libs/realm/schemas/Data';
import {useUser} from '@realm/react';
import BackgroundFetch from 'react-native-background-fetch';
import {horizontalScale, verticalScale} from '../utils/Metric';
import PowerMPPT from '../assets/PowerMPPT.svg';
import TempMPPT from '../assets/TempMPPT.svg';
import Temp2MPPT from '../assets/Temp2MPPT.svg';
import VoltageMPPT from '../assets/VoltageMPPT.svg';
import MPPT from '../assets/MPPT.svg';
import BleManager, {
  BleDisconnectPeripheralEvent,
  BleManagerDidUpdateValueForCharacteristicEvent,
  BleScanCallbackType,
  BleScanMatchMode,
  BleScanMode,
  Peripheral,
} from 'react-native-ble-manager';
import {Buffer} from 'buffer';
import BounceButton from './BounceButton';
import {Switch} from '@rneui/themed';
import Animated, {
  useSharedValue,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {Skeleton} from 'native-base';

interface MpptComponentProps {
  controlSignal: number; //change later
  setControlSignal: (value: number) => void;
  // controlSignal: boolean; // test
  // setControlSignal: (value: boolean) => void; //test
  modeSelector: number;
  setModeSelector: (value: number) => void;
  enable: boolean;
  solarPower: number;
  tempValue1: number;
  tempValue2: number;
  voltageValueMppt: number;
  peripheralMPPT: string;
  MPPT_UUID: string;
  MPPT_POWER_VOLTAGE_CHAR: string;
  MPPT_TEMP: string;
  isConnected: boolean;
}

export function MpptComponent({
  controlSignal,
  setControlSignal,
  enable = false,
  solarPower,
  tempValue1,
  tempValue2,
  voltageValueMppt,
  setModeSelector,
  modeSelector,
  peripheralMPPT,
  MPPT_UUID,
  MPPT_POWER_VOLTAGE_CHAR,
  MPPT_TEMP,
  isConnected,
}: MpptComponentProps) {
  const [signalControl, setSignalControl] = useState(false); //Main Battery

  function handleSystemPressMPPT() {
    if (signalControl) {
      setSignalControl(false);
      setControlSignal(0);
    } else {
      setSignalControl(true);
      setControlSignal(1);
    }
  }

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  const screenWidth = Dimensions.get('window').width;
  const elementWidth = horizontalScale(50);
  const translateX = -(elementWidth / 1);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{scale: scale.value}],
    };
  });

  const realm = useRealm();
  const dataQuery = useQuery(Data);
  const user = useUser();

  useEffect(() => {
    opacity.value = withSpring(1);
    scale.value = withSpring(1);
  }, []);

  useEffect(() => {
    if (user && realm) {
      realm.subscriptions.update((mutableSubs, realm) => {
        const historicByUserQuery = realm
          .objects('Data')
          .filtered(`user_id = '${user.id}'`);
        mutableSubs.add(historicByUserQuery, {name: 'historic_by_user'});
      });
    }
  }, []);

  const [variable, setVariable] = useState(0); // Initialize your variable

  useEffect(() => {
    const intervalId = setInterval(() => {
      setVariable(prevVariable => prevVariable + 1); // Change the variable every 30 seconds
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let intervalId: string | number | NodeJS.Timeout | undefined;
    // if (signalControl == true) {

    intervalId = setInterval(() => {
      saveToDatabase(solarPower, tempValue1, tempValue2, voltageValueMppt);
    }, 29000); // 30000 milliseconds = 30 seconds
    // }
    // Clean up function to clear the interval
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [signalControl, variable]);

  useEffect(() => {
    console.log('useEffect is running');

    BackgroundFetch.configure(
      {
        minimumFetchInterval: 15, // <-- minutes (15 is minimum allowed)
        stopOnTerminate: true, // <-- Android-only
        startOnBoot: true, // <-- Android-only
      },
      async taskId => {
        console.log('BackgroundFetch task started');

        const readCharacteristics = async (
          peripheralId: string,
          serviceUUID: string,
          characteristicUUID1: string,
          characteristicUUID2: string,
        ) => {
          let intPower = 0;
          let intVoltage = 0;
          let intTemp1 = 0;
          let intTemp2 = 0;

          await BleManager.read(peripheralId, serviceUUID, characteristicUUID1)
            .then(readData => {
              console.log('alou Read BG: ' + readData);
              console.log('UUIDs: ' + peripheralId);
              console.log(serviceUUID);
              console.log(characteristicUUID1 + '\n--------------------\n');
              // Assuming readData is a base64-encoded string
              const buffer = Buffer.from(readData);
              // Power
              const sensorData = [
                buffer.readUInt8(2), // Value at index 2
                buffer.readUInt8(3), // Value at index 3
              ];
              const subArrayPower = sensorData.reverse();
              intPower = (subArrayPower[0] << 8) | subArrayPower[1];
              /////////////////////////

              // Voltage
              const sensorData2 = [
                buffer.readUInt8(4), // Value at index 4
                buffer.readUInt8(5), // Value at index 5
              ];

              const subArrayVoltage = sensorData2.reverse();
              intVoltage = (subArrayVoltage[0] << 8) | subArrayVoltage[1];
              intVoltage = Number((intVoltage / 10).toFixed(2));

              console.log('Voltage BG: ' + intVoltage);
              console.log('Power BG: ' + intPower);
              //---------------------------------------------------------//
            })
            .catch(error => {
              // Failure code
              console.log('Error reading characteristic: test', error);
            });

          await BleManager.read(peripheralId, serviceUUID, characteristicUUID2)
            .then(readData => {
              // Assuming readData is a base64-encoded string
              const buffer = Buffer.from(readData);
              // Temperature 1 ---------------------------------------//

              const sensorData = [
                buffer.readUInt8(2), // Value at index 2
                buffer.readUInt8(3), // Value at index 3
              ];

              const subArrayTemp1 = sensorData.reverse();
              intTemp1 = (subArrayTemp1[0] << 8) | subArrayTemp1[1];

              // Temperature 2 ---------------------------------------//

              const sensorData2 = [
                buffer.readUInt8(4), // Value at index 4
                buffer.readUInt8(5), // Value at index 5
              ];

              const subArrayTemp2 = sensorData2.reverse();
              intTemp2 = (subArrayTemp2[0] << 8) | subArrayTemp2[1];

              console.log('temp1 BG: ' + intTemp1);
              console.log('temp2 BG: ' + intTemp2);
            })
            .catch(error => {
              // Failure code
              console.log('Error reading characteristic: test', error);
            });

          // Save to database with the newly computed values
          saveToDatabase(intPower, intTemp1, intTemp2, intVoltage);
        };

        await readCharacteristics(
          peripheralMPPT,
          MPPT_UUID,
          MPPT_POWER_VOLTAGE_CHAR,
          MPPT_TEMP,
        );

        BackgroundFetch.finish(taskId);
        console.log('BackgroundFetch task finished');
      },
      error => {
        console.error('[BackgroundFetch] failed to start', error);
      },
    );

    return () => {
      console.log('useEffect cleanup');
      BackgroundFetch.stop();
    };
  }, [peripheralMPPT, MPPT_UUID, MPPT_POWER_VOLTAGE_CHAR]);
  // }, [peripheralMPPT, MPPT_UUID, MPPT_POWER_VOLTAGE_CHAR]);

  function saveToDatabase(
    power: number,
    temperature1: number,
    temperature2: number,
    voltage: number,
  ) {
    try {
      realm.write(() => {
        realm.create(
          'Data',
          Data.generate(user!.id, power, temperature1, temperature2, voltage),
        );
      });
    } catch (error) {
      console.error('Error writing to the database', error);
    }
  }

  return (
    <View className="">
      <Animated.View
        entering={FadeInUp.duration(500)}
        className="flex flex-row items-center pl-2 h-full mt-5 absolute"
        style={{top: verticalScale(20)}}>
        {isConnected ? (
          <Skeleton.Text
            lines={1}
            width={horizontalScale(50)}
            startColor={'#a2b9df'}
            endColor={'#76869e'}
          />
        ) : (
          <View className="flex flex-row">
            <TempMPPT />
            <Text
              className="text-lg  text-text self-center"
              style={{
                fontFamily: 'Poppins-SemiBold',
              }}>
              {tempValue1}°C
            </Text>
          </View>
        )}
      </Animated.View>
      <Animated.View
        entering={FadeInUp.duration(500)}
        className="flex flex-row items-center right-0 pr-2 h-full mt-5 absolute"
        style={{top: verticalScale(20)}}>
        {isConnected ? (
          <Skeleton.Text
            lines={1}
            width={horizontalScale(50)}
            startColor={'#a2b9df'}
            endColor={'#76869e'}
          />
        ) : (
          <View className="flex flex-row">
            <Text
              className="text-lg  text-text self-center"
              style={{
                fontFamily: 'Poppins-SemiBold',
              }}>
              {tempValue1}°C
            </Text>
            <Temp2MPPT />
          </View>
        )}
      </Animated.View>
      <View>
        <Animated.View entering={FadeInUp.duration(500)}>
          {isConnected ? (
            <Skeleton.Text
              lines={1}
              startColor={'#a2b9df'}
              endColor={'#76869e'}
              width={horizontalScale(90)}
              style={{
                position: 'absolute',
                left: screenWidth / 2,
                transform: [{translateX}],
              }}
            />
          ) : (
            <View>
              <Text
                className="text-text text-base flex text-center w-screen"
                style={{
                  fontFamily: 'Poppins-SemiBold',
                  marginTop: verticalScale(90),
                  position: 'absolute',
                }}>
                MODE
              </Text>
              <Text
                className="text-text text-2xl flex text-center w-screen"
                style={{
                  fontFamily: 'Poppins-SemiBold',
                  marginTop: verticalScale(115),
                  position: 'absolute',
                }}>
                {modeSelector ? 'POWER STATION' : 'BATTERY'}
              </Text>
            </View>
          )}
        </Animated.View>
        <Animated.View
          entering={FadeInUp.duration(500)}
          className="flex flex-row pl-2 items-center justify-center absolute"
          style={{top: verticalScale(20)}}>
          <PowerMPPT />
          {isConnected ? (
            <Skeleton.Text
              lines={1}
              width={horizontalScale(50)}
              startColor={'#a2b9df'}
              endColor={'#76869e'}
            />
          ) : (
            <Text
              className="text-text text-lg self-end"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              {solarPower}W
            </Text>
          )}
        </Animated.View>
        <Animated.View
          className="flex w-full justify-center items-center absolute"
          style={[animatedStyles, {marginLeft: 'auto', marginRight: 'auto'}]}>
          <MPPT width={horizontalScale(400)} height={verticalScale(200)} />
        </Animated.View>
        <Animated.View
          entering={FadeInUp.duration(500)}
          className="flex flex-row items-center pr-2 right-0 absolute"
          style={{top: verticalScale(20)}}>
          {isConnected ? (
            <Skeleton.Text
              lines={1}
              width={horizontalScale(50)}
              startColor={'#a2b9df'}
              endColor={'#76869e'}
            />
          ) : (
            <View className="flex flex-row">
              <Text
                className="text-lg bg- text-text self-end"
                style={{
                  fontFamily: 'Poppins-SemiBold',
                }}>
                {voltageValueMppt}V
              </Text>
              <VoltageMPPT />
            </View>
          )}
        </Animated.View>
      </View>
      <View
        className="flex mb-2 mx-5 rounded-3xl bg-banner p-2 flex-row justify-center items-center"
        style={{marginTop: verticalScale(230)}}>
        <View className="flex items-center mr-10 justify-center">
          <BounceButton
            className={`bg-${
              controlSignal ? 'banner' : 'background'
            } flex justify-center mx-5 items-center w-14 h-14 rounded-full`}
            icon={true}
            iconProps={{
              name: 'power-outline',
              size: 30,
              color: controlSignal ? '#FFF' : '#A2B9DF',
            }}
            // disabled={enable}
            onPress={handleSystemPressMPPT}></BounceButton>
        </View>
        <View className="flex items-center justify-center">
          <Switch
            value={!!modeSelector}
            onValueChange={value => setModeSelector(value ? 1 : 0)}
            trackColor={{false: '#FFF', true: '#FFF'}}
            thumbColor={modeSelector ? '#0076BD' : '#0076BD'}
            style={{
              transform: [{scale: 1.5}],
            }}
          />
        </View>
      </View>
    </View>
  );
}
