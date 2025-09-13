import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  ColorValue,
  ScrollView,
  Image,
} from "react-native";
import CustomButton from "@/components/customButton";
import FilterButtonContent from "./FilterButtonContent";
import { useEffect, useState } from "react";
import images from "@/components/Images";
import { fxIndexMap } from "@/components/fxIndexMap";

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

interface FilterButtonProps {
  itemList: string[][];
  title: string;
  initList: any;
  setFilterStateParent: any;
  setFilterValueParent: any;
  fxFilterInit: any;
}

export default function FilterButton({
  itemList,
  title,
  initList,
  setFilterStateParent,
  setFilterValueParent,
  fxFilterInit,
}: FilterButtonProps) {
  const [fxInit, setFxInit] = useState<number>(fxFilterInit);

  const [filterState, setFilterState] = useState<number[]>([
    0,
    0,
    fxFilterInit,
    0,
    0,
    0,
  ]);

  const [filterButtonColor, setFilterButtonColor] = useState([
    transparent,
    transparent,
    transparent,
    transparent,
    transparent,
    transparent,
  ]);

  // const [filterValue, setFilterValue] = useState([0, 0, 0, 0]);

  const minButtonWidths = [
    140 * ScaleFactor,
    140 * ScaleFactor,
    100 * ScaleFactor,
    200 * ScaleFactor,
    200 * ScaleFactor,
    140 * ScaleFactor,
  ];

  // console.log(fxFilterInit);
  useEffect(() => {
    let arr = [...filterState];
    arr[2] = fxFilterInit;
    setFilterState(arr);
    setFilterButtonColor(
      arr.map((items) => (items != 0 ? plateColor : transparent))
    );
  }, [fxFilterInit]);

  return (
    <View
      style={{
        width: DW,
        paddingHorizontal: 13 * ScaleFactor,
        // paddingBottom: 10,
        // paddingTop: 5,
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
        {/* <View style={{ justifyContent: "center" }}></View> */}
        {itemList.map((item: any, index: number) => {
          return (
            <CustomButton
              frameStyle={{
                ...styles.modalButtonFrameStyle,
                minWidth: minButtonWidths[index],
              }}
              buttonStyle={{
                width: "100%",
                backgroundColor: filterButtonColor[index],
                padding: 5 * ScaleFactor,
                borderRadius: 20 * ScaleFactor,
                borderWidth: 2,
                borderColor: accentColor,
                // flexDirection: "row",
              }}
              onPressOut={() => {
                if (index != 2 || fxFilterInit === 0) {
                  let arr = [...filterState];
                  arr[index] = (arr[index] + 1) % item.length;
                  setFilterState(arr);
                  setFilterStateParent(arr);
                  setFilterButtonColor(
                    arr.map((items) => (items != 0 ? plateColor : transparent))
                  );
                }
              }}
              key={item[0]}
            >
              <FilterButtonContent
                text={item[filterState[index]]}
                index={index}
                state={filterState[index]}
                setFilterValue={setFilterValueParent}
              ></FilterButtonContent>
            </CustomButton>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  secTitleText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 24 * ScaleFactor,
    textAlignVertical: "center",
    marginLeft: 5 * ScaleFactor,
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
    marginHorizontal: 5 * ScaleFactor,
    minWidth: 70 * ScaleFactor,
    minHeight: 30 * ScaleFactor,
    marginVertical: 5,
    flexGrow: 1,
  },
});
