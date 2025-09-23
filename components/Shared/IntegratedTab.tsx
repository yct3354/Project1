import Feather from "@expo/vector-icons/Feather";
import { useNavigation } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  ColorValue,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Directions,
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import CustomButton from "../customButton";

import { useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const emojiDictionary = require("emoji-dictionary");

const DW = Dimensions.get("window").width;
const DH = Dimensions.get("window").height;
const ScaleFactor = DW / 411.4286;
const ScaleFactorVert = DH / 924;
const accentColor = "#EFBF04"; //9D00FF, FF8000
const themeColor = "#1A1A16"; //1A1915
const modalColor = "#181716";
const topBarColor: ColorValue = "#615F55"; //292823
const topBarColorS = "#615F55"; //292823
const plateColor = "#45423A"; //474440
const transparent = "#00000000";
const transparentC: ColorValue = "#00000000";
const standardShrinkFactor = 0.85;
const lowShrinkFactor = 0.95;

interface GroupTabProps {
  item: any;
  tagList: any;
  index: any;
  setModifiedIndex: any;
  deleteSlide: any;
}

const location = "en-US";
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

let currentDate = new Date();
let currentYear = currentDate.getFullYear();

function getDateString(datePreParse: string) {
  const date = new Date(datePreParse);
  let day = date.getDate();
  let month = date.getMonth();
  let year = date.getFullYear();
  return (
    monthNames[month] +
    " " +
    (day < 10 ? "0" + day : day) +
    (year < currentYear ? " " + year : "")
  );
}

export default function IntegratedTab({
  item,
  tagList,
  index,
  setModifiedIndex,
  deleteSlide,
}: GroupTabProps) {
  const animatedPress = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation<any>();
  const start = useSharedValue(0);
  const [swipeState, setSwipeState] = useState(0);

  const animatedPressButton = useRef(new Animated.Value(1)).current;
  const swipeTranslate = useRef(new Animated.Value(0)).current;
  const tabFade = swipeTranslate.interpolate({
    inputRange: [-DW, -DW, 0, DW * 0.99, DW],
    outputRange: [0, 1, 1, 0.99, 0],
  });
  const XFadeRight = swipeTranslate.interpolate({
    inputRange: [-DW / 6, 0],
    outputRange: [1, 0],
  });

  const XFadeLeft = swipeTranslate.interpolate({
    inputRange: [0, DW / 6],
    outputRange: [0, 1],
  });

  const sessionEmoji = emojiDictionary.getUnicode(
    tagList.find((obj: any) => obj.tag_id === item.tag_id).emoji
  );

  const pressInAnimation = () => {
    Animated.timing(animatedPress, {
      useNativeDriver: true,
      toValue: lowShrinkFactor,
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
        ? navigation.navigate("SessionDetails", { session_id: item.session_id })
        : {};
    });
  };

  const pressInAnimationButton = () => {
    Animated.timing(animatedPressButton, {
      useNativeDriver: true,
      toValue: lowShrinkFactor,
      duration: 200,
    }).start();
  };
  const pressOutAnimationButton = (success: any) => {
    Animated.timing(animatedPressButton, {
      useNativeDriver: true,
      toValue: 1,
      duration: 100,
    }).start(() => {
      success.state === 5 ? console.log("check pressed") : {};
    });
  };

  const swipeReturn = (returnValue: number) => {
    Animated.timing(swipeTranslate, {
      useNativeDriver: true,
      toValue: returnValue,
      duration: 100,
    }).start(() => {
      if (returnValue != 0) {
        setSwipeState(returnValue);
        setModifiedIndex(index);
      }
    });
  };
  // console.log(item);

  const longPressTab = Gesture.LongPress()
    .onBegin(() => {
      scheduleOnRN(pressInAnimation);
    })
    .onFinalize((success) => {
      scheduleOnRN(pressOutAnimation, success);
    });

  const singleTapTab = Gesture.Tap().onEnd(() => {
    scheduleOnRN(navigation.navigate, "SessionDetails", {
      session_id: item.session_id,
      user_group_id: item.user_group_id,
    });
  });

  const panTab = Gesture.Pan()
    .blocksExternalGesture(longPressTab, singleTapTab)
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onBegin((e) => {
      start.value = e.absoluteX;
    })
    .onUpdate((e) => {
      swipeTranslate.setValue(e.absoluteX - start.value + swipeState);
    })
    .onEnd((e) => {
      // console.log(e);
      if (
        e.absoluteX - start.value + swipeState < -DW / 3 ||
        e.velocityX < -1000
      ) {
        swipeReturn(-DW);
      } else if (
        e.absoluteX - start.value + swipeState > DW / 3 ||
        e.velocityX > 1000
      ) {
        swipeReturn(DW);
      } else {
        swipeReturn(0);
        setSwipeState(0);
      }
    })
    .runOnJS(true);

  const flingTab = Gesture.Fling()
    .blocksExternalGesture(longPressTab, singleTapTab)
    .direction(Directions.LEFT)
    .onEnd(() => {
      swipeReturn(-200);
    })
    .runOnJS(true);

  const longPressButton = Gesture.LongPress()
    .blocksExternalGesture(longPressTab, singleTapTab)
    .onBegin(() => {
      scheduleOnRN(pressInAnimationButton);
    })
    .onEnd(() => {
      // runOnJS(setModalVisible)(true);
    })
    .onFinalize((success) => {
      scheduleOnRN(pressOutAnimationButton, success);
    });

  const singleTapButton = Gesture.Tap().onEnd(() => {
    // console.log("check pressed");
  });

  const tabGesture = Gesture.Simultaneous(singleTapTab, longPressTab, panTab);
  const buttonGesture = Gesture.Simultaneous(singleTapButton, longPressButton);
  return (
    <Animated.View
      style={{
        opacity: tabFade,
        transform: [{ translateX: deleteSlide }],
      }}
    >
      <GestureHandlerRootView style={{}}>
        <GestureDetector gesture={tabGesture}>
          <View style={styles.sessionTab}>
            <Animated.View
              style={{
                position: "absolute",
                right: "0%",
                height: "100%",
                width: 40 * ScaleFactor,
                top: "0%",
                // backgroundColor: "red",
                zIndex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingRight: 5 * ScaleFactor,
                opacity: XFadeRight,
              }}
            >
              <CustomButton
                onPressOut={() => {
                  // navigation.goBack();
                }}
                frameStyle={{ paddingRight: 10 * ScaleFactor }}
                buttonStyle={{
                  width: 40 * ScaleFactor,
                }}
              >
                <Feather name="x" size={30 * ScaleFactor} color={"#FF3B30"} />
              </CustomButton>
            </Animated.View>
            <Animated.View
              style={{
                position: "absolute",
                left: "0%",
                height: "100%",
                width: "20%",
                top: "0%",
                // backgroundColor: "red",
                zIndex: 1,
                justifyContent: "center",
                alignItems: "center",
                // paddingLeft: 5 * ScaleFactor,
                opacity: XFadeLeft,
              }}
            >
              <CustomButton
                onPressOut={() => {
                  // navigation.goBack();
                }}
                frameStyle={{}}
                buttonStyle={{
                  width: 40 * ScaleFactor,
                }}
              >
                <Feather name="x" size={30 * ScaleFactor} color={"#FF3B30"} />
              </CustomButton>
            </Animated.View>
            <Animated.View
              style={{
                flexDirection: "row",
                transform: [
                  { scale: animatedPress },
                  { translateX: swipeTranslate },
                ],
                backgroundColor: themeColor,
                zIndex: 2,
                height: "100%",
                width: "100%",
              }}
            >
              <TouchableOpacity activeOpacity={0.8} style={{ width: "100%" }}>
                <View style={{ flexDirection: "row", height: "100%" }}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <View
                      style={{
                        width: "20%",
                        height: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontSize: 40 * ScaleFactor }}>
                        {sessionEmoji}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          paddingBottom: 4 * ScaleFactor,
                          alignItems: "center",
                        }}
                      >
                        <Text style={styles.sessionName}>
                          {item.session_name}
                        </Text>
                        <View
                          style={{
                            flex: 1,
                            flexDirection: "row-reverse",
                            paddingHorizontal: 15 * ScaleFactor,
                          }}
                        >
                          <Text style={styles.amountText}>
                            {item.amount.toLocaleString(location, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }) +
                              " " +
                              item.currency}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          paddingTop: 4 * ScaleFactor,
                        }}
                      >
                        <Text style={styles.secText}>
                          {getDateString(item.date)}
                        </Text>
                        <View
                          style={{
                            flex: 1,
                            flexDirection: "row-reverse",
                            paddingHorizontal: 15 * ScaleFactor,
                          }}
                        >
                          <Text style={styles.supplementText}>
                            {/* {(item.amount * item.rate).toLocaleString(location, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) +
                        " " +
                        config.defaultCurrency} */}
                            {item.group_name}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <GestureHandlerRootView
                        style={{
                          paddingRight: 10 * ScaleFactor,
                        }}
                      >
                        <GestureDetector gesture={buttonGesture}>
                          <Animated.View
                            style={{
                              transform: [{ scale: animatedPressButton }],
                              alignItems: "center",
                              justifyContent: "center",
                              // paddingTop: 5 * ScaleFactor,
                            }}
                          >
                            <Feather
                              name="check"
                              size={30 * ScaleFactor}
                              color={accentColor}
                            />
                          </Animated.View>
                        </GestureDetector>
                      </GestureHandlerRootView>

                      {/* <CustomButton
                  onPressOut={() => {
                    // navigation.goBack();
                  }}
                  frameStyle={{
                    marginVertical: 2 * ScaleFactor,
                    marginRight: 0 * ScaleFactor,
                  }}
                  buttonStyle={{
                    height: 40 * ScaleFactor,
                    width: 40 * ScaleFactor,
                    borderRadius: 23,
                    // backgroundColor: plateColor,
                  }}
                >
                  <Feather
                    name="check"
                    size={30 * ScaleFactor}
                    color={accentColor}
                  />
                </CustomButton> */}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sessionTab: {
    // backgroundColor: plateColor,
    borderRadius: 20 * ScaleFactor,
    marginVertical: 8 * ScaleFactor,
    marginRight: 25 * ScaleFactor,
    marginLeft: 25 * ScaleFactor,
    height: 70 * ScaleFactor,
    flexDirection: "row",
    alignItems: "center",
  },
  sessionName: {
    color: "white",
    fontSize: 18 * ScaleFactor,
    fontWeight: "bold",
    // width: "25%",
  },
  amountText: {
    color: "white",
    fontSize: 20 * ScaleFactor,
    fontWeight: "500",
    // width: "25%",
  },
  secText: {
    color: "white",
    fontSize: 14 * ScaleFactor,
    fontWeight: "400",
    // width: "25%",
  },
  supplementText: {
    color: accentColor,
    fontSize: 14 * ScaleFactor,
    fontWeight: "400",
    // width: "25%",
  },
});
