import 'react-native-reanimated'
import { React, useRef, useState, useEffect} from 'react';
import { detectObjects } from 'vision-camera-realtime-object-detection';
import {StyleSheet, View, Dimensions, Text} from 'react-native';
import { useCameraDevices, Camera, useFrameProcessor } from 'react-native-vision-camera';
import Reanimated, { runOnJS, interpolate, Extrapolate, useSharedValue, useAnimatedProps, useAnimatedStyle, useAnimatedGestureHandler } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import {GestureHandlerRootView} from 'react-native-gesture-handler'
import { PanGestureHandler } from 'react-native-gesture-handler';

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
  const [objects, setObjects] = useState([]);

  const frameProcessorConfig = {
    modelFile: 'lite-model_efficientdet_lite4_detection_metadata_2.tflite',
    scoreThreshold: 0.4,
    maxResults: 1,
    numThreads: 4,
  };

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const detectedObjects = detectObjects(frame, frameProcessorConfig);
    runOnJS(setObjects)(
      detectedObjects.map((obj) => ({
        ...obj,
        top: obj.top * screenHeight - 50,
        left: obj.left * screenWidth - 50,
        width: obj.width * screenWidth + 100,
        height: obj.height * screenHeight + 100,
      }))
    );
  }, []);

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
          frameProcessorFps={1}
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

        {objects?.map(
        ( { top, left, width, height, labels }, index ) => (
          <View key={`${index}`} style={[styles.detectionFrame, { top, left, width, height }]} >
            <Text style={styles.detectionFrameLabel}>
              {labels.map((label) => `${label.label} (${label.confidence.toFixed(2)})`).join(',')}
            </Text>
          </View>
        )
      )}

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
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: "rgba(255,255,255,0.5)",
    borderWidth: 4,
    borderRadius: 60,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 50
  },
  flashButton: {
    position: 'absolute',
    bottom: 50,
    right: 30
  },
  revButton: {
    position: 'absolute',
    bottom: 50,
    left: 30
  },
  volumeButton: {
    position: 'absolute',
    bottom: 150,
    right: 30
  },
  timeContainer: {
    position: 'absolute',
    top: 50,
    right: 30,
    width: 30,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.5)",
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3
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
    boxShadow: 'red',
    elevation: 5,
    zIndex: 9,
  },
  detectionFrameLabel: {
    backgroundColor: 'rgba(220, 220, 220, 0.7)',
    textTransform: 'capitalize'
  },
});

export default CameraScreen;