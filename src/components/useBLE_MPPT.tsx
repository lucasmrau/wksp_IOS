import React, {useState, useEffect} from 'react';
import {NativeModules, NativeEventEmitter, Alert} from 'react-native';

import BleManager, {
  BleDisconnectPeripheralEvent,
  BleManagerDidUpdateValueForCharacteristicEvent,
  BleScanCallbackType,
  BleScanMatchMode,
  BleScanMode,
  Peripheral,
} from 'react-native-ble-manager';
import {Buffer} from 'buffer';
import {Ble} from './Ble';
import {VoltageMain} from '../characteristics/VoltageMain';
import {read} from 'fs';

export const BleManagerModule = NativeModules.BleManager;
export const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

declare module 'react-native-ble-manager' {
  interface Peripheral {
    connected?: boolean;
    connecting?: boolean;
    createPeripheral: () => Peripheral;
    addOrUpdatePeripheral(id: string, updatedPeripheral: Peripheral): void;
    startScan(): void;
    handleStopScan(): void;
    handleDisconnectedPeripheral(event: BleDisconnectPeripheralEvent): void;
    handleUpdateValueForCharacteristic(
      data: BleManagerDidUpdateValueForCharacteristicEvent,
    ): void;
    handleDiscoverPeripheral(peripheral: Peripheral): void;
    togglePeripheralConnection(peripheral: Peripheral): Promise<void>;
    retrieveConnected(): Promise<void>;
    connectPeripheral(peripheral: Peripheral): Promise<void>;
    handleAndroidPermissions?(): void;
    readCharacteristics(
      serviceUUID: string,
      characteristicUUID: string,
    ): Promise<void>;
  }
}

const SECONDS_TO_SCAN_FOR = 5;
const SERVICE_UUIDS: string[] = [];
const ALLOW_DUPLICATES = true;

const MPPT_MAC = 'E9:60:0A:76:C1:5B';

const MPPT_UUID = 'E909900B-38D7-0000-8FE1-2A48A02B36E6';
const MPPT_ON_OFF_UUID = 'E90A930B-38D7-0000-8FE1-2A48A02B36E6';
const MPPT_ON_OFF_CHAR = 'E91A930B-38D7-0000-8FE1-2A48A02B36E6';
const MPPT_POWER_VOLTAGE_CHAR = 'E919900B-38D7-0000-8FE1-2A48A02B36E6';
const MPPT_TEMP = 'E929900B-38D7-0000-8FE1-2A48A02B36E6';
const MPPT_RESET = 'E92A930B-38D7-0000-8FE1-2A48A02B36E6';

export function useBleMPPT() {
  const [isScanning, setIsScanning] = useState(false);
  const [connectingStatus, setConnectingStatus] = useState(false);
  const [hasErrorMPPT, setHasErrorMPPT] = useState(false);

  const [peripherals, setPeripherals] = useState(
    new Map<Peripheral['id'], Peripheral>(),
  );

  const [systemTimeTick, setSystemTimeTick] = useState(1234);

  const [peripheralMPPT, setperipheralMPPT] = useState('');

  //characteristics

  //Control -------------------------------------------------
  const [controlSignal, setControlSignal] = useState(0);

  // Mode - COR or Battery
  const [modeSelector, setModeSelector] = useState(0);

  //Power W -------------------------------------------------
  const [solarPower, setSolarPower] = useState(0); //Main Battery

  //Voltage V -------------------------------------------------

  const [voltageMppt, setVoltageMppt] = useState(0); //Main Battery

  //Temperature
  const [tempValue1, setTempValue1] = useState(0); //Main Battery
  const [tempValue2, setTempValue2] = useState(0); //Main Battery

  //Control -------------------------------------------------
  const [faultSignal, SetFaultSignal] = useState(0); //Main Battery

  /////////////////////////////////////////////////////////////

  // useEffect(() => {
  //   writelLEDToPeripheral();
  // }, [ledBrightness]);

  // useEffect(() => {
  //   writelLCDToPeripheral();
  // }, [LCDBrightness]);

  const addOrUpdatePeripheral = (id: string, updatedPeripheral: Peripheral) => {
    // new Map() enables changing the reference & refreshing UI.
    // TOFIX not efficient.
    setPeripherals(map => new Map(map.set(id, updatedPeripheral)));
    setperipheralMPPT(id);
  };

  const startScan = () => {
    if (!isScanning) {
      // reset found peripherals before scan
      setPeripherals(new Map<Peripheral['id'], Peripheral>());

      try {
        console.debug('[startScan] starting scan...');
        setIsScanning(true);
        BleManager.scan(SERVICE_UUIDS, SECONDS_TO_SCAN_FOR, ALLOW_DUPLICATES, {
          matchMode: BleScanMatchMode.Sticky,
          scanMode: BleScanMode.LowLatency,
          callbackType: BleScanCallbackType.AllMatches,
        })
          .then(() => {
            console.debug('[startScan] scan promise returned successfully.');
          })
          .catch(err => {
            console.error('[startScan] ble scan returned in error', err);
          });
      } catch (error) {
        console.error('[startScan] ble scan error thrown', error);
      }
    }
  };

  const handleStopScan = () => {
    setIsScanning(false);
    console.debug('[handleStopScan] scan is stopped.');
  };

  const handleDisconnectedPeripheral = (
    event: BleDisconnectPeripheralEvent,
  ) => {
    let peripheral = peripherals.get(event.peripheral);
    if (peripheral) {
      // console.debug(
      //   `[handleDisconnectedPeripheral][${peripheral.id}] previously connected peripheral is disconnected.`,
      //   event.peripheral,
      // );
      addOrUpdatePeripheral(peripheral.id, {...peripheral, connected: false});
    }
    // console.debug(
    //   `[handleDisconnectedPeripheral][${event.peripheral}] disconnected.`,
    // );
  };

  const handleUpdateValueForCharacteristic = (
    data: BleManagerDidUpdateValueForCharacteristicEvent,
  ) => {
    // console.debug(
    //   `[handleUpdateValueForCharacteristic] received data from '${data.peripheral}' with characteristic='${data.characteristic}' and value='${data.value}'`,
    // );
  };

  const handleDiscoverPeripheral = (peripheral: Peripheral) => {
    // console.debug('[handleDiscoverPeripheral] new BLE peripheral=', peripheral);

    // Check if the peripheral's name is "COR"
    if (peripheral.name && peripheral.name.includes('MPPT')) {
      console.debug(`Found a device called: ${peripheral.name}`);
      // Handle the "COR" device as needed
      addOrUpdatePeripheral(peripheral.id, peripheral);
    }
  };

  // const handleDiscoverPeripheral = (peripheral: Peripheral) => {
  //   // console.debug('[handleDiscoverPeripheral] new BLE peripheral=', peripheral);
  //   // Check if the peripheral's name is "COR"
  //   if (
  //     peripheral.advertising.serviceUUIDs &&
  //     peripheral.advertising.serviceUUIDs.includes(COR_UUID)
  //   ) {
  //     console.debug(`Found a device called: ${peripheral.name}`);
  //     // Handle the "COR" device as needed
  //     addOrUpdatePeripheral(peripheral.id, peripheral);
  //   }
  // };

  const readCharacteristics = async (
    peripheralId: string,
    serviceUUID: string,
    characteristicUUID: string,
  ) => {
    await BleManager.read(peripheralId, serviceUUID, characteristicUUID)
      .then(readData => {
        console.log('alou Read: ' + readData + ' - ' + peripheralMPPT);
        console.log(serviceUUID);
        console.log(characteristicUUID);

        // Assuming readData is a base64-encoded string
        const buffer = Buffer.from(readData);
        //Power
        const sensorData = [
          buffer.readUInt8(2), // Value at index 2
          buffer.readUInt8(3), // Value at index 3
        ];
        const subArrayPower = sensorData.reverse();
        const intPower = (subArrayPower[0] << 8) | subArrayPower[1];
        setSolarPower(intPower);
        /////////////////////////

        // Voltage
        const sensorData2 = [
          buffer.readUInt8(4), // Value at index 4
          buffer.readUInt8(5), // Value at index 5
        ];

        const subArrayVoltage = sensorData2.reverse();
        const intVoltage = (subArrayVoltage[0] << 8) | subArrayVoltage[1];
        setVoltageMppt(intVoltage);
        console.log('Voltage: ' + intVoltage);
        console.log('Power: ' + intPower);
        //---------------------------------------------------------//
      })
      .catch(error => {
        // Failure code
        console.log('Error reading characteristic:', error);
        setHasErrorMPPT(true);
      });
  };

  const readCharacteristics2 = async (
    peripheralId: string,
    serviceUUID: string,
    characteristicUUID: string,
  ) => {
    try {
      const readData = await BleManager.read(
        peripheralId,
        serviceUUID,
        characteristicUUID,
      );

      // Assuming readData is a base64-encoded string
      const buffer = Buffer.from(readData);
      // Temperature 1 ---------------------------------------//

      const sensorData = [
        buffer.readUInt8(2), // Value at index 2
        buffer.readUInt8(3), // Value at index 3
      ];

      const subArrayTemp1 = sensorData.reverse();
      const intTemp1 = (subArrayTemp1[0] << 8) | subArrayTemp1[1];

      setTempValue1(intTemp1);

      // Temperature 2 ---------------------------------------//

      const sensorData2 = [
        buffer.readUInt8(4), // Value at index 4
        buffer.readUInt8(5), // Value at index 5
      ];

      const subArrayTemp2 = sensorData2.reverse();
      const intTemp2 = (subArrayTemp1[0] << 8) | subArrayTemp2[1];

      // Update powerValueScreen
      setTempValue2(intTemp2);
    } catch (error) {
      // Handle any errors that occur during the read operation
      console.log(error);
      setHasErrorMPPT(true);
    }
  };

  const readCharacteristics3 = async (
    peripheralId: string,
    serviceUUID: string,
    characteristicUUID: string,
  ) => {
    await BleManager.read(peripheralId, serviceUUID, characteristicUUID)
      .then(readData => {
        const buffer = Buffer.from(readData);
        // ON OFF ---------------------------------------------//
        const sensorData = buffer.readUInt8(2);

        setControlSignal(sensorData);

        //COR OR Battery ---------------------------------------------//
        const sensorData2 = buffer.readUInt8(3);
        setModeSelector(sensorData2);
      })
      .catch(error => {
        // Failure code
        setHasErrorMPPT(true);
        console.log(error);
      });
  };

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     readCharacteristics3(peripheralMPPT, MPPT_ON_OFF_UUID, MPPT_ON_OFF_CHAR);
  //   }, 2000); // 2000 milliseconds = 2 seconds

  //   // Cleanup interval on component unmount
  //   return () => clearInterval(intervalId);
  // }, []); // Empty dependency array ensures this runs once on mount

  // write Reset
  const writeReset = async () => {
    try {
      const dataToSend = Array.from(
        new Uint8Array([
          (systemTimeTick >> 8) & 0xff,
          systemTimeTick & 0xff,
          1,
          2,
        ]),
      );

      // Write the data to the characteristic
      await BleManager.write(
        peripheralMPPT,
        MPPT_ON_OFF_UUID,
        MPPT_RESET,
        dataToSend,
      );

      console.log('Data written successfully:', dataToSend);
    } catch (error) {
      console.error('Error writing data to peripheral:', error);
    }
  };

  const writeControl = async (controlSignal: number, modeSelector: number) => {
    try {
      const dataToSend = Array.from(
        new Uint8Array([
          (systemTimeTick >> 8) & 0xff,
          systemTimeTick & 0xff,
          controlSignal,
          modeSelector,
        ]),
      );

      // Write the data to the characteristic
      await BleManager.write(
        peripheralMPPT,
        MPPT_ON_OFF_UUID,
        MPPT_ON_OFF_CHAR,
        dataToSend,
      );

      console.log('Data written successfully:', dataToSend);
    } catch (error) {
      console.error('Error writing data to peripheral:', error);
    }
  };

  const readCharacteristicsonScreenMPPT = async () => {
    await readCharacteristics2(peripheralMPPT, MPPT_UUID, MPPT_TEMP);

    await readCharacteristics3(
      peripheralMPPT,
      MPPT_ON_OFF_UUID,
      MPPT_ON_OFF_CHAR,
    );
  };

  const readPoweronScreen = async () => {
    await readCharacteristics(
      peripheralMPPT,
      MPPT_UUID,
      MPPT_POWER_VOLTAGE_CHAR,
    );
  };

  const readControlSignalonScreen = async () => {
    await readCharacteristics3(
      peripheralMPPT,
      MPPT_ON_OFF_UUID,
      MPPT_ON_OFF_CHAR,
    );
  };

  const retrieveConnected = async () => {
    try {
      const connectedPeripherals = await BleManager.getConnectedPeripherals();
      if (connectedPeripherals.length === 0) {
        console.warn('[retrieveConnected] No connected peripherals found.');
        return;
      }

      console.debug(
        '[retrieveConnected] connectedPeripherals',
        connectedPeripherals,
      );

      for (var i = 0; i < connectedPeripherals.length; i++) {
        var peripheral = connectedPeripherals[i];
        addOrUpdatePeripheral(peripheral.id, {...peripheral, connected: true});
      }
    } catch (error) {
      console.error(
        '[retrieveConnected] unable to retrieve connected peripherals.',
        error,
      );
    }
  };

  const connectPeripheral = async (peripheral: Peripheral) => {
    try {
      if (peripheral) {
        addOrUpdatePeripheral(peripheral.id, {...peripheral, connecting: true});

        await BleManager.connect(peripheral.id);
        console.debug(`[connectPeripheral][${peripheral.id}] connected.`);

        addOrUpdatePeripheral(peripheral.id, {
          ...peripheral,
          connecting: false,
          connected: true,
        });

        setConnectingStatus(true);

        await sleep(900);

        await BleManager.retrieveServices(peripheral.id);
      }
    } catch (error) {
      console.error(
        `[connectPeripheral][${peripheral.id}] connectPeripheral error`,
        error,
      );
    }
  };

  function sleep(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
  }

  const disconnectPeripheral = async (peripheral: Peripheral) => {
    try {
      if (peripheral && peripheral.connected) {
        // Update the peripheral status to indicate disconnecting
        addOrUpdatePeripheral(peripheral.id, {...peripheral, connected: true});

        // Disconnect from the peripheral using BleManager
        await BleManager.disconnect(peripheral.id);
        console.debug(`[disconnectPeripheral][${peripheral.id}] disconnected.`);
        setConnectingStatus(false); ////////////////////
        // Update the peripheral status to indicate it's no longer connected
        addOrUpdatePeripheral(peripheral.id, {
          ...peripheral,
          connecting: false,
          connected: false,
        });
      }
    } catch (error) {
      console.error(
        `[disconnectPeripheral][${peripheral.id}] disconnectPeripheral error`,
        error,
      );
    }
  };

  useEffect(() => {
    try {
      BleManager.start({showAlert: false})
        .then(() => console.debug('BleManager started.'))
        .catch(error =>
          console.error('BeManager could not be started.', error),
        );
    } catch (error) {
      console.error('unexpected error starting BleManager.', error);
      return;
    }

    const listeners = [
      bleManagerEmitter.addListener(
        'BleManagerDiscoverPeripheral',
        handleDiscoverPeripheral,
      ),
      bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan),
      bleManagerEmitter.addListener(
        'BleManagerDisconnectPeripheral',
        handleDisconnectedPeripheral,
      ),
      bleManagerEmitter.addListener(
        'BleManagerDidUpdateValueForCharacteristic',
        handleUpdateValueForCharacteristic,
      ),
    ];

    return () => {
      // console.debug('[app] main component unmounting. Removing listeners...');
      for (const listener of listeners) {
        listener.remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isScanning,
    peripherals,
    addOrUpdatePeripheral,
    startScan,
    handleStopScan,
    handleDisconnectedPeripheral,
    handleUpdateValueForCharacteristic,
    handleDiscoverPeripheral,
    connectPeripheral,
    disconnectPeripheral,
    setConnectingStatus,
    peripheralMPPT,
    setperipheralMPPT,
    MPPT_UUID,
    MPPT_POWER_VOLTAGE_CHAR,
    MPPT_TEMP,
    solarPower,
    voltageMppt,
    setSolarPower,
    setVoltageMppt,
    controlSignal,
    setControlSignal,
    writeControl,
    writeReset,
    readCharacteristicsonScreenMPPT,
    readPoweronScreen,
    modeSelector,
    setModeSelector,
    tempValue1,
    tempValue2,
    setTempValue1,
    setTempValue2,
    readCharacteristics,
    readCharacteristics2,
    readControlSignalonScreen,
    hasErrorMPPT,
    setHasErrorMPPT,
  };
}
