import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder,Animated,TouchableOpacity } from 'react-native';
import { getDatabase, ref, onValue, set, off } from 'firebase/database';
import app from '../firebaseConfig';
import { Ionicons } from "@expo/vector-icons"; // Import icons
// for x-axis
const Slider = ({ min, max, value, onValueChange, disabled  }) => {
  // const sliderWidth = 250;
  // const knobRadius = 15;
  // const [position, setPosition] = useState(((value - min) / (max - min)) * sliderWidth);
   const valueRef = useRef(value);

  // useEffect(() => {
  //   valueRef.current = value;
  // }, [value]);

  const sliderWidth = 250;
  const knobRadius = 15;
  const [position, setPosition] = useState(((value - min) / (max - min)) * sliderWidth);

  useEffect(() => {
    // Update the slider's position whenever the value changes
    const newPosition = ((value - min) / (max - min)) * sliderWidth;
    setPosition(newPosition);
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    const db = getDatabase(app);
    const xAxisRef = ref(db, 'main/86gQQY9K1Xc3CqQaQ6MUO9nu5472/rom1/scollers/X-axis');

    const unsubscribe = onValue(xAxisRef, (snapshot) => {
      const newValue = snapshot.val();
      if (newValue !== valueRef.current) {
        const newPosition = ((newValue - min) / (max - min)) * sliderWidth;
        setPosition(newPosition);
        onValueChange(newValue);
      }
    });

    return () => unsubscribe();
  }, [max, onValueChange]);

  const updateFirebase = (newValue) => {
    const db = getDatabase(app);
    const xAxisRef = ref(db, 'main/86gQQY9K1Xc3CqQaQ6MUO9nu5472/rom1/scollers/X-axis');
    set(xAxisRef, newValue);
  };

  const updatePosition = (dx) => {
    let newPosition = Math.max(0, Math.min(sliderWidth, dx));
    setPosition(newPosition);
    const newValue = Math.round(min + (newPosition / sliderWidth) * (max - min));
    onValueChange(newValue);
    updateFirebase(newValue);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled, // Disable user interaction if disabled
    onMoveShouldSetPanResponder: () => !disabled,
    onPanResponderMove: (_, gesture) => {
      if (!disabled) {
        updatePosition(gesture.moveX - 50);
      }
    },
  });

  return (
    <View style={styles.sliderContainer}>
      {/* Apply the disabled styles conditionally */}
      <View style={[styles.track, disabled && styles.disabledTrack]} />
      <View
        style={[
          styles.knob,
          { left: position },
          disabled && styles.disabledKnob,
        ]}
        {...(disabled ? {} : panResponder.panHandlers)} // Disable interactions if disabled
      />
    </View>
  );
};
// for y-axis
const Slider2 = ({ min, max, value, onValueChange }) => {
  const sliderWidth = 250;
  const knobRadius = 15;
  const [position, setPosition] = useState(((value - min) / (max - min)) * sliderWidth);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    const db = getDatabase(app);
    const yAxisRef = ref(db, 'main/86gQQY9K1Xc3CqQaQ6MUO9nu5472/rom1/scollers/Y-axis');

    const unsubscribe = onValue(yAxisRef, (snapshot) => {
      const newValue = snapshot.val();
      if (newValue !== valueRef.current) {
        const newPosition = ((newValue - min) / (max - min)) * sliderWidth;
        setPosition(newPosition);
        onValueChange(newValue);
      }
    });

    return () => unsubscribe();
  }, [max, onValueChange]);

  const updateFirebase = (newValue) => {
    const db = getDatabase(app);
    const yAxisRef = ref(db, 'main/86gQQY9K1Xc3CqQaQ6MUO9nu5472/rom1/scollers/Y-axis');
    set(yAxisRef, newValue);
  };

  const updatePosition = (dx) => {
    let newPosition = Math.max(0, Math.min(sliderWidth, dx));
    setPosition(newPosition);
    const newValue = Math.round(min + (newPosition / sliderWidth) * (max - min));
    onValueChange(newValue);
    updateFirebase(newValue);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      updatePosition(gesture.moveX - 50);
    },
  });

  return (
    <View style={styles.sliderContainer}>
      <View style={styles.track} />
      <View
        style={[styles.knob, { left: position }]}
        {...panResponder.panHandlers}
      />
    </View>
  );
};




const App = () => {
  const [xDegree, setXDegree] = useState(0);
  const [yDegree, setYDegree] = useState(0);

  const [IsEnableAuto, setIsEnabledAuto] = useState(false);
  const animatedValue = new Animated.Value(IsEnableAuto ? 1 : 0);
// switch
  const toggleSwitch = () => {
      // Toggle the switch state
    const newState = !IsEnableAuto;
    setIsEnabledAuto(newState);

      // Update Firebase database
    const db = getDatabase(app);
    const autoRef = ref(db, 'main/86gQQY9K1Xc3CqQaQ6MUO9nu5472/rom1/buttons/automatic');
    set(autoRef, newState);


    //setIsEnabledAuto(!IsEnableAuto);
    Animated.timing(animatedValue, {
      toValue: IsEnableAuto ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 23], // Adjusted for smooth movement
  });



  useEffect(() => {
    const db = getDatabase(app);
    const xAxisRef = ref(db, 'main/86gQQY9K1Xc3CqQaQ6MUO9nu5472/rom1/scollers/X-axis');

    const unsubscribe = onValue(xAxisRef, (snapshot) => {
      const initialValue = snapshot.val();
      if (initialValue != null) {
        setXDegree(initialValue);
      }
    });

    return () => off(xAxisRef);
  }, []);


  useEffect(() => {
    const db = getDatabase(app);
    const yAxisRef = ref(db, 'main/86gQQY9K1Xc3CqQaQ6MUO9nu5472/rom1/scollers/Y-axis');

    const unsubscribe = onValue(yAxisRef, (snapshot) => {
      const initialValue = snapshot.val();
      if (initialValue != null) {
        setYDegree(initialValue);
      }
    });

    return () => off(yAxisRef);
  }, []);

  return (
    <View style={styles.container}>
          <View style={styles.wetheCtn}>
              <View></View>
          </View>
          <View style={styles.ControlPanelCtn}>
            <View style={styles.sliderCtn}>
              {/* slider X */}
                <View style={styles.sliderChild}>
                    <View style={styles.sliderContextCtn}>
                        <Text style={styles.header}> X-Axis: </Text>
                        <Text style={styles.temperature}>{xDegree}°</Text>
                    </View>
                    <Slider min={0} max={180} value={xDegree} onValueChange={setXDegree} disabled={IsEnableAuto} />
                </View>





            

                {/* slider Y */}
                <View style={styles.sliderChild}>     
                    <View style={styles.sliderContextCtn}>
                      <Text style={styles.header}> Y-Axis: </Text>
                      <Text style={styles.temperature}>{yDegree}°</Text>
                    </View>
                    <Slider2 min={0} max={180} value={yDegree} onValueChange={setYDegree} />
                </View>
            </View>

          {/* button */}
            <View style={styles.buttonCtn}>
            <View style={styles.switchCtn}>
              <Text style={styles.SwitchName}>Auto</Text>
                <TouchableOpacity onPress={toggleSwitch} style={styles.switchContainer}>
                    <Animated.View
                      style={[
                        styles.switchBackground,
                        { backgroundColor: IsEnableAuto ? "#A041FF" : "#808080" }, // Active & Inactive colors
                      ]}
                    >
                      <Animated.View
                        style={[
                          styles.toggleCircle,
                          { transform: [{ translateX }] },
                        ]}
                      >
                        <Ionicons
                          name={IsEnableAuto ? "checkmark" : "close"}
                          size={16}
                          color="white"
                        />
                      </Animated.View>
                    </Animated.View>
                </TouchableOpacity>
            </View>
    

            </View>
          </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 17,
    //marginBottom: 20,
    fontWeight: 'bold',
    paddingRight:10
  },
  sliderContainer: {
    width: 270,
    height: 40,
    justifyContent: 'center',
  },
  track: {
    width: 250,
    height: 6,
    backgroundColor: '#ddd',
    borderRadius: 3,
    alignSelf: 'center',
  },
  knob: {
    width: 16,
    height: 26,
    borderRadius: 5,
    backgroundColor: '#ff4081',
    position: 'absolute',
    top: 7,
  },
  sliderContextCtn:{
    flexDirection:"row",
    alignItems:'center',
    backgroundColor:'white',
    width:"100%",
    paddingLeft:20,
  },
  temperature: {
    fontSize: 25,

    fontWeight: 'bold',
  },
  wetheCtn:{
    flex:2,
    backgroundColor:'red',
    padding: 10,
    width:"100%"

  },
  ControlPanelCtn:{
    flex:1.9,
    backgroundColor:'blue',
    padding:10,
    width:"100%",


  },
  sliderCtn:{
    flex:4,
    height:"100%",
    backgroundColor:'green',
    justifyContent:'center',
    alignItems:'center'
    
  },

  disabledTrack: {
    backgroundColor: "#ccc", // Grey track when disabled
  },
  disabledKnob: {
    backgroundColor: "#888", // Grey knob when disabled
  },
  buttonCtn:{
    flex:3,
    height:"100%",
    backgroundColor:'pink',
    padding:10,

  },
  sliderChild:{
    
  },
  switchCtn:{

  },
  switchContainer: {
    //alignItems: "center",
   // justifyContent: "center",
  },
  SwitchName:{
    fontSize:20,
    fontWeight:'bold',
    paddingVertical:10
  },
  switchBackground: {
    width: 50,
    height: 28,
    borderRadius: 20,
    padding: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  toggleCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "green",
    justifyContent: "center",
    alignItems: "center",
    borderWidth:1,
    borderColor:'white'
  },
});


export default App;
