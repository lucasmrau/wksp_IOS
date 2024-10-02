import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Slider} from '@rneui/base';

interface LedProps {
  ledBrightness: number;
  onSliderChange: (value: number) => void;
  enable: boolean;
  enableMode: boolean;
}

export function Led({
  ledBrightness,
  onSliderChange,
  enable,
  enableMode,
}: LedProps) {
  const [modeIsPressed, modeDetIsPressed] = useState(false);

  const handleModePress = () => {
    modeDetIsPressed(!modeIsPressed);
  };

  const handleSliderChangeLED = (value: any) => {
    onSliderChange(value);
  };

  return (
    <>
      <View className="items-start flex-row rounded-3xl p-5 space-x-5 mx-5 bg-banner flex">
        <View>
          <Text
            className="text-text pb-3 pl-1 font-bold uppercase"
            style={{fontFamily: 'Poppins-SemiBold'}}>
            side LED
          </Text>
          <TouchableOpacity
            className={`bg-${
              modeIsPressed ? 'yellow' : 'background'
            } flex justify-center items-center w-16 h-16 rounded-full`}
            disabled={enableMode}
            onPress={handleModePress}>
            <Ionicons
              name="sunny-outline"
              size={35}
              color={modeIsPressed ? 'yellow' : 'grey'}
            />
          </TouchableOpacity>
        </View>
        <View className="justify-center items-center h-full text-center flex flex-row px-2">
          <Slider
            allowTouchTrack={true}
            maximumTrackTintColor="#FFF"
            maximumValue={100}
            minimumTrackTintColor="#2b7bbb"
            minimumValue={0}
            onValueChange={handleSliderChangeLED}
            orientation="horizontal"
            step={1}
            style={{width: 200, height: 25}}
            thumbStyle={
              ledBrightness === 0
                ? {height: 0, width: 0}
                : {height: 0.4, width: 0.4}
            } // Condicionando a visibilidade
            thumbTintColor="white"
            thumbTouchSize={{width: 80, height: 80}}
            trackStyle={{height: 20, borderRadius: 20}}
            value={ledBrightness}
            disabled={enable}
          />
        </View>
      </View>
    </>
  );
}
