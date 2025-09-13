import config from "@/components/config.json";
import ControlMenu from "@/components/ControlMenu";
import CustomButton from "@/components/customButton";
import FxList from "@/components/FxList/FxList";
import InfoTab from "@/components/infoTab";
import { LoginState } from "@/components/LoginProvider";
import ModifyEntryModal from "@/components/ModifyEntryModal";
import PieAutoPlot from "@/components/PieChartModal/PieChartRender";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useSQLiteContext } from "expo-sqlite";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  ColorValue,
  Dimensions,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DW = Dimensions.get("window").width;
const DH = Dimensions.get("window").height;
const ScaleFactor = DW / 411.4286;
const ScaleFactorVert = DH / 924;
const accentColor = "#EFBF04"; //9D00FF, FF8000
const themeColor = "#1A1A16"; //1A1915
const topBarColor: ColorValue = "#615F55"; //292823
const topBarColorS = "#615F55"; //292823
const plateColor = "#45423A"; //474440
const transparent = "#00000000";
const transparentC: ColorValue = "#00000000";
const standardShrinkFactor = 0.85;
const lowShrinkFactor = 0.95;

// Data Processing

const location = "en-US";

let currentDate = new Date();
let monthStartDate = new Date();
monthStartDate.setDate(1);
monthStartDate.setHours(0, 0, 0, 0);
let currentYear = currentDate.getFullYear();

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

const formatterUS = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

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

const dummyTagList = [{ id: 1, text: "N/A" }];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { loginState, setLoginState } = useContext(LoginState);

  const [isLoading, setLoading] = useState(true);
  const [isReloading, setReloading] = useState(false);
  const [LdataLoaded, setLdataLoaded] = useState(false);
  const [tagListLoaded, setTagListLoaded] = useState(false);
  const [sumLoaded, setSumLoaded] = useState(false);
  const [hiddenState, setHiddenState] = useState(false);
  const [tagList, setTagList] = useState<any>(dummyTagList);
  const [Ldata, setLdata] = useState<any>([]);
  const [totalSum, setTotalSum] = useState<number>(0);

  const loadFade = useRef(new Animated.Value(0)).current;
  const loadSlide = useRef(new Animated.Value(DH / 3)).current;

  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const isReloaded = LdataLoaded && tagListLoaded && sumLoaded;

  const db = useSQLiteContext();

  const GetUnique = async () => {
    try {
      return await db.getAllAsync(
        `SELECT DISTINCT tag FROM record WHERE tag <> "Foreign Exchange" AND direction = -1`
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const Get3Latest = async () => {
    try {
      return await db.getAllAsync(
        `SELECT * FROM record WHERE hidden = false AND tag <> "Foreign Exchange" ORDER BY date DESC LIMIT 3`
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const GetSum = async () => {
    try {
      return await db.getAllAsync(
        'SELECT IFNULL (SUM(amount*rate),0) AS value FROM record WHERE tag <> "Foreign Exchange" AND direction = -1 AND date >= "' +
          monthStartDate.toISOString() +
          '"'
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const fetchData = async () => {
    try {
      const LdataTemp = await Get3Latest();
      const TagListTemp = (await GetUnique()).map(
        (item: any, index: number) => ({
          id: index + 1,
          text: item.tag,
        })
      );
      const sumTemp: any = (await GetSum())[0];
      setLdata(LdataTemp);
      setTagList(TagListTemp);
      if (sumTemp.value === totalSum && !isLoading) {
        setSumLoaded(true);
      }
      setTotalSum(sumTemp.value);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    }).start();
  };

  const SlideIn = () => {
    Animated.timing(loadSlide, {
      toValue: 0,
      // delay: 5,
      duration: 300,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  };
  const SlideOut = () => {
    Animated.timing(loadSlide, {
      toValue: DH / 3,
      // delay: 5,
      duration: 300,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (!isLoading) {
      FadeIn();
      SlideIn();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isReloading) {
      FadeOut();
      SlideOut();
      setLdataLoaded(false);
      setTagListLoaded(false);
      setSumLoaded(false);
      fetchData();
    } else if (!isLoading) {
      FadeIn();
      SlideIn();
    }
  }, [isReloading]);

  useEffect(() => {
    if (!isLoading && isReloaded) {
      setReloading(false);
    }
  }, [isReloaded]);

  useEffect(() => {
    if (!LdataLoaded && !isLoading) {
      setLdataLoaded(true);
    }
  }, [Ldata]);

  useEffect(() => {
    if (!tagListLoaded && !isLoading) {
      setTagListLoaded(true);
    }
  }, [tagList]);

  useEffect(() => {
    if (!sumLoaded && !isLoading) {
      setSumLoaded(true);
    }
  }, [totalSum]);

  return (
    <View style={{ flex: 1, backgroundColor: topBarColor }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <ScrollView overScrollMode="always" style={styles.scrollPlate}>
            <View
              style={{
                flex: 1,
                justifyContent: "flex-start",
                alignItems: "center",
                // height: 1200,
                backgroundColor: themeColor,
              }}
            >
              <View style={styles.scrollOffset}></View>
              <View style={styles.topPlate}>
                <View style={styles.numberGrid}>
                  <View style={styles.numberPlate}>
                    <Text style={styles.mainTitle}>Monthly Expenditure</Text>
                    <Animated.Text
                      style={{ ...styles.mainAmount, opacity: loadFade }}
                    >
                      {hiddenState
                        ? "***"
                        : totalSum.toLocaleString(location, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }) +
                          " " +
                          config.defaultCurrency}
                    </Animated.Text>
                  </View>
                  <CustomButton
                    onPressOut={() => {
                      // console.log("+ Pressed");
                      setAddModalVisible(true);
                    }}
                    buttonStyle={{
                      height: 40,
                      width: 40,
                      backgroundColor: { transparent },
                    }}
                  >
                    <Feather name="plus" size={30} color={accentColor} />
                  </CustomButton>
                </View>
                <View style={styles.chartGrid}>
                  <View style={styles.chartPlate}>
                    <PieAutoPlot
                      width={DW}
                      initTagList={tagList}
                      hiddenState={hiddenState}
                      loadOpacity={loadFade}
                      isReloading={isReloading}
                      setGlobalReload={setReloading}
                    ></PieAutoPlot>
                  </View>
                </View>
              </View>
              <View style={styles.midBar}>
                <View style={styles.midLeftPlate}>
                  <Text style={styles.secTitle}>Latest Transactions</Text>
                </View>
                <View style={styles.midRightPlate}>
                  <CustomButton
                    onPressOut={() => {
                      navigation.navigate("FullList", { mode: "All" });
                    }}
                    buttonStyle={{
                      height: 30,
                      width: 80,
                      borderRadius: 20,
                      backgroundColor: plateColor,
                      paddingHorizontal: 10,
                    }}
                  >
                    <Text style={styles.secText}>See all</Text>
                  </CustomButton>
                </View>
              </View>
              <Animated.View
                style={{
                  width: "100%",
                  // opacity: loadFade,
                  transform: [{ translateY: loadSlide }],
                }}
              >
                {Ldata.map((LatestTransaction: any) => {
                  return (
                    <InfoTab
                      onPress={() => {}}
                      plateStyle={{
                        paddingHorizontal: 15,
                        paddingVertical: 5,
                      }}
                      item={LatestTransaction}
                      key={LatestTransaction._id}
                      hiddenState={hiddenState}
                      setGlobalReload={setReloading}
                    ></InfoTab>
                  );
                })}
              </Animated.View>
              <FxList
                hiddenState={hiddenState}
                loadSlide={loadSlide}
                isReloading={isReloading}
              ></FxList>
            </View>
          </ScrollView>
          <View style={styles.topBarBase}>
            <LinearGradient
              colors={[
                topBarColor,
                topBarColor,
                ...transparentFade(topBarColorS, 50, 255),
              ]}
              locations={[0, 0, ...linspace(0, 1, 50)]}
              style={styles.topBar}
            >
              <View style={styles.topLeftPlate}>
                <CustomButton
                  onPressOut={() => {
                    setMenuModalVisible(true);
                  }}
                  buttonStyle={{
                    height: 40,
                    width: 40,
                    backgroundColor: transparent,
                  }}
                >
                  <Feather name="menu" size={30} color={accentColor} />
                </CustomButton>
              </View>
              <View style={styles.topRightPlate}>
                <CustomButton
                  onPressOut={() => {
                    setHiddenState(!hiddenState);
                  }}
                  buttonStyle={{
                    height: 40,
                    width: 40,
                    backgroundColor: transparent,
                  }}
                >
                  <Feather
                    name={hiddenState ? "eye" : "eye-off"}
                    size={24}
                    color={accentColor}
                  />
                </CustomButton>
              </View>
            </LinearGradient>
            <ControlMenu
              modalVisibleParent={menuModalVisible}
              setModalVisibleParent={setMenuModalVisible}
              hiddenState={hiddenState}
              setReloading={setReloading}
            />
            <ModifyEntryModal
              setModalVisibleParent={setAddModalVisible}
              modalVisibleParent={addModalVisible}
              editable={true}
              addNew={true}
              setGlobalReload={setReloading}
            />
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
                loginState
                  ? navigation.navigate("GroupView")
                  : navigation.navigate("LoginScreen");
              }}
              buttonStyle={{
                height: 60,
                width: 60,
              }}
            >
              <MaterialIcons name="people-alt" size={30} color={accentColor} />
            </CustomButton>
          </LinearGradient>
        </View>
      </SafeAreaView>
      {/* </LinearGradient> */}
    </View>
  );
}

const styles = StyleSheet.create({
  topBarBase: {
    flex: 1,
    position: "absolute",
    height: 50 * ScaleFactorVert,
    width: "100%",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-start",
    backgroundColor: transparent,
    position: "absolute",
    height: 50 * ScaleFactorVert,
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
  scrollPlate: {
    flex: 1,
    backgroundColor: themeColor,
    width: DW,
  },
  scrollOffset: {
    backgroundColor: themeColor,
    height: 50 * ScaleFactorVert,
  },
  topPlate: {
    flexDirection: "column",
    alignContent: "center",
    // height: DW * 1.2,
    backgroundColor: "#00000000",
    width: "100%",
  },
  numberGrid: {
    flexDirection: "row",
    backgroundColor: "#00000000",
    paddingRight: 15 * ScaleFactor,
    paddingLeft: 20 * ScaleFactor,
    paddingTop: 10 * ScaleFactor,
    alignContent: "center",
    alignItems: "center",
    height: DW * 0.2,
    width: "100%",
  },
  numberPlate: {
    flex: 1,
    backgroundColor: "#00000000",
    justifyContent: "center",
    alignItems: "flex-start",
    height: "100%",
  },
  mainTitle: {
    color: "white",
    fontSize: 16 * ScaleFactor,
    fontWeight: "condensed",
    paddingLeft: 2,
  },
  mainAmount: {
    color: "white",
    fontSize: 35 * ScaleFactor,
    fontWeight: "bold",
  },
  chartGrid: {
    backgroundColor: "#00000000",
    paddingHorizontal: 20 * ScaleFactor,
    paddingVertical: 5 * ScaleFactor,
    height: DW - 10 * ScaleFactor,
    width: "100%",
  },
  chartPlate: {
    backgroundColor: plateColor, //505050ff 3B4747
    borderRadius: 20,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 24 * ScaleFactor,
    margin: 10,
  },
  midBar: {
    flexDirection: "row",
    justifyContent: "flex-start",
    // backgroundColor: "transparent",
    height: 50 * ScaleFactorVert,
    width: "100%",
    paddingLeft: 20 * ScaleFactor,
    paddingRight: 15 * ScaleFactor,
    marginTop: 5 * ScaleFactor,
  },
  midLeftPlate: {
    width: "80%",
    flexDirection: "column-reverse",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  midRightPlate: {
    width: "20%",
    flexDirection: "column-reverse",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  secTitle: {
    color: "white",
    fontSize: 25 * ScaleFactor,
    fontWeight: "bold",
    paddingLeft: 0,
  },
  secText: {
    color: accentColor,
    fontSize: 16 * ScaleFactor,
    fontWeight: "500",
  },
  item: {
    backgroundColor: plateColor,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
});
