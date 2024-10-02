import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {useBle} from '../components/useBLE';

interface PowerMainProps {
  pValue: number;
}

export function PowerMain({pValue}: PowerMainProps) {
  const {powerValue} = useBle();

  const [powerValueScreen, setPowerValueScreen] = useState(0);

  useEffect(() => {
    setPowerValueScreen(powerValue);
  }, [powerValue]);

  return powerValueScreen;
}
