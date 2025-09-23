import config from "@/components/config.json";
import CustomButton from "@/components/customButton";
import SessionTab from "@/components/Shared/SessionTab";
import * as SQLiteAPI from "@/components/SQLiteAPI";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ColorValue,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import UserBalance from "./UserBalance";

const DW = Dimensions.get("window").width;
const DH = Dimensions.get("window").height;
const ScaleFactor = DW / 412;
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

const emojiDictionary = require("emoji-dictionary");

const location = "en-US";

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

export default function SessionView({ route }: any) {
  const navigation = useNavigation<any>();
  const db = useSQLiteContext();
  const { group_id, user_group_id, group_name } = route.params;

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [groupInfo, setGroupInfo] = useState<any>({});
  const [sessionTable, setSessionTable] = useState([]);
  const [userNet, setUserNet] = useState<any>([]);
  const [tagList, setTagList] = useState([]);
  const [userSum, setUserSum] = useState(0);
  const [groupSum, setGroupSum] = useState(0);

  const loadFade = useRef(new Animated.Value(0)).current;
  const scrollProgress = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  const slideBarRange = 150;
  const leftBorderRadius = scrollProgress.interpolate({
    inputRange: [0, slideBarRange - 20],
    outputRange: [20, 0],
  });
  const rightBorderRadius = scrollProgress.interpolate({
    inputRange: [0, slideBarRange],
    outputRange: [0, 20],
  });

  const leftText = scrollProgress.interpolate({
    inputRange: [0, slideBarRange],
    outputRange: ["#000000", "#FFFFFF"],
  });
  const rightText = scrollProgress.interpolate({
    inputRange: [0, slideBarRange],
    outputRange: ["#FFFFFF", "#000000"],
  });

  const fetchData = async () => {
    const [tempInfo]: any = await SQLiteAPI.GetGroupInfo(db, group_id);
    const tableC: any = await SQLiteAPI.GetSessionByGroup(db, group_id);
    const [tempSum]: any = await SQLiteAPI.GetUserGroupSum(db, user_group_id);
    // console.log(tempSum);
    const tempNet: any = await SQLiteAPI.GetGroupUserNet(db, group_id);
    const tempTag: any = await SQLiteAPI.GetGroupTag(db, group_id);
    setGroupInfo(tempInfo);
    setSessionTable(tableC);
    setUserSum(tempSum.sum);
    setGroupSum(
      tableC.reduce((acc: number, item: any) => {
        return item.sum * item.rate + acc;
      }, 0)
    );
    setUserNet([
      ...tempNet.filter((item: any) => item.user_group_id === user_group_id),
      ...tempNet.filter((item: any) => item.user_group_id != user_group_id),
    ]);
    setTagList(tempTag);
    setLoading(false);
  };

  const FadeIn = () => {
    Animated.timing(loadFade, {
      toValue: 1,
      // delay: 5,
      duration: 300,
      // easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  };
  const FadeOut = () => {
    Animated.timing(loadFade, {
      toValue: 0,
      // delay: 5,
      duration: 300,
      // easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start(() => {});
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (refreshing) {
      // console.log("Loading...");
    } else {
      // console.log("Finished Loading.");
    }
  }, [refreshing]);

  useEffect(() => {
    if (!loading) {
      // setLoading(false);
      FadeIn();
    }
  }, [loading]);

  // useEffect(() => {
  //   if (!loading) {
  //     FadeIn();
  //   }
  // }, [loading]);

  return (
    <LinearGradient
      colors={[themeColor, topBarColor]}
      locations={[0.5, 0.5]}
      style={{ flex: 1 }}
    >
      <LinearGradient
        colors={[
          topBarColor,
          topBarColor,
          ...transparentFade(topBarColorS, 50, 255),
        ]}
        locations={[0, 0, ...linspace(0, 1, 50)]}
        style={styles.topBar}
      ></LinearGradient>
      {/* <SafeAreaView style={{ flex: 1 }}> */}
      <View style={{ height: StatusBar.currentHeight }}></View>
      <View
        style={{
          flex: 1,
          backgroundColor: themeColor,
          alignItems: "center",
          justifyContent: "center",

          overflow: "hidden",
          width: "100%",
        }}
      >
        <View
          style={{
            backgroundColor: themeColor,
            flex: 1,
          }}
        >
          <Animated.View style={{ opacity: loadFade, minHeight: "13%" }}>
            <View style={styles.titlePlate}>
              <Text style={{ ...styles.sumText, paddingTop: 10 * ScaleFactor }}>
                {emojiDictionary.getUnicode(groupInfo.emoji || " ")}
              </Text>
              <Text style={{ ...styles.sumText, paddingTop: 5 * ScaleFactor }}>
                {groupInfo.group_name || " "}
              </Text>
            </View>
          </Animated.View>
          <View>
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                marginBottom: 10 * ScaleFactor,
                minHeight: "18%",
              }}
            >
              <Animated.View
                style={{ ...styles.topLeftPlate, opacity: loadFade }}
              >
                <View style={styles.amountPlate}>
                  <Text style={styles.secText}>{"Your Expenditure"}</Text>
                  <Text style={styles.sumText}>
                    {userSum.toLocaleString(location, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) +
                      " " +
                      config.defaultCurrency}
                  </Text>
                </View>
                <View style={styles.amountPlate}>
                  <Text style={styles.secText}>{"Group Expenditure"}</Text>
                  <Text style={styles.sumText}>
                    {groupSum.toLocaleString(location, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) +
                      " " +
                      config.defaultCurrency}
                  </Text>
                </View>
              </Animated.View>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  paddingHorizontal: 20 * ScaleFactor,
                }}
              >
                <View style={{ justifyContent: "flex-end" }}>
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
                    <MaterialIcons
                      name="insights"
                      size={30 * ScaleFactor}
                      color={accentColor}
                    />
                  </CustomButton>
                  <CustomButton
                    onPressOut={() => {
                      // navigation.goBack();
                    }}
                    frameStyle={{
                      marginVertical: 2 * ScaleFactor,
                      marginRight: 2 * ScaleFactor,
                    }}
                    buttonStyle={{
                      height: 40 * ScaleFactor,
                      width: 40 * ScaleFactor,
                      borderRadius: 23,
                      // backgroundColor: plateColor,
                    }}
                  >
                    <MaterialIcons
                      name="person-add"
                      size={30 * ScaleFactor}
                      color={accentColor}
                    />
                  </CustomButton>
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
                      name="edit-2"
                      size={30 * ScaleFactor}
                      color={accentColor}
                    />
                  </CustomButton>
                </View>
              </View>
            </View>
            <View style={{ height: 40 * ScaleFactor, width: "100%" }}>
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                <View
                  style={{
                    width: slideBarRange * 2 * ScaleFactor,
                    borderRadius: 22,
                    borderWidth: 2,
                    borderColor: plateColor,
                    overflow: "hidden",
                    height: "100%",
                    justifyContent: "center",
                  }}
                >
                  <Animated.View
                    style={{
                      backgroundColor: accentColor,
                      // backgroundColor: "#EDCA40",
                      width: slideBarRange * ScaleFactor,
                      borderBottomLeftRadius: leftBorderRadius,
                      borderTopLeftRadius: leftBorderRadius,
                      borderBottomRightRadius: rightBorderRadius,
                      borderTopRightRadius: rightBorderRadius,
                      height: "100%",
                      transform: [{ translateX: scrollProgress }],
                    }}
                  ></Animated.View>
                  <TouchableOpacity
                    onPress={() =>
                      scrollRef?.current?.scrollTo({ animated: true, x: 0 })
                    }
                    style={{
                      width: "50%",
                      position: "absolute",
                      height: "100%",
                      left: "0%",
                      top: "0%",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Animated.Text
                      style={{
                        color: leftText,
                        fontWeight: "500",
                        fontSize: 17 * ScaleFactor,
                      }}
                    >
                      {"Transactions"}
                    </Animated.Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      scrollRef?.current?.scrollTo({ animated: true, x: DW })
                    }
                    style={{
                      width: "50%",
                      position: "absolute",
                      height: "100%",
                      left: "50%",
                      top: "0%",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Animated.Text
                      style={{
                        color: rightText,
                        fontWeight: "500",
                        fontSize: 17 * ScaleFactor,
                      }}
                    >
                      {"Balance"}
                    </Animated.Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
          <Animated.View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              width: DW,
              opacity: loadFade,
              // backgroundColor: "red",
            }}
          >
            <ScrollView
              horizontal={true}
              ref={scrollRef}
              style={{ width: "100%" }}
              snapToInterval={DW}
              onScroll={(event) => {
                scrollProgress.setValue(
                  (event.nativeEvent.contentOffset.x / DW) *
                    slideBarRange *
                    ScaleFactor
                );
              }}
              decelerationRate={0.92}
            >
              <View style={{ width: DW }}>
                <FlatList
                  data={sessionTable}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }: any) => (
                    <SessionTab
                      item={item}
                      sessionID={item.session_id}
                      user_group_id={user_group_id}
                      tagList={tagList}
                    />
                  )}
                  ListHeaderComponent={
                    <View
                      style={{ width: "100%", height: 10 * ScaleFactor }}
                    ></View>
                  }
                  ListFooterComponent={
                    <View
                      style={{ width: "100%", height: 120 * ScaleFactorVert }}
                    ></View>
                  }
                ></FlatList>
              </View>
              <View style={{ width: DW }}>
                <FlatList
                  data={userNet}
                  // style={{ width: "90%" }}
                  renderItem={({ item }: any) => (
                    <UserBalance
                      item={item}
                      self={item.user_group_id === user_group_id ? true : false}
                    />
                  )}
                  ListHeaderComponent={
                    <View
                      style={{ width: "100%", height: 10 * ScaleFactor }}
                    ></View>
                  }
                  ListFooterComponent={
                    <View
                      style={{ width: "100%", height: 120 * ScaleFactorVert }}
                    ></View>
                  }
                ></FlatList>
              </View>
            </ScrollView>
            <LinearGradient
              colors={[
                transparentC,
                transparentC,
                ...[...transparentFade(themeColor, 50, 255)].reverse(),
              ]}
              locations={[0, 0, ...linspace(0, 1, 50)]}
              start={[0, 1]}
              end={[0, 0]}
              style={{
                width: "100%",
                height: 20 * ScaleFactor,
                position: "absolute",
                top: "0%",
              }}
            ></LinearGradient>
          </Animated.View>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              // padding: 5 * ScaleFactor,
              position: "absolute",
              right: "3%",
              bottom: "5%",
            }}
          >
            <CustomButton
              onPressOut={() => {
                // navigation.popToTop();
              }}
              frameStyle={{ padding: 10 * ScaleFactor }}
              buttonStyle={{
                height: 54,
                width: 54,
                backgroundColor: plateColor,
                elevation: 5,
              }}
            >
              <Feather name="plus" size={36} color={accentColor} />
            </CustomButton>
          </View>
          <LinearGradient
            colors={[
              transparentC,
              transparentC,
              ...[...transparentFade(topBarColorS, 50, 255)].reverse(),
            ]}
            locations={[0, 0, ...linspace(0, 1, 50)]}
            style={{
              width: "100%",
              height: 50 * ScaleFactorVert,
              bottom: 0,
              position: "absolute",
              paddingHorizontal: 15 * ScaleFactor,
              paddingBottom: 10 * ScaleFactor,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CustomButton
              onPressOut={() => {
                navigation.popToTop();
              }}
              buttonStyle={{
                height: 60,
                width: 60,
              }}
            >
              <MaterialIcons name="person" size={30} color={accentColor} />
            </CustomButton>
          </LinearGradient>
          <View
            style={{
              width: "100%",
              paddingHorizontal: 20 * ScaleFactor,
              paddingTop: 15 * ScaleFactor,
              flexDirection: "row",
              position: "absolute",
              // top:'0%'
            }}
          >
            <CustomButton
              onPressOut={() => {
                navigation.goBack();
              }}
              buttonStyle={{
                height: 40 * ScaleFactor,
                width: 40 * ScaleFactor,
                borderRadius: 20,
                backgroundColor: plateColor,
              }}
            >
              <Feather
                name="arrow-left"
                size={24 * ScaleFactor}
                color={accentColor}
              />
            </CustomButton>
            <CustomButton
              onPressOut={() => {
                // navigation.goBack();
              }}
              frameStyle={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "flex-end",
                // backgroundColor: "red",
              }}
              buttonStyle={{
                height: 40 * ScaleFactor,
                width: 40 * ScaleFactor,
                borderRadius: 20,
                // backgroundColor: plateColor,
              }}
            >
              <Feather
                name="trash-2"
                size={30 * ScaleFactor}
                color={"#FF3B30"}
              />
            </CustomButton>
          </View>
        </View>
      </View>
      <View style={{ height: "1%" }}></View>
      {/* </SafeAreaView> */}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-start",
    backgroundColor: transparent,
    position: "absolute",
    // height: 50,
    height: StatusBar.currentHeight,
    width: "100%",
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 0,
  },
  titlePlate: {
    // paddingTop: 20 * ScaleFactor,
    justifyContent: "center",
    alignItems: "center",
  },
  topLeftPlate: {
    // width: "100%",
    // height: "30%",
    justifyContent: "center",
    paddingHorizontal: 25 * ScaleFactor,
    // paddingBottom: 5 * ScaleFactor,
  },
  amountPlate: {
    marginTop: 5 * ScaleFactor,
  },
  secText: {
    color: "white",
    fontWeight: "condensed",
    fontSize: 16 * ScaleFactor,
  },
  sumText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 35 * ScaleFactor,
  },
  titleInput: {
    // height: 38 * ScaleFactor,
    alignItems: "flex-end",
    justifyContent: "center",
    textAlign: "left",
    color: "white",
    fontWeight: "400",
    textAlignVertical: "center",
    borderBottomWidth: 2,
    // borderRadius: 10,
    // paddingHorizontal: 3 * ScaleFactor,
    paddingBottom: 0,
    paddingTop: 25 * ScaleFactor,
    // paddingVertical: 20 * ScaleFactor,
  },
});
