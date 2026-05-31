import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

import { locationService } from "../../../services/locationService";
import { priorityService } from "../../../services/priorityService";
import { categoryService } from "../../../services/categoryService";

import type { LocationItem, PriorityItem, CategoryItem } from "../types";

export function useTicketFormData() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [priorities, setPriorities] = useState<PriorityItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  const [locationId, setLocationId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [priorityId, setPriorityId] = useState<number | null>(null);

  const [urgencyLevel, setUrgencyLevel] = useState<number>(3);
  const [loadingData, setLoadingData] = useState(true);

  const selectedLocation = useMemo(
    () => locations.find((item) => item.id === locationId) || null,
    [locations, locationId]
  );

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === categoryId) || null,
    [categories, categoryId]
  );

  const selectedPriority = useMemo(
    () => priorities.find((item) => item.id === priorityId) || null,
    [priorities, priorityId]
  );

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);

      const [locationsRes, prioritiesRes, categoriesRes] = await Promise.all([
        locationService.getAll(),
        priorityService.getAll(),
        categoryService.getAll(),
      ]);

      const locationsData = locationsRes.data?.data ?? locationsRes.data ?? [];
      const prioritiesData = prioritiesRes.data?.data ?? prioritiesRes.data ?? [];
      const categoriesData = categoriesRes.data?.data ?? categoriesRes.data ?? [];

      setLocations(locationsData);
      setPriorities(prioritiesData);
      setCategories(categoriesData);

      if (locationsData.length > 0) {
        setLocationId(locationsData[0].id);
      }

      if (categoriesData.length > 0) {
        setCategoryId(categoriesData[0].id);
      }

      if (prioritiesData.length > 0) {
        setPriorityId(prioritiesData[0].id);
        setUrgencyLevel(prioritiesData[0].sortOrder ?? 3);
      }
    } catch (error: any) {
      console.log("LOAD ERROR =", error?.response?.data || error.message);

      Alert.alert("Erreur", "Impossible de charger les données.");
    } finally {
      setLoadingData(false);
    }
  };

  const selectPriority = (priority: PriorityItem) => {
    setPriorityId(priority.id);
    setUrgencyLevel(priority.sortOrder ?? 3);
  };

  return {
    locations,
    priorities,
    categories,

    locationId,
    categoryId,
    priorityId,
    urgencyLevel,

    selectedLocation,
    selectedCategory,
    selectedPriority,

    setLocationId,
    setCategoryId,
    selectPriority,

    loadingData,
  };
}