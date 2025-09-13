import React, { useEffect, useRef, useState, memo } from "react";
import {
  Modal,
  Text,
  StyleSheet,
  View,
  Animated,
  ColorValue,
  Dimensions,
  FlatList,
  ScrollView,
} from "react-native";
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
  Directions,
} from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import CustomButton from "@/components/customButton";
// import SerialButton from "@/components/PieChartModal/SerialButton";
import ModalFlatList from "@/components/PieChartModal/ModalFlatList";
import Feather from "@expo/vector-icons/Feather";
import config from "@/components/config.json";

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

const sortList: string[] = ["Date", "Amount", "Title"];
const filterList: string[] = ["Hidden Shown", "All Direction"];

import { useSharedValue } from "react-native-reanimated";
import { useSQLiteContext } from "expo-sqlite";

interface ModalInput {
  tagText: any;
  tagList: any;
  PieData: any;
  modalVisibleParent: any;
  setModalVisibleParent: any;
  hiddenState: boolean;
  setGlobalReload: any;
  setTagText: any;
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

function transparentFade(initColor: string, x: number, y: number) {
  let arr: ColorValue[] = [];
  for (let i = 1; i <= x; i++) {
    let num = Math.ceil((y / 2) * Math.cos((Math.PI * i) / 50) + 255 / 2);
    arr.push(initColor + (num < 16 ? "0" : "") + num.toString(16));
  }

  return arr;
}

function SpendingDetailsModal({
  tagText,
  tagList,
  PieData,
  modalVisibleParent,
  setModalVisibleParent,
  hiddenState,
  setGlobalReload,
}: ModalInput) {
  const db = useSQLiteContext();
  const start = useSharedValue(0);

  const [modalVisible, setModalVisble] = useState(false);

  const modalAppear = useRef(new Animated.Value(0)).current;
  const ModalIPColor = modalAppear.interpolate({
    inputRange: [0, 1],
    outputRange: ["#00000000", "#0000008c"],
  });

  const modalAnim = modalAppear.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -DH * 0.78],
  });

  const ListRef = useRef<FlatList>(null);

  const currentIndex = tagList.findIndex((obj: any) => obj.text === tagText);

  const [page, setPage] = useState(currentIndex);

  function handleScroll(event: any) {
    const scrollIndex = Math.round(event.nativeEvent.contentOffset.x / DW);
    page != scrollIndex ? setPage(scrollIndex) : {};
  }

  const ModalSlideIn = (rebound: boolean) => {
    if (!rebound) {
      setPage(currentIndex);
      setModalVisble(true);
    }
    ListRef.current?.scrollToIndex({ animated: false, index: currentIndex });

    Animated.timing(modalAppear, {
      toValue: 1,
      duration: 300,
      delay: 10,
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
    if (modalVisibleParent) ModalSlideIn(false);
  }, [modalVisibleParent]);

  const modalPan = Gesture.Pan()
    .onBegin((e) => {
      start.value = e.absoluteY;
    })
    .onUpdate((e) => {
      modalAppear.setValue(1 - (e.absoluteY - start.value) / (DH * 0.78));
    })
    .onEnd((e) => {
      if (e.absoluteY - start.value > DH * 0.5) {
        ModalSlideOut();
      } else {
        ModalSlideIn(true);
      }
    })
    .runOnJS(true);

  const modalFling = Gesture.Fling()
    .direction(Directions.DOWN)
    .onStart((e) => {
      ModalSlideOut();
      console.log("fling");
    })
    .runOnJS(true);

  const modalGesture = Gesture.Simultaneous(modalFling, modalPan);

  const singleModal = (tagText: string, lastItem: boolean) => {
    const totalSum: number =
      PieData[PieData.findIndex((obj: any) => obj.tag === tagText)].value;
    return (
      <Animated.View
        key={tagText}
        style={{
          ...styles.modalView,
          borderColor: accentColor,
          borderWidth: 2,
          width: DW,
          marginRight: lastItem ? 0 : 20,
          zIndex: 1,
          overflow: "hidden",
        }}
      >
        <GestureHandlerRootView style={{ top: 0 }}>
          <GestureDetector gesture={modalGesture}>
            <View>
              <View style={{ alignItems: "center" }}>
                <CustomButton
                  frameStyle={{
                    backgroundColor: "tranparent",
                    width: DW,
                    height: DH * 0.02,
                    justifyContent: "center",
                    alignItems: "center",
                    top: 0,
                  }}
                  buttonStyle={{
                    // flex: 1,
                    backgroundColor: "#ffffff65",
                    width: "35%",
                    height: "20%",
                    top: "25%",
                    borderRadius: 3,
                  }}
                  onPressOut={() => {}}
                  shrinkFactor={0.97}
                ></CustomButton>
                <View
                  style={{
                    width: DW,
                    flexDirection: "row",
                    paddingHorizontal: 20,
                    paddingVertical: 0,
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.modalText}>{tagText}</Text>
                  <CustomButton
                    onPressOut={() => ModalSlideOut()}
                    buttonStyle={{
                      height: 40,
                      width: 40,
                      backgroundColor: { transparent },
                      paddingTop: 5,
                    }}
                  >
                    <Feather name="x" size={30} color={accentColor} />
                  </CustomButton>
                </View>

                <View
                  style={{
                    width: DW,
                    flexDirection: "row",
                    paddingHorizontal: 20,
                    paddingVertical: 0,
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.amountText}>
                    {totalSum.toLocaleString(location, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) +
                      " " +
                      config.defaultCurrency}
                  </Text>
                </View>
              </View>

              <ModalFlatList
                tagText={tagText}
                hiddenState={hiddenState}
                setGlobalReload={setGlobalReload}
                ModalSlideOut={ModalSlideOut}
              />
              <LinearGradient
                colors={[
                  transparentC,
                  transparentC,
                  ...[...transparentFade(modalColor, 50, 255)].reverse(),
                ]}
                locations={[0, 0, ...linspace(0, 1, 50)]}
                style={{
                  width: "100%",
                  height: "10%",
                  position: "absolute",
                  top: "90%",
                  borderTopWidth: 0,
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                  borderRadius: 20,
                }}
              ></LinearGradient>
            </View>
          </GestureDetector>
        </GestureHandlerRootView>
      </Animated.View>
    );
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
                height: DH * 0.72,
                transform: [{ translateY: modalAnim }],
                flex: 1,
              }}
            >
              <ScrollView
                horizontal={true}
                snapToInterval={DW + 20}
                decelerationRate={0.85}
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                contentOffset={{
                  x: (modalVisible ? page : currentIndex) * (DW + 20),
                  y: 0,
                }}
              >
                {tagList.map((item: any, index: number) => {
                  return singleModal(
                    item.text,
                    index === tagList.length - 1 ? true : false
                  );
                })}
              </ScrollView>
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
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginTop: 5 * ScaleFactor,
    textAlign: "left",
    color: "white",
    fontWeight: "bold",
    fontSize: 24 * ScaleFactor,
    flex: 1,
    marginLeft: 2 * ScaleFactor,
  },
  amountText: {
    marginVertical: 5 * ScaleFactor,
    textAlign: "left",
    color: "white",
    fontWeight: "bold",
    fontSize: 30 * ScaleFactor,
    flex: 1,
  },
  secTitleText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 24 * ScaleFactor,
    textAlignVertical: "center",
    paddingRight: 10 * ScaleFactor,
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
    minWidth: 80 * ScaleFactor,
    minHeight: 30 * ScaleFactor,
  },
});

export default memo(SpendingDetailsModal);
