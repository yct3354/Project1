import config from "@/components/config.json";
import CustomButton from "@/components/customButton";
import fx from "@/data/fx.json";
import generated from "@/data/generated.json";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import React, { memo, useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  ColorValue,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";
import uuid from "react-native-uuid";
import { LoginState } from "./LoginProvider";

const accentColor = "#EFBF04"; //9D00FF, FF8000
const themeColor = "#1A1A16"; //1A1915
const modalColor = "#181716";
const modalColorC: ColorValue = "#181716";
const topBarColor: ColorValue = "#615F55"; //292823
const topBarColorS = "#615F55"; //292823
const plateColorC: ColorValue = "#45423A"; //474440
const plateColor = "#45423A";
const transparent = "#00000000";
const transparentC: ColorValue = "#00000000";

const DW = Dimensions.get("window").width;
const DH = Dimensions.get("window").height;
const ScaleFactor = DW / 411.4286;

const location = "en-US";

import { useSQLiteContext } from "expo-sqlite";
import { useSharedValue } from "react-native-reanimated";

interface ControlMenuProps {
  modalVisibleParent: any;
  setModalVisibleParent: any;
  hiddenState: boolean;
  setReloading: any;
}
function ControlMenuModal({
  // PieData,
  modalVisibleParent,
  setModalVisibleParent,
  hiddenState,
  setReloading,
}: ControlMenuProps) {
  const db = useSQLiteContext();
  const start = useSharedValue(0);
  const navigation = useNavigation<any>();
  const { loginState, setLoginState } = useContext(LoginState);

  const [modalVisible, setModalVisble] = useState(false);

  const modalAppear = useRef(new Animated.Value(0)).current;
  const ModalIPColor = modalAppear.interpolate({
    inputRange: [0, 1],
    outputRange: ["#00000000", "#0000008C"],
  });

  const modalAnim = modalAppear.interpolate({
    inputRange: [0, 1],
    outputRange: [0, DH * 1],
  });

  const ModalSlideIn = (rebound: boolean) => {
    if (!rebound) {
      setModalVisble(true);
    }
    Animated.timing(modalAppear, {
      toValue: 1,
      duration: 300,
      delay: 50,
      useNativeDriver: true,
    }).start();
  };

  const ModalSlideOut = (post_action: any = () => {}) => {
    Animated.timing(modalAppear, {
      toValue: 0,
      duration: 300, // Animation duration in milliseconds
      useNativeDriver: true, // Use native driver for performance
    }).start(() => {
      setModalVisibleParent(false);
      setModalVisble(false);
      post_action;
    });
  };

  useEffect(() => {
    if (modalVisibleParent) {
      ModalSlideIn(false);
    }
  }, [modalVisibleParent]);

  const reloadFromJson = async () => {
    try {
      let today = new Date();
      db.withTransactionAsync(async () => {
        fx.map((item: any) => {
          db.runAsync(
            `INSERT INTO record (_id, amount, tag, currency, title, date, rate, hidden, direction) VALUES  (?,?,?,?,?,?,?,?,?)`,
            [
              uuid.v4(),
              item.balance,
              "Foreign Exchange",
              item.tag,
              "Initial Balance",
              today.toISOString(),
              item.rate,
              false,
              1,
            ]
          );
        });
        generated.map((item) => {
          db.runAsync(
            `INSERT INTO record (_id, amount, tag, currency, title, date, rate, hidden, direction) VALUES  (?,?,?,?,?,?,?,?,?)`,
            [
              item._id,
              item.amount,
              item.tag,
              item.currency,
              item.title,
              item.date,
              item.rate,
              item.hidden,
              item.direction,
            ]
          );
        });
      });
      // db.withTransactionAsync(async () => {
      //   generated.map((item) => {
      //     db.runAsync(
      //       `INSERT INTO record (_id, amount, tag, currency, title, date, rate, hidden, direction) VALUES  (?,?,?,?,?,?,?,?,?)`,
      //       [
      //         item._id,
      //         item.amount,
      //         item.tag,
      //         item.currency,
      //         item.title,
      //         item.date,
      //         item.rate,
      //         item.hidden,
      //         item.direction,
      //       ]
      //     );
      //   });
      // });
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  const deleteAll = async () => {
    try {
      await db.runAsync(`DELETE FROM record`);
      const now = new Date();
      await db.runAsync(
        `INSERT INTO record (_id, amount, tag, currency, title, date, rate, hidden, direction) VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          uuid.v4(),
          0,
          "Foreign Exchange",
          config.defaultCurrency,
          "Initial Balance",
          now.toISOString(),
          -1,
          false,
          1,
        ]
      );
    } catch (error) {
      console.log(error);
    }
  };

  const ClearAccData = async () => {
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

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await SecureStore.deleteItemAsync("username");
      await SecureStore.deleteItemAsync("password");
      ClearAccData();
      setLoginState(false);
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  return (
    <View
      style={{
        height: "100%",
        backgroundColor: "transparent",
        ...styles.centeredView,
      }}
    >
      <Modal
        style={{ margin: 0 }}
        statusBarTranslucent={true}
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          ModalSlideOut();
        }}
      >
        <Animated.View
          style={{
            ...styles.centeredView,
          }}
        >
          <Animated.View
            style={{
              backgroundColor: ModalIPColor,
              width: "100%",
              height: "100%",
            }}
          >
            <Animated.View
              style={{
                position: "absolute",
                top: -DH,
                left: 0,
                width: DW,
                height: DH,
                transform: [{ translateY: modalAnim }],
                flex: 1,
              }}
            >
              <View style={styles.modalView}>
                <View
                  style={{
                    width: "100%",
                    height: "100%",
                    alignItems: "center",
                  }}
                >
                  <View style={styles.bufferbar}></View>
                  <View style={styles.backBar}>
                    <CustomButton
                      onPressOut={() => {
                        ModalSlideOut();
                        // setReloading(true);
                      }}
                      frameStyle={{
                        borderRadius: 0,
                        marginVertical: 10 * ScaleFactor,
                        // backgroundColor: "red",
                      }}
                      buttonStyle={{ borderRadius: 0, flexDirection: "row" }}
                    >
                      <Feather name="arrow-up" size={36} color={accentColor} />
                    </CustomButton>
                  </View>
                  <View style={[styles.menuList]}>
                    <CustomButton
                      onPressOut={() => {
                        !loginState
                          ? ModalSlideOut(navigation.navigate("LoginScreen"))
                          : logout();
                      }}
                      frameStyle={{
                        borderRadius: 0,
                        marginVertical: 10 * ScaleFactor,
                      }}
                      buttonStyle={{ borderRadius: 0, flexDirection: "row" }}
                    >
                      <MaterialIcons
                        name="person"
                        size={24}
                        color={accentColor}
                      />
                      <Text style={styles.buttonText}>
                        {loginState ? "Logout" : "Login"}
                      </Text>
                    </CustomButton>
                    <CustomButton
                      onPressOut={() => console.log("Settings Pressed")}
                      frameStyle={{
                        borderRadius: 0,
                        marginVertical: 10 * ScaleFactor,
                      }}
                      buttonStyle={{ borderRadius: 0, flexDirection: "row" }}
                    >
                      <Feather name="settings" size={24} color={accentColor} />
                      <Text style={styles.buttonText}>Settings</Text>
                    </CustomButton>
                    <CustomButton
                      onPressOut={() => console.log("Help Pressed")}
                      frameStyle={{
                        borderRadius: 0,
                        marginVertical: 10 * ScaleFactor,
                      }}
                      buttonStyle={{ borderRadius: 0, flexDirection: "row" }}
                    >
                      <Feather
                        name="help-circle"
                        size={24}
                        color={accentColor}
                      />
                      <Text style={styles.buttonText}>Help</Text>
                    </CustomButton>
                    <CustomButton
                      onPressOut={() => {
                        deleteAll();
                        setReloading(true);
                      }}
                      frameStyle={{
                        borderRadius: 0,
                        marginVertical: 10 * ScaleFactor,
                      }}
                      buttonStyle={{ borderRadius: 0, flexDirection: "row" }}
                    >
                      <Feather name="trash-2" size={24} color={"#FF3B30"} />
                      <Text style={styles.buttonText}>Clear All Data</Text>
                    </CustomButton>
                    <CustomButton
                      onPressOut={() => {
                        setReloading(true);
                      }}
                      frameStyle={{
                        borderRadius: 0,
                        marginVertical: 10 * ScaleFactor,
                      }}
                      buttonStyle={{ borderRadius: 0, flexDirection: "row" }}
                    >
                      <Feather
                        name="refresh-cw"
                        size={24}
                        color={accentColor}
                      />
                      <Text style={styles.buttonText}>{"Reload Data"}</Text>
                    </CustomButton>
                    <CustomButton
                      onPressOut={() => {
                        deleteAll();
                        reloadFromJson();
                        setReloading(true);
                      }}
                      frameStyle={{
                        borderRadius: 0,
                        marginVertical: 10 * ScaleFactor,
                      }}
                      buttonStyle={{ borderRadius: 0, flexDirection: "row" }}
                    >
                      <FontAwesome6
                        name="file-import"
                        size={24}
                        color={accentColor}
                      />
                      <Text style={styles.buttonText}>
                        {"Import Data (Developer)"}
                      </Text>
                    </CustomButton>
                  </View>
                </View>
                {/* </LinearGradient> */}
              </View>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flexDirection: "row",
    justifyContent: "flex-start",
    backgroundColor: transparent,
    // position: "absolute",
    height: "100%",
    width: "100%",
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 0,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    flexDirection: "column",
    margin: 0,
    height: "100%",
    backgroundColor: transparent,
    padding: 0,
    alignItems: "center",
  },
  bufferbar: {
    width: "100%",
    height: "20%",
  },
  backBar: {
    width: "100%",
    height: "8%",
    alignItems: "flex-start",
    flexDirection: "row-reverse",
    paddingHorizontal: 25 * ScaleFactor,
  },
  menuList: {
    width: "80%",
    height: "40%",
    // backgroundColor: "#181716ce",
    backgroundColor: modalColor,
    borderRadius: 20 * ScaleFactor,
    paddingVertical: 10 * ScaleFactor,
  },
  buttonBackground: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: transparent,
    // position: "absolute",
    // height: "100%",
    width: "100%",
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 0,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginTop: 5 * ScaleFactor,
    textAlign: "left",
    color: "white",
    fontWeight: "bold",
    fontSize: 24 * ScaleFactor,
    flex: 1,
  },
  amountText: {
    marginVertical: 5 * ScaleFactor,
    textAlign: "left",
    color: "white",
    fontWeight: "bold",
    fontSize: 30 * ScaleFactor,
    flex: 1,
  },
  secTitleText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 24 * ScaleFactor,
    textAlignVertical: "center",
    paddingRight: 10 * ScaleFactor,
  },
  buttonText: {
    color: "white",
    fontSize: 22 * ScaleFactor,
    textAlign: "center",
    fontWeight: "500",
    marginHorizontal: 10 * ScaleFactor,
    textAlignVertical: "center",
    // backgroundColor: "red",
  },
  modalButtonFrameStyle: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5 * ScaleFactor,
    minWidth: 80 * ScaleFactor,
    minHeight: 30 * ScaleFactor,
  },
});

export default memo(ControlMenuModal);
