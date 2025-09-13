import config from "@/components/config.json";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const fetchUserGroups = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    // const dataSend = {};
    const response = await fetch(config.devURL + "/getUserGroups", {
      method: "GET",
      headers: {
        "Content-Type": "application/JSON",
        authorization: `Bearer ${token}`,
      },
      // body: JSON.stringify(dataSend),
    });
    const data = await response.json();
    // setUserData(data);
    console.log(data);
  } catch (error) {
    console.log(error);
  }
};

export const fetchGroupSessions = async (
  group_id = "74bbbe9e-68d6-40d4-ad13-0a41727c8a62"
) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const dataSend = { group_id: group_id };
    const response = await fetch(config.devURL + "/getGroupSessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/JSON",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataSend),
    });
    const data = await response.json();
    // setUserData(data);
    console.log(data);
  } catch (error) {
    console.log(error);
  }
};

export const fetchGroupUsers = async (
  group_id = "74bbbe9e-68d6-40d4-ad13-0a41727c8a62"
) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const dataSend = { group_id: group_id };
    const response = await fetch(config.devURL + "/getGroupUsers", {
      method: "POST",
      headers: {
        "Content-Type": "application/JSON",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataSend),
    });
    const data = await response.json();
    // setUserData(data);
    console.log(data);
  } catch (error) {
    console.log(error);
  }
};

export const fetchSessionTransactions = async (
  session_id = "320cefcf-72d2-4a47-b7a6-44934e7699cc"
) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const dataSend = { session_id: session_id };
    const response = await fetch(config.devURL + "/getSessionTransactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/JSON",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataSend),
    });
    const data = await response.json();
    // setUserData(data);
    console.log(data);
  } catch (error) {
    console.log(error);
  }
};

const logout = async (username: string, password: string) => {
  try {
    const dataSend = { username: username, password: password };
    const response = await fetch(config.devURL + "/logout", {
      method: "POST",
      headers: { "Content-Type": "application/JSON" },
      body: JSON.stringify(dataSend),
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.log(error);
  }
};

export const obtainDelta = async (
  group_id_table: Object[],
  user_group_id_table: Object[],
  tag_table: Object[],
  session_id_table: Object[],
  transaction_table: Object[]
) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const dataSend = {
      group_id_table: group_id_table,
      user_group_id_table: user_group_id_table,
      tag_table: tag_table,
      session_id_table: session_id_table,
      transaction_table: transaction_table,
    };

    const response = await fetch(config.devURL + "/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/JSON",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataSend),
    });
    const data = await response.json();
    // console.log(data);
    return data;
  } catch (error) {
    console.log(error);
  }
};
