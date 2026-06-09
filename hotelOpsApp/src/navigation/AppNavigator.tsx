import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../features/auth/screens/LoginScreen";
import RegisterScreen from "../features/auth/screens/RegisterScreen";
import HomeScreen from "../features/home/screens/HomeScreen";
import CreateTicketScreen from "../features/tickets/screens/CreateTicketScreen";


import { useAuth } from "../contexts/AuthContext";
import { colors } from "../theme/colors";

import AgentHomeScreen from "../features/agent/screens/AgentHomeScreen";
import AgentTaskListScreen from "../features/agent/screens/AgentTaskListScreen";
import AgentTaskDetailScreen from "../features/agent/screens/AgentTaskDetailScreen";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;

  Home: undefined;
  CreateTicket: undefined;

  AgentHome: undefined;
  AgentTasks: undefined;
  AgentTaskDetail: {
    taskId: number;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AgentStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: "700",
        },
      }}
    >
      <Stack.Screen
        name="AgentHome"
        component={AgentHomeScreen}
        options={{
          title: "Mon espace",
        }}
      />

      <Stack.Screen
        name="AgentTasks"
        component={AgentTaskListScreen}
        options={{
          title: "Mes tâches",
        }}
      />

      <Stack.Screen
        name="AgentTaskDetail"
        component={AgentTaskDetailScreen}
        options={{
          title: "Détail intervention",
        }}
      />
    </Stack.Navigator>
  );
}

function UserStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Accueil",
        }}
      />

      <Stack.Screen
        name="CreateTicket"
        component={CreateTicketScreen}
        options={{
          title: "Nouveau ticket",
        }}
      />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const roleCode = user?.role?.code;

  const isMaintenanceAgent =
    roleCode === "MAINTENANCE_AGENT" || roleCode === "MAINTENANCE";

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : isMaintenanceAgent ? (
        <AgentStack />
      ) : (
        <UserStack />
      )}
    </NavigationContainer>
  );
}