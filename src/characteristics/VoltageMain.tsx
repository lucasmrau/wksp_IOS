// SOCDisplay.js

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

interface VoltageMainProps {
  voltageValue: number; 
}


export function VoltageMain ({ voltageValue } : VoltageMainProps ){
    
  return (
    <View style={styles.container}>
      <Text style={styles.socLabel}>Voltage Main:</Text>
      <Text style={styles.socValue}>{voltageValue}</Text>
    </View>
  );
};

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


