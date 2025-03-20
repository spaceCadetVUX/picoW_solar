import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder,Animated,TouchableOpacity } from 'react-native';
import { getDatabase, ref, onValue, set, off } from 'firebase/database';
import app from '../firebaseConfig';
import { Ionicons } from "@expo/vector-icons"; // Import icons
import { StatusBar } from 'react-native';
// for x-axis
const Slider = ({ min, max, value, onValueChange, disabled  }) => {
  const valueRef = useRef(value);
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
// Y axis
const Slider2 = ({ min, max, value, onValueChange, disabled }) => {

  const valueRef = useRef(value);
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


// sensitive slider
const SenSlider = ({ min, max, value, onValueChange, disabled  }) => {
  const valueRef = useRef(value);
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
    const xAxisRef = ref(db, 'main/86gQQY9K1Xc3CqQaQ6MUO9nu5472/rom1/scollers/sensitivity');

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
    const xAxisRef = ref(db, 'main/86gQQY9K1Xc3CqQaQ6MUO9nu5472/rom1/scollers/sensitivity');
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
      <View style={[styles.Sentrack, disabled && styles.disabledTrack]} />
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



const App = () => {
  const [xDegree, setXDegree] = useState(0);
  const [yDegree, setYDegree] = useState(0);
  const [sen, setSen] = useState(0);

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


// x axis control
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

// y axis control
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

// sensitive control
  useEffect(() => {
    const db = getDatabase(app);
    const senRef = ref(db, 'main/86gQQY9K1Xc3CqQaQ6MUO9nu5472/rom1/scollers/sensitivity');

    const unsubscribe = onValue(senRef, (snapshot) => {
      const initialValue = snapshot.val();
      if (initialValue != null) {
        setSen(initialValue);
      }
    });

    return () => off(senRef);
  }, []);


  return (
    <View style={styles.container}>
       <StatusBar backgroundColor="#020025" barStyle="light-content" />
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
                    <Slider2 min={0} max={180} value={yDegree} onValueChange={setYDegree} disabled={IsEnableAuto}/>
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
              

              {/* sensitive slider */}
              <View style={styles.senCtn}>
              <View style={styles.sliderChild}>     
                    <View style={styles.sliderContextCtn}>
                      <Text style={styles.header}> sensitive: </Text>
                      <Text style={styles.temperature}>{sen}</Text>
                    </View>
                    <SenSlider min={0} max={10} value={sen} onValueChange={setSen}/>
                </View>
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
    backgroundColor: '#edf1fc',
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
  sliderContainerSen: {
    width: 170,
    height: 40,
    justifyContent: 'center',
  //  / marginLeft:20
  },
  track: {
    width: 250,
    height: 6,
    backgroundColor: '#ddd',
    borderRadius: 3,
    alignSelf: 'center',
  },
  Sentrack: {
    width: 250,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 3,
    alignSelf: 'center',
   
  },
  knob: {
    width: 16,
    height: 26,
    borderRadius: 5,
    backgroundColor: '#2928e8',
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
    padding: 10,
    width:"100%"

  },
  ControlPanelCtn:{
    flex:1.9,
    padding:10,
    width:"100%",
  },
  sliderCtn:{
    flex:4,
    height:"100%",
    backgroundColor:'green',
    justifyContent:'center',
    alignItems:'center',
    backgroundColor: '#3a81f7',
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Offset
    shadowOpacity: 0.25, // Transparency
    shadowRadius: 3.84, // Blur radius

    elevation: 5, 
    borderRadius:10,
    marginBottom:10,
    
  },

  disabledTrack: {
    backgroundColor: "#ccc", // Grey track when disabled
  },
  disabledKnob: {
    backgroundColor: "#888", // Grey knob when disabled
  },
  buttonCtn:{
    flex:3.4,
    height:"100%",
   // flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    padding:10,
    backgroundColor: '#3a81f7',
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Offset
    shadowOpacity: 0.25, // Transparency
    shadowRadius: 3.84, // Blur radius
    elevation: 5, 
    borderRadius:10,
    marginBottom:10,
  },
  sliderChild:{
    
  },
  switchCtn:{

  },
  senCtn:{},

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
