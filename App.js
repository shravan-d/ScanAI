import React, { useEffect, useRef, useState } from 'react';
import {StyleSheet, Dimensions, View, Text, Animated, Image} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import LandingScreen from './components/screens/LandingScreen';
import CameraScreen from './components/screens/CameraScreen';
import RatingScreen from './components/screens/RatingScreen';

const Stack = createNativeStackNavigator();  
var screenWidth = Dimensions.get('screen').width;

const App = () => {
  const [loading, setLoading] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  var bg = require ('./assets/cube-icon2.jpg');
  var ballAnimatedValue = useRef(new Animated.Value(0)).current;

  const moveBall = () => {
    Animated.timing(ballAnimatedValue, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: true,
    }).start();
  };
  const xVal = ballAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-0.3*screenWidth, 0.3*screenWidth],
  });
  const yVal = ballAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, -120],
  });
  const xVal2 = ballAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3*screenWidth],
  });

  const animStyle = {
    transform: [{ translateY: yVal }, { translateX: xVal } ]
  };
  const animTextStyle = {
    transform: [{ translateX: xVal2 } ]
  };

  useEffect(()=>{
    moveBall();
    setTimeout(() => {setAnimationComplete(true)}, 2500)
  }, [])

  if(loading || !animationComplete){
    return (
      <View style={{width: "100%", height: '100%', backgroundColor: '#2b2d42', justifyContent: 'center', alignItems: 'center'}}>
        <View style={{width: '50%', height: '50%', alignSelf: 'center'}}>
            <Image source={bg} style={{width: '100%', aspectRatio: 1, height: undefined}} />
        </View>
        <Animated.View style={[{width: 6, height: 250, borderRadius: 2, backgroundColor: '#c7f9cc', position: 'absolute'}, animStyle]}>
        </Animated.View>
        <View style={[{position: 'absolute', bottom: '30%',}]}>
            <Text style={{color: '#c7f9cc', fontFamily: 'Montserrat-Bold', fontSize: 30}}>ScanAI</Text>
            <Animated.View style={[{backgroundColor: '#2b2d42', position: 'absolute', width: 150, height: 50}, animTextStyle]}></Animated.View>
        </View>
      </View>
    )
  } 
  else if(!loading && animationComplete){
    return (
        <NavigationContainer>
            <Stack.Navigator>
            <Stack.Screen
                name="Home"
                component={LandingScreen}
                options={{headerShown: false}}
            />
            <Stack.Screen
                name="CameraScreen"
                component={CameraScreen}
                options={{headerShown: false}}
            />
            <Stack.Screen
                name="RatingScreen"
                component={RatingScreen}
                options={{headerShown: false}}
            />
            </Stack.Navigator>       
        </NavigationContainer>
    );
  }
};

const styles = StyleSheet.create({});

export default App;
