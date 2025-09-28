import { useEffect, useRef } from "react";
import { Animated, Dimensions, Text } from "react-native";

const DW = Dimensions.get("window").width;
const DH = Dimensions.get("window").height;
const ScaleFactor = DW / 411.4286;

interface EmptyListAnimatedProps {
  text: string;
}

export default function EmptyListAnimated({ text }: EmptyListAnimatedProps) {
  const loadFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(loadFade, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        justifyContent: "center",
        flex: 1,
        alignItems: "center",
        height: DH * 0.27,
        opacity: loadFade,
      }}
    >
      <Text
        style={{
          color: "white",
          fontSize: 22 * ScaleFactor,
          fontWeight: "bold",
        }}
      >
        {text}
      </Text>
    </Animated.View>
  );
}
