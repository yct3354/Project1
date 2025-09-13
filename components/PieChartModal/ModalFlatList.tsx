import React, { memo, useEffect, useState, useRef } from "react";
import { View, Dimensions, Animated, ColorValue } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import FlatListItem from "./FlatListItem";
import { useSQLiteContext } from "expo-sqlite";
import SerialButton from "./SerialButton";
import FilterButton from "./FilterButton";
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
  Directions,
  FlatList,
} from "react-native-gesture-handler";
import { useSortedScreens } from "expo-router/build/useScreens";

const DW = Dimensions.get("window").width;
const DH = Dimensions.get("window").height;
const ScaleFactor = DW / 411.4286;

const sortList: string[] = ["Date", "Amount", "Title"];

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

interface ModalFlatListProps {
  tagText: string;
  // sortBy: string;
  // filterBy: string;
  hiddenState: boolean;
  setGlobalReload: any;
  ModalSlideOut: any;
}

const ModalFlatList = ({
  tagText,
  hiddenState,
  setGlobalReload,
  ModalSlideOut,
}: ModalFlatListProps) => {
  const db = useSQLiteContext();
  const [isLoading, setLoading] = useState(true);
  const [reload, setReload] = useState(false);
  const [groupedList, setGroupedList] = useState([]);
  const [sortMethod, setSortMethod] = useState("date");
  const [sortOrderMode, setSortOrderMode] = useState(0);
  const [filterState, setFilterState] = useState<number[]>([0, 0, 0, 0]);
  const [filterValue, setFilterValue] = useState<number>(100);
  const [fxTags, setFxTags] = useState<string[]>([]);
  const initSortState = [1, 0, 0];
  const initFilterState = [0, 0];

  const flatListRef = useRef<any>(null);
  const loadFade = useRef(new Animated.Value(0)).current;
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(false);

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

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
  ];

  const filterString = () => {
    let dateString = "";
    let hiddenString = "";
    let currencyString = "";
    let amountString = "";
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
    } else {
      dateString = ' AND date > "' + monthStartDate.toISOString() + '"';
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
    return dateString + hiddenString + currencyString + amountString;
  };
  const FadeIn = () => {
    Animated.timing(loadFade, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const FadeInFast = () => {
    Animated.timing(loadFade, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const FadeOut = () => {
    Animated.timing(loadFade, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (!isLoading) {
      FadeIn();
    }
  }, [isLoading]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      // console.log("Pan Started");
      // setScrollEnabled(true);
    })
    .onUpdate((e) => {
      // console.log(e.translationY);
      if (e.translationY < 0 && !scrollEnabled) {
        // console.log("scrollEnabled");
        // setScrollEnabled(true);
      }
    })
    .runOnJS(true);

  const GetGroupedList = async () => {
    try {
      return await db.getAllAsync(
        "SELECT * FROM record WHERE tag = ?" +
          filterString() +
          " " +
          "ORDER BY " +
          sortMethod.toLowerCase() +
          (sortOrderMode === 0 ? " DESC" : " ASC"),
        tagText
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const list: any = await GetFxTags();
        setFxTags(list.map((item: any) => item.currency));
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const list: any = await GetGroupedList();
      FadeOut();
      setGroupedList(list);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataNoAnim = async () => {
    try {
      const list: any = await GetGroupedList();
      // FadeOut();
      setGroupedList(list);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sortMethod, sortOrderMode, filterValue, filterState]);

  useEffect(() => {
    if (!isLoading) {
      fetchDataNoAnim();
      setGlobalReload(true);
    }
  }, [reload]);

  useEffect(() => {
    if (!isLoading) {
      if (reload) {
        scrollToTop();
        setReload(false);
      } else {
        FadeInFast();
        scrollToTop();
      }
    }
  }, [groupedList]);

  return (
    <View style={{ width: "100%", flex: 1 }}>
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
      />
      <View style={{ width: "100%", flex: 1 }}>
        <Animated.View
          style={{
            width: "100%",
            opacity: loadFade,
            height: "100%",
            // backgroundColor: "red",
          }}
        >
          <GestureHandlerRootView>
            <GestureDetector gesture={panGesture}>
              <FlatList
                data={groupedList}
                ref={flatListRef}
                // scrollEnabled={scrollEnabled}
                // onStartReached={() => setScrollEnabled(false)}
                // onRefresh={() => console.log("refreshing")}
                renderItem={({ item }) => (
                  <FlatListItem
                    item={item}
                    hiddenState={hiddenState}
                    setGlobalReload={setReload}
                  />
                )}
                keyExtractor={(item: any) => item._id}
                contentContainerStyle={{
                  width: "100%",
                  flexGrow: 0,
                }}
                windowSize={5}
                // onScroll={handleScroll}
                ListFooterComponent={
                  <View
                    style={{ width: "100%", height: 71 * ScaleFactor }}
                  ></View>
                }
                overScrollMode="always"
              />
            </GestureDetector>
          </GestureHandlerRootView>
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
      </View>
    </View>
  );
};

export default memo(ModalFlatList);
