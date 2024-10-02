import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // import Slider from '@react-native-assets/slider';
import {Slider, Icon} from '@rneui/base';

interface LcdProps {
  lcdBrightness: number;
  onSliderChange: (value: number) => void;
  enable: boolean;
}

export function Lcd({lcdBrightness, onSliderChange, enable}: LcdProps) {
  const handleSliderChange = (value: any) => {
    onSliderChange(value);
  };

  return (
    <>
      <View className="items-start flex-row rounded-3xl p-5 mt-5 space-x-5 mx-5 bg-banner flex ">
        <Text
          className="text-text px-2 pr-2 uppercase"
          style={{fontFamily: 'Poppins-SemiBold'}}>
          display
        </Text>
        <Slider
          allowTouchTrack={true}
          maximumTrackTintColor="#FFF"
          maximumValue={40}
          minimumTrackTintColor="#2b7bbb"
          minimumValue={0}
          onValueChange={handleSliderChange}
          orientation="horizontal"
          step={1}
          style={{width: 200, height: 25, marginLeft: 20}}
          thumbStyle={
            lcdBrightness === 0
              ? {height: 0, width: 0}
              : {height: 0.4, width: 0.4}
          } // Condicionando a visibilidade
          thumbTintColor="white"
          thumbTouchSize={{width: 80, height: 80}}
          trackStyle={{height: 20, borderRadius: 20}}
          value={lcdBrightness}
          // disabled={enable}
        />
      </View>
    </>
  );
}
