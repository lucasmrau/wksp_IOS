// SOCDisplay.js

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';


interface SOCExt3Props {
    socExt3Value: number; 
  }

export function SOCExt3 ({ socExt3Value } : SOCExt3Props) {
    
  return (
    <View style={styles.container}>
      <Text style={styles.socLabel}>SOC Ext 3:</Text>
      <Text style={styles.socValue}>{socExt3Value}</Text>
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


