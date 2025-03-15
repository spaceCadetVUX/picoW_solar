import React, { useState } from 'react';
import { View, Text, StyleSheet, PanResponder, ScrollView } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

const CircularSlider = ({ min, max, value, onValueChange }) => {
  const radius = 70;
  const strokeWidth = 10;
  const knobRadius = 20;
  const centerX = 150;
  const centerY = 150;
  const circumference = 2 * Math.PI * radius;
  const [angle, setAngle] = useState((value - min) / (max - min) * 360);

  const polarToCartesian = (angle) => {
    const radians = (angle - 90) * (Math.PI / 180.0);
    return {
      x: centerX + radius * Math.cos(radians),
      y: centerY + radius * Math.sin(radians),
    };
  };

  const updateAngle = (dx, dy) => {
    const x = dx - centerX;
    const y = dy - centerY;
    let newAngle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (newAngle < 0) newAngle += 360;
    setAngle(newAngle);
    const newValue = Math.round(min + (newAngle / 360) * (max - min));
    onValueChange(newValue);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      updateAngle(gesture.moveX, gesture.moveY);
    },
  });

  const cartesian = polarToCartesian(angle);

  return (
    <Svg height="300" width="300">
      <Circle cx={centerX} cy={centerY} r={radius} stroke="#ddd" strokeWidth={strokeWidth} fill="none" />
      <Circle
        cx={centerX}
        cy={centerY}
        r={radius}
        stroke="#ff4081"
        strokeWidth={strokeWidth}
        strokeDasharray={`${(angle / 360) * circumference}, ${circumference}`}
        fill="none"
        rotation="-90"
        origin={`${centerX}, ${centerY}`}
      />
      <Line x1={centerX} y1={centerY} x2={cartesian.x} y2={cartesian.y} stroke="#ff4081" strokeWidth={2} />
      <Circle cx={cartesian.x} cy={cartesian.y} r={knobRadius} fill="#fff" stroke="#ff4081" strokeWidth={3} {...panResponder.panHandlers} />
    </Svg>
  );
};

const App = () => {
  const [temperature, setTemperature] = useState(28);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        <Text style={styles.header}>Adjust Temperature</Text>
        <CircularSlider min={0} max={180} value={temperature} onValueChange={setTemperature} />
        <View style={styles.gaugeContainer}>
          <Text style={styles.temperature}>{temperature}°C</Text>
        </View>
        <View style={styles.headerContainer}>
          <Text style={styles.name}>Yasmin</Text>
          <Text style={styles.date}>Sun, 22 Feb 2024</Text>
        </View>
        <Text style={styles.condition}>Condition: <Text style={styles.normal}>Normal</Text></Text>
        <View style={styles.controls}>
          <ControlButton label="Wearable" status="ON" />
          <ControlButton label="Obstacle" status="OFF" />
          <ControlButton label="Next Feed" status="08:00" />
          <ControlButton label="Appetite" status="90%" />
          <ControlButton label="Coordinate" status="N/A" />
        </View>
      </View>
    </ScrollView>
  );
};

const ControlButton = ({ label, status }) => (
  <View style={styles.controlButton}>
    <Text style={styles.controlLabel}>{label}</Text>
    <View style={styles.controlStatus}>
      <Text style={styles.controlStatusText}>{status}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { alignItems: 'center', paddingVertical: 20 },
  header: { fontSize: 20, marginBottom: 20, fontWeight: 'bold' },
  gaugeContainer: { marginTop: 20, alignItems: 'center' },
  temperature: { fontSize: 48, fontWeight: 'bold' },
  headerContainer: { alignItems: 'center', marginTop: 30 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#ff4081' },
  date: { fontSize: 16, color: '#888' },
  condition: { fontSize: 18, marginVertical: 20 },
  normal: { color: 'green' },
  controls: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 20 },
  controlButton: { alignItems: 'center', margin: 10 },
  controlLabel: { fontSize: 16, marginBottom: 5 },
  controlStatus: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#ff4081', alignItems: 'center', justifyContent: 'center' },
  controlStatusText: { color: '#fff', fontSize: 16 },
});

export default App;
