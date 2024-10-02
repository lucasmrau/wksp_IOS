import { View, Image } from "react-native";
import Logo from '../assets/logo.png'
import React from "react";



export function Header() {
  return (
    <View className="w-full px-5 pt-5 items-start">
       <Image
        source={Logo} 
        className="w-11 h-11"  
      />

    </View>
  )
}
