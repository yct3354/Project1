import React, { useRef } from "react";
import { Pressable, Text, StyleSheet, View, Animated } from "react-native";

interface customButtonProps {
  children?: any;
  onPress?: any;
  onPressIn?: any;
  onPressOut?: any;
  buttonStyle?: any;
  frameStyle?: any;
  shrinkFactor?: any;
}

export default function CustomButton({
  children,
  onPress = () => {},
  onPressIn = () => {},
  onPressOut = () => {},
  buttonStyle,
  frameStyle,
  shrinkFactor = 0.85,
}: customButtonProps) {
  const animatedPress = useRef(new Animated.Value(1)).current;

  const pressInAnimation = () => {
    Animated.timing(animatedPress, {
      useNativeDriver: true,
      toValue: shrinkFactor,
      duration: 200,
    }).start();
  };
  const pressOutAnimation = () => {
    Animated.timing(animatedPress, {
      useNativeDriver: true,
      toValue: 1,
      duration: 100,
    }).start(() => {
      onPressOut() || {};
    });
  };

  return (
    <Pressable
      style={{ ...frameStyle, overflow: "hidden" }}
      onPress={onPress || (() => {})}
      onPressIn={() => {
        pressInAnimation();
        onPressIn();
      }}
      onPressOut={() => {
        pressOutAnimation();
      }}
    >
      <Animated.View
        style={{
          ...style.button,
          ...buttonStyle,
          transform: [{ scale: animatedPress }],
        }}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

const style = StyleSheet.create({
  button: {
    borderRadius: 30,
    backgroundColor: "#00000000",
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
    opacity: 1,
    overflow: "hidden",
    padding: 0,
  },
});
