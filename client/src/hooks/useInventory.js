import { useState, useEffect, useCallback } from "react";
import { inventoryAPI } from "../api";

export const useInventory = (initialPage = 1, initialPageSize = 10) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 1,
    totalItems: 0,
    next: null,
    prev: null,
  });
  const [pageSize, setPageSize] = useState(initialPageSize);

  const fetchInventory = useCallback(async (page, limit) => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryAPI.getAll({ page, limit });
      console.log(
        "Full API response in useInventory hook (with pagination):",
        response
      );
      const backendData = response.data;

      if (backendData && backendData.success) {
        const itemsArray = backendData.data;
        if (Array.isArray(itemsArray)) {
          setInventory(itemsArray);
          if (backendData.pagination) {
            setPagination({
              currentPage: backendData.pagination.currentPage,
              totalPages: backendData.pagination.totalPages,
              totalItems: backendData.pagination.totalItems,
              next: backendData.pagination.next || null,
              prev: backendData.pagination.prev || null,
            });
          }
          console.log(
            "Inventory data successfully fetched and set:",
            itemsArray
          );
          console.log("Pagination data from backend:", backendData.pagination);
        } else {
          console.error(
            "Fetched data's 'data' property is not an array. Received:",
            itemsArray
          );
          setInventory([]);
          setError("Format data inventaris tidak sesuai dari API.");
        }
      } else {
        console.error(
          "API call was not successful or backendData is missing:",
          backendData
        );
        setInventory([]);
        setError(backendData?.message || "Gagal mengambil data dari API.");
      }
    } catch (err) {
      console.error("Error fetching inventory in useInventory hook:", err);
      setError(err.message || "Gagal memuat data inventaris");
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory(pagination.currentPage, pageSize);
  }, [fetchInventory, pagination.currentPage, pageSize]);

  const goToPage = (pageNumber) => {
    setPagination((prev) => ({ ...prev, currentPage: pageNumber }));
  };

  const changePageSize = (newSize) => {
    setPageSize(newSize);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const refetch = useCallback(() => {
    fetchInventory(pagination.currentPage, pageSize);
  }, [fetchInventory, pagination.currentPage, pageSize]);

  return {
    inventory,
    loading,
    error,
    pagination,
    pageSize,
    refetch,
    goToPage,
    changePageSize,
  };
};
