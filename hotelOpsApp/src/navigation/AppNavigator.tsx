import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import RegisterScreen from "../features/auth/screens/RegisterScreen";
import CreateTicketScreen from "../features/tickets/screens/CreateTicketScreen";
import HomeScreen from "../features/home/screens/HomeScreen";
import LoginScreen from "../features/auth/screens/LoginScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      setIsAuthenticated(!!token);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
        <>
          <Stack.Screen name="Home">
  {(props) => (
    <HomeScreen
      {...props}
      setIsAuthenticated={setIsAuthenticated}
    />
  )}
</Stack.Screen>
          <Stack.Screen name="CreateTicket" component={CreateTicketScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen
                  {...props}
                  setIsAuthenticated={setIsAuthenticated}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
