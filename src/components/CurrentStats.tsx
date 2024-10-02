import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BounceButton from '../components/BounceButton';

interface CurrentStatsProps {
  acValue: number;
  dcValue: number;
  systemIsOn: number;
  onSystemPress: (value: boolean) => void;
  updateDCCurrent: (value: number) => void;
  updateACCurrent: (value: number) => void;
  enable?: boolean; // Optional property with a default value
}

export function CurrentStats({
  systemIsOn,
  onSystemPress,
  updateACCurrent,
  updateDCCurrent,
  enable = false,
  acValue,
  dcValue,
}: CurrentStatsProps) {
  const [acOnOff, setAcOnOff] = useState(false);
  const [dcOnOff, setDcOnOff] = useState(false);

  // Function to handle the System button press
  const handleSystemPress = () => {
    // If the System is currently ON, turn it OFF and turn off AC and DC
    if (!!systemIsOn) {
      onSystemPress(false);
    } else {
      // If the System is currently OFF, turn it ON
      onSystemPress(true); // Pass the current system state to the parent component
    }
  };

  // Function to handle the AC button press
  const handleACPress = () => {
    if (!!systemIsOn) {
      setAcOnOff(!acOnOff);
      updateACCurrent(acValue);
    }
  };

  // Function to handle the DC button press
  const handleDCPress = () => {
    // Only allow turning on DC if the System is ON
    setDcOnOff(!dcOnOff);
    updateDCCurrent(dcValue);
  };

  return (
    <View className="flex flex-row rounded-3xl justify-center items-center mb-5 mx-5 bg-banner p-2">
      <View>
        <BounceButton
          className={`bg-${
            systemIsOn ? 'banner' : 'background'
          } flex justify-center mx-5 items-center w-14 h-14 rounded-full`}
          icon={true}
          iconProps={{
            name: 'power-outline',
            size: 30,
            color: systemIsOn ? '#FFF' : '#A2B9DF',
          }}
          disabled={enable}
          onPress={handleSystemPress}></BounceButton>
      </View>
      <View>
        <BounceButton
          onPress={handleACPress}
          text="AC"
          variable={acValue}
          className={`${
            acOnOff ? 'bg-banner' : 'bg-background'
          } flex justify-center mx-5 items-center w-14 h-14 rounded-full`}
          disabled={!systemIsOn}
        />
      </View>
      <View>
        <BounceButton
          text="DC"
          variable={dcValue}
          onPress={handleDCPress}
          className={`${
            dcOnOff ? 'bg-banner' : 'bg-background'
          } flex justify-center mx-5 items-center w-14 h-14 rounded-full`}
          disabled={!systemIsOn}
        />
      </View>
    </View>
  );
}
