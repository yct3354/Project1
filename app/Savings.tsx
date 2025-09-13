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

import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import FlatListItem from "@/components/PieChartModal/FlatListItem";
import { LinearGradient } from "expo-linear-gradient";
// import * as Reanimated from '@/components/Reanimated'
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  ReduceMotion,
} from "react-native-reanimated";
import CustomButton from "@/components/customButton";
import { StatusBar } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import FilterButton from "@/components/FullList/FilterButton";
import SerialButton from "@/components/FullList/SerialButton";
import ExtendingTextBar from "@/components/ExtendingTextBar";
// console.log('statusBarHeight: ', StatusBar.currentHeight);

const DW = Dimensions.get("window").width;
const DH = Dimensions.get("window").height;
const ScaleFactor = DW / 412;
const ScaleFactorVert = DH / 924;
const accentColor = "#EFBF04"; //9D00FF, FF8000
const themeColor = "#1A1A16"; //1A1915
const topBarColor: ColorValue = "#615F55"; //292823
const topBarColorS = "#615F55"; //292823
const plateColor = "#45423A"; //474440
const transparent = "#00000000";
const transparentC: ColorValue = "#00000000";

let oneWeekAgo = new Date(); // Get today's date
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // Subtract 14 days
let twoWeeksAgo = new Date(); // Get today's date
twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14); // Subtract 14 days
let oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
let twoMonthsAgo = new Date();
twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
let oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

let monthStartDate = new Date();
monthStartDate.setDate(1);
monthStartDate.setHours(0, 0, 0, 0);

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

export default function Savings() {
  const db = useSQLiteContext();
  const navigation = useNavigation<any>();
  const flatListRef = useRef<any>(null);
  const [searchPlaceholder, setSearchPlaceholder] = useState("Search");
  const [search, setSearch] = useState("");
  const [fullList, setFullList] = useState<any>([]);
  const [isLoading, setLoading] = useState(true);
  const [reload, setReload] = useState(false);

  const sortList: string[] = ["Date", "Amount", "Title"];

  const [sortMethod, setSortMethod] = useState("date");
  const [sortOrderMode, setSortOrderMode] = useState(0);
  const [filterState, setFilterState] = useState<number[]>([0, 0, 0, 0, 0]);
  const [filterValue, setFilterValue] = useState<number>(100);
  const [fxTags, setFxTags] = useState<string[]>([]);
  const [tagList, setTagList] = useState<string[]>([]);
  const [searchBarState, setSearchBarState] = useState(false);

  const initSortState = [1, 0, 0];
  const initFilterState = [0, 0];

  // const loadFade = useRef(new Animated.Value(0)).current;
  const loadFade = useSharedValue(0);
  const titleLoadFade = useSharedValue(1);
  const searchBarWidth = useSharedValue<any>("28%");

  const FadeIn = () => {
    loadFade.value = withTiming(1, {
      duration: 300,
    });
  };

  const FadeInFast = () => {
    loadFade.value = withTiming(1, {
      duration: 100,
    });
  };

  const FadeOut = () => {
    loadFade.value = withTiming(0, {
      duration: 300,
    });
  };

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

  const handleSearchBar = () => {
    if (searchBarState) {
      searchBarWidth.value = "28%";
      titleFadeIn();
      setSearch("");
    } else {
      searchBarWidth.value = "100%";
      titleFadeOut();
    }
    setSearchBarState(!searchBarState);
  };

  const searchBarAnimation = useAnimatedStyle(() => ({
    width: withTiming(searchBarWidth.value, {
      duration: 300,
      easing: Easing.bezier(0.69, 0, 0.19, 1),
      reduceMotion: ReduceMotion.System,
    }),
  }));

  const filterList: string[][] = [
    [
      "Last ...",
      "Last Week",
      "Last 2 Weeks",
      "Last Month",
      "Last 2 Months",
      "Last Year",
    ],
    ["Hidden ...", "Hidden Shown", "Hidden Only"],
    ["Currency", ...fxTags],
    ["Amount <", "Amount <", "Amount >"],
    ["Categories", ...tagList],
  ];

  const filterString = () => {
    let dateString = "";
    let hiddenString = "";
    let currencyString = "";
    let amountString = "";
    let tagString = "";
    if (filterState[0] != 0) {
      switch (filterState[0] - 1) {
        case 0: {
          dateString = ' AND date > "' + oneWeekAgo.toISOString() + '"';
          break;
        }
        case 1: {
          dateString = ' AND date > "' + twoWeeksAgo.toISOString() + '"';
          break;
        }
        case 2: {
          dateString = ' AND date > "' + oneMonthAgo.toISOString() + '"';
          break;
        }
        case 3: {
          dateString = ' AND date > "' + twoMonthsAgo.toISOString() + '"';
          break;
        }
        case 4: {
          dateString = ' AND date > "' + oneYearAgo.toISOString() + '"';
          break;
        }
      }
    }
    if (filterState[1] != 0) {
      switch (filterState[1] - 1) {
        case 0: {
          hiddenString = "";
          break;
        }
        case 1: {
          hiddenString = " AND hidden = true";
          break;
        }
      }
    } else {
      hiddenString = " AND hidden = false";
    }
    if (filterState[2] != 0) {
      currencyString = ' AND currency = "' + fxTags[filterState[2] - 1] + '"';
    }
    if (filterState[3] != 0) {
      switch (filterState[3] - 1) {
        case 0: {
          amountString = " AND amount <= " + filterValue;
          break;
        }
        case 1: {
          amountString = " AND amount >= " + filterValue;
          break;
        }
      }
    }
    if (filterState[4] != 0) {
      tagString = ' AND tag = "' + tagList[filterState[4] - 1] + '"';
    }
    return (
      dateString + hiddenString + currencyString + amountString + tagString
    );
  };

  const searchString = () => {
    let string = "";
    if (searchBarState && search != "") {
      string = ' AND title LIKE "%' + search + '%" ';
    } else {
      string = " ";
    }
    return string;
  };

  const GetFullList = async () => {
    try {
      return await db.getAllAsync(
        "SELECT * FROM record WHERE _id <> '0'" +
          filterString() +
          searchString() +
          "ORDER BY " +
          sortMethod.toLowerCase() +
          (sortOrderMode === 0 ? " DESC" : " ASC")
      );
    } catch (error) {
      console.log(error);
    }
  };

  const GetFxTags = async () => {
    try {
      return await db.getAllAsync("SELECT DISTINCT currency FROM record");
    } catch (error) {
      console.log(error);
    }
  };

  const GetUniqueTags = async () => {
    try {
      return await db.getAllAsync(`SELECT DISTINCT tag FROM record`);
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const fetchInitData = async () => {
    try {
      const list: any = await GetFullList();
      const fxList: any = await GetFxTags();
      const tagList: any = await GetUniqueTags();
      setFxTags(fxList.map((item: any) => item.currency));
      setTagList(tagList.map((item: any) => item.tag));
      setFullList(list);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitDataNoAnim = async () => {
    try {
      const list: any = await GetFullList();
      const fxList: any = await GetFxTags();
      const tagList: any = await GetUniqueTags();
      setFxTags(fxList.map((item: any) => item.currency));
      setTagList(tagList.map((item: any) => item.tag));
      setFullList(list);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const list: any = await GetFullList();
      FadeOut();
      setFullList(list);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      FadeIn();
    }
  }, [isLoading]);

  useEffect(() => {
    fetchInitData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [sortMethod, sortOrderMode, filterValue, filterState, search]);

  useEffect(() => {
    if (!isLoading) {
      fetchInitDataNoAnim();
      // setGlobalReload(true);
    }
  }, [reload]);

  useEffect(() => {
    if (!isLoading) {
      if (reload) {
        setReload(false);
      } else {
        FadeInFast();
      }
    }
  }, [fullList]);

  return (
    <View style={styles.background}>
      <LinearGradient
        colors={[
          topBarColor,
          topBarColor,
          ...transparentFade(topBarColorS, 50, 255),
        ]}
        locations={[0, 0, ...linspace(0, 1, 50)]}
        style={styles.topBar}
      ></LinearGradient>
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            backgroundColor: themeColor,
            flex: 1,
          }}
        >
          <View style={{ width: "100%", height: "35%" }}>
            <View
              style={{
                width: "100%",
                paddingVertical: 5 * ScaleFactor,
                marginHorizontal: 20,
              }}
            >
              <CustomButton
                onPressOut={() => {
                  navigation.popToTop();
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
                paddingHorizontal: 20 * ScaleFactor,
                paddingVertical: 5 * ScaleFactor,
                flexDirection: "row",
              }}
            >
              <ExtendingTextBar
                titleText={"All Transactions"}
                enabled={true}
                placeholder="Search"
                initWidth="28%"
                titleTextStyle={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 35 * ScaleFactorVert,
                }}
                barTextStyle={{
                  fontSize: 18 * ScaleFactor,
                  paddingRight: 8 * ScaleFactor,
                }}
                setTextParent={setSearch}
                setSelfStateEnabled={setSearchBarState}
                iconSize={24 * ScaleFactor}
                primaryIcon={"search"}
                closeIcon={"x"}
                secondary={false}
              />
            </View>
            <SerialButton
              itemList={sortList}
              initList={initSortState}
              title="Sort By"
              setSerialState={setSortMethod}
              setOrderModeParent={setSortOrderMode}
            />
            <FilterButton
              itemList={filterList}
              initList={initFilterState}
              title="Filter:"
              setFilterValueParent={setFilterValue}
              setFilterStateParent={setFilterState}
              fxFilterInit={-1}
            />
          </View>
          <Animated.View style={{ flex: 1, opacity: loadFade }}>
            <FlatList
              data={fullList}
              ref={flatListRef}
              renderItem={({ item }) => (
                <FlatListItem
                  item={item}
                  hiddenState={false}
                  setGlobalReload={setReload}
                />
              )}
              keyExtractor={(item: any) => item._id}
              contentContainerStyle={{
                width: "100%",
                flexGrow: 0,
              }}
              windowSize={5}
              ListHeaderComponent={
                <View
                  style={{ width: "100%", height: 15 * ScaleFactor }}
                ></View>
              }
              ListFooterComponent={
                <View
                  style={{ width: "100%", height: 71 * ScaleFactor }}
                ></View>
              }
              overScrollMode="always"
            />
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
                height: "5%",
                position: "absolute",
                top: "0%",
              }}
            ></LinearGradient>
          </Animated.View>
          <LinearGradient
            colors={[
              transparentC,
              transparentC,
              ...[...transparentFade(themeColor, 50, 255)].reverse(),
            ]}
            locations={[0, 0, ...linspace(0, 1, 50)]}
            style={{
              width: "100%",
              height: "3%",
              position: "absolute",
              top: "97%",
            }}
          ></LinearGradient>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    // width: DW,
    // height: DH,
    flex: 1,
    backgroundColor: themeColor,
  },
  topBarBase: {
    flex: 1,
    position: "absolute",
    height: 50,
    width: "100%",
  },
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
  topLeftPlate: {
    flex: 1,
    flexDirection: "column-reverse",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  topRightPlate: {
    flex: 1,
    flexDirection: "column-reverse",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  titleText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 35 * ScaleFactor,
  },
  searchBar: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
    position: "absolute",
    right: "0%",
    height: "100%",
    paddingVertical: 0 * ScaleFactor,
  },
  searchText: {
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
