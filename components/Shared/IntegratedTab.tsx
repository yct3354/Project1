import Feather from "@expo/vector-icons/Feather";
import { useNavigation } from "expo-router";
import { useRef } from "react";
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
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import CustomButton from "../customButton";

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

export default function IntegratedTab({ item, tagList }: GroupTabProps) {
  const animatedPress = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation<any>();

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

  const sessionEmoji = emojiDictionary.getUnicode(
    tagList.find((obj: any) => obj.tag_id === item.tag_id).emoji
  );
  // console.log(item);

  const longPressTab = Gesture.LongPress()
    .onBegin(() => {
      runOnJS(pressInAnimation)();
    })
    .onFinalize((success) => {
      runOnJS(pressOutAnimation)(success);
    });

  const singleTapTab = Gesture.Tap().onEnd(() => {
    runOnJS(navigation.navigate)("SessionDetails", {
      session_id: item.session_id,
      user_group_id: item.user_group_id,
    });
  });

  const tabGesture = Gesture.Simultaneous(singleTapTab, longPressTab);

  return (
    <GestureHandlerRootView style={{}}>
      <GestureDetector gesture={tabGesture}>
        <Animated.View
          style={{
            flexDirection: "row",
            transform: [{ scale: animatedPress }],
          }}
        >
          <TouchableOpacity activeOpacity={0.8} style={{ width: "100%" }}>
            <View style={styles.sessionTab}>
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
                  <Text style={styles.sessionName}>{item.session_name}</Text>
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
                  <Text style={styles.secText}>{getDateString(item.date)}</Text>
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
              <View style={{ flexDirection: "row" }}>
                <CustomButton
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
                </CustomButton>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  sessionTab: {
    // backgroundColor: plateColor,
    borderRadius: 20 * ScaleFactor,
    marginVertical: 8 * ScaleFactor,
    paddingVertical: 5 * ScaleFactor,
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
