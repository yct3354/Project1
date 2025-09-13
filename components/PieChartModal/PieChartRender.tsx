import {
  Text,
  View,
  StyleSheet,
  ColorValue,
  Dimensions,
  Animated,
  Pressable,
} from "react-native";

import React, { useState, useRef, useEffect } from "react";
import Svg, { Path } from "react-native-svg";
import CustomButton from "@/components/customButton";
import SpendingDetailsModal from "@/components/PieChartModal/SpendingDetailsModal";
import { useSQLiteContext } from "expo-sqlite";
import config from "@/components/config.json";

const AnimatedP = Animated.createAnimatedComponent(Path);

const accentColor = "#EFBF04"; //9D00FF, FF8000
const themeColor = "#1A1A16"; //1A1915
const modalColor = "#181716ff";
const topBarColor: ColorValue = "#615F55"; //292823
const topBarColorS = "#615F55"; //292823
const plateColor = "#45423A"; //474440
const transparent = "#00000000";

const location = "en-US";

const DW = Dimensions.get("window").width;
const DH = Dimensions.get("window").height;
const ScaleFactor = DW / 411.4286;
// #161, 129, 2
// #253, 221, 94
const startRadius = 80;
const endRadius = 88;
const ringThickness = 20;
const bounceTime = 85; //ms

const R = 70;
const PieSize = 300 * ScaleFactor;
const svgSize = 200;
const SVGScale = PieSize / 2 / 100;
const sliceNumber = 90;
const sliceAngle = 360 / sliceNumber;
const sliceThickness = Math.sqrt(
  2 * endRadius +
    (ringThickness / 2) * (1 - Math.cos((sliceAngle * Math.PI) / 180))
);

let monthStartDate = new Date();
monthStartDate.setDate(1);
monthStartDate.setHours(0, 0, 0, 0);

const GradientCal = (
  R1: number,
  G1: number,
  B1: number,
  R2: number,
  G2: number,
  B2: number,
  n: number
) => {
  let colorArray: string[] = [];
  colorArray.push(
    "#" +
      (R1 < 16 ? "0" : "") +
      R1.toString(16) +
      (G1 < 16 ? "0" : "") +
      G1.toString(16) +
      (B1 < 16 ? "0" : "") +
      B1.toString(16)
  );
  for (let i = 1; i < n - 1; i++) {
    let Rx = Math.trunc(R1 + (i * (R2 - R1)) / (n - 1));
    let Gx = Math.trunc(G1 + (i * (G2 - G1)) / (n - 1));
    let Bx = Math.trunc(B1 + (i * (B2 - B1)) / (n - 1));
    colorArray.push(
      "#" +
        (Rx < 16 ? "0" : "") +
        Rx.toString(16) +
        (Gx < 16 ? "0" : "") +
        Gx.toString(16) +
        (Bx < 16 ? "0" : "") +
        Bx.toString(16)
    );
  }
  colorArray.push(
    "#" +
      (R2 < 16 ? "0" : "") +
      R2.toString(16) +
      (G2 < 16 ? "0" : "") +
      G2.toString(16) +
      (B2 < 16 ? "0" : "") +
      B2.toString(16)
  );
  return colorArray;
};

const angleArray = (item: number[]) => {
  let output: number[] = [];
  let sum: number = 0;
  output.push(0);
  for (let i = 1; i < item.length; i++) {
    sum = sum + item[i - 1] * 360;
    output.push(sum);
  }
  return output;
};

interface PieAutoPlotProps {
  width?: number;
  initTagList: any;
  hiddenState: boolean;
  loadOpacity: any;
  isReloading: any;
  setGlobalReload: any;
}

const renderDot = (color: any) => {
  return (
    <View
      style={{
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: color,
        marginRight: 10 * ScaleFactor,
      }}
    />
  );
};

const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0; // Adjust for SVG's 0-degree at 3 o'clock
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (
  x: number,
  y: number,
  radius: number,
  thickness: number,
  startAngle: number,
  endAngle: number
) => {
  const radius_in = radius - thickness / 2;
  const radius_out = radius + thickness / 2;
  const start_in = polarToCartesian(x, y, radius_in, startAngle + 1.2);
  const end_in = polarToCartesian(x, y, radius_in, endAngle - 1.2);
  const start_out = polarToCartesian(x, y, radius_out, endAngle - 1);
  const end_out = polarToCartesian(x, y, radius_out, startAngle + 1);
  const start = polarToCartesian(x, y, radius, startAngle);
  const end = polarToCartesian(x, y, radius, endAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  const sweepFlag_in = 1; // Assuming clockwise sweep
  const sweepFlag_out = 0;
  return [
    `M ${start_in.x} ${start_in.y}`, // Move to center
    `L ${start_in.x} ${start_in.y}`, // Line to start of arc
    `A ${radius_in} ${radius_in} 0 ${largeArcFlag} ${sweepFlag_in} ${end_in.x} ${end_in.y}`, // Arc
    `L ${start_out.x} ${start_out.y}`, // Line to start of arc
    `A ${radius_out} ${radius_out} 0 ${largeArcFlag} ${sweepFlag_out} ${end_out.x} ${end_out.y}`, // Arc
    `Z`, // Close path
  ].join(" ");
};

export default function PieAutoPlot({
  width = 411.4286,
  initTagList,
  hiddenState,
  loadOpacity,
  isReloading,
  setGlobalReload,
}: PieAutoPlotProps) {
  const db = useSQLiteContext();
  const [isLoading, setLoading] = useState(true);

  let totalSum: number = 0;
  let percentageArray: number[] = [];

  const dummyList: any[] =
    initTagList.length === 0
      ? [
          {
            angle: 0,
            color: accentColor,
            id: 1,
            percentage: 1,
            tag: "N/A",
            value: 10,
          },
        ]
      : initTagList.map((item: any, index: number) => ({
          angle: 0 + (index * 360) / initTagList.length,
          color: accentColor,
          id: item.id,
          percentage: 1 / initTagList.length,
          tag: item.text,
          value: 10,
        }));

  const [PieData, setPieData] = useState(dummyList);

  const initValue = PieData[0].value.toLocaleString(location, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const initTag = isLoading ? "N/A" : PieData[0].tag;

  const initPercentage = (PieData[0].percentage * 100).toFixed(1);

  const [valueText, setValueText] = useState(initValue);
  const [tagText, setTagText] = useState(initTag);
  const [tagList, setTagList] = useState(initTagList);
  const [PercentageText, setPercentageText] = useState(initPercentage);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [modalVisible, setModalVisible] = useState(false);

  // const GetGrouped = async () => {
  //   try {
  //     return await db.getAllAsync(
  //       'SELECT IFNULL(ROW_NUMBER() OVER (ORDER BY tag ASC),1) AS id, IFNULL(tag,"N/A"") AS tag, IFNULL(SUM(amount*rate),0) AS value FROM record WHERE tag <> "Foreign Exchange" AND date >= "' +
  //         monthStartDate.toISOString() +
  //         '" GROUP BY tag'
  //     );
  //   } catch (error) {
  //     throw error;
  //   }
  // };

  const GetGrouped = async () => {
    try {
      return await db.getAllAsync(
        'SELECT IFNULL((ROW_NUMBER() OVER (ORDER BY tag ASC)),1) AS id, IFNULL(tag,"N/A") AS tag, IFNULL(SUM(amount*rate),0) AS value FROM record WHERE tag <> "Foreign Exchange" AND direction = -1 AND date >= "' +
          monthStartDate.toISOString() +
          '" GROUP BY tag'
      );
    } catch (error) {
      throw error;
    }
  };

  const fetchData = async () => {
    try {
      let sectorData: any = await GetGrouped();
      if (sectorData.length === 0) {
        sectorData = [
          {
            angle: 0,
            color: accentColor,
            id: 1,
            percentage: 1,
            tag: "N/A",
            value: 10,
          },
        ];
      }
      totalSum = sectorData.reduce(
        (accumulator: number, currentItem: any) =>
          accumulator + currentItem.value,
        0
      );
      percentageArray = sectorData.map((obj: any) => obj.value / totalSum);
      const tempData = sectorData.map((item: any) => ({
        ...item,
        color: GradientCal(230, 81, 0, 239, 191, 4, sectorData.length)[
          item.id - 1
        ],
        percentage: percentageArray[item.id - 1],
        angle: angleArray(percentageArray)[item.id - 1],
      }));

      const tempList = sectorData.map((item: any) => ({
        id: item.id,
        text: item.tag,
      }));
      setPieData(tempData);
      setValueText(
        tempData[0].value.toLocaleString(location, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
      setTagText(tempData[0].tag);
      setTagList(tempList);
      setPercentageText((tempData[0].percentage * 100).toFixed(1));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isReloading) fetchData();
  }, [isReloading]);

  const animatedSectorArray = useRef<Animated.Value[]>([]).current;
  const sliceArray: any[] = [];

  for (let i = animatedSectorArray.length; i <= PieData.length - 1; i++) {
    animatedSectorArray.push(new Animated.Value(0));
  }

  let angle: number = 0;
  let j: number = 1;

  function roundHalf(num: number) {
    return Math.round(num * 100) / 100;
  }

  for (let i = 0; i < sliceNumber; i++) {
    angle = i * sliceAngle + sliceAngle / 2;
    if (
      roundHalf(
        PieData[j - 1].angle + PieData[j - 1].percentage * 360 - angle
      ) <
      sliceAngle / 2
    ) {
      j += 1;
    }
    sliceArray.push({ value: angle, id: i + 1, sector: j });
  }

  const centerTextFadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      delay: 5,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const centerTextFadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 100, // Animation duration in milliseconds
      useNativeDriver: true, // Use native driver for performance
    }).start();
  };

  const pressInAnimation = (animatedSector: any) => {
    Animated.timing(animatedSector, {
      toValue: 1,
      duration: bounceTime,
      useNativeDriver: true,
    }).start();
  };
  const pressOutAnimation = (animatedSector: any) => {
    Animated.timing(animatedSector, {
      toValue: 0,
      duration: bounceTime,
      useNativeDriver: true,
    }).start();
  };

  const PieSectorPlot = (item: any) => {
    return (
      <AnimatedP
        d={animatedSectorArray[item.id - 1].interpolate({
          inputRange: [0, 1],
          outputRange: [
            describeArc(
              100,
              100,
              startRadius,
              ringThickness,
              item.angle,
              item.angle + item.percentage * 360
            ),
            describeArc(
              100,
              100,
              endRadius,
              ringThickness,
              item.angle,
              item.angle + item.percentage * 360
            ),
          ],
        })}
        fill={item.color}
        stroke={item.color}
        strokeWidth="1"
        key={item.id}
      />
    );
  };

  const slicePlot = (item: any) => {
    return (
      <Pressable
        onPressIn={() => {
          pressInAnimation(animatedSectorArray[item.sector - 1]);
          centerTextFadeOut();
        }}
        onPressOut={() => {
          pressOutAnimation(animatedSectorArray[item.sector - 1]);
          setValueText(
            PieData[item.sector - 1].value.toLocaleString(location, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          );
          setTagText(PieData[item.sector - 1].tag);
          setPercentageText(
            (PieData[item.sector - 1].percentage * 100).toFixed(1)
          );
          centerTextFadeIn();
        }}
        style={{
          position: "absolute",
          height: SVGScale * (ringThickness + endRadius - startRadius),
          width: sliceThickness,
          // borderWidth: 1,
          // borderColor: "black",
          backgroundColor:
            // item.id % 2 === 0 ? "white" : "black",
            "transparent",
          transform: [
            { translateX: 1 * ScaleFactor },
            { rotate: item.value.toString(10) + "deg" },
            { translateY: -(SVGScale * (startRadius + endRadius)) / 2 },
          ],
        }}
        key={item.id}
      ></Pressable>
    );
  };

  const renderLegendComponent = (width: number) => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          paddingHorizontal: 5 * ScaleFactor,
          width: "100%",
          flexWrap: "wrap",
          // flex: 1,
        }}
      >
        {PieData.map((item: any) => {
          return (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                // width: (width - 70) / 3,
                marginHorizontal: 10 * ScaleFactor,
              }}
              key={item.id}
            >
              {renderDot(item.color)}
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 14 * ScaleFactor,
                  color: "white",
                  fontWeight: "500",
                  // flex: 1,
                }}
              >
                {item.tag === "N/A" ? "- - -" : item.tag}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <Animated.View
      style={{
        width: "100%",
        margin: 15,
        padding: 0,
        borderRadius: 20,
        backgroundColor: transparent,
        opacity: loadOpacity,
        // flex: 1,
      }}
    >
      <View style={styles.container}>
        <View style={styles.graphWrapper}>
          <Svg
            height={PieSize}
            width={PieSize}
            viewBox={"0 0 " + svgSize + " " + svgSize}
          >
            {PieData.map((items: any) => {
              return PieSectorPlot(items);
            })}
          </Svg>
          {sliceArray.map((items) => {
            return slicePlot(items);
          })}
          <CustomButton
            frameStyle={{
              position: "absolute",
              justifyContent: "center",
              alignContent: "center",
              borderRadius: 84 * ScaleFactor,
            }}
            buttonStyle={{
              borderRadius: 84 * ScaleFactor,
              paddingTop: 0 * ScaleFactor,
              backgroundColor: "#38352E",
              borderWidth: 6 * ScaleFactor,
              borderColor: "#BF550F",
              borderStyle: "solid",
              height: 164 * ScaleFactor,
              width: 164 * ScaleFactor,
              opacity: fadeAnim,
              elevation: 5,
            }}
            onPressOut={() => {
              tagText != "N/A" ? setModalVisible(true) : {};
            }}
          >
            <Animated.Text
              style={{
                fontSize: 24 * ScaleFactor,
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {config.defaultCurrency}
            </Animated.Text>
            <Animated.Text
              style={{
                fontSize: 30 * ScaleFactor,
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {hiddenState ? "***" : tagText != "N/A" ? valueText : "0"}
            </Animated.Text>
            <Animated.Text
              style={{
                fontSize: 18 * ScaleFactor,
                color: "white",
                textAlign: "center",
              }}
            >
              {tagText != "N/A" ? tagText : "No Records"}
            </Animated.Text>
            <Animated.Text
              style={{
                fontSize: 18 * ScaleFactor,
                color: "white",
                textAlign: "center",
              }}
            >
              {tagText != "N/A" ? PercentageText + "%" : "- - -"}
            </Animated.Text>
          </CustomButton>
        </View>
        <SpendingDetailsModal
          tagText={tagText}
          tagList={tagList}
          PieData={PieData}
          modalVisibleParent={modalVisible}
          setModalVisibleParent={setModalVisible}
          hiddenState={hiddenState}
          setGlobalReload={setGlobalReload}
          setTagText={setTagText}
        />
      </View>

      {renderLegendComponent(width)}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // width: DW,
  },
  graphWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    position: "absolute",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 24,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
