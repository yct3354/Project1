import CustomButton from "@/components/customButton";
import * as SQLiteAPI from "@/components/SQLiteAPI";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  ColorValue,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import GroupTab from "./GroupTab";
import IntegratedList from "./IntegratedList";

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

export default function GroupView() {
  const navigation = useNavigation<any>();
  const db = useSQLiteContext();

  const [refreshing, setRefreshing] = useState(false);

  const [signup, setSignup] = useState(false);

  const [groupTable, setGroupTable] = useState([]);
  const [unsortedTransaction, setUnsortedTransaction] = useState([]);
  const [tagList, setTagList] = useState([]);
  const [modifiedIndex, setModifiedIndex] = useState(-1);
  const [listLoaded, setListLoaded] = useState(false);

  const loadFade = useRef(new Animated.Value(0)).current;
  const listSlide = useRef(new Animated.Value(0)).current;

  const fetchData = async () => {
    try {
      const tableB: any = await SQLiteAPI.GetGroup(db);
      const tableD: any = await SQLiteAPI.GetUnsortedTransaction(db);
      const tableT: any = await SQLiteAPI.GetTags(db);
      setGroupTable(tableB);
      setUnsortedTransaction(tableD);
      setTagList(tableT);
    } catch (error) {
      console.log(error);
    } finally {
      setListLoaded(true);
    }
  };

  const scrapAll = () => {
    Animated.timing(listSlide, {
      toValue: DW * 2,
      duration: 150,
      // easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start(() => {
      setUnsortedTransaction([]);
    });
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
    if (modifiedIndex != -1) {
      const data = [...unsortedTransaction];
      data.splice(modifiedIndex, 1);
      setUnsortedTransaction(data);
      setModifiedIndex(-1);
    }
  }, [modifiedIndex]);

  useEffect(() => {
    if (listLoaded) {
      FadeIn();
    }
  }, [listLoaded]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
      return () => {
        FadeOut();
        setListLoaded(false);
      };
    }, [])
  );

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
            flex: 1,
            alignItems: "center",
            overflow: "hidden",
            width: "100%",
          }}
        >
          <View
            style={{
              width: "100%",
              paddingHorizontal: 20 * ScaleFactor,
              paddingVertical: 15 * ScaleFactor,
              flexDirection: "row",
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
          </View>
          <View
            style={{
              paddingBottom: 5 * ScaleFactor,
            }}
          >
            <View
              style={{
                paddingBottom: 5 * ScaleFactor,
                paddingHorizontal: 25 * ScaleFactor,
                width: "100%",
                justifyContent: "center",
                flexDirection: "row",
              }}
            >
              <View style={{}}>
                <Text style={styles.mainText}>{"To be sorted"}</Text>
              </View>
              <View
                style={{
                  flex: 1,
                  paddingLeft: 10 * ScaleFactor,
                  flexDirection: "row-reverse",
                }}
              >
                <CustomButton
                  onPressOut={() => {
                    scrapAll();
                  }}
                  frameStyle={{ paddingLeft: 10 * ScaleFactor }}
                  buttonStyle={{
                    height: 35 * ScaleFactor,
                    borderColor: accentColor,
                    borderWidth: 2,
                    flexDirection: "row",
                    paddingHorizontal: 10 * ScaleFactor,
                  }}
                >
                  <Text
                    style={{
                      color: "#FF3B30",
                      fontSize: 16 * ScaleFactor,
                      fontWeight: "500",
                    }}
                    numberOfLines={1}
                  >
                    {"Scrap All"}
                  </Text>
                </CustomButton>
                <CustomButton
                  onPressOut={() => {}}
                  frameStyle={{ paddingLeft: 10 * ScaleFactor }}
                  buttonStyle={{
                    height: 35 * ScaleFactor,
                    borderColor: accentColor,
                    borderWidth: 2,
                    flexDirection: "row",
                    paddingHorizontal: 10 * ScaleFactor,
                  }}
                >
                  <Text
                    style={{
                      color: accentColor,
                      fontSize: 16 * ScaleFactor,
                      fontWeight: "500",
                    }}
                    numberOfLines={1}
                  >
                    {"Accept All"}
                  </Text>
                </CustomButton>
              </View>
            </View>
            <Animated.View
              style={{
                opacity: loadFade,
              }}
            >
              <IntegratedList
                unsortedTransaction={unsortedTransaction}
                tagList={tagList}
                setModifiedIndex={setModifiedIndex}
                modifiedIndex={modifiedIndex}
                deleteSlide={listSlide}
              ></IntegratedList>
            </Animated.View>
          </View>
          <View
            style={{
              // flex: 1,
              paddingTop: 15 * ScaleFactor,
              width: "100%",
              // backgroundColor: "red",
              height: "55%",
              // alignItems: "flex-start",
            }}
          >
            <View style={{ paddingHorizontal: 25 * ScaleFactor }}>
              <Text style={styles.mainText}>{"Your groups"}</Text>
            </View>
            <Animated.View
              style={{
                // flex: 1,
                borderRadius: 20 * ScaleFactor,
                paddingVertical: 5 * ScaleFactor,
                marginHorizontal: 10 * ScaleFactor,
                opacity: loadFade,
                // backgroundColor: "red",
              }}
            >
              <FlatList
                data={groupTable}
                renderItem={({ item }: any) => (
                  <GroupTab
                    item={item}
                    groupID={item.group_id}
                    userGroupID={item.user_group_id}
                  />
                )}
              ></FlatList>
            </Animated.View>
          </View>
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
                navigation.navigate("AddGroup");
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
      </View>
      <View style={{ height: "1%" }}></View>
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
  mainText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 25 * ScaleFactor,
  },
});
