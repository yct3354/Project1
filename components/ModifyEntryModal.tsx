import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ColorValue,
  Dimensions,
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Calender from "./Calender";

import config from "@/components/config.json";
import CustomButton from "@/components/customButton";
import ExtendingTextBar from "@/components/ExtendingTextBar";
import { fxIndexMap } from "@/components/fxIndexMap";
import fxOrder from "@/data/fxOrder.json";
import fxRef from "@/data/fxRef.json";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSQLiteContext } from "expo-sqlite";
import uuid from "react-native-uuid";
import InlineDropdown from "./InLineDropdown";

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

interface ModifyEntryModalProps {
  setModalVisibleParent: any;
  modalVisibleParent: any;
  item?: any;
  editable: boolean;
  addNew: boolean;
  setGlobalReload: any;
}

const formatterUS = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

// const d = new Date();
// d.setHours(d.getHours() - d.getTimezoneOffset() / 60);

export default function ModifyEntryModal({
  setModalVisibleParent,
  modalVisibleParent,
  item = {
    _id: uuid.v4(),
    amount: 0,
    tag: "",
    currency: config.defaultCurrency,
    title: "",
    date: new Date(),
    rate: fxRef[fxIndexMap(config.defaultCurrency)].rate,
    hidden: false,
    direction: -1,
  },
  editable,
  setGlobalReload,
  addNew,
}: ModifyEntryModalProps) {
  const db = useSQLiteContext();

  const [editState, setEditState] = useState(editable);
  const [keyboardStatus, setKeyboardStatus] = useState("Keyboard Hidden");
  const [slidedUp, setSlidedUp] = useState(false);

  const [titleText, setTitleText] = useState(item.title);
  const [placeholderTitle, setPlaceholderTitle] = useState(
    "Enter Title here..."
  );
  const [placeholderAmount, setPlaceholderAmount] = useState(
    "Enter Amount here..."
  );
  const [placeholderRate, setPlaceholderRate] = useState("Rate");
  const [placeholderHour, setPlaceholderHour] = useState("00");
  const [placeholderMinute, setPlaceholderMinute] = useState("00");
  const [placeholderConvertedAmount, setPlaceholderConvertedAmount] =
    useState("00");
  const [amount, setAmount] = useState(
    item.amount.toLocaleString(location, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
  const [realAmount, setRealAmount] = useState(item.amount);
  const [currency, setCurrency] = useState(0);
  const [baseCurrency, setBaseCurrency] = useState(0);
  const [date, setDate] = useState(item.date);
  const itemDate = new Date(item.date);

  const parseToFullString = (input: number) => {
    return input < 10 ? "0" + input : input.toString();
  };
  const [hour, setHour] = useState(parseToFullString(itemDate.getHours()));
  const [minute, setMinute] = useState(
    parseToFullString(itemDate.getMinutes())
  );
  const [rate, setRate] = useState(
    item.rate.toLocaleString(location, {
      maximumFractionDigits: 4,
    })
  );
  const [realRate, setRealRate] = useState(item.rate);

  const [convertedAmount, setConvertedAmount] = useState(
    (item.amount * item.rate).toLocaleString(location, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );

  const [realConvertedAmount, setRealConvertedAmount] = useState(
    item.amount * item.rate
  );

  const [rateOrFor, setRateOrFor] = useState(true);
  const [hiddenState, setHiddenState] = useState(item.hidden);
  const [direction, setDirection] = useState(item.direction === 1);
  const [newTag, setNewTag] = useState("");

  const initDateParsed = new Date(date);

  const fullDate =
    initDateParsed.getFullYear() +
    "-" +
    parseToFullString(initDateParsed.getMonth() + 1) +
    "-" +
    parseToFullString(initDateParsed.getDate()) +
    "T" +
    hour +
    ":" +
    minute;

  const [fxTags, setFxTags] = useState<string[]>([]);

  const [selectedTag, setSelectedTag] = useState(item.tag);
  const dummyTagList = [{ id: 1, text: "N/A" }];
  const [tagList, setTagList] = useState<any>(dummyTagList);

  const [modalVisible, setModalVisble] = useState(false);

  const modalAppear = useRef(new Animated.Value(0)).current;
  const ModalIPColor = modalAppear.interpolate({
    inputRange: [0, 1],
    outputRange: ["#00000000", "#0000008c"],
  });

  const modalAnim = modalAppear.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -DH * 0.93],
  });

  const resetToInit = () => {
    setTitleText(item.title);
    setAmount(
      item.amount.toLocaleString(location, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
    setCurrency(fxTags.indexOf(item.currency));
    setDate(item.date);
    setSelectedTag(item.tag);
    setRate(
      item.rate.toLocaleString(location, {
        maximumFractionDigits: 4,
      })
    );
    setHour(parseToFullString(itemDate.getHours()));
    setMinute(parseToFullString(itemDate.getMinutes()));
    setConvertedAmount(
      (item.amount * item.rate).toLocaleString(location, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
    setDirection(item.direction === 1);
    setHiddenState(item.hidden);
  };

  const ModalSlideIn = (rebound: boolean) => {
    if (!rebound) {
      setModalVisble(true);
    }
    setRateOrFor(true);
    Animated.timing(modalAppear, {
      toValue: 1,
      duration: 300,
      delay: 50,
      useNativeDriver: true,
    }).start();
  };

  const ModalSlideOut = (cancelEdit: boolean) => {
    Animated.timing(modalAppear, {
      toValue: 0,
      duration: 300, // Animation duration in milliseconds
      useNativeDriver: true, // Use native driver for performance
    }).start(() => {
      if (cancelEdit) {
        resetToInit();
        if (!addNew) setEditState(false);
      } else {
        setGlobalReload(true);
        if (addNew) resetToInit();
      }
      setModalVisibleParent(false);
      setModalVisble(false);
    });
  };

  const SlideUp = () => {
    Animated.timing(modalAppear, {
      toValue: 1.4,
      duration: 200,
      delay: 50,
      useNativeDriver: true,
    }).start(() => setSlidedUp(true));
  };

  const SlideDown = () => {
    Animated.timing(modalAppear, {
      toValue: 1,
      duration: 200,
      delay: 50,
      useNativeDriver: true,
    }).start(() => setSlidedUp(false));
  };

  useEffect(() => {
    if (modalVisibleParent) {
      ModalSlideIn(false);
      // fetchData();
    }
  }, [modalVisibleParent]);

  const GetFxTags = async () => {
    try {
      return await db.getAllAsync("SELECT DISTINCT currency FROM record");
    } catch (error) {
      console.log(error);
    }
  };

  const GetUnique = async () => {
    try {
      return await db.getAllAsync(
        `SELECT DISTINCT tag FROM record WHERE tag <> "Foreign Exchange"`
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const updateEntry = async () => {
    try {
      await db.runAsync(
        `UPDATE record SET amount = ?, tag = ?, currency = ?, title = ?, date = ?, rate = ?, hidden = ?, direction = ? WHERE _id = ?`,
        [
          realAmount,
          selectedTag,
          fxTags[currency],
          titleText,
          fullDate,
          realRate,
          hiddenState,
          -1,
          item._id,
        ]
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const insertEntry = async () => {
    try {
      await db.runAsync(
        `INSERT INTO record (_id, amount, tag, currency, title, date, rate, hidden, direction) VALUES  (?,?,?,?,?,?,?,?,?)`,
        [
          item._id,
          realAmount,
          selectedTag,
          fxTags[currency],
          titleText,
          fullDate,
          realRate,
          hiddenState,
          direction ? 1 : -1,
        ]
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const deleteEntry = async () => {
    try {
      await db.runAsync(`DELETE FROM record WHERE _id = ?`, [item._id]);
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  useEffect(() => {
    if (rateOrFor) {
      // console.log(realAmount, realRate);
      setConvertedAmount(
        (realAmount * realRate).toLocaleString(location, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
      setRealConvertedAmount(realAmount * realRate);
    }
  }, [realAmount, realRate]);

  useEffect(() => {
    if (!rateOrFor) {
      // console.log(realAmount, realConvertedAmount);
      setRate(
        formatterUS.format(
          realAmount != 0 ? realConvertedAmount / realAmount : 0
        )
      );
      setRealRate(realConvertedAmount / realAmount);
    }
  }, [realAmount, realConvertedAmount]);

  const fetchData = async () => {
    try {
      const list: any = await GetFxTags();
      list.sort((a: any, b: any) => {
        const indexA = fxOrder.indexOf(a.currency);
        const indexB = fxOrder.indexOf(b.currency);

        if (indexA === -1 && indexB !== -1) return 1;
        if (indexB === -1 && indexA !== -1) return -1;
        if (indexA === -1 && indexB === -1) return 0;

        return indexA - indexB;
      });
      const TagListTemp = (await GetUnique()).map(
        (item: any, index: number) => ({
          id: index + 1,
          text: item.tag,
        })
      );
      setTagList(TagListTemp);
      const arr = list.map((item: any) => item.currency);
      setFxTags(arr);
      setCurrency(arr.indexOf(item.currency));
      setBaseCurrency(arr.indexOf(config.defaultCurrency));
    } catch (error) {
      throw error;
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardStatus("Keyboard Shown");
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardStatus("Keyboard Hidden");
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (slidedUp) SlideDown();
  }, [keyboardStatus]);

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
          ModalSlideOut(true);
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
                transform: [{ translateY: modalAnim }],
                flex: 1,
              }}
            >
              {/* Content here */}
              <View
                style={{
                  ...styles.modalView,
                  borderColor: editState ? accentColor : "#FFFFFF80",
                }}
              >
                <View style={styles.titleBox}>
                  <Text style={styles.titleText}>Transaction Details</Text>
                </View>
                <View style={styles.row}>
                  <View style={styles.columnLeft}>
                    <Text style={styles.itemText}>{"No Image"}</Text>
                  </View>
                  <View style={styles.columnRight}>
                    <View style={styles.buttonBox}>
                      <CustomButton
                        onPressOut={() => {
                          addNew ? insertEntry() : updateEntry();
                          ModalSlideOut(false);
                        }}
                        frameStyle={{ alignItems: "center" }}
                        buttonStyle={{
                          ...styles.buttonStyle,
                        }}
                      >
                        <View style={styles.iconStyle}>
                          <Feather name="save" size={24} color={accentColor} />
                        </View>
                        <Text
                          style={{
                            ...styles.buttonText2,
                          }}
                        >
                          {"Save"}
                        </Text>
                      </CustomButton>
                    </View>
                    <View style={styles.buttonBox}>
                      <CustomButton
                        onPressOut={() => setEditState(!editState)}
                        frameStyle={{ alignItems: "center" }}
                        buttonStyle={{
                          ...styles.buttonStyle,
                        }}
                      >
                        <View style={styles.iconStyle}>
                          <Feather
                            name="edit"
                            size={22 * ScaleFactor}
                            color={accentColor}
                          />
                        </View>
                        <Text
                          style={{
                            ...styles.buttonText2,
                          }}
                        >
                          {"Edit"}
                        </Text>
                      </CustomButton>
                    </View>
                    <View style={styles.buttonBox}>
                      <CustomButton
                        onPressOut={() => {
                          editState ? setHiddenState(!hiddenState) : {};
                        }}
                        frameStyle={{
                          alignItems: "center",
                        }}
                        buttonStyle={{
                          ...styles.buttonStyle,
                        }}
                      >
                        <View
                          style={{
                            ...styles.iconStyle,
                            paddingRight: 1 * ScaleFactor,
                          }}
                        >
                          <FontAwesome
                            name={hiddenState ? "check-square" : "square-o"}
                            size={24 * ScaleFactor}
                            color={editState ? accentColor : "#FFFFFF80"}
                          />
                        </View>
                        <Text
                          style={{
                            ...styles.buttonText2,
                          }}
                        >
                          {"Hidden"}
                        </Text>
                      </CustomButton>
                    </View>
                    <View
                      style={{ ...styles.buttonBox, opacity: addNew ? 0 : 1 }}
                    >
                      <CustomButton
                        onPressOut={() => {
                          if (!addNew) {
                            deleteEntry();
                            ModalSlideOut(false);
                          }
                        }}
                        frameStyle={{ alignItems: "center" }}
                        buttonStyle={{
                          ...styles.buttonStyle,
                        }}
                      >
                        <View
                          style={{
                            ...styles.iconStyle,
                            paddingRight: 1 * ScaleFactor,
                          }}
                        >
                          <Feather name="trash-2" size={24} color={"#FF3B30"} />
                        </View>
                        <Text
                          style={{
                            ...styles.buttonText2,
                          }}
                        >
                          {"Delete"}
                        </Text>
                      </CustomButton>
                    </View>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.itemBoxFull}>
                    <Text style={styles.itemText}>{"Transaction Title"}</Text>
                    <TextInput
                      style={{
                        ...styles.titleInput,
                        fontSize: 22 * ScaleFactor,
                        width: "100%",
                        borderBottomColor: editState ? "white" : "#FFFFFF80",
                      }}
                      placeholder={placeholderTitle}
                      onChangeText={setTitleText}
                      placeholderTextColor="white"
                      onFocus={() => {
                        setPlaceholderTitle("");
                      }}
                      onEndEditing={() => {
                        setTitleText(titleText);
                      }}
                      value={titleText}
                      // keyboardType="number-pad"
                      editable={editState}
                    />
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.itemBoxFull}>
                    <View
                      style={{
                        width: "100%",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Text style={styles.itemText}>{"Amount"}</Text>
                      <View style={{ flex: 1, alignItems: "flex-end" }}>
                        <CustomButton
                          onPressOut={() =>
                            editState ? setDirection(!direction) : {}
                          }
                          frameStyle={{
                            alignItems: "center",
                            marginHorizontal: 5 * ScaleFactor,
                          }}
                        >
                          <Feather
                            name={direction ? "plus" : "minus"}
                            size={21 * ScaleFactor}
                            color={editState ? accentColor : "#FFFFFF80"}
                          />
                        </CustomButton>
                      </View>
                    </View>
                    <View style={styles.itemBox2}>
                      {/* <CustomButton
                        onPressOut={() => {
                          editState
                            ? setCurrency((currency + 1) % fxTags.length)
                            : {};
                          editState
                            ? setRealRate(
                                fxRef[
                                  fxIndexMap(
                                    fxTags[(currency + 1) % fxTags.length]
                                  )
                                ].rate
                              )
                            : {};
                          editState
                            ? setRate(
                                formatterUS.format(
                                  fxRef[
                                    fxIndexMap(
                                      fxTags[(currency + 1) % fxTags.length]
                                    )
                                  ].rate
                                )
                              )
                            : {};
                        }}
                        frameStyle={{
                          alignItems: "center",
                          minWidth: "30%",
                        }}
                        buttonStyle={{
                          backgroundColor: plateColor,
                          borderColor: editState ? accentColor : "#FFFFFF80",
                          borderWidth: 2,
                          paddingHorizontal: 12 * ScaleFactor,
                          width: "100%",
                        }}
                      >
                        <Text style={{ ...styles.buttonText }}>
                          {fxTags[currency]}
                        </Text>
                      </CustomButton> */}
                      <InlineDropdown
                        onSelect={(text: any) => {
                          setCurrency(fxTags.indexOf(text));
                          setRate(
                            formatterUS.format(fxRef[fxIndexMap(text)].rate)
                          );
                        }}
                        initItem={fxTags[currency]}
                        list={fxTags.map((item, index) => ({
                          id: index,
                          text: item,
                        }))}
                        editable={editState}
                        style={{ alignItems: "center", minWidth: "30%" }}
                        textStyle={{ fontSize: 18 * ScaleFactor }}
                        dropDirection={"down"}
                      />
                      <TextInput
                        style={{
                          ...styles.amountInput,
                          fontSize: 22 * ScaleFactor,
                          backgroundColor: transparent,
                          width: "70%",
                          marginRight: 5 * ScaleFactor,
                          borderColor: editState ? "white" : "#FFFFFF80",
                          // flex: 1,
                        }}
                        placeholder={placeholderAmount}
                        onChangeText={setAmount}
                        placeholderTextColor="white"
                        onFocus={() => {
                          setPlaceholderAmount("");
                        }}
                        onEndEditing={() => {
                          if (formatterUS.format(Number(amount)) === "NaN") {
                            setAmount(formatterUS.format(0));
                            setRealAmount(0);
                          } else {
                            setAmount(formatterUS.format(amount));
                            setRealAmount(Number(amount));
                          }
                        }}
                        value={amount}
                        selectTextOnFocus={true}
                        keyboardType="number-pad"
                        editable={editState}
                      />
                    </View>
                  </View>
                </View>
                <View style={styles.row}>
                  <View
                    style={{
                      ...styles.itemBoxFull,
                      opacity: rateOrFor ? 1 : 0.5,
                    }}
                  >
                    <View
                      style={{
                        width: "100%",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Text style={styles.itemText}>{"Exchange Rate"}</Text>
                      <View style={{ flex: 1, alignItems: "flex-end" }}>
                        <CustomButton
                          onPressOut={() =>
                            editState && !rateOrFor
                              ? setRateOrFor(!rateOrFor)
                              : {}
                          }
                          frameStyle={{
                            alignItems: "center",
                            marginHorizontal: 5 * ScaleFactor,
                          }}
                        >
                          <Feather
                            name="check"
                            size={21 * ScaleFactor}
                            color={editState ? accentColor : "#FFFFFF80"}
                          />
                        </CustomButton>
                      </View>
                    </View>
                    <View style={styles.itemBox2}>
                      {/* <CustomButton
                        onPressOut={() => {
                          rateOrFor && editState
                            ? setBaseCurrency(
                                (baseCurrency + 1) % fxTags.length
                              )
                            : {};
                        }}
                        frameStyle={{
                          alignItems: "center",
                          minWidth: "40%",
                        }}
                        buttonStyle={{
                          backgroundColor: plateColor,
                          borderColor: editState ? accentColor : "#FFFFFF80",
                          borderWidth: 2,
                          paddingHorizontal: 12 * ScaleFactor,
                          width: "100%",
                        }}
                      >
                        <Text style={{ ...styles.buttonText }}>
                          {fxTags[currency] + "/" + fxTags[baseCurrency]}
                        </Text>
                      </CustomButton> */}
                      <InlineDropdown
                        onSelect={(text: string, index: number) => {
                          setBaseCurrency(index);
                        }}
                        initItem={fxTags[currency] + "/" + fxTags[baseCurrency]}
                        list={fxTags.map((item, index) => ({
                          id: index,
                          text: fxTags[baseCurrency] + "/" + item,
                        }))}
                        editable={editState && rateOrFor}
                        style={{ alignItems: "center", minWidth: "45%" }}
                        textStyle={{ fontSize: 18 * ScaleFactor }}
                        dropDirection={"down"}
                      />
                      <TextInput
                        style={{
                          ...styles.rateInput,
                          fontSize: 22 * ScaleFactor,
                          backgroundColor: transparent,
                          width: "55%",
                          borderBottomColor: editState ? "white" : "#FFFFFF80",
                          marginRight: 5 * ScaleFactor,
                        }}
                        placeholder={placeholderRate}
                        onChangeText={setRate}
                        placeholderTextColor="white"
                        onFocus={() => {
                          setPlaceholderRate("");
                        }}
                        onEndEditing={() => {
                          if (formatterUS.format(Number(rate)) === "NaN") {
                            setRate(formatterUS.format(0));
                            setRealRate(0);
                          } else {
                            setRate(formatterUS.format(rate));
                            setRealRate(Number(rate));
                          }
                        }}
                        value={rate}
                        keyboardType="number-pad"
                        selectTextOnFocus={true}
                        editable={rateOrFor && editState}
                      />
                    </View>
                  </View>
                </View>
                <View style={styles.row}>
                  <View
                    style={{
                      ...styles.itemBoxFull,
                      opacity: !rateOrFor ? 1 : 0.5,
                    }}
                  >
                    <View
                      style={{
                        width: "100%",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Text style={styles.itemText}>{"Exchange For"}</Text>
                      <View style={{ flex: 1, alignItems: "flex-end" }}>
                        <CustomButton
                          onPressOut={() =>
                            editState && rateOrFor
                              ? setRateOrFor(!rateOrFor)
                              : {}
                          }
                          frameStyle={{
                            alignItems: "center",
                            marginHorizontal: 5 * ScaleFactor,
                          }}
                        >
                          <Feather
                            name="check"
                            size={21 * ScaleFactor}
                            color={editState ? accentColor : "#FFFFFF80"}
                          />
                        </CustomButton>
                      </View>
                    </View>
                    <View style={styles.itemBox2}>
                      {/* <CustomButton
                        onPressOut={() => {
                          !rateOrFor && editState
                            ? setBaseCurrency(
                                (baseCurrency + 1) % fxTags.length
                              )
                            : {};
                        }}
                        frameStyle={{
                          alignItems: "center",
                          minWidth: "30%",
                        }}
                        buttonStyle={{
                          backgroundColor: plateColor,
                          borderColor: editState ? accentColor : "#FFFFFF80",
                          borderWidth: 2,
                          paddingHorizontal: 12 * ScaleFactor,
                          width: "100%",
                        }}
                      >
                        <Text style={{ ...styles.buttonText }}>
                          {fxTags[baseCurrency]}
                        </Text>
                      </CustomButton> */}
                      <InlineDropdown
                        onSelect={(text: string, index: number) => {
                          setBaseCurrency(index);
                        }}
                        initItem={fxTags[baseCurrency]}
                        list={fxTags.map((item, index) => ({
                          id: index,
                          text: item,
                        }))}
                        editable={editState && !rateOrFor}
                        style={{ alignItems: "center", minWidth: "30%" }}
                        textStyle={{ fontSize: 18 * ScaleFactor }}
                        dropDirection={"down"}
                      />
                      <TextInput
                        style={{
                          ...styles.rateInput,
                          fontSize: 22 * ScaleFactor,
                          backgroundColor: transparent,
                          width: "70%",
                          borderBottomColor: editState ? "white" : "#FFFFFF80",
                          marginRight: 5 * ScaleFactor,
                        }}
                        placeholder={placeholderConvertedAmount}
                        onChangeText={setConvertedAmount}
                        placeholderTextColor="white"
                        onFocus={() => {
                          setPlaceholderConvertedAmount("");
                          SlideUp();
                        }}
                        onEndEditing={() => {
                          if (
                            formatterUS.format(Number(convertedAmount)) ===
                            "NaN"
                          ) {
                            setConvertedAmount(formatterUS.format(0));
                            setRealConvertedAmount(0);
                          } else {
                            setConvertedAmount(
                              formatterUS.format(Number(convertedAmount))
                            );
                            setRealConvertedAmount(Number(convertedAmount));
                          }
                          SlideDown();
                        }}
                        value={convertedAmount}
                        keyboardType="number-pad"
                        selectTextOnFocus={true}
                        editable={!rateOrFor && editState}
                      />
                    </View>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.itemBoxFullWithBar}>
                    <ExtendingTextBar
                      titleText="Category"
                      enabled={editState}
                      placeholder="New Category"
                      initWidth="44%"
                      titleTextStyle={styles.itemTextWithBar}
                      barTextStyle={{
                        fontSize: 16 * ScaleFactor,
                      }}
                      setTextParent={setNewTag}
                      iconSize={22 * ScaleFactor}
                      primaryIcon={"plus"}
                      closeIcon={"x"}
                      secondary={true}
                      secondaryIcon="check"
                      primaryHandle={SlideUp}
                      closeHandle={SlideDown}
                      secondaryHandle={() => {
                        setTagList([
                          ...tagList,
                          { id: tagList.length + 1, text: newTag },
                        ]);
                        setSelectedTag(newTag);
                      }}
                    />
                    <View style={{ paddingTop: 5 * ScaleFactor }}>
                      <InlineDropdown
                        onSelect={setSelectedTag}
                        initItem={selectedTag}
                        list={tagList}
                        editable={editState}
                        style={{}}
                        textStyle={{
                          fontSize: 16,
                          marginVertical: 3 * ScaleFactor,
                        }}
                        dropDirection={"up"}
                      />
                    </View>
                    {/* </View> */}
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.itemBoxLeft}>
                    <View
                      style={{
                        width: "100%",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Text style={styles.itemText}>{"Date"}</Text>
                    </View>
                    <Calender
                      initDate={item.date}
                      setSelectedDateParent={setDate}
                      editable={editState}
                    ></Calender>
                  </View>
                  <View style={styles.itemBoxRight}>
                    <View
                      style={{
                        width: "100%",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Text style={styles.itemText}>{"Time"}</Text>
                    </View>
                    <View style={styles.itemBox2}>
                      <TextInput
                        style={{
                          ...styles.timeInput,
                          fontSize: 22 * ScaleFactor,
                          width: "40%",
                          borderBottomColor: editState ? "white" : "#FFFFFF80",
                          flex: 1,
                        }}
                        placeholder={placeholderHour}
                        onChangeText={setHour}
                        placeholderTextColor="white"
                        onFocus={() => {
                          setPlaceholderHour("");
                          SlideUp();
                        }}
                        onEndEditing={() => {
                          setHour(
                            parseToFullString(
                              Number(hour) > 23
                                ? 23
                                : Number(hour) < 0
                                  ? 0
                                  : Math.round(Number(hour))
                            )
                          );
                          SlideDown();
                        }}
                        value={hour}
                        selectTextOnFocus={true}
                        keyboardType="number-pad"
                        editable={editState}
                      />
                      <Text style={styles.timeText}>{":"}</Text>
                      <TextInput
                        style={{
                          ...styles.timeInput,
                          fontSize: 22 * ScaleFactor,
                          backgroundColor: transparent,
                          width: "40%",
                          // marginRight: 5 * ScaleFactor,
                          borderBottomColor: editState ? "white" : "#FFFFFF80",
                          flex: 1,
                        }}
                        placeholder={placeholderMinute}
                        onChangeText={setMinute}
                        placeholderTextColor="white"
                        onFocus={() => {
                          setPlaceholderMinute("");
                          SlideUp();
                        }}
                        onBlur={() => SlideDown()}
                        onEndEditing={() => {
                          setMinute(
                            parseToFullString(
                              Number(minute) > 59
                                ? 59
                                : Number(minute) < 0
                                  ? 0
                                  : Math.round(Number(minute))
                            )
                          );
                          SlideDown();
                        }}
                        value={minute}
                        selectTextOnFocus={true}
                        keyboardType="number-pad"
                        editable={editState}
                      />
                    </View>
                  </View>
                </View>
                <CustomButton
                  onPressOut={() => ModalSlideOut(true)}
                  frameStyle={{
                    position: "absolute",
                    top: "0.7%",
                    left: "93%",
                  }}
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
    borderWidth: 2,
    // borderColor: accentColor,
    paddingTop: 10 * ScaleFactor,
    paddingHorizontal: 10 * ScaleFactor,
    paddingBottom: 10 * ScaleFactor,
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
  row: {
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 15 * ScaleFactor,
    paddingVertical: 5 * ScaleFactor,
  },
  columnLeft: {
    width: "70%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  columnRight: {
    width: "30%",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  itemBoxLeft: {
    width: "55%",
    flexDirection: "column",
    marginVertical: 5 * ScaleFactor,
    paddingRight: 15 * ScaleFactor,
  },
  itemBoxFull: {
    width: "100%",
    flexDirection: "column",
    marginVertical: 5 * ScaleFactor,
  },
  itemBoxFullWithBar: {
    width: "100%",
    flexDirection: "column",
    marginBottom: 5 * ScaleFactor,
  },
  itemBoxRight: {
    width: "45%",
    flexDirection: "column",
    marginVertical: 5 * ScaleFactor,
  },
  itemBoxRight2: {
    width: "45%",
    flexDirection: "column",
    justifyContent: "center",
    marginVertical: 5 * ScaleFactor,
  },
  itemBox2: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-end",
  },
  itemBox3: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10 * ScaleFactor,
  },
  buttonText2: {
    fontSize: 16 * ScaleFactor,
    fontWeight: "500",
    textAlign: "left",
    textAlignVertical: "center",
    color: "white",
  },
  itemText: {
    fontSize: 16 * ScaleFactor,
    fontWeight: "400",
    textAlign: "left",
    textAlignVertical: "center",
    color: "white",
    minHeight: 21 * ScaleFactor,
  },
  itemTextWithBar: {
    fontSize: 16 * ScaleFactor,
    fontWeight: "400",
    textAlign: "left",
    textAlignVertical: "center",
    color: "white",
    minHeight: 21 * ScaleFactor,
    paddingTop: 10 * ScaleFactor,
  },
  timeText: {
    fontSize: 22 * ScaleFactor,
    fontWeight: "bold",
    textAlign: "center",
    textAlignVertical: "center",
    color: "white",
    paddingHorizontal: 5 * ScaleFactor,
    // backgroundColor: "red",
    // paddingLeft: 4 * ScaleFactor,
    // minHeight: 21 * ScaleFactor,
  },
  titleInput: {
    height: 38 * ScaleFactor,
    alignItems: "flex-end",
    justifyContent: "center",
    textAlign: "left",
    color: "white",
    fontWeight: "bold",
    textAlignVertical: "center",
    borderBottomWidth: 2,
    // borderRadius: 10,
    paddingHorizontal: 3 * ScaleFactor,
    paddingBottom: 0,
    paddingTop: 5,
  },
  amountInput: {
    height: 38 * ScaleFactor,
    alignItems: "flex-end",
    justifyContent: "center",
    textAlign: "right",
    color: "white",
    fontWeight: "bold",
    textAlignVertical: "center",
    borderBottomColor: "white",
    borderBottomWidth: 2,
    paddingHorizontal: 3 * ScaleFactor,
    paddingBottom: 0,
    paddingTop: 5,
  },
  rateInput: {
    height: 38 * ScaleFactor,
    alignItems: "flex-end",
    justifyContent: "center",
    textAlign: "right",
    color: "white",
    fontWeight: "bold",
    textAlignVertical: "center",
    borderBottomWidth: 2,
    // marginHorizontal: 5 * ScaleFactor,
    paddingBottom: 0,
    paddingTop: 10 * ScaleFactor,
  },
  timeInput: {
    height: 38 * ScaleFactor,
    alignItems: "flex-end",
    justifyContent: "center",
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    textAlignVertical: "center",
    borderBottomWidth: 2,
    // marginHorizontal: 5 * ScaleFactor,
    paddingBottom: 0,
    paddingTop: 10 * ScaleFactor,
  },
  buttonStyle: {
    width: "100%",
    flexDirection: "row",
    minWidth: "30%",
    justifyContent: "flex-start",
    // paddingLeft: 8 * ScaleFactor,
    // paddingRight: 5 * ScaleFactor,
  },
  buttonText: {
    color: "white",
    fontSize: 18 * ScaleFactor,
    fontWeight: "bold",
    textAlign: "center",
  },
  iconStyle: {
    minWidth: 36 * ScaleFactor,
    alignItems: "center",
    // backgroundColor: "red",
    // justifyContent: "center",
  },
});
