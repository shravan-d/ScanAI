import 'react-native-reanimated'
import { React, useRef, useState, useEffect} from 'react';
import { detectObjects } from 'vision-camera-realtime-object-detection';
import {StyleSheet, View, Dimensions, Text, TouchableOpacity} from 'react-native';
import { useCameraDevices, Camera, useFrameProcessor } from 'react-native-vision-camera';
import Reanimated, { runOnJS, interpolate, Extrapolate, useSharedValue, useAnimatedProps, useAnimatedStyle, useAnimatedGestureHandler } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import {GestureHandlerRootView} from 'react-native-gesture-handler'
import { PanGestureHandler } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera)
Reanimated.addWhitelistedNativeProps({
  zoom: true,
})

const MAX_ZOOM = 3;
const zoomBarHeight = 120;
var screenHeight = Dimensions.get('window').height;
var screenWidth = Dimensions.get('window').width;

const CameraScreen = ( ) => {
  const [camPerm, setCamPerm] = useState('not-determined');
  const [focusPos, setFocusPos] = useState({x: -1, y: -1, show: false});
  const [object, setObject] = useState(null);
  const [newObject, setNewObject] = useState(null);

  const frameProcessorConfig = {
    modelFile: 'lite-model_efficientdet_lite4_detection_metadata_2.tflite',
    scoreThreshold: 0.4,
    maxResults: 1,
    numThreads: 4,
  };

  const updateObjects = (object, detectedObjects) => {
    if (detectedObjects.length == 0){
      setNewObject(null);
      return;
    }
    setNewObject({ 
      top: detectedObjects[0].top * screenHeight - 40, 
      left: detectedObjects[0].left * screenWidth - 40, 
      width: detectedObjects[0].width * screenWidth + 80, 
      height: detectedObjects[0].height * screenHeight + 80, 
      labels: detectedObjects[0].labels 
    })
  }

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const detectedObjects = detectObjects(frame, frameProcessorConfig);
    runOnJS(updateObjects)(object, detectedObjects);
  }, []);


  useEffect(() => {
    if (object === null)
      setObject(newObject)
    else {
      if (newObject === null)
        setObject(null)
      else if (Math.abs(object.top - newObject.top) > 0.1*screenHeight || 
        Math.abs(object.left - newObject.left) > 0.05*screenWidth || 
        Math.abs(object.width - newObject.width) > 0.05*screenWidth || 
        Math.abs(object.height - newObject.height) > 0.1*screenHeight )
        setObject(newObject)
    }
  }, [newObject])

  const getCamPermission = async () => {
    let status = await Camera.getCameraPermissionStatus();
    if (status !== 'authorized') {
        await Camera.requestCameraPermission();
    }
    setCamPerm(status);
  }   

  const devices = useCameraDevices()
  const device = devices.back
  const camera = useRef()

  useEffect(() => { 
    getCamPermission();
  }, []);

  let lastPress = 0;
  const onDoublePress = () => {
    const time = new Date().getTime();
    const delta = time - lastPress;
    const DOUBLE_PRESS_DELAY = 400;
    if (delta < DOUBLE_PRESS_DELAY) {
        setCameraPos(!cameraPos);
    }
    lastPress = time;
  };

  const y = useSharedValue(zoomBarHeight-15);
  const zoom = useSharedValue(0)
  const height = useSharedValue(1);
  
  const gestureHandler = useAnimatedGestureHandler({
      onStart: (_, ctx) => {
          ctx.startY = y.value;
      },
      onActive: (event, ctx) => {
          y.value = Math.min(zoomBarHeight-15, Math.max(0, ctx.startY + event.translationY));
          height.value = interpolate(y.value, [0, zoomBarHeight-15], [0, 1], Extrapolate.CLAMP);
          zoom.value = interpolate(1 - height.value, [0, 1], [1, MAX_ZOOM], Extrapolate.CLAMP);
      },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return { transform: [{ translateY: y.value }] };
  });

  const animatedHeightStyle = useAnimatedStyle(() => {
    return { transform: [{ scaleY: height.value }, {translateY: zoomBarHeight / 2}] };
  });

  const animatedHeightStyle2 = useAnimatedStyle(() => {
    return { transform: [{ scaleY: 1 - height.value }, {translateY: -zoomBarHeight / 2}] };
  });

  const animatedProps = useAnimatedProps(
    () => ({ zoom: zoom.value }),
    [zoom]
  )

  const focusCamera = async (event) => {
    if(focusPos.show) return;
    if(100 * event.pageX / screenWidth > 80 && 100 * event.pageY / screenHeight > 55) return;
    if(100 * event.pageY / screenHeight > 85) return;
    setFocusPos({show:true, x: event.pageX, y: event.pageY})
    var timeout, response;
    const timeoutPromise = new Promise((resolve, reject) => {
      timeout = setTimeout(() => {
        resolve(false);
      }, 1000);
    });
    try{
      response = await Promise.race([camera.current.focus({ x: event.pageX, y: event.pageY }), timeoutPromise]);
    } catch (e) {
      
    } finally {
      if(timeout){ 
        clearTimeout(timeout);
      }
      setFocusPos({show: false})
    }
  }

  return (
    <GestureHandlerRootView style={styles.container} onStartShouldSetResponder={() => onDoublePress()} 
      onTouchStart={(event)=>{focusCamera(event.nativeEvent)}}>
        {camPerm ==='authorized' && device != null &&
        <>
        <ReanimatedCamera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={true}
          video={false}
          audio={false}
          animatedProps={animatedProps}
          frameProcessorFps={2}
          frameProcessor={frameProcessor} 
        />
        <View style={styles.zoomContainer}>
          <Animated.View style={[animatedHeightStyle, {width: 2, height: zoomBarHeight-15, backgroundColor: 'white', borderRadius: 5, position: 'absolute', top: -zoomBarHeight/2}]}></Animated.View>
          <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[animatedStyle, styles.zoomLever]}>
          </Animated.View>
          </PanGestureHandler>
          <Animated.View style={[animatedHeightStyle2, {marginTop: 15, width: 2, height: zoomBarHeight-15, backgroundColor: 'white', borderRadius: 5, position: 'absolute', top: zoomBarHeight/2}]}></Animated.View>
        </View>
        {focusPos.show && <View style={[styles.focusBox, {top:focusPos.y, left: focusPos.x}]}></View>}
        {object && 
        <>
          <View style={[styles.detectionFrame, { top: object.top, left: object.left, width: object.width, height: object.height }]}></View>
          <View style={styles.detectionFrameLabel}>
            <Text style={{textTransform: 'capitalize', fontSize: 18}}>{object.labels[0].label}</Text>
            <Text style={{fontSize: 18}}>{object.labels[0].confidence.toFixed(2)}</Text>
          </View>
          <TouchableOpacity onPress={() => {console.log('Submit')}} style={styles.captureButton}>
            <Icon name="checkmark" size={35} color="white" />
          </TouchableOpacity>
        </>
        }
        </>
        }
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  captureButton: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(199, 249, 204, 0.7)",
    borderColor: "rgba(141, 153, 174, 1)",
    borderWidth: 4,
    borderRadius: 60,
    // alignSelf: 'center',
    right: 0.2*screenWidth,
    position: 'absolute',
    bottom: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  detectionFrameLabel: {
    backgroundColor: "rgba(141, 153, 174, 0.8)",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 50,
    left: 0.2*screenWidth,
    width: 180,
    height: 60,
    borderRadius: 5,
    padding: 10,
  },
  zoomContainer: {
    height: zoomBarHeight,
    width: 30,
    position: 'absolute',
    bottom: 250,
    right: 30,
    alignItems: 'center',
  },
  zoomLever: {
    width: 20,
    height: 15, 
    borderRadius: 5,
    borderColor: 'rgba(220, 220, 220, 1)',
    borderWidth: 2, 
    backgroundColor: 'rgba(0,0,0,0)',
    position: 'absolute'
  },
  focusBox: {
    position: 'absolute', 
    width: 30, 
    height: 30, 
    borderRadius: 50,
    borderColor: 'rgba(220, 220, 220, 1)', 
    borderWidth: 2, 
    backgroundColor:'rgba(0,0,0,0)'
  },
  detectionFrame: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 9
  },
});

export default CameraScreen;