import React, { memo } from "react";
import { FlatList } from "react-native";
import InfoTab from "@/components/infoTab";

interface FlatListItemProps {
  item: any;
  hiddenState: boolean;
  setGlobalReload: any;
}

const FlatListItem = ({
  item,
  hiddenState,
  setGlobalReload,
}: FlatListItemProps) => {
  return (
    <InfoTab
      onPress={() => {
        console.log("Info Tab Pressed");
      }}
      plateStyle={{ paddingHorizontal: 15, paddingVertical: 5 }}
      item={item}
      hiddenState={hiddenState}
      setGlobalReload={setGlobalReload}
    ></InfoTab>
  );
};

export default memo(FlatListItem);
