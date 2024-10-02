// SOCDisplay.js

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

interface SOCExt2Props {
    socExt2Value: number;
  }

export function SOCExt2 ({ socExt2Value } : SOCExt2Props) {
    
  return (
    <View style={styles.container}>
      <Text style={styles.socLabel}>SOC Ext 2:</Text>
      <Text style={styles.socValue}>{socExt2Value}</Text>
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


