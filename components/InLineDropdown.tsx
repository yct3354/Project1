import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ColorValue,
  Dimensions,
  Animated,
  Easing,
} from "react-native";

import { useSQLiteContext } from "expo-sqlite";
import Feather from "@expo/vector-icons/Feather";
import CustomButton from "@/components/customButton";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

import { runOnJS } from "react-native-reanimated";

const DW = Dimensions.get("window").width;
const DH = Dimensions.get("window").height;
const ScaleFactor = DW / 411.4286;

interface InLineDropdownProps {
  onSelect: any;
  initItem: any;
  list: any;
  editable: any;
  textStyle: any;
  style: any;
  buttonStyle?: any;
  dropDirection: "up" | "down";
}

const accentColor = "#EFBF04"; //9D00FF, FF8000
const themeColor = "#1A1A16"; //1A1915
const modalColor = "#181716ff";
const topBarColor: ColorValue = "#615F55"; //292823
const topBarColorS = "#615F55"; //292823
const plateColor = "#45423A"; //474440
const transparent = "#00000000";

const InlineDropdown = ({
  onSelect,
  initItem,
  list,
  editable,
  style,
  buttonStyle,
  textStyle,
  dropDirection,
}: InLineDropdownProps) => {
  const db = useSQLiteContext();
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);

  const handleSelect = (text: any, index: any) => {
    setSelectedValue(text);
    onSelect(text, index);
    setDropdownVisible(false);
  };

  const loadRoll = useRef(new Animated.Value(0)).current;
  const loadBorder = loadRoll.interpolate({
    inputRange: [0, 1],
    outputRange: [200, 20],
  });
  const loadSlide = loadRoll.interpolate({
    inputRange: [0, 1],
    outputRange: [dropDirection === "up" ? 50 : -50, 0],
  });

  const RollIn = () => {
    Animated.timing(loadRoll, {
      toValue: 1,
      // delay: 5,
      duration: 300,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  };

  const RollOut = () => {
    Animated.timing(loadRoll, {
      toValue: 0,
      // delay: 5,
      duration: 300,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start(() => {
      setDropdownVisible(!isDropdownVisible);
    });
  };

  const dropDownStyle = StyleSheet.create({
    style: dropDirection === "up" ? { bottom: "100%" } : { top: "100%" },
  });

  const GetUnique = async () => {
    try {
      return await db.getAllAsync(
        `SELECT DISTINCT tag FROM record WHERE tag <> "Foreign Exchange"`
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const toggleDropdown = () => {
    if (!isDropdownVisible) {
      setDropdownVisible(!isDropdownVisible);
      RollIn();
    } else {
      RollOut();
    }
  };

  return (
    <View style={{ ...style, flexDirection: "row" }}>
      <CustomButton
        frameStyle={{ flex: 1 }}
        buttonStyle={{
          ...styles.button,
          ...buttonStyle,
          borderColor: editable ? accentColor : "#FFFFFF80",
          // backgroundColor: "red",
        }}
        onPressOut={() => (editable ? toggleDropdown() : {})}
        shrinkFactor={0.9}
      >
        <Text style={{ ...styles.buttonText, ...textStyle }}>
          {selectedValue || initItem}{" "}
        </Text>
        <View
          style={{
            // flex: 1,
            flexDirection: "row-reverse",
            alignItems: "flex-start",
          }}
        >
          <Feather
            name={dropDirection === "up" ? "chevron-up" : "chevron-down"}
            size={21}
            color={editable ? accentColor : "#FFFFFF80"}
          />
        </View>
      </CustomButton>
      {isDropdownVisible && (
        <Animated.View
          style={{
            ...styles.dropdown,
            opacity: loadRoll,
            borderRadius: loadBorder,
            ...dropDownStyle.style,
            maxHeight: DH * 0.25,
            transform: [
              {
                translateY: loadSlide,
              },
              {
                scaleX: loadRoll,
              },
              {
                scaleY: loadRoll,
              },
            ],
            transformOrigin:
              dropDirection === "up" ? "bottom right" : "top right",
          }}
        >
          <FlatList
            data={list}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <GestureHandlerRootView
                style={styles.option}
                onStartShouldSetResponder={() => true}
              >
                <GestureDetector
                  gesture={Gesture.Tap()
                    .maxDuration(25000)
                    .onEnd(() => runOnJS(handleSelect)(item.text, item.id))}
                  // onPressOut={() => handleSelect(item.text, item.id)}
                >
                  <Animated.Text
                    style={{ ...styles.optionText, opacity: loadRoll }}
                  >
                    {item.text}
                  </Animated.Text>
                </GestureDetector>
              </GestureHandlerRootView>
            )}
          />
        </Animated.View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  button: {
    backgroundColor: plateColor,
    borderRadius: 15,
    // paddingVertical: 3 * ScaleFactor,
    // marginTop: 3 * ScaleFactor,
    paddingHorizontal: 10 * ScaleFactor,
    // paddingHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    zIndex: 5,
    flexDirection: "row",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18 * ScaleFactor,
    flex: 1,
    fontWeight: "bold",
  },
  dropdown: {
    // marginTop: 5,
    backgroundColor: plateColor,
    position: "absolute",
    zIndex: 99,
    width: "100%",
  },
  option: {
    padding: 10,
  },
  optionText: {
    fontSize: 16 * ScaleFactor,
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default InlineDropdown;
