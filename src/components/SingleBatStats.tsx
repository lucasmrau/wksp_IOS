import {Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DetailsButtonBattery } from './DetailsButtonBattery';

export function SingleBatStats() {
  return (
    <>
      <View className="flex-1 flex-row justify-center mb-20 gap-2 pt-2 px-5 inline bg-background">
    
          <View className="bg-modal rounded-md items-center justify-center w-24 h-32">
            <MaterialCommunityIcons name="thermometer" size={30} color="gray" />
            <Text className="text-white font-bold pt-5">20C</Text>
          </View>
    
          <View className="bg-modal rounded-md items-center justify-center w-24 h-32">
            <MaterialCommunityIcons name="flash" size={30} color="gray" />
            <Text className="text-white font-bold pt-5">650V</Text>
          </View>
    
          {/* <View className="bg-modal rounded-md items-center justify-center w-24 h-32">
            <MaterialCommunityIcons name="thermometer" size={30} color="gray" />
            <Text className="text-white font-bold pt-5">20C</Text>
          </View> */}

      </View>
    </>
  );
}
