import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import Slider from '@react-native-assets/slider'; // Make sure to import Slider from the correct package

export function BatteryRange() {
  const [sliderValue, setSliderValue] = useState<number>(80);
  const [textInputValue, setTextInputValue] = useState<string>('80');


  const handleSliderValue = (value: number) => {
    setSliderValue(value);
    setTextInputValue(value.toString()); // Update the text input value
  };

  const handleTextInputChange = (text: string) => {
    setTextInputValue(text);
    const numericValue = parseInt(text);
    if (!isNaN(numericValue)) {
      setSliderValue(numericValue); // Update the slider value
    }
  };

  return (
    <View className="items-center">
      <Text className="mb-2 p-2 font-bold text-white">SOC Range: {sliderValue}%</Text>
      <Slider
            style={{ width: 270, height: 20}}
            minimumValue={0}
            maximumValue={100}
            step={5}
            thumbSize={19}
            thumbStyle={{
              width: 30, 
              height: 30, 
              borderWidth: 0, 
            }}
            trackStyle={{ height: 20, borderWidth: 0, overflow:'visible', borderRadius: 20}}
            minimumTrackTintColor="#2b7bbb"
            thumbTintColor="#2b7bbb"
            value={sliderValue}
            onValueChange={handleSliderValue}
          />
      <TextInput
        style={{ borderColor: 'gray',borderRadius: 5, borderWidth: 1, marginTop: 10, padding: 5, width:35, color: 'white' }}
        value={textInputValue}
        onChangeText={handleTextInputChange}
        keyboardType="numeric"
      />
    </View>
  );
}
