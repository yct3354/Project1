import Entypo from "@expo/vector-icons/Entypo";
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

interface GroupTabProps {
  item: any;
  groupID: any;
  userGroupID: any;
}

export default function GroupTab({
  item,
  groupID,
  userGroupID,
}: GroupTabProps) {
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
        ? navigation.navigate("SessionView", {
            group_id: groupID,
            user_group_id: userGroupID,
          })
        : {};
    });
  };

  const longPressTab = Gesture.LongPress()
    .onBegin(() => {
      runOnJS(pressInAnimation)();
    })
    .onFinalize((success) => {
      runOnJS(pressOutAnimation)(success);
    });

  const singleTapTab = Gesture.Tap().onEnd(() => {
    runOnJS(navigation.navigate)("SessionView", {
      group_id: groupID,
      user_group_id: userGroupID,
      group_name: item.group_name,
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
            <View style={styles.groupTab}>
              <View
                style={{
                  width: "20%",
                  // height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 40 * ScaleFactor }}>
                  {emojiDictionary.getUnicode(item.emoji)}
                </Text>
              </View>
              <Text style={styles.groupName}>{item.group_name}</Text>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row-reverse",
                  paddingHorizontal: 8 * ScaleFactor,
                }}
              >
                <Entypo color={accentColor} size={24} name={"chevron-right"} />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  groupTab: {
    // backgroundColor: plateColor,
    borderRadius: 10 * ScaleFactor,
    marginHorizontal: 15 * ScaleFactor,
    marginVertical: 10 * ScaleFactor,
    flexDirection: "row",
    alignItems: "center",
  },
  groupName: {
    color: "white",
    fontSize: 26 * ScaleFactor,
    fontWeight: "bold",
  },
});
