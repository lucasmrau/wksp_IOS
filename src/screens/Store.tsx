import React, {useState} from 'react';
import {
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {DetailScreen} from '../components/productModal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import data from '../components/data';

export function Store() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortOrderPrice, setSortOrderPrice] = useState('asc');

  const filteredData = data.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sortedAlphabetically = filteredData.slice().sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.title.localeCompare(b.title);
    } else {
      return b.title.localeCompare(a.title);
    }
  });

  const sortedByPrice = filteredData.slice().sort((a, b) => {
    if (sortOrderPrice === 'asc') {
      return a.price - b.price;
    } else {
      return b.price - a.price;
    }
  });

  const sortedData =
    sortOrderPrice === 'asc' ? sortedAlphabetically : sortedByPrice;

  const renderItem = ({item} : any) => (
    <TouchableOpacity onPress={() => setSelectedItem(item)}>
      <View className="bg-modal m-2 p-3 rounded-md w-80">
        <View className="flex rounded-md flex-row items-center bg-modal">
          <Image source={item.imageSource} className="w-36 h-28 bg-white" />
          <Text className="text-white p-3 flex-auto">{item.title}</Text>
        </View>
        <Text className="text-white p-2">USD {item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  const onCloseDetailScreen = () => {
    setSelectedItem(null);
  };

  return (
    <View className="flex flex-1 pt-5 bg-background items-center">
      <View>
        <View className="flex flex-row mt-5 mx-5">
          <TextInput
            placeholder="Search..."
            placeholderTextColor="white"
            value={searchQuery}
            onChangeText={text => setSearchQuery(text)}
            className="border-1 border text-white border-gray-500 rounded-md p-2 w-52 text-lg"
          />
          <TouchableOpacity
            onPress={() =>
              setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
            }>
            <MaterialCommunityIcons
              name={
                sortOrder === 'asc'
                  ? 'order-alphabetical-ascending'
                  : 'order-alphabetical-descending'
              }
              size={36}
              color="white"
              style={{
                paddingLeft: 10,
                justifyContent: 'center',
                paddingTop: 10,
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              setSortOrderPrice(prev => (prev === 'asc' ? 'desc' : 'asc'))
            }>
            <MaterialCommunityIcons
              name={
                sortOrderPrice === 'asc'
                  ? 'order-numeric-ascending'
                  : 'order-numeric-descending'
              }
              size={36}
              color="white"
              style={{
                paddingLeft: 10,
                justifyContent: 'center',
                paddingTop: 10,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={sortedData}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />
      <DetailScreen item={selectedItem} onClose={onCloseDetailScreen} />
    </View>
  );
}
