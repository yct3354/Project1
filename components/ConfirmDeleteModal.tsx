import { ConfirmState } from "@/components/ConfirmProvider";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  ColorValue,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";
import CustomButton from "./customButton";

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

interface ConfirmDeleteModalProps {
  onConfirm: any;
  onCancel: any;
  text: string;
}

export default function ConfirmDeleteModal({
  onConfirm,
  onCancel,
  text,
}: ConfirmDeleteModalProps) {
  const { confirmState, setConfirmState } = useContext(ConfirmState);
  const [modalVisible, setModalVisble] = useState(false);
  const modalAppear = useRef(new Animated.Value(0)).current;
  const ModalIPColor = modalAppear.interpolate({
    inputRange: [0, 1],
    outputRange: ["#00000000", "#0000008c"],
  });

  const modalAnim = modalAppear.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -DH * 0.6],
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

  const ModalSlideOut = (option: boolean) => {
    Animated.timing(modalAppear, {
      toValue: 0,
      duration: 300, // Animation duration in milliseconds
      useNativeDriver: true, // Use native driver for performance
    }).start(() => {
      setConfirmState(false);
      setModalVisble(false);
      option ? onConfirm() : onCancel();
    });
  };

  useEffect(() => {
    if (confirmState) {
      ModalSlideIn(false);
    }
  }, [confirmState]);

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
          ModalSlideOut(false);
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
              ...styles.centeredView,
            }}
          >
            <Animated.View
              style={{
                position: "absolute",
                top: DH,
                width: "75%",
                // height: DH * 0.14,
                transform: [{ translateY: modalAnim }],
                flex: 1,
              }}
            >
              {/* Content here */}
              <View style={styles.modalView}>
                <Text style={styles.titleText}>{text}</Text>
                <View style={styles.bottomBar}>
                  <CustomButton
                    onPressOut={() => {
                      ModalSlideOut(true);
                    }}
                    frameStyle={{
                      width: "50%",
                      alignItems: "center",
                    }}
                    buttonStyle={{
                      width: "100%",
                      backgroundColor: transparent,
                    }}
                  >
                    <Text style={{ ...styles.bottomText, color: "#007AFF" }}>
                      {"Confirm"}
                    </Text>
                  </CustomButton>
                  <CustomButton
                    onPressOut={() => {
                      ModalSlideOut(false);
                    }}
                    frameStyle={{
                      width: "50%",
                      alignItems: "center",
                    }}
                    buttonStyle={{
                      width: "100%",
                      backgroundColor: { transparent },
                    }}
                  >
                    <Text style={{ ...styles.bottomText, color: "#FF3B30" }}>
                      {"Cancel"}
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
    paddingVertical: 5 * ScaleFactor,
    paddingHorizontal: 15 * ScaleFactor,
  },
  titleText: {
    color: "white",
    fontSize: 24 * ScaleFactor,
    fontWeight: "bold",
    textAlign: "center",
    // backgroundColor: "red",
    marginVertical: 10 * ScaleFactor,
  },
  bottomBar: {
    flexDirection: "row",
    flex: 1,
    width: "100%",
    alignItems: "flex-end",
    justifyContent: "center",
    // marginTop: 8 * ScaleFactor,
    // marginBottom: 5 * ScaleFactor,
    marginVertical: 10 * ScaleFactor,
  },
  bottomText: {
    fontSize: 20 * ScaleFactor,
    fontWeight: "400",
    textAlign: "center",
    textAlignVertical: "center",
  },
});
