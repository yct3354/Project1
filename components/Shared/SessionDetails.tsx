import CustomButton from "@/components/customButton";
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
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import TransactionTab from "./TransactionTab";

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

const weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

let currentDate = new Date();
let currentYear = currentDate.getFullYear();

function getDateString(datePreParse: string) {
  const date = new Date(datePreParse);
  let weekDay = date.getDay();
  let day = date.getDate();
  let month = date.getMonth();
  let year = date.getFullYear();
  return (
    weekDays[weekDay] +
    ", " +
    monthNames[month] +
    " " +
    (day < 10 ? "0" + day : day) +
    (year < currentYear ? " " + year : "")
  );
}

export default function SessionDetails({ route }: any) {
  const navigation = useNavigation<any>();
  const db = useSQLiteContext();
  const { session_id, user_group_id } = route.params;

  const [refreshing, setRefreshing] = useState(false);

  const [groupTable, setGroupTable] = useState([]);
  const [sessionInfo, setSessionInfo] = useState<any>({});
  // const [transactionTable, setTransactionTable] = useState([]);
  const [sectionedTransaction, setSectionedTransaction] = useState<any>([]);
  const [emojiKeyboardOpen, setEmojiKeyboardOpen] = useState(false);
  // const [tagList, setTagList] = useState([]);
  const [emoji, setEmoji] = useState(" ");

  const loadFade = useRef(new Animated.Value(1)).current;

  const fetchData = async () => {
    const tableD: any = await SQLiteAPI.GetTransactionBySession(db, session_id);
    const [tempInfo]: any = await SQLiteAPI.GetSessionInfo(db, session_id);
    const [tempEmoji]: any = await SQLiteAPI.GetTagEmoji(db, tempInfo.tag_id);
    const sectionList = [
      {
        title: "Paid By",
        data: [
          ...tableD.filter(
            (item: any) =>
              item.payer_payee && item.user_group_id === user_group_id
          ),
          ...tableD.filter(
            (item: any) =>
              item.payer_payee && item.user_group_id != user_group_id
          ),
        ],
      },
      {
        title: "Shared By",
        data: [
          ...tableD.filter(
            (item: any) =>
              !item.payer_payee && item.user_group_id === user_group_id
          ),
          ...tableD.filter(
            (item: any) =>
              !item.payer_payee && item.user_group_id != user_group_id
          ),
        ],
      },
    ];
    setSectionedTransaction(sectionList);
    setSessionInfo(tempInfo);
    setEmoji(tempEmoji.emoji);
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
      {/* <SafeAreaView style={{ flex: 1 }}> */}
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
            justifyContent: "center",
            overflow: "hidden",
            width: "100%",
            // backgroundColor: "red",
          }}
        >
          <View
            style={{
              width: "100%",
              paddingHorizontal: 20 * ScaleFactor,
              paddingTop: 15 * ScaleFactor,
              flexDirection: "row",
              // position: "absolute",
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
            <CustomButton
              onPressOut={() => {
                // navigation.goBack();
              }}
              frameStyle={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "flex-end",
                // backgroundColor: "red",
              }}
              buttonStyle={{
                height: 40 * ScaleFactor,
                width: 40 * ScaleFactor,
                borderRadius: 20,
                // backgroundColor: plateColor,
              }}
            >
              <Feather
                name="trash-2"
                size={30 * ScaleFactor}
                color={"#FF3B30"}
              />
            </CustomButton>
          </View>
          {/* <CustomButton
              buttonStyle={{
                width: 40 * ScaleFactor,
                height: 40 * ScaleFactor,
                backgroundColor: plateColor,
              }}
              onPressOut={() => setEmojiKeyboardOpen(true)}
            >
              <Text>{emojiDictionary.getUnicode(emoji)}</Text>
            </CustomButton> */}
          <View
            style={{
              paddingBottom: 20 * ScaleFactor,
              // paddingTop: 20 * ScaleFactor,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ ...styles.mainText }}>
              {emojiDictionary.getUnicode(emoji || " ")}
            </Text>
            <Text style={{ ...styles.mainText, paddingTop: 5 * ScaleFactor }}>
              {sessionInfo.session_name || " "}
            </Text>
            <Text
              style={{
                ...styles.supplementText,
                paddingTop: 5 * ScaleFactor,
              }}
            >
              {getDateString(sessionInfo.date) || " "}
              {/* {sessionInfo.date || " "} */}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <SectionList
              sections={sectionedTransaction}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item, index) => item + index}
              renderItem={({ item }) => (
                <TransactionTab
                  item={item}
                  self={user_group_id === item.user_group_id ? true : false}
                />
              )}
              renderSectionHeader={({ section: { title } }) => (
                <View
                  style={{
                    paddingVertical: 15 * ScaleFactor,
                    paddingBottom: 10 * ScaleFactor,
                    paddingHorizontal: 25 * ScaleFactor,
                  }}
                >
                  <Text style={styles.sectionHeader}>{title}</Text>
                </View>
              )}
              ListFooterComponent={
                <View
                  style={{ width: "100%", height: 120 * ScaleFactorVert }}
                ></View>
              }
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
                height: 20 * ScaleFactor,
                position: "absolute",
                top: "0%",
              }}
            ></LinearGradient>
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
              <Feather name="edit-2" size={30} color={accentColor} />
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
        {/* <EmojiPicker
          onEmojiSelected={(emoji) => {
            setEmoji(emojiDictionary.getName(emoji.emoji));
            console.log(emojiDictionary.getName(emoji.emoji));
          }}
          open={emojiKeyboardOpen}
          onClose={() => setEmojiKeyboardOpen(false)}
          // styles={{ container: { backgroundColor: plateColor } }}
          theme={{
            container: modalColor,
            header: "white",
            search: {
              text: "white",
              placeholder: "white",
              background: plateColor,
            },
          }}
          enableSearchBar={true}
          enableCategoryChangeAnimation={false}
          defaultHeight={"50%"}
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
        /> */}
      </View>
      <View style={{ height: "1%" }}></View>
      {/* </SafeAreaView> */}
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
    fontSize: 35 * ScaleFactor,
  },
  supplementText: {
    color: "white",
    fontWeight: "400",
    fontSize: 18 * ScaleFactor,
  },
  sectionHeader: {
    color: "white",
    fontWeight: "bold",
    fontSize: 26 * ScaleFactor,
  },
});
