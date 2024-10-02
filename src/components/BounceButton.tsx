import React, {useRef} from 'react';
import {
  Animated,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type BounceButtonProps = TouchableOpacityProps & {
  text?: string;
  icon?: boolean;
  iconProps?: any;
  style?: any;
  variable?: number;
};

const BounceButton = ({
  text,
  icon,
  iconProps,
  style,
  variable,
  ...props
}: BounceButtonProps) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  let isPressed = false;

  const onPressIn = () => {
    if (!isPressed) {
      isPressed = true;
      Animated.timing(scaleValue, {
        toValue: 1.4, // Aumenta para 120%
        duration: 100, // Duração rápida para o aumento
        useNativeDriver: true,
      }).start();
    }
  };

  const onPressOut = () => {
    if (isPressed) {
      isPressed = false;
      Animated.timing(scaleValue, {
        toValue: 1, // Volta ao tamanho original
        duration: 100, // Duração rápida para a diminuição
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <TouchableOpacity
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[style, {transform: [{scale: scaleValue}]}]}
      {...props}>
      {icon && iconProps && <Ionicons {...iconProps} />}
      {text && (
        <Text
          className="text-xl text-text"
          style={{
            fontFamily: 'Poppins-SemiBold',
            color: variable ? '#FFFF' : '#A2B9DF',
          }}>
          {text}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default BounceButton;
