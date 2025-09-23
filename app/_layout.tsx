import React from "react";

import { LoginProvider } from "@/components/LoginProvider";
import SessionDetails from "@/components/Shared/SessionDetails";
import { createStackNavigator } from "@react-navigation/stack";
import * as SQLite from "expo-sqlite";
import { View } from "react-native";
import AddGroup from "../components/Shared/AddGroup";
import GroupView from "../components/Shared/GroupView";
import SessionView from "../components/Shared/SessionView";
import FullList from "./FullList";
import HomeScreen from "./HomeScreen";
import LoginScreen from "./LoginScreen";

const themeColor = "#1A1A16"; //1A1915
const Stack = createStackNavigator();

export default function RootLayout() {
  return (
    <SQLite.SQLiteProvider
      databaseName="record.db"
      onInit={async (db) => {
        await db.execAsync("PRAGMA journal_mode = WAL");
        await db.execAsync("PRAGMA synchronous = OFF");
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS record ( 
            _id TEXT Primary KEY NOT NULL,
            amount FLOAT(12) NOT NULL,
            tag TEXT,
            currency TEXT NOT NULL,
            title TEXT NOT NULL,
            date TEXT NOT NULL,
            rate FLOAT(12) NOT NULL,
            hidden BOOLEAN NOT NULL,
            direction INT NOT NULL
          )
          `);
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS group_id_table (
            group_id TEXT Primary KEY NOT NULL,
            group_name TEXT NOT NULL,
            timeStamp INT(32) NOT NULL,
            user_group_id TEXT NOT NULL,
            emoji TEXT
          )
          `);
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS tag_table (
            tag_id TEXT Primary KEY NOT NULL,
            tag_name TEXT NOT NULL,
            timeStamp INT(32) NOT NULL,
            group_id TEXT NOT NULL,
            emoji TEXT
          )
          `);
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS user_group_id_table (
            user_group_id TEXT Primary KEY NOT NULL,
            group_id TEXT,
            user_group_name TEXT NOT NULL,
            emoji TEXT,
            timeStamp INT(32) NOT NULL
          )
          `);
        // await db.execAsync(`DROP TABLE user_group_id_table`);
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS session_id_table (
            session_id TEXT Primary KEY NOT NULL,
            group_id TEXT NOT NULL,
            session_name TEXT NOT NULL,
            date TEXT NOT NULL,
            tag_id TEXT,
            timeStamp INT(32) NOT NULL
          )
          `);

        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS transaction_table ( 
            transaction_id TEXT Primary KEY NOT NULL,
            session_id TEXT NOT NULL,
            user_group_id TEXT NOT NULL,
            payer_payee BOOLEAN NOT NULL,
            amount FLOAT(12) NOT NULL,
            currency TEXT NOT NULL,
            rate FLOAT(12) NOT NULL,
            timeStamp INT(12) NOT NULL
          )
          `);
      }}
      options={{ useNewConnection: false }}
    >
      <LoginProvider>
        <View
          style={{
            flex: 1,
            backgroundColor: themeColor,
          }}
        >
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="FullList"
              component={FullList}
              options={{
                headerShown: false,
                animation: "slide_from_right",
                transitionSpec: {
                  open: {
                    animation: "timing",
                    config: {
                      duration: 300, // Faster open animation (150ms)
                    },
                  },
                  close: {
                    animation: "timing",
                    config: {
                      duration: 300, // Slower close animation (500ms)
                    },
                  },
                },
              }}
            />
            <Stack.Screen
              name="LoginScreen"
              component={LoginScreen}
              options={{
                headerShown: false,
                animation: "scale_from_center",
                transitionSpec: {
                  open: {
                    animation: "timing",
                    config: {
                      duration: 300, // Faster open animation (150ms)
                    },
                  },
                  close: {
                    animation: "timing",
                    config: {
                      duration: 300, // Slower close animation (500ms)
                    },
                  },
                },
              }}
            />
            <Stack.Screen
              name="GroupView"
              component={GroupView}
              options={{
                headerShown: false,
                animation: "scale_from_center",
                transitionSpec: {
                  open: {
                    animation: "timing",
                    config: {
                      duration: 300, // Faster open animation (150ms)
                    },
                  },
                  close: {
                    animation: "timing",
                    config: {
                      duration: 300, // Slower close animation (500ms)
                    },
                  },
                },
              }}
            />
            <Stack.Screen
              name="SessionView"
              component={SessionView}
              options={{
                headerShown: false,
                animation: "slide_from_right",
                transitionSpec: {
                  open: {
                    animation: "timing",
                    config: {
                      duration: 300, // Faster open animation (150ms)
                    },
                  },
                  close: {
                    animation: "timing",
                    config: {
                      duration: 300, // Slower close animation (500ms)
                    },
                  },
                },
              }}
            />
            <Stack.Screen
              name="SessionDetails"
              component={SessionDetails}
              options={{
                headerShown: false,
                animation: "slide_from_right",
                transitionSpec: {
                  open: {
                    animation: "timing",
                    config: {
                      duration: 300, // Faster open animation (150ms)
                    },
                  },
                  close: {
                    animation: "timing",
                    config: {
                      duration: 300, // Slower close animation (500ms)
                    },
                  },
                },
              }}
            />
            <Stack.Screen
              name="AddGroup"
              component={AddGroup}
              options={{
                headerShown: false,
                animation: "slide_from_bottom",
                transitionSpec: {
                  open: {
                    animation: "timing",
                    config: {
                      duration: 300, // Faster open animation (150ms)
                    },
                  },
                  close: {
                    animation: "timing",
                    config: {
                      duration: 300, // Slower close animation (500ms)
                    },
                  },
                },
              }}
            />
          </Stack.Navigator>
        </View>
      </LoginProvider>
    </SQLite.SQLiteProvider>
  );
}
