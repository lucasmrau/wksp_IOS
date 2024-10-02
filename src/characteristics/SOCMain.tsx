// SOCDisplay.js

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

interface SOCMainProps {
  socValue: number; 
}


export function SOCMain ({ socValue } : SOCMainProps ){
    
  return (
    <View style={styles.container}>
      <Text className="text-white" style={styles.socLabel}>SOC Main:</Text>
      <Text className='text-white' style={styles.socValue}>{socValue}</Text>
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


