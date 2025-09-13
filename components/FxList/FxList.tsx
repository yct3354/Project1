import {
  useRef,
  createContext,
  useContext,
  useState,
  useEffect,
  memo,
} from "react";
import {
  Text,
  View,
  Animated,
  StyleSheet,
  Dimensions,
  ColorValue,
} from "react-native";
import CustomButton from "@/components/customButton";
import FxTab from "@/components/FxList/FxTab";
import AddFxModal from "./AddFxModal";
import Feather from "@expo/vector-icons/Feather";
import { useSQLiteContext } from "expo-sqlite";
import fxOrder from "@/data/fxOrder.json";
import config from "@/components/config.json";

const DW = Dimensions.get("window").width;
const DH = Dimensions.get("window").height;
const ScaleFactor = DW / 411.4286;
const accentColor = "#EFBF04"; //9D00FF, FF8000
const themeColor = "#1A1A16"; //1A1915
const topBarColor: ColorValue = "#615F55"; //292823
const topBarColorS = "#615F55"; //292823
const plateColor = "#45423A"; //474440
const transparent = "#00000000";

interface FxList {
  loadSlide: any;
  hiddenState: boolean;
  isReloading: any;
}

const sizeFont = (fontSize: number) => {
  return Math.ceil(fontSize * ScaleFactor);
};

function FxList({ loadSlide, hiddenState, isReloading }: FxList) {
  const db = useSQLiteContext();
  const [isLoading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [fxList, setFxList] = useState<any[]>([]);

  const [modalVisible, setModalVisible] = useState(false);

  const GetFxList = async () => {
    try {
      return await db.getAllAsync(
        "SELECT SUM(amount*direction) AS balance, rate, currency FROM record GROUP BY currency"
      );
    } catch (error) {
      throw error;
    }
  };

  const fetchData = async () => {
    try {
      const list: any = await GetFxList();
      list.sort((a: any, b: any) => {
        const indexA = fxOrder.indexOf(a.currency);
        const indexB = fxOrder.indexOf(b.currency);

        // Handle cases where an ID might not be in orderArray (optional)
        // For example, place unlisted items at the end:
        if (indexA === -1 && indexB !== -1) return 1;
        if (indexB === -1 && indexA !== -1) return -1;
        if (indexA === -1 && indexB === -1) return 0;

        return indexA - indexB;
      });
      setFxList(list);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      fetchData();
      setRefresh(false);
    }
  }, [refresh, isReloading]);

  return (
    <Animated.View
      style={{
        width: "100%",
        transform: [{ translateY: loadSlide }],
      }}
    >
      <View style={styles.bottomBar}>
        <View style={styles.bottomLeftPlate}>
          <Text style={styles.secTitle}>Savings</Text>
        </View>
        <View style={styles.bottomRightPlate}>
          <CustomButton
            onPressOut={() => {
              setModalVisible(true);
            }}
            buttonStyle={{
              height: 35 * ScaleFactor,
              // width: 100,
              backgroundColor: plateColor,
              flexDirection: "row",
              paddingHorizontal: 10 * ScaleFactor,
            }}
          >
            <Feather name="plus" size={26 * ScaleFactor} color={accentColor} />
            <Text
              style={{
                color: "white",
                fontSize: 16 * ScaleFactor,
                fontWeight: "500",
              }}
              numberOfLines={1}
            >
              {"New Currency"}
            </Text>
          </CustomButton>
        </View>
      </View>
      {fxList.map((item) => (
        <FxTab
          plateStyle={{
            paddingHorizontal: 15,
            paddingVertical: 5,
          }}
          hiddenState={hiddenState}
          fxTag={item.currency}
          fxBalance={item.balance}
          fxRate={item.rate}
          key={item.currency}
          setRefresh={setRefresh}
        ></FxTab>
      ))}
      <AddFxModal
        setModalVisibleParent={setModalVisible}
        modalVisibleParent={modalVisible}
        tag={config.defaultCurrency}
        setRefresh={setRefresh}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  secTitle: {
    color: "white",
    fontSize: sizeFont(25),
    fontWeight: "bold",
    paddingLeft: 0,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "flex-start",
    backgroundColor: "transparent",
    height: 50,
    width: "100%",
    paddingLeft: 20,
    paddingRight: 15,
    paddingBottom: 0,
    marginTop: 5,
  },
  bottomLeftPlate: {
    // width: "80%",
    flexDirection: "column-reverse",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  bottomRightPlate: {
    // width: "20%",
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-end",
  },
});

export default memo(FxList);
