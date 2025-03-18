import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { getDatabase, ref, onValue } from 'firebase/database';
import app from '../firebaseConfig'; // Import Firebase configuration

const LightParameterScreen = () => {
  const [lightParams, setLightParams] = useState({});
  const [averagedData, setAveragedData] = useState([]); // State for the chart's averaged data
  const [lightHistory, setLightHistory] = useState([]); // To store 1-minute history

  useEffect(() => {
    const db = getDatabase(app);
    const lightParamsRef = ref(db, 'main/86gQQY9K1Xc3CqQaQ6MUO9nu5472/rom1/light_parameter'); // Firebase path

    // Listen for changes in light parameters
    const unsubscribe = onValue(lightParamsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLightParams(data); // Update current light parameter values
        updateHistory(data); // Add new data to the history
      }
    });

    return () => unsubscribe(); // Clean up the listener
  }, []);

  // Add new data to the history and calculate 1-minute average
  const updateHistory = (data) => {
    setLightHistory((prevHistory) => {
      // Keep only the last 60 entries (1 per second)
      const updatedHistory = [...prevHistory, data].slice(-60);

      // Calculate the average for each sensor
      const averageData = calculateAverage(updatedHistory);

      // Update the chart's averaged data
      setAveragedData(averageData);

      return updatedHistory;
    });
  };

  // Function to calculate the average of sensors over the last minute
  const calculateAverage = (history) => {
    const sensors = Object.keys(history[0] || {}); // Get sensor keys (e.g., sensor1, sensor2)
    const averages = sensors.map((sensor) => {
      const sum = history.reduce((total, current) => total + (current[sensor] || 0), 0); // Sum all values
      return sum / history.length; // Calculate average
    });
    return averages;
  };

  // Prepare chart data
  const chartData = {
    labels: Object.keys(lightParams), // Extract keys (e.g., ['sensor1', 'sensor2', ...])
    datasets: [
      {
        data: averagedData, // Use averaged data for the chart
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Light Parameters (1-Minute Average)</Text>
      <View style={styles.dataContainer}>
        {Object.entries(lightParams).map(([key, value]) => (
          <Text key={key} style={styles.paramText}>
            {key}: {value}
          </Text>
        ))}
      </View>

      {/* Bar Chart */}
      <BarChart
        data={chartData}
        width={300} // Chart width
        height={220} // Chart height
        yAxisSuffix="lx" // Example suffix for light intensity
        chartConfig={{
          backgroundColor: '#022173',
          backgroundGradientFrom: '#1E2923',
          backgroundGradientTo: '#08130D',
          decimalPlaces: 0, // No decimals
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          barPercentage: 0.5,
        }}
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  dataContainer: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  paramText: {
    fontSize: 18,
    marginVertical: 5,
    color: '#555',
  },
  chart: {
    borderRadius: 16,
  },
});

export default LightParameterScreen;
