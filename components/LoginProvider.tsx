import config from "@/components/config.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useEffect, useState } from "react";

export const LoginState = createContext<any>(false);

export const LoginProvider = ({ children }: any) => {
  // const login = async (username: string, password: string) => {
  //   try {
  //     const dataSend = { username: username, password: password };
  //     const response = await fetch(config.devURL + "/login", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/JSON" },
  //       body: JSON.stringify(dataSend),
  //     });
  //     const data = await response.json();
  //     if (data.message === "Login successful") {
  //       try {
  //         await SecureStore.setItemAsync("username", username);
  //         await SecureStore.setItemAsync("password", password);
  //         await AsyncStorage.setItem("token", data.token);
  //         return true;
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     } else {
  //       return false;
  //     }
  //     console.log(data);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // const username: any = await SecureStore.getItemAsync("username");
  // const password: any = await SecureStore.getItemAsync("password");

  // const initLogin = await login(username, password);
  const [loginState, setLoginState] = useState(false);

  useEffect(() => {
    const login = async () => {
      try {
        const username: any = await SecureStore.getItemAsync("username");
        const password: any = await SecureStore.getItemAsync("password");
        if (username != null && password != null) {
          const dataSend = { username: username, password: password };
          const response = await fetch(config.devURL + "/login", {
            method: "POST",
            headers: { "Content-Type": "application/JSON" },
            body: JSON.stringify(dataSend),
          });
          const data = await response.json();
          if (data.message === "Login successful") {
            try {
              await SecureStore.setItemAsync("username", username);
              await SecureStore.setItemAsync("password", password);
              await AsyncStorage.setItem("token", data.token);
              setLoginState(true);
            } catch (error) {
              console.log(error);
            }
          } else {
            setLoginState(false);
          }
          console.log(data);
        } else {
          setLoginState(false);
          console.log("Not logged in");
        }
      } catch (error) {
        console.log(error);
      }
    };
    login();
  }, []);

  return (
    <LoginState.Provider value={{ loginState, setLoginState }}>
      {children}
    </LoginState.Provider>
  );
};
