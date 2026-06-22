import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

import { categoryService } from "../../../services/categoryService";
import { locationService } from "../../../services/locationService";
import { priorityService } from "../../../services/priorityService";

import type {
  CategoryItem,
  LocationItem,
  PriorityItem,
  SelectableAssetItem,
} from "../types";

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

  const selectedLocationAssets = useMemo<SelectableAssetItem[]>(() => {
    const locationAssets = selectedLocation?.locationAssets ?? [];

    return locationAssets
      .filter((locationAsset) => {
        return (
          locationAsset.isActive !== false &&
          locationAsset.asset?.isActive !== false
        );
      })
      .map((locationAsset) => ({
        ...locationAsset.asset,
        locationAssetId: locationAsset.id,
        label: locationAsset.label,
        quantity: locationAsset.quantity,
      }));
  }, [selectedLocation]);

  const loadInitialData = useCallback(async () => {
    try {
      setLoadingData(true);

      const [locationsData, prioritiesData, categoriesData] =
        await Promise.all([
          locationService.getAll(),
          priorityService.getAll(),
          categoryService.getAll(),
        ]);

      const activeLocations = locationsData.filter(
        (item) => item.isActive !== false
      );

      const activeCategories = categoriesData.filter(
        (item) => item.isActive !== false
      );

      setLocations(activeLocations);
      setPriorities(prioritiesData);
      setCategories(activeCategories);

      if (activeLocations.length > 0) {
        setLocationId(activeLocations[0].id);
      }

      if (activeCategories.length > 0) {
        setCategoryId(activeCategories[0].id);
      }

      if (prioritiesData.length > 0) {
        const defaultPriority =
          prioritiesData.find(
            (item) => String(item.code).toUpperCase() === "MEDIUM"
          ) || prioritiesData[0];

        setPriorityId(defaultPriority.id);
        setUrgencyLevel(defaultPriority.sortOrder ?? 3);
      }
    } catch (error: any) {
      console.log("LOAD TICKET FORM ERROR =", error?.response?.data || error);

      Alert.alert("Erreur", "Impossible de charger les données du formulaire.");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

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
    selectedLocationAssets,

    setLocationId,
    setCategoryId,
    selectPriority,

    loadingData,
    reload: loadInitialData,
  };
}