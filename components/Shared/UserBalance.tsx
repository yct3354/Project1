import config from "@/components/config.json";
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

const location = "en-US";

interface UserBalanceProps {
  item: any;
  self: boolean;
}

export default function UserBalance({ item, self }: UserBalanceProps) {
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
    }).start(() => {});
  };

  const longPressTab = Gesture.LongPress()
    .onBegin(() => {
      runOnJS(pressInAnimation)();
    })
    .onFinalize((success) => {
      runOnJS(pressOutAnimation)(success);
    });

  const singleTapTab = Gesture.Tap().onEnd(() => {
    // runOnJS(navigation.navigate)("SessionView", { group_id: groupID });
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
            <View style={styles.transactionTab}>
              <View style={{ height: "100%" }}>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    height: 60 * ScaleFactor,
                    width: 60 * ScaleFactor,
                    borderWidth: self ? 2 : 0,
                    borderColor: accentColor,
                    borderRadius: 30 * ScaleFactor,
                    backgroundColor: plateColor,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 36 * ScaleFactor,
                      textAlignVertical: "center",
                    }}
                  >
                    {emojiDictionary.getUnicode(item.emoji)}
                  </Text>
                </View>
              </View>
              <Text style={styles.transactionDetails}>
                {item.user_group_name}
              </Text>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row-reverse",
                  paddingHorizontal: 15 * ScaleFactor,
                }}
              >
                <Text
                  style={{
                    ...styles.sumText,
                    color: item.net >= 0 ? "white" : "#FF3B30",
                  }}
                >
                  {item.net.toLocaleString(location, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) +
                    " " +
                    config.defaultCurrency}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  transactionTab: {
    // backgroundColor: plateColor,
    borderRadius: 20 * ScaleFactor,
    marginVertical: 8 * ScaleFactor,
    paddingVertical: 5 * ScaleFactor,
    marginHorizontal: 20 * ScaleFactor,
    height: 65 * ScaleFactor,
    flexDirection: "row",
    alignItems: "center",
  },
  transactionDetails: {
    color: "white",
    fontSize: 20 * ScaleFactor,
    fontWeight: "bold",
    paddingLeft: 10 * ScaleFactor,
  },
  sumText: {
    fontWeight: "500",
    fontSize: 20 * ScaleFactor,
  },
});
