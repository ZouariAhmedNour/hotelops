import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// import { useAuth } from "../contexts/AuthContext";

// import LoginScreen from "../screens/LoginScreen";
// import DashboardScreen from "../screens/DashboardScreen";
// import TicketListScreen from "../screens/TicketListScreen";
// import TicketDetailScreen from "../screens/TicketDetailScreen";
// import TicketCreateScreen from "../screens/TicketCreateScreen";

/* =========================================================
   Types Navigation
========================================================= */

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  TicketDetail: { ticketId: number };
  TicketCreate: undefined;
};

export type BottomTabParamList = {
  Dashboard: undefined;
  Tickets: undefined;
};

/* =========================================================
   Navigators
========================================================= */

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

/* =========================================================
   Bottom Tabs
========================================================= */

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: "Accueil",
        }}
      />

      <Tab.Screen
        name="Tickets"
        component={TicketListScreen}
        options={{
          title: "Tickets",
        }}
      />
    </Tab.Navigator>
  );
};

/* =========================================================
   Main Navigator
========================================================= */

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Pendant le chargement de la session
  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
          />
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={MainTabs}
            />

            <Stack.Screen
              name="TicketDetail"
              component={TicketDetailScreen}
              options={{
                headerShown: true,
                title: "Détail du ticket",
              }}
            />

            <Stack.Screen
              name="TicketCreate"
              component={TicketCreateScreen}
              options={{
                headerShown: true,
                title: "Nouveau ticket",
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;