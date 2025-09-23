import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useSQLiteContext } from "expo-sqlite";
import { useRef, useState, useEffect } from "react";
import {
  Animated,
  ColorValue,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import {
  KeyboardAvoidingView,
  KeyboardProvider,
} from "react-native-keyboard-controller";
import EmojiPicker from "rn-emoji-keyboard";
import CustomButton from "../customButton";
import InlineDropdown from "../InLineDropdown";
import fxRef from "@/data/fxRef.json";
import { fxIndexMap } from "@/components/fxIndexMap";
import config from "@/components/config.json";
import ExpandableList from "../ExpandableList";
import * as SQLiteAPI from "@/components/SQLiteAPI";
import { scheduleOnRN } from "react-native-worklets";

const emojiDictionary = require("emoji-dictionary");

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

let currentDate = new Date();
let currentYear = currentDate.getFullYear();

export default function AddGroup() {
  const navigation = useNavigation<any>();
  const db = useSQLiteContext();

  const [emojiKeyboardOpen, setEmojiKeyboardOpen] = useState(false);
  const [slidedUp, setSlidedUp] = useState(false);
  const [emoji, setEmoji] = useState(" ");
  const [groupName, setGroupName] = useState("");
  const [groupNamePH, setGroupNamePH] = useState("Group Name");
  const [keyboardStatus, setKeyboardStatus] = useState("Keyboard Hidden");
  const [currency, setCurrency] = useState(config.defaultCurrency);
  const [userList, setUserList] = useState<string[]>([config.defaultName]);

  const slide = useRef(new Animated.Value(0)).current;

  // const fetchData = async () => {
  //   const tableD: any = await SQLiteAPI.GetTransactionBySession(db, session_id);
  //   const [tempInfo]: any = await SQLiteAPI.GetSessionInfo(db, session_id);
  //   const [tempEmoji]: any = await SQLiteAPI.GetTagEmoji(db, tempInfo.tag_id);
  //   const sectionList = [
  //     {
  //       title: "Paid By",
  //       data: [
  //         ...tableD.filter(
  //           (item: any) =>
  //             item.payer_payee && item.user_group_id === user_group_id
  //         ),
  //         ...tableD.filter(
  //           (item: any) =>
  //             item.payer_payee && item.user_group_id != user_group_id
  //         ),
  //       ],
  //     },
  //     {
  //       title: "Shared By",
  //       data: [
  //         ...tableD.filter(
  //           (item: any) =>
  //             !item.payer_payee && item.user_group_id === user_group_id
  //         ),
  //         ...tableD.filter(
  //           (item: any) =>
  //             !item.payer_payee && item.user_group_id != user_group_id
  //         ),
  //       ],
  //     },
  //   ];
  //   setSectionedTransaction(sectionList);
  //   setSessionInfo(tempInfo);
  //   setEmoji(tempEmoji.emoji);
  // };

  // useEffect(() => {
  //   fetchData();
  // }, []);

  useEffect(() => {
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

  const SlideUp = () => {
    Animated.timing(slide, {
      toValue: DW / 2,
      duration: 200,
      delay: 50,
      useNativeDriver: true,
    }).start(() => setSlidedUp(true));
  };

  const SlideDown = () => {
    Animated.timing(slide, {
      toValue: 0,
      duration: 200,
      delay: 50,
      useNativeDriver: true,
    }).start(() => setSlidedUp(false));
  };

  return (
    <View style={{ flex: 1 }}>
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
            <KeyboardProvider>
              <KeyboardAvoidingView
                behavior={"position"}
                style={{
                  // flex: 1,
                  alignItems: "center",
                  // overflow: "hidden",
                  width: "100%",
                }}
              >
                <TouchableWithoutFeedback
                  style={{ flex: 1 }}
                  onPress={Keyboard.dismiss}
                >
                  <View
                    style={{
                      // flex: 0,
                      paddingBottom: 30 * ScaleFactor,
                    }}
                  >
                    <View
                      style={{
                        width: "100%",
                        paddingHorizontal: 20 * ScaleFactor,
                        paddingVertical: 15 * ScaleFactor,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <View style={{ paddingRight: 20 * ScaleFactor }}>
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
                      <View>
                        <Text style={styles.mainText}>{"New Group"}</Text>
                      </View>
                      <View style={{ flex: 1, flexDirection: "row-reverse" }}>
                        <CustomButton
                          onPressOut={() => {
                            navigation.goBack();
                            // console.log(emoji, groupName, currency, userList);
                            SQLiteAPI.AddNewGroup(
                              db,
                              groupName,
                              currency,
                              userList,
                              emoji
                            );
                          }}
                          buttonStyle={{
                            height: 40 * ScaleFactor,
                            width: 40 * ScaleFactor,
                            borderRadius: 20,
                            backgroundColor: plateColor,
                          }}
                        >
                          <Feather
                            name="check"
                            size={24 * ScaleFactor}
                            color={accentColor}
                          />
                        </CustomButton>
                      </View>
                    </View>
                    <View style={{ marginTop: 10 * ScaleFactor }}>
                      <CustomButton
                        onPressOut={() => {
                          setEmojiKeyboardOpen(true);
                        }}
                      >
                        <View
                          style={{
                            justifyContent: "center",
                            alignItems: "center",
                            height: 120 * ScaleFactor,
                            width: 120 * ScaleFactor,
                            borderRadius: 60 * ScaleFactor,
                            backgroundColor: plateColor,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 60 * ScaleFactor,
                              textAlignVertical: "center",
                            }}
                          >
                            {emojiDictionary.getUnicode(emoji)}
                          </Text>
                        </View>
                      </CustomButton>
                    </View>
                    <View style={styles.inputList}>
                      <View style={{ paddingTop: 5 * ScaleFactor }}>
                        <View style={styles.row}>
                          <Text style={styles.titleText}>{"Group Name"}</Text>
                        </View>
                        <View style={styles.row}>
                          <TextInput
                            style={{
                              ...styles.titleInput,
                              fontSize: 22 * ScaleFactor,
                              width: "100%",
                              // borderBottomColor: "white",
                            }}
                            placeholder={groupNamePH}
                            onChangeText={setGroupName}
                            placeholderTextColor="#FFFFFF80"
                            onEndEditing={() => {
                              setGroupName(groupName);
                            }}
                            onBlur={() => {}}
                            value={groupName}
                          />
                        </View>
                      </View>
                      <View style={{ paddingTop: 5 * ScaleFactor }}>
                        <View style={styles.row}>
                          <Text style={styles.titleText}>
                            {"Base Currency"}
                          </Text>
                        </View>
                        <View style={styles.row}>
                          <InlineDropdown
                            onSelect={(text: string, index: number) => {
                              setCurrency(text);
                            }}
                            list={fxRef.map((item, index) => ({
                              id: index,
                              text: item.tag,
                            }))}
                            initItem={
                              fxRef[fxIndexMap(config.defaultCurrency)].tag
                            }
                            editable={true}
                            style={{
                              alignItems: "center",
                              width: "100%",
                            }}
                            textStyle={{
                              fontSize: 22 * ScaleFactor,
                              paddingVertical: 10 * ScaleFactor,
                              textAlignVertical: "center",
                            }}
                            buttonStyle={{ borderRadius: 20 * ScaleFactor }}
                            dropDirection="down"
                          />
                        </View>
                      </View>
                      <View style={{ paddingTop: 5 * ScaleFactor }}>
                        <View style={styles.row}>
                          <Text style={styles.titleText}>{"Participants"}</Text>
                        </View>
                        <View style={styles.row}>
                          <ExpandableList
                            setListParent={(item: any) => setUserList(item)}
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </KeyboardAvoidingView>
            </KeyboardProvider>
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
      <EmojiPicker
        onEmojiSelected={(emoji) => {
          setEmoji(emojiDictionary.getName(emoji.emoji));
        }}
        open={emojiKeyboardOpen}
        onClose={() => setEmojiKeyboardOpen(false)}
        theme={{
          container: modalColor,
          header: "white",
          search: {
            text: "white",
            placeholder: "white",
            background: plateColor,
          },
        }}
        styles={{
          container: {
            borderRadius: 40 * ScaleFactor,
            borderColor: accentColor,
            overflow: "hidden",
          },
        }}
        enableSearchBar={true}
        enableCategoryChangeAnimation={false}
        defaultHeight={"50%"}
        disableSafeArea={true}
        customButtons={
          <View
            style={{
              justifyContent: "center",
              marginTop: 20 * ScaleFactorVert,
            }}
          >
            <CustomButton
              onPressOut={() => {
                setEmojiKeyboardOpen(false);
              }}
              frameStyle={{ justifyContent: "center" }}
              buttonStyle={{
                height: 30,
                width: 30,
              }}
            >
              <Feather name="x" size={26} color={accentColor} />
            </CustomButton>
          </View>
        }
      />
    </View>
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
    backgroundColor: plateColor,
    borderRadius: 20 * ScaleFactor,
    alignItems: "flex-end",
    justifyContent: "center",
    textAlign: "left",
    color: "white",
    fontWeight: "400",
    textAlignVertical: "center",
    paddingHorizontal: 15 * ScaleFactor,
    paddingTop: 10 * ScaleFactor,
    paddingBottom: 10 * ScaleFactor,
  },
  inputList: {
    paddingHorizontal: 25 * ScaleFactor,
    marginTop: 15 * ScaleFactor,
    width: "100%",
  },
  mainText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 25 * ScaleFactor,
  },
  titleText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18 * ScaleFactor,
    paddingLeft: 2 * ScaleFactor,
  },
  row: {
    justifyContent: "flex-start",
    flexDirection: "row",
    width: "100%",
    paddingVertical: 5 * ScaleFactor,
  },
  participantList: {
    borderRadius: 20 * ScaleFactor,
    backgroundColor: plateColor,
    width: "100%",
  },
});
