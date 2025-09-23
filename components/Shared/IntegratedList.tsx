import IntegratedTab from "@/components/Shared/IntegratedTab";
import { LinearGradient } from "expo-linear-gradient";
import { ColorValue, Dimensions } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import TransactionEmpty from "./TransactionEmpty";

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

interface IntegratedListProps {
  unsortedTransaction: any;
  tagList: any;
  setModifiedIndex: any;
  modifiedIndex: number;
  deleteSlide: any;
}

export default function IntegratedList({
  unsortedTransaction,
  tagList,
  setModifiedIndex,
  deleteSlide,
}: // modifiedIndex,
IntegratedListProps) {
  return (
    <Animated.View
      style={{
        height: DH * 0.27,
        borderRadius: 20 * ScaleFactor,
        marginBottom: 0 * ScaleFactor,
        justifyContent: "center",
      }}
      layout={LinearTransition}
    >
      <Animated.FlatList
        data={unsortedTransaction}
        showsVerticalScrollIndicator={false}
        extraData={unsortedTransaction}
        keyExtractor={(item: any) => item.session_id}
        // windowSize={5}
        initialNumToRender={10}
        getItemLayout={(data, index) => ({
          length: 86 * ScaleFactor,
          offset: 86 * ScaleFactor * index,
          index,
        })}
        renderItem={({ item, index }: any) => (
          <IntegratedTab
            item={item}
            tagList={tagList}
            index={index}
            setModifiedIndex={setModifiedIndex}
            deleteSlide={deleteSlide}
          />
        )}
        itemLayoutAnimation={LinearTransition}
        ListEmptyComponent={<TransactionEmpty />}
      ></Animated.FlatList>
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
      <LinearGradient
        colors={[
          transparentC,
          transparentC,
          ...[...transparentFade(themeColor, 50, 255)].reverse(),
        ]}
        locations={[0, 0, ...linspace(0, 1, 50)]}
        start={[0, 0]}
        end={[0, 1]}
        style={{
          width: "100%",
          height: 20 * ScaleFactor,
          position: "absolute",
          bottom: "0%",
        }}
      ></LinearGradient>
    </Animated.View>
  );
}
