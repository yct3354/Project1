import React, { useRef, useState, useEffect } from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  View,
  Animated,
  ColorValue,
  Dimensions,
  Modal,
  TextInput,
  Easing,
} from "react-native";
import { Calendar, CalendarList, Agenda } from "react-native-calendars";
import CustomButton from "@/components/customButton";
import Feather from "@expo/vector-icons/Feather";

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

interface CalenderProps {
  initDate?: any;
  setSelectedDateParent: any;
  editable: any;
}

export default function Calender({
  initDate,
  setSelectedDateParent,
  editable,
}: CalenderProps) {
  const initDateISO = initDate;
  const initDateParsed = new Date(initDateISO);

  const parseToFullString = (input: number) => {
    return input < 10 ? "0" + input : input.toString();
  };

  const calenderDate = {
    dateString:
      initDateParsed.getFullYear() +
      "-" +
      parseToFullString(initDateParsed.getMonth() + 1) +
      "-" +
      parseToFullString(initDateParsed.getDate()),
    day: initDateParsed.getDate(),
    month: initDateParsed.getMonth(),
    timestamp: Date.parse(initDate),
    year: initDateParsed.getFullYear(),
  };

  const [selectedDate, setSelectedDate] = useState<any>(
    calenderDate.dateString
  );
  const [isCalenderVisible, setCalenderVisible] = useState(false);

  const loadRoll = useRef(new Animated.Value(0)).current;
  const loadBorder = loadRoll.interpolate({
    inputRange: [0, 1],
    outputRange: [200, 20],
  });
  const loadSlide = loadRoll.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  const RollIn = () => {
    Animated.timing(loadRoll, {
      toValue: 1,
      // delay: 5,
      duration: 300,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  };

  const RollOut = () => {
    Animated.timing(loadRoll, {
      toValue: 0,
      // delay: 5,
      duration: 300,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start(() => {
      setCalenderVisible(!isCalenderVisible);
    });
  };

  const toggleCalender = () => {
    if (!isCalenderVisible) {
      setCalenderVisible(!isCalenderVisible);
      // FadeIn();
      RollIn();
    } else {
      // FadeOut();
      RollOut();
    }
  };

  return (
    <View style={{}}>
      <CustomButton
        buttonStyle={{
          ...styles.button,
          borderColor: editable ? accentColor : "#FFFFFF80",
        }}
        onPressOut={() => (editable ? toggleCalender() : {})}
        shrinkFactor={0.9}
      >
        <Text style={styles.buttonText}>{selectedDate} </Text>
        <View
          style={{
            // flex: 1,
            flexDirection: "row-reverse",
            alignItems: "flex-start",
          }}
        >
          <Feather
            name="chevron-up"
            size={21}
            color={editable ? accentColor : "#FFFFFF80"}
          />
        </View>
      </CustomButton>
      {isCalenderVisible && (
        <Animated.View
          style={{
            ...styles.calenderContainer,
            overflow: "hidden",
            opacity: loadRoll,
            borderRadius: loadBorder,
            transform: [
              {
                translateY: loadSlide,
              },
              {
                scaleY: loadRoll,
              },
              {
                scaleX: loadRoll,
              },
            ],
            transformOrigin: "46% 100%",
          }}
        >
          <Calendar
            style={{
              borderRadius: 20 * ScaleFactor,
              paddingBottom: 8 * ScaleFactor,
            }}
            theme={{
              backgroundColor: plateColor,
              calendarBackground: plateColor,
              textSectionTitleColor: "white",
              textSectionTitleDisabledColor: "#d9e1e8",
              selectedDayBackgroundColor: "white",
              selectedDayTextColor: "black",
              todayTextColor: accentColor,
              dayTextColor: "white",
              textDisabledColor: "#b3b3b3",
              // dotColor: "#00adf5",
              selectedDotColor: "#ffffff",
              arrowColor: accentColor,
              disabledArrowColor: "#d9e1e8",
              monthTextColor: "white",
              indicatorColor: "blue",
              textDayFontWeight: "300",
              textMonthFontWeight: "bold",
              textDayHeaderFontWeight: "300",
              textDayFontSize: 16 * ScaleFactor,
              textMonthFontSize: 16 * ScaleFactor,
              textDayHeaderFontSize: 16 * ScaleFactor,
            }}
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              setSelectedDateParent(day.dateString);
              // FadeOut();
              RollOut();
            }}
            markedDates={{
              [selectedDate]: {
                selected: true,
                disableTouchEvent: true,
                // dotColor: "red",
              },
            }}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: plateColor,
    borderRadius: 15,
    paddingVertical: 3 * ScaleFactor,
    marginTop: 3 * ScaleFactor,
    paddingHorizontal: 10 * ScaleFactor,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    zIndex: 5,
    flexDirection: "row",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16 * ScaleFactor,
    flex: 1,
    fontWeight: "bold",
  },
  calenderContainer: {
    marginTop: 5 * ScaleFactor,
    // borderRadius: 20 * ScaleFactor,
    // paddingBottom: 8 * ScaleFactor,
    width: "190%",
    position: "absolute",
    bottom: "100%",
    left: "0%",
    zIndex: 98,
  },
  option: {
    padding: 10,
  },
  optionText: {
    fontSize: 16 * ScaleFactor,
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});
