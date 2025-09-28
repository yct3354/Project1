import config from "@/components/config.json";
import CustomButton from "@/components/customButton";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useEffect, useRef, useState } from "react";
import { ColorValue, Dimensions, StyleSheet, Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

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

interface ExpandableListProps {
  list: any;
  setListParent: any;
}

export default function MultiSelectList({
  list,
  setListParent,
}: ExpandableListProps) {
  const flatList = useRef<any>(null);
  const [data, setData] = useState<string[]>([config.defaultName]);
  const [placeholder, setPlaceholder] = useState<string[]>(["Your Name ..."]);
  const [editState, setEditState] = useState(true);
  const initList = Array(list.length).fill(false);
  const [selectState, setSelectState] = useState(initList);

  function setList(item: any, index: number) {
    let temp = [...data];
    temp[index] = item;
    setData(temp);
    setListParent(temp);
  }
  function setListPH(item: any, index: number) {
    let temp = [...placeholder];
    temp[index] = item;
    setPlaceholder(temp);
  }

  useEffect(() => {
    flatList?.current.scrollToEnd({ animated: true });
  }, [data]);

  return (
    <View style={styles.participantList}>
      <View
        style={{
          // maxHeight: Math.ceil(51 * ScaleFactor) * 5,
          // borderRadius: 20 * ScaleFactor,
          overflow: "hidden",
        }}
      >
        <FlatList
          data={list}
          showsVerticalScrollIndicator={false}
          ref={flatList}
          initialScrollIndex={data.length - 1}
          scrollEnabled={false}
          getItemLayout={(data, index) => ({
            length: Math.ceil(51 * ScaleFactor),
            offset: Math.ceil(51 * ScaleFactor) * index,
            index,
          })}
          snapToInterval={Math.ceil(51 * ScaleFactor)}
          renderItem={({ item, index }) => (
            <View
              style={{
                borderBottomWidth: 1,
                borderColor: "#FFFFFF80",
                height: Math.ceil(51 * ScaleFactor),
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {/* <TextInput
                style={{
                  ...styles.titleInput,
                  fontSize: 22 * ScaleFactor,
                  width: "100%",
                  // borderBottomColor: "white",
                }}
                placeholder={placeholder[index]}
                onChangeText={(text) => setList(text, index)}
                placeholderTextColor="#FFFFFF80"
                onFocus={() => {
                  setListPH(placeholder[index], index);
                }}
                onEndEditing={() => {
                  setList(data[index], index);
                }}
                value={data[index]}
                // onBlur={() => console.log("blurred")}
                // keyboardType="number-pad"
                // editable={editState}
              /> */}
              <View
                style={{
                  // width: "10%",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 5 * ScaleFactor,
                  paddingTop: 3 * ScaleFactor,
                  // backgroundColor: "red",
                }}
              >
                <CustomButton
                  onPressOut={() => {
                    if (editState) {
                      const temp = [...selectState];
                      temp[index] = !temp[index];
                      setSelectState(temp);
                    }
                  }}
                  frameStyle={{
                    alignItems: "center",
                  }}
                  buttonStyle={{
                    ...styles.buttonStyle,
                  }}
                >
                  <View
                    style={{
                      ...styles.iconStyle,
                      // paddingRight: 1 * ScaleFactor,
                    }}
                  >
                    <FontAwesome
                      name={selectState[index] ? "check-square" : "square-o"}
                      size={24 * ScaleFactor}
                      color={editState ? accentColor : "#FFFFFF80"}
                    />
                  </View>
                </CustomButton>
              </View>
              <Text style={{ ...styles.text, fontSize: 20 * ScaleFactor }}>
                {item.user_group_name}
              </Text>
            </View>
          )}
        />
      </View>
      <View>
        <CustomButton
          onPressOut={() => {
            setData([...data, ""]);
            setPlaceholder([...placeholder, "Name"]);
          }}
          shrinkFactor={0.95}
        >
          <Text
            style={{
              color: "#007AFF",
              paddingVertical: 10 * ScaleFactor,
              paddingHorizontal: 15 * ScaleFactor,
              width: "100%",
              textAlign: "left",
              fontSize: 16,
              textAlignVertical: "center",
              height: 50 * ScaleFactor,
            }}
          >
            {"New Member"}
          </Text>
        </CustomButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    alignItems: "flex-end",
    justifyContent: "center",
    textAlign: "left",
    color: "white",
    fontWeight: "400",
    textAlignVertical: "center",
    // paddingHorizontal: 15 * ScaleFactor,
    paddingTop: 10 * ScaleFactor,
    paddingBottom: 10 * ScaleFactor,
    height: Math.ceil(50 * ScaleFactor),
  },
  row: {
    justifyContent: "flex-start",
    flexDirection: "row",
    width: "100%",
    paddingVertical: 5 * ScaleFactor,
  },
  participantList: {
    borderRadius: 10 * ScaleFactor,
    backgroundColor: plateColor,
    width: "100%",
    overflow: "hidden",
  },
  buttonStyle: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  iconStyle: {
    minWidth: 36 * ScaleFactor,
    alignItems: "center",
  },
});
