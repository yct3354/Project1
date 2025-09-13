import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  ColorValue,
  ScrollView,
  Image,
  TextInput,
} from "react-native";
import { useState } from "react";
import images from "@/components/Images";
import { fxIndexMap } from "@/components/fxIndexMap";

const DW = Dimensions.get("window").width;
const DH = Dimensions.get("window").height;
const ScaleFactor = DW / 411.4286;

const transparent = "#00000000";

interface filterButtonContentProps {
  text: string;
  index: number;
  state: number;
  setFilterValue: any;
}

const location = "en-US";

const formatterUS = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function parseLocaleNumber(stringNumber: string, locale: string) {
  var thousandSeparator = Intl.NumberFormat(locale)
    .format(11111)
    .replace(/\p{Number}/gu, "");
  var decimalSeparator = Intl.NumberFormat(locale)
    .format(1.1)
    .replace(/\p{Number}/gu, "");

  return parseFloat(
    stringNumber
      .replace(new RegExp("\\" + thousandSeparator, "g"), "")
      .replace(new RegExp("\\" + decimalSeparator), ".")
  );
}

export default function FilterButtonContent({
  text,
  index,
  state,
  setFilterValue,
}: filterButtonContentProps) {
  const [primaryAmount, onChangePrimaryAmount] = useState("");
  const [primaryPlaceholder, setPrimaryPlaceholder] = useState(
    formatterUS.format(100)
  );
  switch (index) {
    case 2: {
      if (state != 0) {
        return (
          <View
            style={{
              flexDirection: "row",
              alignContent: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={images[fxIndexMap(text)]}
              style={{
                flex: 0.5,
                width: null,
                height: null,
                resizeMode: "contain",
              }}
            />
            <Text style={styles.buttonText2}>{text}</Text>
          </View>
        );
      } else {
        return (
          <View
            style={{
              flexDirection: "row",
              alignContent: "center",
              justifyContent: "center",
            }}
          >
            <Text style={styles.buttonText}>{text}</Text>
          </View>
        );
      }
    }
    case 3: {
      return (
        <View
          style={{
            flexDirection: "row",
            alignContent: "center",
            justifyContent: "center",
          }}
        >
          <Text style={styles.buttonText3}>{text}</Text>
          <TextInput
            style={{
              ...styles.row1Amount,
              fontSize: 16 * ScaleFactor,
            }}
            editable={state === 0 ? false : true}
            placeholder={primaryPlaceholder}
            placeholderTextColor="white"
            selectTextOnFocus={true}
            underlineColorAndroid={transparent}
            onFocus={() => {
              setPrimaryPlaceholder("");
              if (parseLocaleNumber(primaryAmount, location) === 0)
                onChangePrimaryAmount("");
            }}
            onChangeText={onChangePrimaryAmount}
            onEndEditing={() => {
              onChangePrimaryAmount(formatterUS.format(Number(primaryAmount)));
              setFilterValue(Number(primaryAmount));
            }}
            value={primaryAmount}
            keyboardType="number-pad"
          />
        </View>
      );
    }
  }
  return (
    <View
      style={{
        flexDirection: "row",
        alignContent: "center",
        justifyContent: "center",
      }}
    >
      <Text style={styles.buttonText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonText: {
    color: "white",
    fontSize: 16 * ScaleFactor,
    fontWeight: "500",
    marginHorizontal: 10 * ScaleFactor,
    textAlignVertical: "center",
  },
  buttonText2: {
    color: "white",
    fontSize: 16 * ScaleFactor,
    fontWeight: "500",
    marginRight: 10 * ScaleFactor,
    textAlignVertical: "center",
  },
  buttonText3: {
    color: "white",
    fontSize: 16 * ScaleFactor,
    fontWeight: "500",
    // marginHorizontal: 10 * ScaleFactor,
    textAlignVertical: "center",
  },
  row1Amount: {
    // width: "40%",
    alignItems: "flex-end",
    justifyContent: "center",
    backgroundColor: transparent,
    textAlign: "right",
    color: "white",
    fontWeight: "500",
    textAlignVertical: "bottom",
    // borderBottomColor: "white",
    // borderBottomWidth: 2,
    paddingBottom: 0,
    paddingTop: 0,
  },
});
