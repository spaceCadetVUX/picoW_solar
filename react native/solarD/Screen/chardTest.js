import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';
import { StatusBar } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';
import app from '../firebaseConfig';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { LinearGradient } from "expo-linear-gradient";

const LightParameterScreen = () => {
  const [lightParams, setLightParams] = useState({});
  const [averagedData, setAveragedData] = useState([]);
  const [lightHistory, setLightHistory] = useState([]);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const db = getDatabase(app);
    const lightParamsRef = ref(db, 'main/86gQQY9K1Xc3CqQaQ6MUO9nu5472/rom1/light_parameter');

    const unsubscribe = onValue(lightParamsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLightParams(data);
        updateHistory(data);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateHistory = (data) => {
    setLightHistory((prevHistory) => {
      const updatedHistory = [...prevHistory, data].slice(-60);
      setAveragedData(calculateAverage(updatedHistory));
      return updatedHistory;
    });
  };

  const calculateAverage = (history) => {
    const sensors = Object.keys(history[0] || {});
    return sensors.map((sensor) => {
      const sum = history.reduce((total, current) => total + (current[sensor] || 0), 0);
      return sum / history.length;
    });
  };

  const chartData = {
    labels: Object.keys(lightParams),
    datasets: [
      {
        data: averagedData,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#edf1fc" barStyle="light-content" />
      <LinearGradient colors={["white", "white"]} style={styles.textBox}>
      <Text style={styles.title}>Light Parameters</Text>
      </LinearGradient>


      <BarChart
      data={chartData}
      width={300}
      height={220}
      yAxisSuffix="lx"
      chartConfig={{
        backgroundColor: 'white',
        backgroundGradientFrom: 'white',
        backgroundGradientTo: 'white',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        barPercentage: 1,
        barTopRadius:10,
        propsForBackgroundLines: {
          stroke: "#e3e3e3", // Light grid lines
          strokeDasharray: "1 4", // Dashed lines
        },
      }}
      style={styles.chart}
   //   showValuesOnTopOfBars={true}
      withInnerLines={true}
      withCustomBarColorFromData={false} 
    />
      <View style={styles.dataContainer}>
        {Object.entries(lightParams).map(([key, value], index) => (
          <View key={key} style={styles.paramBox}>
            <Text style={styles.paramText}>{key} : {value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  //  justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#edf1fc',
    padding: 20,
  },
  textBox:{
    justifyContent:'center',
    alignItems:'center',
    width:'100%',
    height:40,
    margin:10,
    borderRadius:13,
    elevation:5
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf:'center',
    color: 'black',

  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#444',
  },
  dataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
    width: '100%',
    backgroundColor:'white',
    padding:10,
    borderRadius:20,
    elevation: 5, 
  },
  paramBox: {
    width: '45%',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#3a81f7',
    margin: 5,
    borderRadius: 10,
    elevation:3
  },
  paramText: {
    fontSize: 14,
    marginVertical: 5,
    color: 'white',
    fontWeight:'bold'
  },
  chart: {
    borderRadius: 20,
    backgroundColor:'white',
    padding:5,
    elevation: 5, 
  },
});

export default LightParameterScreen;
