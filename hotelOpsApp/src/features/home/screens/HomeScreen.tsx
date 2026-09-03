import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import AppCard from "../../../components/ui/AppCard";
import ServicesEntryCard from "../../clientServices/components/ServicesEntryCard";
import { quickActionsByRole } from "../constants/quickActions";
import { styles } from "../styles/home.styles";
import { useAuth } from "../../../contexts/AuthContext";

export default function HomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Voulez-vous vous déconnecter ?", [
      {
        text: "Annuler",
        style: "cancel",
      },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const roleCode = user?.role?.code || "USER";
  const actions = quickActionsByRole[roleCode] || quickActionsByRole.USER;

  const handleQuickActionPress = (title: string) => {
    if (title === "Créer ticket") {
      navigation.navigate("CreateTicket");
      return;
    }

    // « Mes demandes » couvre desormais aussi les commandes et reservations
    // du module services, pas seulement les tickets de maintenance.
    if (title === "Mes demandes") {
      navigation.navigate("MyRequests", { tab: "orders" });
      return;
    }

    Alert.alert("Info", "Cette fonctionnalité sera ajoutée prochainement.");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Text style={styles.smallTitle}>BIENVENUE AU GRAND PALACE</Text>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialCommunityIcons name="logout" size={24} color="#1C2D5A" />
        </TouchableOpacity>
      </View>

      <Text style={styles.bigTitle}>
        Bonjour{" "}
        {user?.firstName
          ? `${user.firstName} ${user.lastName}`
          : "Utilisateur"}
        ,
      </Text>

      <View style={styles.roleBadge}>
        <MaterialCommunityIcons
          name="account-circle-outline"
          size={18}
          color="#fff"
        />
        <Text style={styles.roleBadgeText}>{roleCode}</Text>
      </View>

      <Text style={styles.sectionTitle}>Mes demandes en cours</Text>

      <AppCard style={styles.ticketCard}>
        <Text style={styles.ticketCategory}>MAINTENANCE</Text>
        <Text style={styles.ticketTitle}>Climatisation bruyante</Text>
        <Text style={styles.ticketStatus}>● Réparateur en route</Text>
      </AppCard>

      <TouchableOpacity onPress={() => navigation.navigate("CreateTicket")}>
        <AppCard style={styles.primaryCard}>
          <View style={styles.primaryCardRow}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons
                name="alert-outline"
                size={26}
                color="#fff"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.primaryCardLabel}>ASSISTANCE TECHNIQUE</Text>
              <Text style={styles.primaryCardTitle}>Signaler un problème</Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={30}
              color="#fff"
            />
          </View>
        </AppCard>
      </TouchableOpacity>

      <ServicesEntryCard />

      <Text style={styles.sectionTitle}>Services rapides</Text>

      <View style={styles.grid}>
        {actions.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.gridCard}
            activeOpacity={0.85}
            onPress={() => handleQuickActionPress(item.title)}
          >
            <AppCard style={{ flex: 1 }}>
              <View style={styles.gridIcon}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={28}
                  color="#1C2D5A"
                />
              </View>

              <Text style={styles.gridTitle}>{item.title}</Text>
              <Text style={styles.gridDesc}>{item.desc}</Text>
            </AppCard>
          </TouchableOpacity>
        ))}
      </View>

      <AppCard style={styles.banner}>
        <Text style={styles.bannerLabel}>INCONTOURNABLE</Text>
        <Text style={styles.bannerTitle}>Le Rooftop Infinity</Text>
        <Text style={styles.bannerDesc}>Ouvert jusqu'à 23h00 ce soir</Text>
      </AppCard>
    </ScrollView>
  );
}