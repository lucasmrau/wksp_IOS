import {LogBox} from 'react-native';
import {Loading} from './src/components/Loading';
import React, {useEffect} from 'react';
import {Routes} from './src/routes/index';
import 'react-native-get-random-values';
import {AppProvider} from '@realm/react';
import {REALM_APP_ID} from '@env';
import {Realm} from 'realm';
import {RealmProvider, syncConfig, useRealm} from './src/libs/realm';

LogBox.ignoreLogs(['new NativeEventEmitter']);
LogBox.ignoreAllLogs();

export default function App() {
  return (
    <AppProvider id={REALM_APP_ID}>
      <Routes />
    </AppProvider>
  );
}
