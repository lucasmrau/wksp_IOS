import {Text, View} from 'react-native';
import React from 'react';
import {Button as ButtonNativeBase, IButtonProps} from 'native-base';
import {Loading} from './Loading';

type Props = IButtonProps & {
  text: string;
  color: string;
  textColor: string;
};

export function Button({text, textColor, color, ...rest}: Props) {
  return (
    <ButtonNativeBase
      className={`w-full h-14 rounded-xl`}
      _pressed={{
        opacity: 0.8,
      }}
      bgColor={color}
      {...rest}>
      <Text
        style={{color: textColor, fontFamily: 'Poppins-SemiBold'}}
        className={`uppercase`}>
        {text}
      </Text>
    </ButtonNativeBase>
  );
}
