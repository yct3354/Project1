import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ColorValue,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import config from "@/components/config.json";
import CustomButton from "@/components/customButton";
import { fxIndexMap } from "@/components/fxIndexMap";
import images from "@/components/Images";
import fxRef from "@/data/fxRef.json";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import { useSQLiteContext } from "expo-sqlite";
import uuid from "react-native-uuid";

/**
 * Parse a localized number to a float.
 * @param {string} stringNumber - the localized number
 * @param {string} locale - [optional] the locale that the number is represented in. Omit this parameter to use the current locale.
 */
function parseLocaleNumber(stringNumber: string, locale: string) {
  var thousandSeparator = Intl.NumberFormat(locale)
    .format(11111)
    .replace(/\p{Number}/gu, "");
  var decimalSeparator = Intl.NumberFormat(locale)
    .format(1.1)
    .replace(/\p{Number}/gu, "");

  return parseFloat(
    stringNumber
      .replace(new RegExp("\\" + thousandSeparator, "g"), "")
      .replace(new RegExp("\\" + decimalSeparator), ".")
  );
}

const accentColor = "#EFBF04"; //9D00FF, FF8000
const themeColor = "#1A1A16"; //1A1915
const modalColor = "#181716ff";
const topBarColor: ColorValue = "#615F55"; //292823
const topBarColorS = "#615F55"; //292823
const plateColor = "#45423A"; //474440
const transparent = "#00000000";

const DW = Dimensions.get("window").width;
const DH = Dimensions.get("window").height;
const ScaleFactor = DW / 411.4286;

const location = "en-US";

interface ChangeBalanceModalProps {
  setModalVisibleParent: any;
  modalVisibleParent: any;
  tag: string;
  setRefresh: any;
}

const formatterUS = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function ChangeBalanceModal({
  setModalVisibleParent,
  modalVisibleParent,
  tag,
  setRefresh,
}: ChangeBalanceModalProps) {
  const db = useSQLiteContext();
  const [modalVisible, setModalVisble] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const modalAppear = useRef(new Animated.Value(0)).current;
  const ModalIPColor = modalAppear.interpolate({
    inputRange: [0, 1],
    outputRange: ["#00000000", "#0000008c"],
  });

  const modalAnim = modalAppear.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -DH * 0.75],
  });

  const ModalSlideIn = (rebound: boolean) => {
    if (!rebound) {
      setModalVisble(true);
    }
    Animated.timing(modalAppear, {
      toValue: 1,
      duration: 300,
      delay: 5,
      useNativeDriver: true,
    }).start();
  };

  const ModalSlideOut = () => {
    Animated.timing(modalAppear, {
      toValue: 0,
      duration: 300, // Animation duration in milliseconds
      useNativeDriver: true, // Use native driver for performance
    }).start(() => {
      setModalVisibleParent(false);
      setModalVisble(false);
    });
  };

  useEffect(() => {
    if (modalVisibleParent) {
      ModalSlideIn(false);
      fetchData();
    }
  }, [modalVisibleParent]);

  const [primaryOriginal, setPrimaryOriginal] = useState<any>(fxRef[0]);
  const [secondaryOriginal, setSecondaryOriginal] = useState<any>(fxRef[1]);

  const [primaryAmount, onChangePrimaryAmount] = useState("");
  const [secondaryAmount, onChangeSecondaryAmount] = useState("");
  const [primaryPlaceholder, setPrimaryPlaceholder] = useState(
    formatterUS.format(0)
  );
  const [secondaryPlaceholder, setSecondaryPlaceholder] = useState(
    formatterUS.format(0)
  );
  const [conversionMode, setConversionMode] = useState(0);
  const [secondaryCurrency, setSecondaryCurrency] = useState(
    config.defaultCurrency
  );

  const [fxTags, setFxTags] = useState<string[]>([]);

  const GetFxTags = async () => {
    try {
      return await db.getAllAsync("SELECT DISTINCT currency FROM record");
    } catch (error) {
      console.log(error);
    }
  };

  const getFxBalance = async (tag: string) => {
    try {
      return await db.getAllAsync(
        "SELECT SUM(amount*direction) AS balance, rate, currency FROM record WHERE currency = ? GROUP BY currency",
        tag
      );
    } catch (error) {
      throw error;
    }
  };

  const fetchData = async () => {
    try {
      const primary: any = await getFxBalance(tag);
      const list: any = await GetFxTags();
      const secondary: any = await getFxBalance(secondaryCurrency);
      setPrimaryOriginal(primary[0]);
      setSecondaryOriginal(secondary[0]);
      let re_list = list.map((item: any) => item.currency);
      setSelectedIndex(re_list.indexOf(secondaryCurrency));
      setFxTags(re_list);
    } catch (error) {
      throw error;
    } finally {
    }
  };

  const fetchSecondaryData = async (tag: string) => {
    try {
      const secondary: any = await getFxBalance(tag);
      setSecondaryOriginal(secondary[0]);
    } catch (error) {
    } finally {
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const primaryFinalBalance =
    primaryOriginal.balance +
    (conversionMode === 1 ? -1 : 1) *
      (primaryAmount === "" ? 0 : parseLocaleNumber(primaryAmount, location));
  const secondaryFinalBalance =
    secondaryOriginal.balance +
    (conversionMode === 0 ? -1 : conversionMode === 2 ? 0 : 1) *
      (secondaryAmount === ""
        ? 0
        : parseLocaleNumber(secondaryAmount, location));

  const rateDivision = (secondary: boolean) => {
    if (primaryAmount === "" || secondaryAmount === "") return "- - -";
    else {
      if (secondary) {
        return "1";
      } else {
        let P1 = parseLocaleNumber(primaryAmount, location);
        let P2 = parseLocaleNumber(secondaryAmount, location);
        if (P1 != 0 && P2 != 0) return (P2 / P1).toFixed(4);
        else return "-1";
      }
    }
  };

  const setFxBalance = async (
    currency: string,
    titleSet: string,
    direction: number,
    amount: number,
    secondary: boolean
  ) => {
    try {
      const now = new Date();
      return await db.runAsync(
        `INSERT INTO record (_id, amount, tag, currency, title, date, rate, hidden, direction) VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          uuid.v4(),
          amount,
          "Foreign Exchange",
          currency,
          titleSet,
          now.toISOString(),
          rateDivision(secondary) === "- - -" ? 0 : rateDivision(secondary),
          false,
          direction,
        ]
      );
    } catch (error) {
      console.log(error);
    }
  };

  const saveChanges = () => {
    let primary =
      // (conversionMode === 1 ? -1 : 1) *
      primaryAmount === "" ? 0 : parseLocaleNumber(primaryAmount, location);
    let secondary =
      // (conversionMode === 0 ? -1 : conversionMode === 2 ? 0 : 1) *
      secondaryAmount === "" ? 0 : parseLocaleNumber(secondaryAmount, location);

    let entryTitle = "";
    switch (conversionMode) {
      case 0: {
        entryTitle =
          primaryOriginal.currency + " to " + secondaryOriginal.currency;
        break;
      }
      case 1: {
        entryTitle =
          secondaryOriginal.currency + " to " + primaryOriginal.currency;
        break;
      }
      case 2: {
        entryTitle = "Added " + primaryOriginal.currency;
        break;
      }
    }
    setFxBalance(
      tag,
      entryTitle,
      conversionMode === 1 ? -1 : 1,
      primary,
      false
    );
    if (conversionMode != 2) {
      setFxBalance(
        secondaryCurrency,
        entryTitle,
        conversionMode === 0 ? -1 : conversionMode === 2 ? 0 : 1,
        secondary,
        true
      );
    }
    setRefresh(true);
    fetchData();
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
                top: DH,
                width: "100%",
                height: DH * 0.4,
                transform: [{ translateY: modalAnim }],
                flex: 1,
              }}
            >
              {/* Content here */}
              <View style={styles.modalView}>
                <View style={styles.titleBox}>
                  <Text style={styles.titleText}>Exchange/Add</Text>
                </View>
                <View style={styles.row1}>
                  <View style={styles.leftPlate}>
                    <View
                      style={{
                        width: "90%",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 30,
                        borderWidth: 2,
                        borderColor: accentColor,
                      }}
                    >
                      <View style={{ width: "20%" }}>
                        <Image
                          source={images[fxIndexMap(tag)]}
                          style={{
                            flex: 1,
                            width: null,
                            height: null,
                            resizeMode: "contain",
                          }}
                        />
                      </View>
                      <Text style={styles.row1Text}>{tag}</Text>
                    </View>
                  </View>
                  <TextInput
                    style={{
                      ...styles.row1Amount,
                      fontSize:
                        primaryAmount.length > 10
                          ? (10 / primaryAmount.length) * 24 * ScaleFactor
                          : 24 * ScaleFactor,
                    }}
                    placeholder={primaryPlaceholder}
                    placeholderTextColor="white"
                    onFocus={() => {
                      setPrimaryPlaceholder("");
                      if (parseLocaleNumber(primaryAmount, location) === 0)
                        onChangePrimaryAmount("");
                    }}
                    onChangeText={onChangePrimaryAmount}
                    onEndEditing={() => {
                      onChangePrimaryAmount(
                        formatterUS.format(Number(primaryAmount))
                      );
                    }}
                    value={primaryAmount}
                    keyboardType="number-pad"
                  />
                  <View style={{ width: "5%" }}></View>
                  <Feather name="arrow-down-right" size={30} color="white" />
                </View>
                <View style={styles.center}>
                  <View style={{ width: "10%" }}></View>
                  <View style={styles.centerLeft}>
                    <CustomButton
                      onPressOut={() => {
                        setConversionMode((conversionMode + 1) % 3);
                      }}
                      buttonStyle={{
                        height: 50 * ScaleFactor,
                        width: 30 * ScaleFactor,
                        backgroundColor: { transparent },
                        paddingTop: 5 * ScaleFactor,
                      }}
                    >
                      <AntDesign
                        name={
                          conversionMode === 0
                            ? "arrow-up"
                            : conversionMode === 1
                            ? "arrow-down"
                            : "plus"
                        }
                        size={30}
                        color={accentColor}
                      />
                    </CustomButton>
                  </View>
                  <View style={{ width: "10%" }}></View>
                  <View style={styles.centerMid}>
                    <Text style={styles.rateText}>
                      {tag + "/" + secondaryOriginal.currency}
                    </Text>
                    <Text style={styles.rateNumberText}>
                      {rateDivision(false)}
                    </Text>
                  </View>
                  <View style={styles.centerRight}>
                    <View
                      style={{
                        borderWidth: 2 * ScaleFactor,
                        borderColor: accentColor,
                        borderRadius: 10 * ScaleFactor,
                        paddingHorizontal: 10 * ScaleFactor,
                        paddingVertical: 5 * ScaleFactor,
                        marginBottom: 5 * ScaleFactor,
                        minHeight: 68 * ScaleFactor,
                        maxWidth: 151 * ScaleFactor,
                      }}
                    >
                      <Text style={styles.midText} numberOfLines={1}>
                        {"Final Balance:"}
                      </Text>
                      <Text
                        style={{
                          ...styles.midAmountText,
                        }}
                        adjustsFontSizeToFit={true}
                        numberOfLines={1}
                      >
                        {(fxRef[fxIndexMap(primaryOriginal.currency)]
                          .signLocation === "front"
                          ? fxRef[fxIndexMap(primaryOriginal.currency)].sign +
                            " "
                          : "") +
                          formatterUS.format(primaryFinalBalance) +
                          (fxRef[fxIndexMap(primaryOriginal.currency)]
                            .signLocation === "back"
                            ? " " +
                              fxRef[fxIndexMap(primaryOriginal.currency)].sign
                            : "")}
                      </Text>
                    </View>
                    <View
                      style={{
                        borderWidth: 2 * ScaleFactor,
                        borderColor: accentColor,
                        borderRadius: 10 * ScaleFactor,
                        paddingHorizontal: 10 * ScaleFactor,
                        paddingVertical: 5 * ScaleFactor,
                        marginTop: 5 * ScaleFactor,
                        minHeight: 68 * ScaleFactor,
                        maxWidth: 151 * ScaleFactor,
                      }}
                    >
                      <Text style={styles.midText} numberOfLines={1}>
                        {"Final Balance:"}
                      </Text>
                      <Text
                        style={{
                          ...styles.midAmountText,
                        }}
                        adjustsFontSizeToFit={true}
                        numberOfLines={1}
                      >
                        {(fxRef[fxIndexMap(secondaryOriginal.currency)]
                          .signLocation === "front"
                          ? fxRef[fxIndexMap(secondaryOriginal.currency)].sign +
                            " "
                          : "") +
                          (conversionMode === 2
                            ? "- - -"
                            : formatterUS.format(secondaryFinalBalance)) +
                          (fxRef[fxIndexMap(secondaryOriginal.currency)]
                            .signLocation === "back"
                            ? " " +
                              fxRef[fxIndexMap(secondaryOriginal.currency)].sign
                            : "")}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.row1}>
                  <View style={styles.leftPlate}>
                    <CustomButton
                      onPress={() => {
                        let newIndex = (selectedIndex + 1) % fxTags.length;
                        setSelectedIndex(newIndex);
                        fetchSecondaryData(fxTags[newIndex]);
                      }}
                      frameStyle={{ width: "90%" }}
                      buttonStyle={{
                        backgroundColor: plateColor,
                        width: "100%",
                        flexDirection: "row",
                        borderWidth: 2,
                        borderColor: accentColor,
                      }}
                    >
                      <View style={{ width: "20%" }}>
                        <Image
                          source={
                            images[fxIndexMap(secondaryOriginal.currency)]
                          }
                          style={{
                            flex: 1,
                            width: null,
                            height: null,
                            resizeMode: "contain",
                          }}
                        />
                      </View>
                      <Text style={styles.row1Text}>
                        {secondaryOriginal.currency}
                      </Text>
                    </CustomButton>
                  </View>
                  <TextInput
                    style={{
                      ...styles.row1Amount,
                      fontSize:
                        secondaryAmount.length > 10
                          ? (10 / secondaryAmount.length) * 24 * ScaleFactor
                          : 24 * ScaleFactor,
                    }}
                    placeholder={secondaryPlaceholder}
                    onChangeText={onChangeSecondaryAmount}
                    placeholderTextColor="white"
                    onFocus={() => {
                      setSecondaryPlaceholder("");
                      if (parseLocaleNumber(secondaryAmount, location) === 0)
                        onChangeSecondaryAmount("");
                    }}
                    onEndEditing={() => {
                      onChangeSecondaryAmount(
                        formatterUS.format(Number(secondaryAmount))
                      );
                    }}
                    value={secondaryAmount}
                    keyboardType="number-pad"
                  />
                  <View style={{ width: "5%" }}></View>
                  <Feather name="arrow-up-right" size={30} color="white" />
                </View>
                <View style={styles.bottomBar}>
                  <CustomButton
                    onPressOut={() => {
                      saveChanges();
                      ModalSlideOut();
                    }}
                    frameStyle={{
                      width: "50%",
                      alignItems: "center",
                    }}
                    buttonStyle={{
                      width: "50%",
                      backgroundColor: { transparent },
                    }}
                  >
                    <Text style={{ ...styles.bottomText, color: "#007AFF" }}>
                      Confirm
                    </Text>
                  </CustomButton>
                  <CustomButton
                    onPressOut={() => {
                      ModalSlideOut();
                    }}
                    frameStyle={{
                      width: "50%",
                      alignItems: "center",
                    }}
                    buttonStyle={{
                      width: "50%",
                      backgroundColor: { transparent },
                    }}
                  >
                    <Text style={{ ...styles.bottomText, color: "#FF3B30" }}>
                      Cancel
                    </Text>
                  </CustomButton>
                </View>

                <CustomButton
                  onPressOut={() => ModalSlideOut()}
                  frameStyle={{ position: "absolute", top: "1%", left: "95%" }}
                  buttonStyle={{
                    height: 30,
                    width: 30,
                    backgroundColor: { transparent },
                    paddingTop: 5,
                  }}
                >
                  <Feather name="x" size={26} color={accentColor} />
                </CustomButton>
              </View>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    flexDirection: "column",
    margin: 0,
    height: "100%",
    backgroundColor: modalColor,
    borderRadius: 20,
    padding: 0,
    alignItems: "center",
    borderWidth: 2,
    borderColor: accentColor,
    paddingVertical: 10 * ScaleFactor,
    paddingHorizontal: 10 * ScaleFactor,
  },
  titleBox: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20 * ScaleFactor,
  },
  titleText: {
    color: "white",
    fontSize: 24 * ScaleFactor,
    fontWeight: "bold",
    textAlign: "center",
  },
  row1: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
  },
  leftPlate: {
    width: "30%",
    flexDirection: "row",
    alignItems: "center",
  },
  row1Text: {
    color: "white",
    fontSize: 24 * ScaleFactor,
    fontWeight: "bold",
    textAlign: "left",
    textAlignVertical: "center",
    paddingLeft: 5 * ScaleFactor,
  },
  row1Amount: {
    width: "40%",
    alignItems: "flex-end",
    justifyContent: "center",
    backgroundColor: transparent,
    textAlign: "right",
    color: "white",
    fontWeight: "bold",
    textAlignVertical: "bottom",
    borderBottomColor: "white",
    borderBottomWidth: 2,
    paddingBottom: 0,
    paddingTop: 0,
  },
  center: {
    width: "100%",
    height: "50%",
    flexDirection: "row",
  },
  centerLeft: {
    width: "10%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  centerMid: {
    width: "30%",
    height: "100%",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  rateText: {
    color: "white",
    fontSize: 20 * ScaleFactor,
    fontWeight: "500",
    textAlign: "left",
    textAlignVertical: "center",
  },
  rateNumberText: {
    color: accentColor,
    fontSize: 20 * ScaleFactor,
    fontWeight: "500",
    textAlign: "left",
    textAlignVertical: "center",
  },
  centerRight: {
    width: "40%",
    height: "100%",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  midText: {
    color: "white",
    fontSize: 19 * ScaleFactor,
    fontWeight: "bold",
    textAlign: "right",
    textAlignVertical: "center",
  },
  midAmountText: {
    color: "white",
    fontSize: 18 * ScaleFactor,
    fontWeight: "bold",
    marginTop: 2 * ScaleFactor,
    textAlign: "right",
    textAlignVertical: "center",
  },
  bottomBar: {
    flexDirection: "row",
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8 * ScaleFactor,
  },
  buttonText: {
    fontSize: 20 * ScaleFactor,
    fontWeight: "bold",
    textAlign: "center",
    textAlignVertical: "center",
  },
  bottomText: {
    fontSize: 20 * ScaleFactor,
    fontWeight: "400",
    textAlign: "center",
    textAlignVertical: "center",
  },
});
