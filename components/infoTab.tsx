import React, { useRef, useState } from "react";
import {
  Text,
  StyleSheet,
  View,
  Animated,
  ColorValue,
  Dimensions,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  Pressable,
} from "react-native-gesture-handler";
import config from "@/components/config.json";
import ModifyEntryModal from "./ModifyEntryModal";
import Icons from "./Icons";
import { runOnJS } from "react-native-reanimated";

const accentColor = "#EFBF04"; //9D00FF, FF8000
const themeColor = "#1A1A16"; //1A1915
const topBarColor: ColorValue = "#615F55"; //292823
const topBarColorS = "#615F55"; //292823
const plateColor = "#45423A"; //474440
const hiddenColor = "#574141";
const transparent = "#00000000";

const location = "en-US";

const DW = Dimensions.get("window").width;
const DH = Dimensions.get("window").height;
const ScaleFactor = DW / 411.4286;
const shrinkFactor = 0.95;

interface infoTabProps {
  children?: any;
  onPress: any;
  plateStyle: any;
  item: any;
  hiddenState: boolean;
  setGlobalReload: any;
}

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

export default function InfoTab({
  children,
  onPress,
  plateStyle,
  item,
  hiddenState,
  setGlobalReload,
}: infoTabProps) {
  // const [pressed, setPressed] = useState(false);

  const animatedPress = useRef(new Animated.Value(1)).current;
  const [modalVisible, setModalVisible] = useState(false);
  // const [tapEnabled, setTapEnabled] = useState(false);
  let tapEnabled = false;

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
    }).start();
  };

  const singleTap = Gesture.Tap()
    .maxDuration(25000)
    .onStart(() => {
      runOnJS(setModalVisible)(true);
    });

  return (
    <View style={{ width: "100%", ...plateStyle }}>
      <GestureHandlerRootView style={{}}>
        <Pressable
          onPressIn={() => pressInAnimation()}
          onPressOut={() => {
            pressOutAnimation();
            // tapEnabled ? setModalVisible(true) : {};
          }}
        >
          <GestureDetector gesture={singleTap}>
            <View style={{ width: "100%" }}>
              <Animated.View
                style={{
                  opacity: item.hidden ? 0.5 : 1,
                  borderRadius: 20 * ScaleFactor,
                  padding: 10 * ScaleFactor,
                  ...styles.infoPlate,
                  width: "100%",
                  flexDirection: "row",
                  transform: [{ scale: animatedPress }],
                }}
              >
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    width: "15%",
                  }}
                >
                  <Icons
                    tagText={item.tag}
                    size={36 * ScaleFactor}
                    color={"white"}
                  ></Icons>
                </View>

                <View style={styles.textPlate}>
                  <View style={styles.titleBar}>
                    <View style={styles.titlePlate}>
                      <Text style={styles.titleText}>{item.title}</Text>
                    </View>
                    <View style={styles.amountPlate}>
                      <Text
                        style={styles.amountText}
                        numberOfLines={1}
                        adjustsFontSizeToFit={true}
                      >
                        {(hiddenState
                          ? "***"
                          : (item.direction === -1 ? "-" : "+") +
                            item.amount.toLocaleString(location, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })) +
                          " " +
                          item.currency}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.supplementPlate}>
                    <Text style={styles.supplementText}>
                      {getDateString(item.date)}
                    </Text>
                    <View style={styles.supplementAmountPlate}>
                      <Text style={styles.supplementAmount}>
                        {(hiddenState
                          ? "***"
                          : (item.direction === -1 ? "-" : "+") +
                            Math.abs(item.amount * item.rate).toLocaleString(
                              location,
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )) +
                          " " +
                          config.defaultCurrency}
                      </Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
              <ModifyEntryModal
                setModalVisibleParent={setModalVisible}
                modalVisibleParent={modalVisible}
                item={item}
                editable={false}
                addNew={false}
                setGlobalReload={setGlobalReload}
              />
            </View>
          </GestureDetector>
        </Pressable>
      </GestureHandlerRootView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    flex: 0.4,
    flexDirection: "row",
    justifyContent: "flex-start",
    // backgroundColor: "red",
  },
  titleText: {
    color: "white",
    fontSize: 20 * ScaleFactor,
    fontWeight: "500",
    paddingRight: 5,
  },
  amountPlate: {
    flex: 0.6,
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
  },
  amountText: {
    color: "white",
    fontSize: 20 * ScaleFactor,
    fontWeight: "500",
    paddingRight: 5,
  },
  supplementPlate: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  supplementText: {
    color: "white",
    fontSize: 14 * ScaleFactor,
    paddingTop: 5 * ScaleFactor,
    paddingLeft: 1,
  },
  supplementAmountPlate: {
    flex: 1,
    marginHorizontal: 5 * ScaleFactor,
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
  },
  supplementAmount: {
    textAlign: "right",
    color: accentColor,
    fontSize: 14 * ScaleFactor,
    paddingTop: 5 * ScaleFactor,
    paddingLeft: 1,
  },
});
