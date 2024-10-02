import {Dimensions, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {LineChart} from 'react-native-chart-kit';

interface GraphStatsProps {
  power: number[];
}

export function GraphStats({power}: GraphStatsProps) {
  const [data, setData] = useState<number[]>([]);
  const [labelCount, setLabelCount] = useState(0);

  useEffect(() => {
    if (power.length > 0) {
      setData(prevData => {
        const newData = [...prevData, ...power];
        // Limit to the latest 5 values
        const slicedData = newData.slice(-5);
        return slicedData;
      });

      // Update the label count based on the length of the power array
      setLabelCount(prevCount => prevCount + power.length);
    }
  }, [power]);

  // Generate labels based on the total number of labels generated so far
  const generateLabels = (data: any[]) => {
    const startIndex = labelCount - data.length;
    return data.map((_, index) => `${(startIndex + index) * 30}s`);
  };

  if (data.length === 0) {
    return <Text>No data available</Text>;
  }

  return (
    <View>
      <LineChart
        data={{
          labels: generateLabels(data),
          datasets: [
            {
              data: data,
            },
          ],
        }}
        width={Dimensions.get('window').width} // from react-native
        height={220}
        yAxisLabel=""
        yAxisSuffix="W"
        yAxisInterval={1} // optional, defaults to 1
        chartConfig={{
          backgroundColor: '#1E172C',
          backgroundGradientFrom: '#1E172C',
          backgroundGradientTo: '#1E172C',
          decimalPlaces: 2, // optional, defaults to 2dp
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            // stroke: '#343434',
          },
        }}
        bezier
        style={{
          marginVertical: 4,
          borderRadius: 16,
          margin: 20,
        }}
      />
    </View>
  );
}
