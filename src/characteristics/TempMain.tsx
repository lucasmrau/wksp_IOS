// SOCDisplay.js

import React from 'react';
import {Text, View, StyleSheet} from 'react-native';

interface TempMainProps {
  minTempValue: number;
  maxTempValue: number;
}

export function TempMain({minTempValue, maxTempValue}: TempMainProps) {
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.socLabel}>Min Temperature:</Text>
        <Text style={styles.socValue}>{minTempValue}</Text>
      </View>

      <View style={styles.container}>
        <Text style={styles.socLabel}>Max Temperature:</Text>
        <Text style={styles.socValue}>{maxTempValue}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socLabel: {
    fontSize: 18,
    marginRight: 8,
  },
  socValue: {
    fontSize: 18,
  },
});
