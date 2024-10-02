/* eslint-disable */
import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  FlatList,
  TouchableHighlight,
  Pressable,
} from 'react-native';
import {Peripheral} from 'react-native-ble-manager';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {useBle} from '../components/useBLE';
import {SOCMain} from '../characteristics/SOCMain';
import {SOCExt1} from '../characteristics/SOCExt1';
import {SOCExt2} from '../characteristics/SOCExt2';
import {SOCExt3} from '../characteristics/SOCExt3';
import {VoltageMain} from '../characteristics/VoltageMain';
import {PowerMain} from '../characteristics/PowerMain';
import {TempMain} from '../characteristics/TempMain';

export function Ble() {
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
    minTempValue,
    maxTempValue,
  } = useBle();

  const renderItem = ({item}: {item: Peripheral}) => {
    const backgroundColor = item.connected ? '#069400' : Colors.white;
    return (
      <TouchableHighlight underlayColor="#0082FC">
        <View style={[styles.row, {backgroundColor}]}>
          <Text style={styles.peripheralName}>
            {/* completeLocalName (item.name) & shortAdvertisingName (advertising.localName) may not always be the same */}
            {item.name} - {item?.advertising?.localName}
            {item.connecting && ' - Connecting...'}
          </Text>
          <Text style={styles.rssi}>RSSI: {item.rssi}</Text>
          <Text style={styles.peripheralId}>{item.id}</Text>
        </View>
      </TouchableHighlight>
    );
  };

  return (
    <>
      <StatusBar />
      <SafeAreaView style={styles.body}>
        <Pressable style={styles.scanButton} onPress={startScan}>
          <Text style={styles.scanButtonText}>
            {isScanning ? 'Scanning...' : 'Scan Bluetooth'}
          </Text>
        </Pressable>
        <Pressable style={styles.scanButton} onPress={retrieveConnected}>
          <Text style={styles.scanButtonText}>
            {'Retrieve connected peripherals'}
          </Text>
        </Pressable>

        {/* Display here */}
        <SOCMain socValue={socValue} />
        <SOCExt1 socExt1Value={socExt1Value} />
        <SOCExt2 socExt2Value={socExt2Value} />
        <SOCExt3 socExt3Value={socExt3Value} />
        <VoltageMain voltageValue={voltageValue} />
        {/* <PowerMain powerValue={powerValue}/> */}
        <TempMain minTempValue={minTempValue} maxTempValue={maxTempValue} />

        {Array.from(peripherals.values()).length === 0 && (
          <View style={styles.row}>
            <Text style={styles.noPeripherals}>
              No Peripherals, press "Scan Bluetooth" above.
            </Text>
          </View>
        )}
        <FlatList
          data={Array.from(peripherals.values())}
          contentContainerStyle={{rowGap: 12}}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      </SafeAreaView>
    </>
  );
}
const boxShadow = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
};
const styles = StyleSheet.create({
  engine: {
    position: 'absolute',
    right: 10,
    bottom: 0,
    color: Colors.black,
  },
  scanButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#0a398a',
    margin: 10,
    borderRadius: 12,
    ...boxShadow,
  },
  scanButtonText: {
    fontSize: 20,
    letterSpacing: 0.25,
    color: Colors.white,
  },
  body: {
    backgroundColor: '#0082FC',
    flex: 1,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
  peripheralName: {
    fontSize: 16,
    textAlign: 'center',
    padding: 10,
  },
  rssi: {
    fontSize: 12,
    textAlign: 'center',
    padding: 2,
  },
  peripheralId: {
    fontSize: 12,
    textAlign: 'center',
    padding: 2,
    paddingBottom: 20,
  },
  row: {
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 20,
    ...boxShadow,
  },
  noPeripherals: {
    margin: 10,
    textAlign: 'center',
    color: Colors.white,
  },
  socValue: {
    fontSize: 18,
    textAlign: 'center',
    padding: 10,
    color: Colors.white,
  },
});

export {useBle};
