import React, {useEffect, useState} from 'react';
import {View, Text, Dimensions} from 'react-native';
import COR from '../assets/COR.svg';
import {horizontalScale, verticalScale} from '../utils/Metric';
import WireVectorPower from '../assets/WireVectorPower.svg';
import BatteryVector from '../assets/BatteryVector.svg';
import {Skeleton} from 'native-base';
import Animated, {
  useSharedValue,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface BatteryStatsProps {
  powerValu: number;
  soc: number;
  isConnected: boolean;
}

export function BatteryStats({powerValu, soc, isConnected}: BatteryStatsProps) {
  // battery time remaining in hours
  const [chargeMode, setChargeMode] = useState(false);
  const batteryCapacity = 1500; // battery capacity in Wh
  const power = powerValu; // power

  const timeRemainingInHours = (batteryCapacity * (soc / 100)) / power;
  const isNegative = timeRemainingInHours < 0;
  const isPositive = timeRemainingInHours > 0;
  const absoluteTimeRemainingInHours = Math.abs(timeRemainingInHours);

  const hours = isNaN(Math.floor(absoluteTimeRemainingInHours))
    ? 0
    : Math.floor(absoluteTimeRemainingInHours);
  const minutes = isNaN(Math.floor((absoluteTimeRemainingInHours - hours) * 60))
    ? 0
    : Math.floor((absoluteTimeRemainingInHours - hours) * 60);

  const textColor = isNegative ? '#B0001E' : isPositive ? '#03DABB' : '#a2b9df';

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{scale: scale.value}],
    };
  });

  useEffect(() => {
    opacity.value = withSpring(1);
    scale.value = withSpring(1);
  }, []);

  const screenWidth = Dimensions.get('window').width;
  const elementWidth = horizontalScale(50);
  const translateX = -(elementWidth / 1);

  return (
    <View
      className="flex flex-row "
      style={{height: verticalScale(200), marginBottom: verticalScale(20)}}>
      {/* View para centralizar o texto "100" */}
      <Animated.View
        entering={FadeInUp.duration(500)}
        style={{
          position: 'absolute',
          top: '65%',
        }}>
        {isConnected ? (
          <Skeleton.Text
            lines={1}
            startColor={'#a2b9df'}
            endColor={'#76869e'}
            width={horizontalScale(90)}
            style={{
              position: 'absolute',
              left: screenWidth / 2,
              transform: [{translateX}],
            }}
          />
        ) : (
          <Text
            className="text-text text-4xl flex text-center w-screen"
            style={{fontFamily: 'Poppins-SemiBold'}}>
            {soc}%
          </Text>
        )}
      </Animated.View>

      <Animated.View
        entering={FadeInUp.duration(500)}
        className="flex flex-row pl-2 items-center justify-center absolute"
        style={{top: verticalScale(20)}}>
        <WireVectorPower />
        {isConnected ? (
          <Skeleton.Text
            lines={1}
            width={horizontalScale(50)}
            startColor={'#a2b9df'}
            endColor={'#76869e'}
          />
        ) : (
          <Text
            className="text-text text-lg"
            style={{fontFamily: 'Poppins-SemiBold'}}>
            {powerValu}W
          </Text>
        )}
      </Animated.View>

      {/* Corrigido: Animated.View em vez de View */}
      <Animated.View
        className="flex w-full justify-center items-center absolute"
        style={[animatedStyles, {marginLeft: 'auto', marginRight: 'auto'}]}>
        <COR width={horizontalScale(400)} height={verticalScale(200)} />
      </Animated.View>

      <Animated.View
        entering={FadeInUp.duration(500)}
        className="flex flex-row items-center pr-2 right-0 absolute"
        style={{top: verticalScale(20)}}>
        {isConnected ? (
          <Skeleton.Text
            lines={1}
            width={horizontalScale(50)}
            startColor={'#a2b9df'}
            endColor={'#76869e'}
          />
        ) : (
          <Text
            className="text-lg"
            style={{
              fontFamily: 'Poppins-SemiBold',
              color: textColor,
            }}>
            {hours}h{minutes}
          </Text>
        )}
        <BatteryVector />
      </Animated.View>
    </View>
  );
}
