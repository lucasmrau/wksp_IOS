// SOCDisplay.js

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

interface SOCExt1Props {
  socExt1Value: number; 
}


export function SOCExt1 ({ socExt1Value } : SOCExt1Props) {
    
  return (
    <View style={styles.container}>
      <Text style={styles.socLabel}>SOC Ext 1:</Text>
      <Text style={styles.socValue}>{socExt1Value}</Text>
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


