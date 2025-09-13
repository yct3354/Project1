import config from "@/components/config.json";
import CustomButton from "@/components/customButton";
import { LoginState } from "@/components/LoginProvider";
import * as ServerAPI from "@/components/ServerAPI";
import * as SQLiteAPI from "@/components/SQLiteAPI";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackActions, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { useSQLiteContext } from "expo-sqlite";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  ColorValue,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const db = useSQLiteContext();
  const { loginState, setLoginState } = useContext(LoginState);

  const [refreshing, setRefreshing] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [userpassword, setUserpassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loginUnsuccessful, setLoginUnsuccessful] = useState(false);
  const [signup, setSignup] = useState(false);
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [repeatPasswordHidden, setRepeatPasswordHidden] = useState(true);

  const [userGroupTable, setUserGroupTable] = useState([]);
  const [groupTable, setGroupTable] = useState([]);
  const [tagTable, setTagTable] = useState([]);
  const [sessionTable, setSessionTable] = useState([]);
  const [transactionTable, setTransactionTable] = useState([]);

  const loadFade = useRef(new Animated.Value(1)).current;

  const ClearAll = async () => {
    try {
      await db.getAllAsync(`DELETE FROM group_id_table`);
      await db.getAllAsync(`DELETE FROM user_group_id_table`);
      await db.getAllAsync(`DELETE FROM session_id_table`);
      // await db.getAllAsync(`DROP TABLE session_id_table`);
      await db.getAllAsync(`DELETE FROM transaction_table`);
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // const GetUserGroup = async () => {
  //   try {
  //     return await db.getAllAsync(`SELECT * FROM user_group_id_table`);
  //   } catch (error) {
  //     console.log(error);
  //     throw error;
  //   }
  // };

  // const GetGroup = async () => {
  //   try {
  //     return await db.getAllAsync(`SELECT * FROM group_id_table`);
  //   } catch (error) {
  //     console.log(error);
  //     throw error;
  //   }
  // };

  // const GetSessions = async () => {
  //   try {
  //     return await db.getAllAsync(`SELECT * FROM session_id_table`);
  //   } catch (error) {
  //     console.log(error);
  //     throw error;
  //   }
  // };

  // const GetTransactions = async () => {
  //   try {
  //     return await db.getAllAsync(`SELECT * FROM transaction_table`);
  //   } catch (error) {
  //     console.log(error);
  //     throw error;
  //   }
  // };

  const fetchData = async () => {
    const tableA: any = await SQLiteAPI.GetUserGroup(db);
    const tableB: any = await SQLiteAPI.GetGroup(db);
    const tableT: any = await SQLiteAPI.GetTags(db);
    const tableC: any = await SQLiteAPI.GetSessions(db);
    const tableD: any = await SQLiteAPI.GetTransactions(db);
    setUserGroupTable(tableA);
    setGroupTable(tableB);
    setTagTable(tableT);
    setSessionTable(tableC);
    setTransactionTable(tableD);
    // console.log(tableD);
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

  const syncAll = async () => {
    const delta: any = await ServerAPI.obtainDelta(
      groupTable,
      userGroupTable,
      tagTable,
      sessionTable,
      transactionTable
    );
    // console.log(delta.user_group_id_table);
    try {
      delta.user_group_id_table.update.length != 0
        ? await SQLiteAPI.UpdateUserGroup(db, delta.user_group_id_table.update)
        : {};
      delta.user_group_id_table.add.length != 0
        ? await SQLiteAPI.AddUserGroup(db, delta.user_group_id_table.add)
        : {};
      delta.user_group_id_table.remove.length != 0
        ? await SQLiteAPI.RemoveUserGroup(db, delta.user_group_id_table.remove)
        : {};
      delta.group_id_table.update.length != 0
        ? await SQLiteAPI.UpdateGroup(db, delta.group_id_table.update)
        : {};
      delta.group_id_table.add.length != 0
        ? await SQLiteAPI.AddGroup(db, delta.group_id_table.add)
        : {};
      delta.group_id_table.remove.length != 0
        ? await SQLiteAPI.RemoveGroup(db, delta.group_id_table.remove)
        : {};
      delta.tag_table.update.length != 0
        ? await SQLiteAPI.UpdateTag(db, delta.tag_table.update)
        : {};
      delta.tag_table.add.length != 0
        ? await SQLiteAPI.AddTag(db, delta.tag_table.add)
        : {};
      delta.tag_table.remove.length != 0
        ? await SQLiteAPI.RemoveTag(db, delta.tag_table.remove)
        : {};
      delta.session_id_table.update.length != 0
        ? await SQLiteAPI.UpdateSession(db, delta.session_id_table.update)
        : {};
      delta.session_id_table.add.length != 0
        ? await SQLiteAPI.AddSession(db, delta.session_id_table.add)
        : {};
      delta.session_id_table.remove.length != 0
        ? await SQLiteAPI.RemoveSession(db, delta.session_id_table.remove)
        : {};
      delta.transaction_table.update.length != 0
        ? await SQLiteAPI.UpdateTransaction(db, delta.transaction_table.update)
        : {};
      delta.transaction_table.add.length != 0
        ? await SQLiteAPI.AddTransaction(db, delta.transaction_table.add)
        : {};
      delta.transaction_tabletransaction_table.remove.length != 0
        ? await SQLiteAPI.RemoveTransaction(db, delta.transaction_table.remove)
        : {};
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };

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

  const clearData = async () => {
    await ClearAll();
  };

  const signUp = async (
    username: string,
    password: string,
    repeatPassword: string
  ) => {
    try {
      if (password != repeatPassword) {
        setLoginUnsuccessful(true);
        return;
      }
      const dataSend = { username: username, password: password };
      const response = await fetch(config.devURL + "/signup", {
        method: "POST",
        headers: { "Content-Type": "application/JSON" },
        body: JSON.stringify(dataSend),
      });
      const data = await response.json();
      if (data.message === "Sign up successful") {
        try {
          await SecureStore.setItemAsync("username", username);
          await SecureStore.setItemAsync("password", password);
          await AsyncStorage.setItem("token", data.token);
          setLoginState(true);
          setRefreshing(true);
          syncAll();
          // navigation.dispatch(StackActions.replace("GroupView"));
        } catch (error) {
          setLoginUnsuccessful(true);
          setManualLoading(false);
        }
      } else {
        setLoginUnsuccessful(true);
        setManualLoading(false);
      }
      console.log(data);
    } catch (error) {
      console.log(error);
      setManualLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const dataSend = { username: username, password: password };
      const response = await fetch(config.devURL + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/JSON" },
        body: JSON.stringify(dataSend),
      });
      const data = await response.json();
      if (data.message === "Login successful") {
        try {
          await SecureStore.setItemAsync("username", username);
          await SecureStore.setItemAsync("password", password);
          await AsyncStorage.setItem("token", data.token);
          setLoginUnsuccessful(false);
          setLoginState(true);
          setRefreshing(true);
          syncAll();
          // navigation.dispatch(StackActions.replace("GroupView"));
        } catch (error) {
          setLoginUnsuccessful(true);
          setManualLoading(false);
          console.log(error);
        }
      } else {
        setLoginUnsuccessful(true);
        setManualLoading(false);
      }
      console.log(data);
    } catch (error) {
      console.log(error);
      setManualLoading(false);
    }
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
    }).start(() => {
      setSignup(!signup);
      setLoginUnsuccessful(false);
    });
  };

  useEffect(() => {
    FadeIn();
  }, [signup]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (refreshing) {
      console.log("Loading...");
    } else {
      if (manualLoading) {
        console.log("Finished Loading.");
        navigation.dispatch(StackActions.replace("GroupView"));
      } else {
      }
    }
  }, [refreshing]);

  return (
    // <View style={{ flex: 1, backgroundColor: topBarColor }}>
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
          }}
        >
          <Animated.View
            style={{
              flex: 1,
              backgroundColor: themeColor,
              alignItems: "center",
              justifyContent: "center",
              width: "80%",
              opacity: loadFade,
            }}
          >
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                // paddingVertical: 25 * ScaleFactor,
                width: "80%",
                height: "4%",
                // backgroundColor: "red",
              }}
            >
              {loginUnsuccessful && (
                <Text style={{ color: "#FF3B30" }}>
                  {signup ? "Sign up unsuccessful" : "Login Unsuccessful"}
                </Text>
              )}
            </View>

            <View style={{ width: "100%" }}>
              <TextInput
                style={{
                  ...styles.titleInput,
                  fontSize: 22 * ScaleFactor,
                  width: "100%",
                  borderBottomColor: "white",
                }}
                placeholder={"Username"}
                onChangeText={setUsername}
                placeholderTextColor="#FFFFFF80"
                value={username}
              />
            </View>
            <View style={{ width: "100%" }}>
              <TextInput
                style={{
                  ...styles.titleInput,
                  fontSize: 22 * ScaleFactor,
                  width: "100%",
                  borderBottomColor: "white",
                }}
                secureTextEntry={passwordHidden}
                placeholder={"Password"}
                onChangeText={setUserpassword}
                placeholderTextColor="#FFFFFF80"
                value={userpassword}
              />
              <CustomButton
                onPressOut={() => {
                  setPasswordHidden(!passwordHidden);
                }}
                frameStyle={{ position: "absolute", right: "0%", top: "20%" }}
                buttonStyle={{
                  height: 40,
                  width: 40,
                  backgroundColor: transparent,
                }}
              >
                <Feather
                  name={!passwordHidden ? "eye" : "eye-off"}
                  size={24}
                  color={"#FFFFFF80"}
                />
              </CustomButton>
            </View>
            {signup && (
              <View style={{ width: "100%" }}>
                <TextInput
                  style={{
                    ...styles.titleInput,
                    fontSize: 22 * ScaleFactor,
                    width: "100%",
                    borderBottomColor: "white",
                  }}
                  secureTextEntry={repeatPasswordHidden}
                  placeholder={"Repeat Password"}
                  onChangeText={setRepeatPassword}
                  placeholderTextColor="#FFFFFF80"
                  value={repeatPassword}
                />
                <CustomButton
                  onPressOut={() => {
                    setRepeatPasswordHidden(!repeatPasswordHidden);
                  }}
                  frameStyle={{ position: "absolute", right: "0%", top: "20%" }}
                  buttonStyle={{
                    height: 40,
                    width: 40,
                    backgroundColor: transparent,
                  }}
                >
                  <Feather
                    name={!repeatPasswordHidden ? "eye" : "eye-off"}
                    size={24}
                    color={"#FFFFFF80"}
                  />
                </CustomButton>
              </View>
            )}

            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 25 * ScaleFactor,
                width: "80%",
              }}
            >
              <CustomButton
                onPressOut={() => {
                  setManualLoading(true);
                  signup
                    ? signUp(username, userpassword, repeatPassword)
                    : login(username, userpassword);
                }}
                frameStyle={{ width: "100%" }}
                buttonStyle={{
                  backgroundColor: plateColor,
                  paddingHorizontal: 15 * ScaleFactor,
                  paddingVertical: 10 * ScaleFactor,
                  borderColor: accentColor,
                  borderWidth: 2,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 18 * ScaleFactor,
                    fontWeight: "bold",
                  }}
                >
                  {signup ? "Sign up" : "Log In"}
                </Text>
              </CustomButton>
            </View>
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: "40%",
                paddingTop: 20 * ScaleFactor,
              }}
            >
              <CustomButton
                onPressOut={() => {
                  FadeOut();
                }}
                frameStyle={{ width: "100%" }}
                buttonStyle={{}}
              >
                <Text
                  style={{
                    color: "#007AFF",
                    fontSize: 16 * ScaleFactor,
                    fontWeight: "bold",
                  }}
                >
                  {!signup ? "Sign up" : "Log In"}
                </Text>
              </CustomButton>
            </View>
          </Animated.View>
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
});
