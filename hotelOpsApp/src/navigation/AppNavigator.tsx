import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../features/auth/screens/LoginScreen";
import RegisterScreen from "../features/auth/screens/RegisterScreen";
import HomeScreen from "../features/home/screens/HomeScreen";
import CreateTicketScreen from "../features/tickets/screens/CreateTicketScreen";

import QrScannerScreen from "../features/tickets/screens/QrScannerScreen";
import PublicCreateTicketScreen from "../features/tickets/screens/PublicCreateTicketScreen";

import { useAuth } from "../contexts/AuthContext";
import { colors } from "../theme/colors";

import AgentHomeScreen from "../features/agent/screens/AgentHomeScreen";
import AgentTaskListScreen from "../features/agent/screens/AgentTaskListScreen";
import AgentTaskDetailScreen from "../features/agent/screens/AgentTaskDetailScreen";
import AgentLocationHistoryScreen from "../features/agent/screens/AgentLocationHistoryScreen";
import BookingDetailScreen from "../features/clientServices/screens/BookingDetailScreen";
import OrderDetailScreen from "../features/clientServices/screens/OrderDetailScreen";
import ServicesHomeScreen from "../features/clientServices/screens/ServicesHomeScreen";
import ServiceCatalogScreen from "../features/clientServices/screens/ServiceCatalogScreen";
import { domainLabel } from "../features/clientServices/utils/labels";
import ServiceItemDetailScreen from "../features/clientServices/screens/ServiceItemDetailScreen";
import RoomServiceCartScreen from "../features/clientServices/screens/RoomServiceCartScreen";
import RestaurantBookingScreen from "../features/clientServices/screens/RestaurantBookingScreen";
import SpaBookingScreen from "../features/clientServices/screens/SpaBookingScreen";
import GenericBookingScreen from "../features/clientServices/screens/GenericBookingScreen";
import MyRequestsScreen from "../features/clientServices/screens/MyRequestsScreen";
import type { ServicesStackParamList } from "../features/clientServices/types/navigation.types";

/** Routes historiques de l'app (auth, tickets, agent de maintenance). */
type CoreStackParamList = {
  Login: undefined;
  Register: undefined;

  Home: undefined;
  CreateTicket: undefined;

  QrScanner: undefined;
  PublicCreateTicket: {
    token: string;
    qrInfo: any;
  };

  AgentHome: undefined;
  AgentTasks: undefined;
  AgentTaskDetail: {
    taskId: number;
  };

  AgentLocationHistory: {
    locationId: number;
    locationName?: string;
  };
};

/**
 * Les 10 routes du module services sont declarees dans le feature lui-meme
 * (features/clientServices/types/navigation.types.ts) et fusionnees ici.
 * Sens de dependance : AppNavigator importe le feature, jamais l'inverse.
 */
export type RootStackParamList = CoreStackParamList & ServicesStackParamList;

const Stack = createNativeStackNavigator<RootStackParamList>();

const publicScreenOptions = {
  headerStyle: {
    backgroundColor: colors.primary,
  },
  headerTintColor: colors.white,
  headerTitleStyle: {
    fontWeight: "700" as const,
  },
};

function PublicScreens() {
  return (
    <>
      <Stack.Screen
        name="QrScanner"
        component={QrScannerScreen}
        options={{
          title: "Scanner QR",
        }}
      />

      <Stack.Screen
        name="PublicCreateTicket"
        component={PublicCreateTicketScreen}
        options={{
          title: "Signalement",
        }}
      />
    </>
  );
}

/** Les 10 ecrans du module services, empiles depuis l'accueil client. */
function ServicesScreens() {
  return (
    <>
      <Stack.Screen
        name="ServicesHome"
        component={ServicesHomeScreen}
        options={{
          title: "Services de l'hôtel",
        }}
      />

      <Stack.Screen
        name="ServiceCatalog"
        component={ServiceCatalogScreen}
        options={({ route }: any) => ({
          title: domainLabel(route.params?.domain),
        })}
      />

      <Stack.Screen
        name="ServiceItemDetail"
        component={ServiceItemDetailScreen}
        options={{
          title: "Détail",
        }}
      />

      <Stack.Screen
        name="RoomServiceCart"
        component={RoomServiceCartScreen}
        options={{
          title: "Mon panier",
        }}
      />

      <Stack.Screen
        name="RestaurantBooking"
        component={RestaurantBookingScreen}
        options={{
          title: "Réserver une table",
        }}
      />

      <Stack.Screen
        name="SpaBooking"
        component={SpaBookingScreen}
        options={{
          title: "Réserver un soin",
        }}
      />

      <Stack.Screen
        name="GenericBooking"
        component={GenericBookingScreen}
        options={({ route }: any) => ({
          title: domainLabel(route.params?.domain),
        })}
      />

      <Stack.Screen
        name="MyRequests"
        component={MyRequestsScreen}
        options={{
          title: "Mes demandes",
        }}
      />

      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{
          title: "Ma commande",
        }}
      />

      <Stack.Screen
        name="BookingDetail"
        component={BookingDetailScreen}
        options={{
          title: "Ma réservation",
        }}
      />
    </>
  );
}

function AgentStack() {
  return (
    <Stack.Navigator screenOptions={publicScreenOptions}>
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

      <Stack.Screen
        name="AgentLocationHistory"
        component={AgentLocationHistoryScreen}
        options={({ route }: any) => ({
          title: route.params?.locationName
            ? `Historique · ${route.params.locationName}`
            : "Historique endroit",
        })}
      />

      {PublicScreens()}
    </Stack.Navigator>
  );
}

function UserStack() {
  return (
    <Stack.Navigator screenOptions={publicScreenOptions}>
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

      {ServicesScreens()}

      {PublicScreens()}
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={publicScreenOptions}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          headerShown: false,
        }}
      />

      {PublicScreens()}
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
