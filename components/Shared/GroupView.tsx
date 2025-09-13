import CustomButton from "@/components/customButton";
import IntegratedTab from "@/components/Shared/IntegratedTab";
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
  View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import GroupTab from "./GroupTab";

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

  const [username, setUsername] = useState("");
  const [userpassword, setUserpassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loginUnsuccessful, setLoginUnsuccessful] = useState(false);
  const [signup, setSignup] = useState(false);
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [repeatPasswordHidden, setRepeatPasswordHidden] = useState(true);

  const [userGroupTable, setUserGroupTable] = useState([]);
  const [groupTable, setGroupTable] = useState([]);
  const [unsortedTransaction, setUnsortedTransaction] = useState([]);
  const [tagList, setTagList] = useState([]);
  const [sessionTable, setSessionTable] = useState([]);
  const [transactionTable, setTransactionTable] = useState([]);

  const loadFade = useRef(new Animated.Value(1)).current;

  const fetchData = async () => {
    const tableB: any = await SQLiteAPI.GetGroup(db);
    const tableD: any = await SQLiteAPI.GetUnsortedTransaction(db);
    const tableT: any = await SQLiteAPI.GetTags(db);
    setGroupTable(tableB);
    setUnsortedTransaction(tableD);
    setTagList(tableT);
  };

  // const InsertUserGroup = async () => {
  //   try {
  //     await db.runAsync(
  //       `INSERT INTO user_group_id_table (group_id , timeStamp, user_group_id, user_group_name, user_id) VALUES  (?,?,?,?,?)`,
  //       [
  //         "74bbbe9e-68d6-40d4-ad13-0a41727c8a62",
  //         1757349756,
  //         "e8e4508c-dafc-4fc0-84d7-39a7c8e15061",
  //         "Zaire",
  //         "af1ae796-b3b4-40d2-9353-a2c14fc894a1",
  //       ]
  //     );
  //     fetchData();
  //   } catch (error) {
  //     console.log(error);
  //     throw error;
  //   }
  // };

  // const ChangeUserGroup = async () => {
  //   try {
  //     await db.runAsync(
  //       `UPDATE user_group_id_table SET group_id = ?, timeStamp = ?, user_group_id = ?, user_group_name = ?, user_id = ?`,
  //       [
  //         "74bbbe9e-68d6-40d4-ad13-0a41727c8a62",
  //         1757349750,
  //         "e8e4508c-dafc-4fc0-84d7-39a7c8e15001",
  //         "Zaire",
  //         "af1ae796-b3b4-40d2-9353-a2c14fc894a1",
  //       ]
  //     );
  //     fetchData();
  //   } catch (error) {
  //     console.log(error);
  //     throw error;
  //   }
  // };

  // const syncAll = async () => {
  //   const delta: any = await ServerAPI.obtainDelta(
  //     groupTable,
  //     userGroupTable,
  //     sessionTable,
  //     transactionTable
  //   );
  //   // console.log(delta.user_group_id_table.add);
  //   try {
  //     await SQLiteAPI.UpdateUserGroup(db, delta.user_group_id_table.update);
  //     await SQLiteAPI.AddUserGroup(db, delta.user_group_id_table.add);
  //     await SQLiteAPI.RemoveUserGroup(db, delta.user_group_id_table.remove);
  //     await SQLiteAPI.UpdateGroup(db, delta.group_id_table.update);
  //     await SQLiteAPI.AddGroup(db, delta.group_id_table.add);
  //     await SQLiteAPI.RemoveGroup(db, delta.group_id_table.remove);
  //     await SQLiteAPI.UpdateSession(db, delta.session_id_table.update);
  //     await SQLiteAPI.AddSession(db, delta.session_id_table.add);
  //     await SQLiteAPI.RemoveSession(db, delta.session_id_table.remove);
  //     await SQLiteAPI.UpdateTransaction(db, delta.transaction_table.update);
  //     await SQLiteAPI.AddTransaction(db, delta.transaction_table.add);
  //     await SQLiteAPI.RemoveTransaction(db, delta.transaction_id_table.remove);
  //   } catch (error) {
  //   } finally {
  //     setRefreshing(false);
  //   }
  // };

  // const ViewUserGroup = async () => {
  //   const tableA: any = await GetUserGroup();
  //   const tableB: any = await GetGroup();
  //   const tableC: any = await GetSessions();
  //   const tableD: any = await GetTransactions();
  //   setUserGroupTable(tableA);
  //   setGroupTable(tableB);
  //   setSessionTable(tableC);
  //   setTransactionTable(tableD);
  //   console.log(tableC.length);
  // };

  // const clearData = async () => {
  //   await ClearAll();
  // };

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
    }).start(() => {
      setSignup(!signup);
      setLoginUnsuccessful(false);
    });
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
      <SafeAreaView style={{ flex: 1 }}>
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
            </View>
            <View
              style={{
                // flex: 1,
                // alignItems: "center",
                paddingBottom: 5 * ScaleFactor,
              }}
            >
              <View
                style={{
                  // paddingBottom: 5 * ScaleFactor,
                  paddingHorizontal: 25 * ScaleFactor,
                  // width: "100%",
                  justifyContent: "center",
                  // backgroundColor: "red",
                }}
              >
                <Text style={styles.mainText}>{"To be sorted"}</Text>
              </View>
              <View
                style={{
                  height: DH * 0.27,
                  borderRadius: 20 * ScaleFactor,
                  marginBottom: 0 * ScaleFactor,
                  justifyContent: "center",
                }}
              >
                <FlatList
                  data={unsortedTransaction}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }: any) => (
                    <IntegratedTab item={item} tagList={tagList} />
                  )}
                ></FlatList>
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
                <LinearGradient
                  colors={[
                    transparentC,
                    transparentC,
                    ...[...transparentFade(themeColor, 50, 255)].reverse(),
                  ]}
                  locations={[0, 0, ...linspace(0, 1, 50)]}
                  start={[0, 0]}
                  end={[0, 1]}
                  style={{
                    width: "100%",
                    height: 20 * ScaleFactor,
                    position: "absolute",
                    bottom: "0%",
                  }}
                ></LinearGradient>
              </View>
            </View>
            <View
              style={{
                // flex: 1,
                paddingTop: 15 * ScaleFactor,
              }}
            >
              <View
                style={{
                  // paddingTop: 10 * ScaleFactor,
                  // paddingBottom: 10 * ScaleFactor,
                  width: "100%",
                  paddingHorizontal: 25 * ScaleFactor,
                }}
              >
                <Text style={styles.mainText}>{"Your groups"}</Text>
              </View>
              <View
                style={{
                  // height: DH * 0.45,
                  flex: 1,
                  // backgroundColor: plateColor,
                  borderRadius: 20 * ScaleFactor,
                  // marginHorizontal: 20 * ScaleFactor,
                  paddingVertical: 20 * ScaleFactor,
                  marginHorizontal: 10 * ScaleFactor,
                  // borderColor: accentColor,
                  // borderWidth: 2,
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
              </View>
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
      </SafeAreaView>
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
