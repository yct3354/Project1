import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  ColorValue,
  ScrollView,
} from "react-native";
import CustomButton from "@/components/customButton";
import { useState } from "react";
import Feather from "@expo/vector-icons/Feather";

const DW = Dimensions.get("window").width;
const DH = Dimensions.get("window").height;
const ScaleFactor = DW / 411.4286;

const accentColor = "#EFBF04"; //9D00FF, FF8000
const themeColor = "#1A1A16"; //1A1915
const modalColor = "#181716ff";
const topBarColor: ColorValue = "#615F55"; //292823
const topBarColorS = "#615F55"; //292823
const plateColor = "#45423A"; //474440
const transparent = "#00000000";

interface SerialButtonProps {
  itemList: any;
  title: string;
  initList: any;
  setSerialState: any;
  setOrderModeParent: any;
}

export default function SerialButton({
  itemList,
  title,
  initList,
  setSerialState,
  setOrderModeParent,
}: SerialButtonProps) {
  const [sortButtonColor, setSortButtonState] = useState(
    initList.map((item: number) => (item === 1 ? plateColor : transparent))
  );

  const [orderMode, setOrderMode] = useState(0);

  return (
    <View
      style={{
        width: DW,
        paddingHorizontal: 18 * ScaleFactor,
        alignContent: "center",
        flexDirection: "row",
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        <Text style={styles.secTitleText}>{title}</Text>
        <View style={{ justifyContent: "center" }}>
          <CustomButton
            onPressOut={() => {
              setOrderMode((orderMode + 1) % 2);
              setOrderModeParent((orderMode + 1) % 2);
            }}
            buttonStyle={{
              height: 30 * ScaleFactor,
              width: 24 * ScaleFactor,
            }}
          >
            <Feather
              name={orderMode === 0 ? "chevrons-down" : "chevrons-up"}
              size={24 * ScaleFactor}
              color={accentColor}
            />
          </CustomButton>
        </View>
        {/* <View style={{ flexDirection: "row" }}> */}
        {itemList.map((item: any, index: number) => {
          return (
            <CustomButton
              frameStyle={styles.modalButtonFrameStyle}
              buttonStyle={{
                width: "100%",
                backgroundColor: sortButtonColor[itemList.indexOf(item)],
                padding: 5 * ScaleFactor,
                borderRadius: 20 * ScaleFactor,
                borderWidth: 2,
                borderColor: accentColor,
              }}
              onPressOut={() => {
                let arr = Array(itemList.length).fill(transparent);
                arr[itemList.indexOf(item)] = plateColor;
                setSerialState(item);
                setSortButtonState(arr);
              }}
              key={item}
            >
              <Text style={styles.buttonText}>{item}</Text>
            </CustomButton>
          );
        })}
      </View>
      {/* </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  secTitleText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 24 * ScaleFactor,
    textAlignVertical: "center",
    marginRight: 5 * ScaleFactor,
  },
  buttonText: {
    color: "white",
    fontSize: 16 * ScaleFactor,
    fontWeight: "500",
    marginHorizontal: 10 * ScaleFactor,
    textAlignVertical: "center",
  },
  modalButtonFrameStyle: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4 * ScaleFactor,
    minWidth: 65 * ScaleFactor,
    minHeight: 30 * ScaleFactor,
    marginVertical: 5,
    flexGrow: 1,
  },
});
