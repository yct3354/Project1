import { useSQLiteContext } from "expo-sqlite";
import { useRef, createContext, useContext, useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  ColorValue,
  Dimensions,
  // Animated,
  FlatList,
  TextInput,
  DimensionValue,
} from "react-native";

// import * as Reanimated from '@/components/Reanimated'
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  ReduceMotion,
} from "react-native-reanimated";
import CustomButton from "@/components/customButton";
import Feather from "@expo/vector-icons/Feather";
import Icons from "./Icons";

const DW = Dimensions.get("window").width;
const DH = Dimensions.get("window").height;
const ScaleFactor = DW / 411.4286;
const accentColor = "#EFBF04"; //9D00FF, FF8000
const themeColor = "#1A1A16"; //1A1915
const topBarColor: ColorValue = "#615F55"; //292823
const topBarColorS = "#615F55"; //292823
const plateColor = "#45423A"; //474440
const transparent = "#00000000";
const transparentC: ColorValue = "#00000000";

interface ExtendingTextBarProps {
  titleText: string;
  enabled: boolean;
  placeholder: string;
  initWidth: string;
  titleTextStyle: any;
  barTextStyle: any;
  setTextParent: any;
  setSelfStateEnabled?: any;
  iconSize: number;
  primaryIcon: string;
  closeIcon: string;
  secondary: boolean;
  secondaryIcon?: string;
  primaryHandle?: any;
  closeHandle?: any;
  secondaryHandle?: any;
}

export default function ExtendingTextBar({
  titleText,
  enabled,
  placeholder,
  initWidth,
  titleTextStyle,
  barTextStyle,
  setTextParent,
  setSelfStateEnabled = () => {},
  iconSize,
  primaryIcon,
  closeIcon,
  secondary,
  secondaryIcon,
  primaryHandle = () => {},
  closeHandle = () => {},
  secondaryHandle = () => {},
}: ExtendingTextBarProps) {
  const [textPlaceholder, setTextPlaceholder] = useState(placeholder);
  const [text, setText] = useState("");
  const [barState, setBarState] = useState(false);

  const textInput = useRef<any>(null);

  const titleLoadFade = useSharedValue(1);
  const barWidth = useSharedValue<any>(initWidth);
  // const barHeight = useSharedValue<any>("100%");

  const titleFadeIn = () => {
    titleLoadFade.value = withTiming(1, {
      duration: 300,
    });
  };
  const titleFadeOut = () => {
    titleLoadFade.value = withTiming(0, {
      duration: 300,
    });
  };

  const handleBar = () => {
    setBarState(!barState);
    if (barState) {
      barWidth.value = initWidth;
      titleFadeIn();
      setText("");
      closeHandle();
      setSelfStateEnabled(true);
    } else {
      barWidth.value = "100%";
      titleFadeOut();
      primaryHandle();
      setSelfStateEnabled(true);
    }
  };

  useEffect(() => {
    // barState ? textInput.current?.focus() : {};
    if (barState) {
      setTimeout(() => {
        textInput.current?.focus();
      }, 0);
    }
  }, [barState]);

  const barAnimation = useAnimatedStyle(() => ({
    width: withTiming(barWidth.value, {
      duration: 300,
      easing: Easing.bezier(0.69, 0, 0.19, 1),
      reduceMotion: ReduceMotion.System,
    }),
  }));

  return (
    <View
      style={{
        width: "100%",
        flexDirection: "row",
      }}
    >
      <Animated.Text
        style={{
          ...titleTextStyle,
          opacity: titleLoadFade,
        }}
      >
        {titleText}
      </Animated.Text>
      <Animated.View style={[styles.bar, barAnimation]}>
        <CustomButton
          onPressOut={() => {
            enabled ? handleBar() : {};
          }}
          frameStyle={{ height: "100%" }}
          buttonStyle={{
            borderRadius: 24 * ScaleFactor,
            backgroundColor: plateColor,
            flexDirection: "row",
            // paddingVertical: 5 * ScaleFactor,
            height: "100%",
            // alignItems: "center",
            // justifyContent: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                paddingLeft: 8 * ScaleFactor,
              }}
            >
              <Icons
                tagText={primaryIcon}
                size={iconSize}
                color={accentColor}
              />
            </View>
            <View
              style={{
                justifyContent: "center",
                flex: 1,
              }}
            >
              <TextInput
                style={{
                  ...barTextStyle,
                  alignItems: "flex-end",
                  justifyContent: "center",
                  backgroundColor: transparent,
                  textAlign: "left",
                  color: "white",
                  textAlignVertical: "center",
                  paddingBottom: 0,
                  paddingTop: 0,
                  flex: 1,
                }}
                ref={textInput}
                editable={barState}
                // autoFocus={true}
                focusable={true}
                placeholder={textPlaceholder}
                placeholderTextColor="white"
                selectTextOnFocus={true}
                underlineColorAndroid={transparent}
                onFocus={() => {
                  setTextPlaceholder("");
                  setBarState(true);
                }}
                onChangeText={(newText) => {
                  setText(newText);
                  setTextParent(newText);
                }}
                onEndEditing={() => {
                  setTextPlaceholder(placeholder);
                }}
                // onBlur={() => handleBar()}
                value={text}
              />
              {barState && (
                <View
                  style={{
                    position: "absolute",
                    right: "2%",
                  }}
                >
                  <CustomButton
                    onPressOut={() => {
                      handleBar();
                    }}
                    buttonStyle={{
                      height: 40 * ScaleFactor,
                      width: 30 * ScaleFactor,
                      borderRadius: 20,
                      // backgroundColor: "red",
                    }}
                  >
                    <Icons
                      tagText={closeIcon}
                      size={iconSize}
                      color="#b3b3b3"
                    ></Icons>
                  </CustomButton>
                </View>
              )}
              {barState && secondary && (
                <View
                  style={{
                    position: "absolute",
                    right: "12%",
                  }}
                >
                  <CustomButton
                    onPressOut={() => {
                      secondaryHandle();
                      handleBar();
                    }}
                    buttonStyle={{
                      height: 40 * ScaleFactor,
                      width: 30 * ScaleFactor,
                      borderRadius: 20,
                      // backgroundColor: "blue",
                    }}
                  >
                    {/* <Feather name="x" size={24 * ScaleFactor} color="#b3b3b3" /> */}
                    <Icons
                      tagText={secondaryIcon}
                      size={iconSize}
                      color="#b3b3b3"
                    ></Icons>
                  </CustomButton>
                </View>
              )}
            </View>
          </View>
        </CustomButton>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
    position: "absolute",
    right: "0%",
    height: "100%",
    paddingVertical: 0 * ScaleFactor,
  },
  text: {
    alignItems: "flex-end",
    justifyContent: "center",
    backgroundColor: transparent,
    textAlign: "left",
    color: "white",
    fontWeight: "500",
    textAlignVertical: "center",
    paddingBottom: 0,
    paddingTop: 0,
    paddingRight: 8 * ScaleFactor,
  },
});
