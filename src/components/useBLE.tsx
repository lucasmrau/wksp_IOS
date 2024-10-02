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
import {loadKnownPeripherals} from '../storage/storageDevices';

export const BleManagerModule = NativeModules.BleManager;
export const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

declare module 'react-native-ble-manager' {
  interface Peripheral {
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

const COR_MAC = 'E9:60:0A:76:C1:5B';
const COR_UUID = 'E909900B-38D7-0000-8FE1-2A48A02B36E6';
const COR_CHARACTERISTIC_T_SOC = 'E919900B-38D7-0000-8FE1-2A48A02B36E6';
const COR_CHARACTERISTIC_V_P = 'E929900B-38D7-0000-8FE1-2A48A02B36E6';
const COR_CHARACTERISTIC_TEMP = 'E939900B-38D7-0000-8FE1-2A48A02B36E6';
const COR_CONTROLS_CHAR = 'E90C930B-38D7-0000-8FE1-2A48A02B36E6';
const COR_AC_DC = 'E93C930B-38D7-0000-8FE1-2A48A02B36E6';
const COR_LED_CHAR = 'E91C930B-38D7-0000-8FE1-2A48A02B36E6';
const COR_LCD_CHAR = 'E92C930B-38D7-0000-8FE1-2A48A02B36E6';

export function useBle() {
  const [isScanning, setIsScanning] = useState(false);

  const [peripherals, setPeripherals] = useState(
    new Map<Peripheral['id'], Peripheral>(),
  );

  const [peripheralMAC, setPeripheralMAC] = useState('');

  //UX ------------------------------------------------

  const [hasError, setHasError] = useState(false);

  //characteristics
  //SOC % --------------------------------------------------

  const [socValue, setSocValue] = useState(0); //Main Battery
  const [socExt1Value, setExt1SocValue] = useState(0); //External Battery 1
  const [socExt2Value, setExt2SocValue] = useState(0); //External Battery 2
  const [socExt3Value, setExt3SocValue] = useState(0); //External Battery 3

  //Power W -------------------------------------------------
  const [powerValue, setPowerValue] = useState(0); //Main Battery

  //Voltage V -------------------------------------------------

  const [voltageValue, setVoltageValue] = useState(0); //Main Battery

  //Temperature
  const [minTempValue, setMinTempValue] = useState(0); //Main Battery
  const [maxTempValue, setMaxTempValue] = useState(0); //Main Battery
  const [minTempExt1, setMinTempExt1] = useState(0);
  const [minTempExt2, setMinTempExt2] = useState(0);
  const [minTempExt3, setMinTempExt3] = useState(0);
  const [maxTempExt1, setMaxTempExt1] = useState(0);
  const [maxTempExt2, setMaxTempExt2] = useState(0);
  const [maxTempExt3, setMaxTempExt3] = useState(0);

  //LED
  const [systemTimeTick, setSystemTimeTick] = useState(1234);
  const [ledBrightness, setLedBrightness] = useState(0);

  //LCD
  const [systemTimeTick2, setSystemTimeTick2] = useState(1234);
  const [LCDBrightness, setLCDBrightness] = useState(0);

  //CURRENT

  const [systemTimeTick3, setSystemTimeTick3] = useState(1234);
  const [systemOnOff, setSystemOnOff] = useState(0);

  const [acOnOff, setAcOnOFF] = useState(0);
  const [dcOnOff, setDcOnFF] = useState(0);

  const addOrUpdatePeripheral = (id: string, updatedPeripheral: Peripheral) => {
    // new Map() enables changing the reference & refreshing UI.
    // TOFIX not efficient.
    setPeripherals(map => new Map(map.set(id, updatedPeripheral)));
    setPeripheralMAC(id);
  };

  const [knownPeripherals, setKnownPeripherals] = useState<
    Map<Peripheral['id'], Peripheral>
  >(new Map());

  // Inside your startScan function

  const startScan = async () => {
    try {
      setIsScanning(true);
      // Load known peripherals from AsyncStorage
      const loadedKnownPeripherals = await loadKnownPeripherals();
      setKnownPeripherals(loadedKnownPeripherals); // Store in state for reference

      // Start BLE scan
      BleManager.scan([], 5, true).then(() => {
        console.log('Scanning started...');
      });
    } catch (error) {
      console.error('Error starting scan:', error);
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
    // Check if the peripheral's name contains "COR" or "COR2"
    if (
      peripheral.name &&
      (peripheral.name.includes('COR2') || peripheral.name.includes('COR'))
    ) {
      console.debug(`Found a COR device: ${peripheral.name}`);

      // Check if the peripheral is already stored in knownPeripherals
      if (!knownPeripherals.has(peripheral.id)) {
        // If it's not stored, add or update it
        addOrUpdatePeripheral(peripheral.id, peripheral);
      } else {
        // console.debug(`Peripheral ${peripheral.id} is already stored.`);
      }
    } else {
      // console.debug(
      //   `Peripheral ${
      //     peripheral.name || peripheral.id
      //   } does not match the criteria.`,
      // );
    }
  };

  // const handleDiscoverPeripheral = (peripheral: Peripheral) => {
  //   // console.debug('[handleDiscoverPeripheral] new BLE peripheral=', peripheral);

  //   // Check if the peripheral's name is "COR"
  //   if (
  //     (peripheral.name && peripheral.name.includes('COR2')) ||
  //     (peripheral.name && peripheral.name.includes('COR'))
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
    await BleManager.read(peripheralId, COR_UUID, COR_CHARACTERISTIC_T_SOC)
      .then(readData => {
        // Success code
        // console.log("Read: " + readData);

        // Assuming readData is a base64-encoded string
        const buffer = Buffer.from(readData);

        //SOC
        // Main Battery ---------------------------------------------//
        const sensorData = [
          buffer.readUInt8(2), // Value at index 2
          buffer.readUInt8(3), // Value at index 3
        ];
        const subArraySOC = sensorData.reverse();
        const intSOC = (subArraySOC[0] << 8) | subArraySOC[1]; // 50-100%
        setSocValue(intSOC);
        /////////////////////////

        // External Battery 1 ---------------------------------------//
        const sensorData2 = [buffer.readUInt8(4), buffer.readUInt8(5)];

        const subArraySOC2 = sensorData2.reverse();
        const intSOC2 = (subArraySOC2[0] << 8) | subArraySOC2[1]; // 1-100%
        setExt1SocValue(intSOC2);
        //----------------------------------------------------------//

        // External Battery 2 --------------------------------------//
        const sensorData3 = [buffer.readUInt8(6), buffer.readUInt8(7)];

        const subArraySOC3 = sensorData3.reverse();
        const intSOC3 = (subArraySOC3[0] << 8) | subArraySOC3[1]; // 21.1%
        setExt2SocValue(intSOC3);
        //---------------------------------------------------------//

        // External Battery 3 --------------------------------------//
        const sensorData4 = [buffer.readUInt8(8), buffer.readUInt8(9)];

        const subArraySOC4 = sensorData4.reverse();
        const intSOC4 = (subArraySOC4[0] << 8) | subArraySOC4[1]; // 15.9%
        setExt3SocValue(intSOC4);
        //---------------------------------------------------------//
      })
      .catch(error => {
        // Failure code
        setHasError(true);
        console.log('Error reading characteristic:', error);
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
        COR_UUID,
        COR_CHARACTERISTIC_V_P,
      );

      // Assuming readData is a base64-encoded string
      const buffer = Buffer.from(readData);

      // Voltage
      // Main Battery ---------------------------------------------//

      const sensorData = [
        buffer.readUInt8(2), // Value at index 4
        buffer.readUInt8(3), // Value at index 5
      ];

      const subArrayVoltage = sensorData.reverse();
      const intVoltage = (subArrayVoltage[0] << 8) | subArrayVoltage[1]; // 50-100%

      // Update voltageValue
      setVoltageValue(intVoltage);

      // Power
      // Main Battery ---------------------------------------------//

      const sensorData2 = [
        buffer.readUInt8(4), // Value at index 2
        buffer.readUInt8(5), // Value at index 3
      ];

      // Reverse the byte order (little-endian)
      const subArrayPower = sensorData2.reverse();

      // Calculate two's complement
      let intPower = subArrayPower[0] * 256 + subArrayPower[1];

      // Check if the most significant bit (MSB) is set (indicating a negative value)
      if (subArrayPower[0] & 0x80) {
        // Perform two's complement for negative values
        intPower -= 65536; // Equivalent to subtracting 2^16
      }

      // Update powerValueScreen
      setPowerValue(intPower);

      // External Battery 1 ---------------------------------------//
      // const sensorData2 = [
      //   buffer.readUInt8(4),
      //   buffer.readUInt8(5),
      // ];
    } catch (error) {
      // Handle any errors that occur during the read operation
      console.log(error);
    }
  };

  const readCharacteristics3 = async (
    peripheralId: string,
    serviceUUID: string,
    characteristicUUID: string,
  ) => {
    await BleManager.read(peripheralMAC, COR_UUID, COR_CHARACTERISTIC_TEMP)
      .then(readData => {
        // Success code
        // console.log("Read: " + readData);

        // Assuming readData is a base64-encoded string
        const buffer = Buffer.from(readData);
        // Main Battery ---------------------------------------------//
        //Min Temperature
        const sensorData = buffer.readUInt8(2);

        setMinTempValue(sensorData);

        //Max Temperature
        const sensorData2 = buffer.readUInt8(3);

        setMaxTempValue(sensorData2);

        // External Battery 1 ---------------------------------------//
        const sensorData3 = buffer.readUInt8(4);
        setMinTempExt1(sensorData3);

        const sensorData4 = buffer.readUInt8(5);
        setMaxTempExt1(sensorData4);

        // External Battery 2 ---------------------------------------//
        const sensorData5 = buffer.readUInt8(6);
        setMinTempExt2(sensorData5);

        const sensorData6 = buffer.readUInt8(7);
        setMaxTempExt2(sensorData6);

        // External Battery 3---------------------------------------//
        const sensorData7 = buffer.readUInt8(8);
        setMinTempExt3(sensorData7);

        const sensorData8 = buffer.readUInt8(8);
        setMaxTempExt3(sensorData8);
      })
      .catch(error => {
        // Failure code
        console.log(error);
      });
  };

  const readLed = async (
    peripheralId: string,
    serviceUUID: string,
    characteristicUUID: string,
  ) => {
    await BleManager.read(peripheralId, COR_CONTROLS_CHAR, COR_LED_CHAR)
      .then(readData => {
        const buffer = Buffer.from(readData);
        const sensorData = buffer.readUInt8(2);
        // Update the LED brightness state
        setLedBrightness(sensorData);
      })
      .catch(error => {
        // Handle any errors that occur during the read operation
        console.log(error);
      });
  };

  const readLcd = async (
    peripheralId: string,
    serviceUUID: string,
    characteristicUUID: string,
  ) => {
    await BleManager.read(peripheralId, COR_CONTROLS_CHAR, COR_LCD_CHAR)
      .then(readData => {
        const buffer = Buffer.from(readData);
        // Main Battery ---------------------------------------------//
        //Min Temperature
        const sensorData = buffer.readUInt8(2);
        setLCDBrightness(sensorData);
        // console.log('LCD Brightness:', sensorData);
      })
      .catch(error => {
        // Failure code
        console.log(error);
      });
  };

  const readCurrent = async (
    peripheralId: string,
    serviceUUID: string,
    characteristicUUID: string,
  ) => {
    await BleManager.read(peripheralId, COR_CONTROLS_CHAR, COR_AC_DC)
      .then(readData => {
        const buffer = Buffer.from(readData);

        const systemTimeTick = (buffer.readUInt8(0) << 8) | buffer.readUInt8(1);
        const systemOnOffRead = buffer.readUInt8(2) & 0b00000001;
        const acOnOffRead = (buffer.readUInt8(2) & 0b00000010) >> 1; // Bit 1
        const dcOnOffRead = (buffer.readUInt8(2) & 0b00000100) >> 2; // Bit 2

        setSystemOnOff(systemOnOffRead);
        setAcOnOFF(acOnOffRead);
        setDcOnFF(dcOnOffRead);
      })
      .catch(error => {
        // Handle read error
        console.error('Error reading data from peripheral:', error);
      });
  };

  const writeCurrentToPeripheral = async (
    onOrOff: number,
    acOnOrOff: number,
    dcOnOrOff: number,
  ) => {
    try {
      // Check if the device is connected before writing data
      // await BleManager.isPeripheralConnected(COR_MAC);

      // Combine the systemOnOff, acOnOff, and dcOnOff bits to form a single byte
      const controlByte =
        (onOrOff & 0x01) |
        ((acOnOrOff & 0x01) << 1) |
        ((dcOnOrOff & 0x01) << 2);

      // Convert the data to a regular JavaScript array
      const dataToSend = Array.from(
        new Uint8Array([
          (systemTimeTick >> 8) & 0xff,
          systemTimeTick & 0xff,
          controlByte,
        ]),
      );

      // Write the data to the characteristic
      await BleManager.write(
        peripheralMAC,
        COR_CONTROLS_CHAR,
        COR_AC_DC,
        dataToSend,
      );

      console.log('Data written successfully:', dataToSend);
    } catch (error) {
      console.error('Error writing data to peripheral:', error);
    }
  };

  const writelLEDToPeripheral = async () => {
    try {
      // Check if the device is connected before writing data
      // await BleManager.isPeripheralConnected(COR_MAC);

      // Convert the data to a regular JavaScript array
      const dataToSend = Array.from(
        new Uint8Array([
          (systemTimeTick >> 8) & 0xff,
          systemTimeTick & 0xff,
          ledBrightness,
        ]),
      );

      // Write the data to the characteristic
      if (systemOnOff) {
        await BleManager.write(
          peripheralMAC,
          COR_CONTROLS_CHAR,
          COR_LED_CHAR,
          dataToSend,
        );
      }
      // console.log('Data written successfully:', dataToSend);
    } catch (error) {
      console.error('Error writing data to peripheral:', error);
    }
  };

  const writelLCDToPeripheral = async (lcdValueToWrite: number) => {
    try {
      // Check if the device is connected before writing data
      // await BleManager.isPeripheralConnected(COR_MAC);

      // Convert the data to a regular JavaScript array
      const dataToSend = Array.from(
        new Uint8Array([
          (systemTimeTick2 >> 8) & 0xff,
          systemTimeTick2 & 0xff,
          lcdValueToWrite,
        ]),
      );

      // Write the data to the characteristic
      if (systemOnOff) {
        await BleManager.write(
          peripheralMAC,
          COR_CONTROLS_CHAR,
          COR_LCD_CHAR,
          dataToSend,
        );
      }
      // console.log('Data written successfully:', dataToSend);
    } catch (error) {
      // console.error('Error writing data to peripheral:', error);
    }
  };

  useEffect(() => {
    writelLEDToPeripheral();
  }, [ledBrightness]);

  // const togglePeripheralConnection = async (peripheral: Peripheral) => {
  //   try {
  //     if (peripheral && peripheral.connected) {
  //       // Handle disconnecting from the peripheral
  //       try {
  //         await BleManager.disconnect(peripheral.id);
  //       } catch (error) {
  //         console.error(
  //           `[togglePeripheralConnection][${peripheral.id}] error when trying to disconnect device.`,
  //           error,
  //         );
  //       }
  //     } else {
  //       // Handle connecting to the peripheral
  //       addOrUpdatePeripheral(peripheral.id, {...peripheral, connecting: true});

  //       await BleManager.connect(peripheral.id);
  //       console.debug(
  //         `[togglePeripheralConnection][${peripheral.id}] connected.`,
  //       );

  //       addOrUpdatePeripheral(peripheral.id, {
  //         ...peripheral,
  //         connecting: false,
  //         connected: true,
  //       });

  //       // Before retrieving services, it is often a good idea to let bonding & connection finish properly
  //       await sleep(1500);

  //       /* Test read current RSSI value, retrieve services first */
  //       const peripheralData = await BleManager.retrieveServices(peripheral.id);
  //       console.debug(
  //         `[togglePeripheralConnection][${peripheral.id}] retrieved peripheral services`,
  //         peripheralData,
  //       );

  //       const rssi = await BleManager.readRSSI(peripheral.id);
  //       console.debug(
  //         `[togglePeripheralConnection][${peripheral.id}] retrieved current RSSI value: ${rssi}.`,
  //       );

  //       // Read the characteristic value here
  //     }
  //   } catch (error) {
  //     console.error(
  //       `[togglePeripheralConnection][${peripheral.id}] togglePeripheralConnection error`,
  //       error,
  //     );
  //   }
  // };

  const readCharacteristicsonScreen = async () => {
    await readCharacteristics(
      peripheralMAC,
      COR_UUID,
      COR_CHARACTERISTIC_T_SOC,
    ),
      await readCharacteristics2(
        peripheralMAC,
        COR_UUID,
        COR_CHARACTERISTIC_V_P,
      );
    // await readCharacteristics3(COR_MAC, COR_UUID, COR_CHARACTERISTIC_TEMP);

    await readLed(peripheralMAC, COR_UUID, COR_LED_CHAR);

    await readLcd(peripheralMAC, COR_UUID, COR_LCD_CHAR);

    await readCurrent(peripheralMAC, COR_UUID, COR_AC_DC);
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
    minTempExt1,
    minTempExt2,
    minTempExt3,
    maxTempExt1,
    maxTempExt2,
    maxTempExt3,
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
    hasError,
    setHasError,
    setIsScanning,
  };
}
