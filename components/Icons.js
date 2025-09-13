import React, { useRef, useState } from "react";
import {
  Text,
  StyleSheet,
  View,
  Animated,
  ColorValue,
  Dimensions,
} from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";
import iconMap from "@/data/iconMap.json";

const accentColor = "#EFBF04"; //9D00FF, FF8000
const transparent = "#00000000";

const DW = Dimensions.get("window").width;
const DH = Dimensions.get("window").height;
const ScaleFactor = DW / 411.4286;

const findIconIndex = (tagText) => {
  let index = iconMap.findIndex((obj) => obj.tagText === tagText);
  return index != -1 ? index : iconMap.length - 1;
};

export default function Icons({ tagText, size, color }) {
  const index = findIconIndex(tagText);
  switch (iconMap[index].lib) {
    case "F6": {
      return (
        <FontAwesome6 name={iconMap[index].name} size={size} color={color} />
      );
    }
    case "Material": {
      return (
        <MaterialIcons name={iconMap[index].name} size={size} color={color} />
      );
    }
    case "Feather": {
      return <Feather name={iconMap[index].name} size={size} color={color} />;
    }
    // default: {
    //   return <FontAwesome6 name={iconMap[0].name} size={size} color={color} />;
    // }
  }
}
