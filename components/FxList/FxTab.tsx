import React, { useRef, useState } from "react";
import {
  Animated,
  ColorValue,
  Dimensions,
  Image,
  StyleSheet,
  // Pressable,
  Text,
  View,
} from "react-native";

import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

import { useNavigation } from "@react-navigation/native";

import config from "@/components/config.json";
import ChangeBalanceModal from "@/components/FxList/ChangeBalanceModal";
import images from "@/components/Images";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LinearGradient } from "expo-linear-gradient";
import { runOnJS } from "react-native-reanimated";
import { fxIndexMap } from "../fxIndexMap";

const accentColor = "#EFBF04"; //9D00FF, FF8000
const themeColor = "#1A1A16"; //1A1915
const modalColor = "#181716ff";
const topBarColor: ColorValue = "#615F55"; //292823
const topBarColorS = "#615F55"; //292823
const plateColor = "#45423A"; //474440
const transparent = "#00000000";
const transparentC: ColorValue = "#00000000";

const location = "en-US";

const DW = Dimensions.get("window").width;
const DH = Dimensions.get("window").height;
const ScaleFactor = DW / 411.4286;
const shrinkFactor = 0.95;

const formatterUS = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

interface FxTabProps {
  plateStyle?: any;
  hiddenState: boolean;
  fxBalance: number;
  fxRate: number;
  fxTag: string;
  setRefresh: any;
}

function transparentFade(initColor: string, x: number, y: number) {
  let arr: ColorValue[] = [];
  for (let i = 1; i <= x; i++) {
    let num = Math.ceil((y / 2) * Math.cos((Math.PI * i) / 50) + 255 / 2);
    arr.push(initColor + (num < 16 ? "0" : "") + num.toString(16));
  }

  return arr;
}

const linspace = (start: number, end: number, numPoints: number) => {
  if (numPoints <= 0) {
    return [];
  }
  if (numPoints === 1) {
    return [end];
  }

  const step = (end - start) / (numPoints - 1);
  const result = [];

  for (let i = 0; i < numPoints; i++) {
    result.push(start + i * step);
  }

  return result;
};

export default function FxTab({
  plateStyle,
  hiddenState,
  fxBalance,
  fxRate,
  fxTag,
  setRefresh,
}: FxTabProps) {
  const amountString = (hiddenState ? "***" : formatterUS.format(fxBalance))
    .length;
  let fxIndex = fxIndexMap(fxTag);

  const [modalVisible, setModalVisible] = useState(false);
  const animatedPress = useRef(new Animated.Value(1)).current;
  const animatedPressButton = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation<any>();
  const longPress = useRef(false);

  const pressInAnimation = () => {
    Animated.timing(animatedPress, {
      useNativeDriver: true,
      toValue: shrinkFactor,
      duration: 200,
    }).start();
  };
  const pressOutAnimation = (success: any) => {
    Animated.timing(animatedPress, {
      useNativeDriver: true,
      toValue: 1,
      duration: 100,
    }).start(() => {
      success.state === 5
        ? navigation.navigate("FullList", { mode: fxTag })
        : {};
    });
  };

  const pressInAnimationButton = () => {
    Animated.timing(animatedPressButton, {
      useNativeDriver: true,
      toValue: shrinkFactor,
      duration: 200,
    }).start();
  };
  const pressOutAnimationButton = () => {
    Animated.timing(animatedPressButton, {
      useNativeDriver: true,
      toValue: 1,
      duration: 100,
    }).start();
  };

  const longPressTab = Gesture.LongPress()
    .onBegin(() => {
      runOnJS(pressInAnimation)();
    })
    .onFinalize((success) => {
      runOnJS(pressOutAnimation)(success);
    });

  const singleTapTab = Gesture.Tap().onEnd(() => {
    runOnJS(navigation.navigate)("FullList", { mode: fxTag });
  });

  const longPressButton = Gesture.Tap()
    .blocksExternalGesture(longPressTab, singleTapTab)
    .onBegin(() => {
      runOnJS(pressInAnimationButton)();
    })
    .onEnd(() => {
      runOnJS(setModalVisible)(true);
    })
    .onFinalize(() => {
      runOnJS(pressOutAnimationButton)();
    });

  const singleTapButton = Gesture.Tap().onEnd(() => {
    runOnJS(setModalVisible)(true);
  });

  const buttonGesture = Gesture.Simultaneous(singleTapButton, longPressButton);
  const tabGesture = Gesture.Simultaneous(singleTapTab, longPressTab);

  return (
    <View style={{ width: "100%", ...plateStyle }}>
      <GestureHandlerRootView style={{}}>
        <GestureDetector gesture={tabGesture}>
          <Animated.View style={{ transform: [{ scale: animatedPress }] }}>
            <LinearGradient
              colors={[
                transparentC,
                transparentC,
                ...[...transparentFade(plateColor, 50, 255)].reverse(),
              ]}
              locations={[0, 0, ...linspace(0, 1, 50)]}
              start={[0.3, 0]}
              end={[0, 0]}
              style={{
                borderRadius: 20 * ScaleFactor,
                paddingVertical: 0 * ScaleFactor,
                paddingHorizontal: 10 * ScaleFactor,
                // elevation: 2,
                height: 100 * ScaleFactor,
                ...styles.infoPlate,
              }}
            >
              <View style={styles.leftPlate}>
                <Image
                  source={images[fxIndex]}
                  style={{
                    flex: 1,
                    width: null,
                    height: null,
                    resizeMode: "contain",
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "column",
                  width: "85%",
                  height: "100%",
                  paddingTop: 10 * ScaleFactor,
                }}
              >
                <View style={styles.upperRow}>
                  <View style={{ flex: 0.5, justifyContent: "flex-end" }}>
                    <Text
                      style={{
                        fontSize:
                          amountString > 10
                            ? (10 / amountString) * 26 * ScaleFactor
                            : 26 * ScaleFactor,
                        color: "white",
                        textAlign: "right",
                        fontWeight: "bold",
                        marginRight: 4 * ScaleFactor,
                      }}
                    >
                      {hiddenState ? "***" : formatterUS.format(fxBalance)}
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 0.2,
                      justifyContent: "flex-end",
                      paddingLeft: 5,
                    }}
                  >
                    <Text
                      style={{
                        fontSize:
                          amountString > 10
                            ? (10 / amountString) * 26 * ScaleFactor
                            : 26 * ScaleFactor,
                        color: "white",
                        textAlign: "left",
                        fontWeight: "bold",
                      }}
                    >
                      {fxTag}
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 0.3,
                      justifyContent: "flex-end",
                      paddingRight: 10 * ScaleFactor,
                    }}
                  >
                    <Text
                      style={{
                        fontSize:
                          amountString > 10
                            ? Math.sqrt(10 / amountString) * 18 * ScaleFactor
                            : 18 * ScaleFactor,
                        color: "white",
                        textAlign: "right",
                        fontWeight: "bold",
                        paddingBottom: 2 * ScaleFactor,
                      }}
                    >
                      {fxTag + "/" + config.defaultCurrency}
                    </Text>
                  </View>
                </View>
                <View style={styles.lowerRow}>
                  <View style={{ flex: 0.5, justifyContent: "flex-start" }}>
                    <Text
                      style={{
                        fontSize: 18 * ScaleFactor,
                        color: "white",
                        textAlign: "right",
                        fontWeight: "400",
                      }}
                    >
                      {hiddenState
                        ? "***"
                        : formatterUS.format(
                            fxBalance * (fxRate === -1 ? 0 : fxRate)
                          )}
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 0.2,
                      justifyContent: "flex-start",
                      paddingLeft: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18 * ScaleFactor,
                        color: "white",
                        textAlign: "left",
                        fontWeight: "400",
                      }}
                    >
                      {config.defaultCurrency}
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 0.3,
                      justifyContent: "flex-start",
                      paddingRight: 10 * ScaleFactor,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18 * ScaleFactor,
                        color: accentColor,
                        textAlign: "right",
                        fontWeight: "400",
                        paddingLeft: 3 * ScaleFactor,
                      }}
                    >
                      {fxTag === config.defaultCurrency
                        ? 1
                        : fxRate === -1
                          ? "- - -"
                          : fxRate}
                    </Text>
                  </View>
                </View>
              </View>
              <GestureHandlerRootView
                style={{
                  height: 24 * ScaleFactor,
                  width: 24 * ScaleFactor,
                  backgroundColor: transparent,
                  position: "absolute",
                  top: "5%",
                  left: "95%",
                }}
              >
                <GestureDetector gesture={buttonGesture}>
                  <Animated.View
                    style={{
                      // backgroundColor: "red",
                      transform: [{ scale: animatedPressButton }],
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FontAwesome6
                      name="arrow-right-arrow-left"
                      size={20 * ScaleFactor}
                      color={accentColor}
                    />
                  </Animated.View>
                </GestureDetector>
              </GestureHandlerRootView>
            </LinearGradient>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
      <ChangeBalanceModal
        setModalVisibleParent={setModalVisible}
        modalVisibleParent={modalVisible}
        tag={fxTag}
        setRefresh={setRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  leftPlate: {
    width: "15%",
  },
  upperRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    marginLeft: 5,
    height: "50%",
  },
  lowerRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    marginLeft: 5,
    height: "50%",
  },
  amountDisplay: {
    width: "40%",
    flexDirection: "column",
    justifyContent: "center",
    marginLeft: 5,
  },
  currencyDisplay: {
    width: "17%",
    flexDirection: "column",
    justifyContent: "center",
  },
  rightPlate: {
    width: "28%",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingRight: 15 * ScaleFactor,
    paddingTop: 8 * ScaleFactor,
    // paddingBottom: 10 * ScaleFactor,
  },
  container: {
    backgroundColor: transparent,
    width: "80%",
    flex: 1,
  },
  dropdown: {
    height: 40,
    borderColor: "white",
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
    color: "white",
  },
  label: {
    position: "absolute",
    backgroundColor: transparent,
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
    color: "transparent",
    textAlign: "center",
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
  },
  itemText: {
    color: "white",
    textAlign: "center",
  },
  dropDownContainer: {
    backgroundColor: modalColor,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: accentColor,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  infoPlate: {
    flexDirection: "row",
    width: "100%",
  },
  textPlate: {
    flexDirection: "column",
    flex: 1,
    justifyContent: "flex-start",
    paddingLeft: 10 * ScaleFactor,
  },
  titleBar: {
    flexDirection: "row",
    justifyContent: "center",
  },
  titlePlate: {
    flex: 0.55,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  titleText: {
    color: "white",
    fontSize: 20 * ScaleFactor,
    fontWeight: "500",
    paddingRight: 5,
  },
  amountPlate: {
    flex: 0.45,
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
  },
  supplementText: {
    color: "white",
    fontSize: 14 * ScaleFactor,
    paddingTop: 5 * ScaleFactor,
    paddingLeft: 1,
  },
});
