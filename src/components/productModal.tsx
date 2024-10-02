import React, {useEffect, useState} from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  Linking,
  BackHandler
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Carousel from 'react-native-reanimated-carousel';

// const imagesProducts = [
//   // FORD RANGER
//   'https://worksport.com/cdn/shop/files/SC4ProFordRangerClosed_5f3c0894-ff0e-4223-9835-4f1ae749947f.png?v=1685574372&width=1946',
//   'https://worksport.com/cdn/shop/files/SC4ProFordRangerOpen_25c294c8-73f0-4698-bba9-3c11c85bab85.png?v=1685574373&width=1445',
//   'https://worksport.com/cdn/shop/files/SC4-Pro---Corner_1a699d50-94fe-4d90-ab35-a03456ece24d.jpg?v=1688591211&width=1445',
//   'https://worksport.com/cdn/shop/files/SC4-Pro---Prop-Rod-01_57868a0e-9f08-4085-aa9b-48d890d62619.jpg?v=1688591211&width=1445',
//   'https://worksport.com/cdn/shop/files/SC4-Pro---Seal_96ff080f-75de-44f4-99c8-d48d6b178f52.jpg?v=1688591212&width=1445',
//   'https://worksport.com/cdn/shop/files/SC4-Pro---Rear-Latch---Open_ff3c3ccc-de4c-49a0-bb33-4c7e9d3c8d75.jpg?v=1688591210&width=1445',
// ];

const openWebPage = () => {
  const url = 'https://worksport.com/products/sc4-pro-19-ford-ranger-6-vinyl-quad-fold-w-quick-latch?variant=40631724736572'; // Replace with the URL you want to open

  Linking.openURL(url)
    .then((result) => {
      console.log('Opened: '+ result);
    })
    .catch((error) => {
      console.error('Error opening URL: ' + error);
    });
};

export function DetailScreen({item, onClose} : any) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleBackButton = () => {
      // Handle the back button press here
      onClose(); // Close the modal when the back button is pressed
      return true; // Prevent default behavior (exiting the app)
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButton
    );

    return () => {
      backHandler.remove();
    };
  }, [onClose]);

  const handleSlideChange = ({index}) => {
    setActiveIndex(index);
  };

  const width = Dimensions.get('window').width;

  return (
    <Modal transparent={true} animationType="fade" visible={item !== null}  onRequestClose={onClose}>
      <View className="flex flex-1 p-2 bg-white items-center">
        {item && (
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-2 right-1 p-2 z-50">
            <Ionicons name="close-circle" size={35} color="black" />
          </TouchableOpacity>
        )}
        {item && (
          <View className="bg-white rounded-md relative z-0 items-center">
            {/* <Carousel
              width={width}
              height={300}
              pagingEnabled={true}
              data={firstImages}
              onSnapToItem={handleSlideChange}
              renderItem={({item: image}) => (
                <Image
                  style={{width: '100%', height: 300}}
                  source={{uri: image}} // Set the image source using the URI from your array
                />
              )}
            /> */}
            <Image source={item.imageSource} className="w-screen h-80" />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: 10,
              }}>
              {/* {firstImages.map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: index === activeIndex ? '#2b7bbb' : 'gray',
                    marginHorizontal: 4,
                  }}
                />
              ))} */}
            </View>
            <Text className="text-lg text-center text-black mb-2 mt-2 font-bold">
              {item.title}
            </Text>
            <Text className="text-lg text-gray-600 text-center">{item.description}</Text>
            <Text className="text-black text-center font-bold text-xl pt-5">
              ${item.price}USD
            </Text>
            <TouchableOpacity onPress={openWebPage}>
              <View className="bg-button py-4 px-32 mx-10 my-2 rounded-md">
                <Text className="text-white text-center font-bold uppercase">
                  Buy
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}
