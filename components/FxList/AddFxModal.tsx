import React, { useRef, useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  StyleSheet,
  View,
  Animated,
  ColorValue,
  Dimensions,
  Modal,
  TextInput,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import fxRef from "@/data/fxRef.json";
import { fxIndexMap } from "@/components/fxIndexMap";
import CustomButton from "@/components/customButton";
import images from "@/components/Images";
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

function transparentFade(initColor: string, x: number, y: number) {
  let arr: ColorValue[] = [];
  for (let i = 1; i <= x; i++) {
    let num = Math.ceil((y / 2) * Math.cos((Math.PI * i) / 50) + 255 / 2);
    arr.push(initColor + (num < 16 ? "0" : "") + num.toString(16));
  }

  return arr;
}

export default function AddFxModal({
  setModalVisibleParent,
  modalVisibleParent,
  tag,
  setRefresh,
}: ChangeBalanceModalProps) {
  const db = useSQLiteContext();
  const [modalVisible, setModalVisble] = useState(false);
  const modalAppear = useRef(new Animated.Value(0)).current;
  const ModalIPColor = modalAppear.interpolate({
    inputRange: [0, 1],
    outputRange: ["#00000000", "#0000008c"],
  });

  const modalAnim = modalAppear.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -DH * 0.65],
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

  const [initialAmount, onChangeInitialAmount] = useState("");
  const [placeholder, setPlaceholder] = useState(formatterUS.format(0));

  const [fxTags, setFxTags] = useState<any[]>([fxRef[0]]);
  const [selectedItem, setSelectedItem] = useState(0);
  const [emptyList, setEmptyList] = useState(false);

  const GetFxTags = async () => {
    try {
      return await db.getAllAsync("SELECT DISTINCT currency FROM record");
    } catch (error) {
      console.log(error);
    }
  };

  const fetchData = async () => {
    try {
      const list: any = await GetFxTags();
      const existing = list.map((obj: any) => obj.currency);
      let tempList = fxRef.filter((item: any) => {
        return !existing.includes(item.tag);
      });
      setFxTags(tempList);
      if (fxTags.length === 0) setEmptyList(true);
    } catch (error) {
      throw error;
    } finally {
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // const rateDivision = () => {
  //   if (primaryAmount === "" || secondaryAmount === "") return "- - -";
  //   else {
  //     let P1 = parseLocaleNumber(primaryAmount, location);
  //     let P2 = parseLocaleNumber(secondaryAmount, location);
  //     if (P1 != 0 && P2 != 0) return (P2 / P1).toFixed(4);
  //     else return "- - -";
  //   }
  // };

  const setFxBalance = async (
    currency: string,
    titleSet: string,
    direction: number,
    amount: number
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
          fxRef[fxRef.findIndex((item) => item.tag === currency)].rate,
          false,
          direction,
        ]
      );
    } catch (error) {
      console.log(error);
    }
  };

  const saveChanges = () => {
    let entryTitle = "Initial Balance";
    if (!emptyList) {
      setFxBalance(
        fxTags[selectedItem].tag,
        entryTitle,
        1,
        parseLocaleNumber(initialAmount, location)
      );
      setSelectedItem(0);
      setRefresh(true);
    }
    onChangeInitialAmount("0.00");
    fetchData();
  };

  function handleScroll(event: any) {
    const scrollIndex = Math.round(
      event.nativeEvent.contentOffset.x /
        (130 * ScaleFactor + 10 * ScaleFactor) -
        0.427
    );
    // console.log(
    //   event.nativeEvent.contentOffset.x / (130 * ScaleFactor + 10 * ScaleFactor)
    // );
    scrollIndex != selectedItem
      ? setSelectedItem(scrollIndex >= 0 ? scrollIndex : 0)
      : {};
    // console.log(scrollIndex);
  }

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
                height: DH * 0.25,
                transform: [{ translateY: modalAnim }],
                flex: 1,
              }}
            >
              {/* Content here */}
              <View style={styles.modalView}>
                <Text style={styles.titleText}>Add Currency</Text>
                <View
                  style={{
                    width: 300 * ScaleFactor,
                    height: 60 * ScaleFactor,
                    marginVertical: 10 * ScaleFactor,
                  }}
                >
                  <ScrollView
                    overScrollMode="always"
                    snapToInterval={130 * ScaleFactor + 10 * ScaleFactor}
                    snapToAlignment="center"
                    decelerationRate={0.8}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEnabled={!emptyList}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignContent: "center",
                        justifyContent: "center",
                        marginHorizontal: 5 * ScaleFactor,
                        paddingHorizontal: 10 * ScaleFactor,
                        height: 60 * ScaleFactor,
                        width:
                          fxTags.length === 0
                            ? 310 * ScaleFactor
                            : 130 * ScaleFactor,
                        paddingLeft:
                          fxTags.length === 0
                            ? 20 * ScaleFactor
                            : 0 * ScaleFactor,
                      }}
                    >
                      <Text style={styles.emptyWarningText}>
                        {fxTags.length === 0 ? "No Available Currencies" : ""}
                      </Text>
                    </View>
                    {fxTags.map((item) => (
                      <View
                        style={{
                          flexDirection: "row",
                          alignContent: "center",
                          justifyContent: "center",
                          marginHorizontal: 5 * ScaleFactor,
                          paddingHorizontal: 10 * ScaleFactor,
                          height: 60 * ScaleFactor,
                          width: 130 * ScaleFactor,
                        }}
                        key={item.id}
                      >
                        <Image
                          source={images[fxIndexMap(item.tag)]}
                          style={{
                            flex: 0.7,
                            width: null,
                            height: null,
                            resizeMode: "contain",
                          }}
                        />
                        <Text style={styles.fxTagText}>{item.tag}</Text>
                      </View>
                    ))}
                    <View
                      style={{
                        flexDirection: "row",
                        alignContent: "center",
                        justifyContent: "center",
                        marginHorizontal: 5 * ScaleFactor,
                        paddingHorizontal: 10 * ScaleFactor,
                        height: 60 * ScaleFactor,
                        width: fxTags.length === 0 ? 10 : 130 * ScaleFactor,
                      }}
                    ></View>
                  </ScrollView>
                  <LinearGradient
                    colors={[
                      transparentC,
                      transparentC,
                      ...[...transparentFade(modalColor, 50, 255)].reverse(),
                    ]}
                    locations={[0, 0, ...linspace(0, 1, 50)]}
                    start={[1, 0]}
                    end={[0, 0]}
                    style={{
                      width: "40%",
                      height: "100%",
                      position: "absolute",
                      left: "0%",
                    }}
                  ></LinearGradient>
                  <LinearGradient
                    colors={[
                      transparentC,
                      transparentC,
                      ...[...transparentFade(modalColor, 50, 255)].reverse(),
                    ]}
                    locations={[0, 0, ...linspace(0, 1, 50)]}
                    start={[0, 0]}
                    end={[1, 0]}
                    style={{
                      width: "40%",
                      height: "100%",
                      position: "absolute",
                      left: "60%",
                    }}
                  ></LinearGradient>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignContent: "center",
                    justifyContent: "center",
                    marginHorizontal: 5 * ScaleFactor,
                    paddingHorizontal: 10 * ScaleFactor,
                    width: DW,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 20,
                      fontWeight: "500",
                      marginHorizontal: 5,
                      // backgroundColor: "red",
                      textAlignVertical: "center",
                    }}
                    numberOfLines={1}
                  >
                    Intial Balance:
                  </Text>
                  <TextInput
                    style={{
                      ...styles.amountInput,
                      fontSize: 20,
                    }}
                    placeholder={placeholder}
                    onChangeText={onChangeInitialAmount}
                    placeholderTextColor="white"
                    onFocus={() => {
                      setPlaceholder("");
                      if (parseLocaleNumber(initialAmount, location) === 0)
                        onChangeInitialAmount("");
                    }}
                    onEndEditing={() => {
                      onChangeInitialAmount(
                        formatterUS.format(Number(initialAmount))
                      );
                    }}
                    value={initialAmount}
                    keyboardType="number-pad"
                    editable={!emptyList}
                  />
                  <Text
                    style={{
                      color: "white",
                      fontSize: 20,
                      fontWeight: "500",
                      marginLeft: 5,
                      minWidth: 50 * ScaleFactor,
                      textAlignVertical: "center",
                    }}
                    numberOfLines={1}
                  >
                    {fxTags.length === 0 ? "- - -" : fxTags[selectedItem].tag}
                  </Text>
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
                      onChangeInitialAmount("0.00");
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
  fxTagText: {
    flex: 1,
    color: "white",
    fontSize: 26 * ScaleFactor,
    fontWeight: "500",
    marginLeft: 10 * ScaleFactor,
    textAlignVertical: "center",
    // backgroundColor: "red",
  },
  emptyWarningText: {
    flex: 1,
    color: "white",
    fontSize: 22 * ScaleFactor,
    fontWeight: "500",
    marginLeft: 10 * ScaleFactor,
    textAlignVertical: "center",
    // backgroundColor: "red",
  },
  bottomBar: {
    flexDirection: "row",
    flex: 1,
    width: "100%",
    alignItems: "flex-end",
    justifyContent: "center",
    marginTop: 8 * ScaleFactor,
    marginBottom: 4 * ScaleFactor,
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
  amountInput: {
    width: "40%",
    height: 38 * ScaleFactor,
    alignItems: "flex-end",
    justifyContent: "center",
    backgroundColor: plateColor,
    textAlign: "left",
    color: "white",
    fontWeight: "bold",
    textAlignVertical: "center",
    borderBottomColor: "white",
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingBottom: 0,
    paddingTop: 0,
  },
});
