import React, { useState, useContext, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Space,
  message,
  Popconfirm,
  Layout,
  Input,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import InventoryForm from "../components/inventoryForm";
import { inventoryAPI } from "../api";
import { AuthContext } from "../context/authContext";
import { useInventory } from "../hooks/useInventory";

const { Content } = Layout;

const Inventory = () => {
  const {
    inventory,
    loading: inventoryLoading,
    error: inventoryError,
    pagination,
    pageSize,
    refetch,
    goToPage,
    changePageSize,
  } = useInventory(1, 10);

  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const { user } = useContext(AuthContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [clientCurrentPage, setClientCurrentPage] = useState(1);
  const [clientPageSize, setClientPageSize] = useState(10);

  const filteredInventoryData = useMemo(() => {
    if (!searchTerm) {
      return Array.isArray(inventory) ? inventory : [];
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return (Array.isArray(inventory) ? inventory : []).filter(
      (item) =>
        (item.name && item.name.toLowerCase().includes(lowercasedSearchTerm)) ||
        (item.description &&
          item.description.toLowerCase().includes(lowercasedSearchTerm))
    );
  }, [inventory, searchTerm]);

  useEffect(() => {
    console.log("User from AuthContext in Inventory page:", user);
  }, [user]);

  useEffect(() => {
    setClientCurrentPage(1);
  }, [searchTerm]);

  if (inventoryError) {
    return (
      <div>
        Error loading inventory:{" "}
        {typeof inventoryError === "string"
          ? inventoryError
          : inventoryError.message || "An unexpected error occurred."}
      </div>
    );
  }

  const handleDelete = async (id) => {
    try {
      await inventoryAPI.delete(id);
      message.success("Item deleted successfully");
      refetch();
    } catch (err) {
      console.error("Failed to delete item:", err);
      message.error(
        err.response?.data?.error || "Failed to delete item. Please try again."
      );
    }
  };

  const handleModalSuccess = () => {
    setModalVisible(false);
    setCurrentItem(null);
    refetch();
  };

  const handleServerTableChange = (newPaginationConfig) => {
    if (!searchTerm) {
      if (pagination.currentPage !== newPaginationConfig.current) {
        goToPage(newPaginationConfig.current);
      }
      if (pageSize !== newPaginationConfig.pageSize) {
        changePageSize(newPaginationConfig.pageSize);
      }
    }
  };

  const handleClientTableChange = (newPaginationConfig) => {
    if (searchTerm) {
      setClientCurrentPage(newPaginationConfig.current);
      setClientPageSize(newPaginationConfig.pageSize);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "20%",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "30%",
      ellipsis: true,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: "10%",
      align: "right",
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: "15%",
      align: "right",
      render: (price) =>
        price != null ? `Rp ${Number(price).toFixed(0)}` : "N/A",
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Actions",
      key: "actions",
      width: "15%",
      align: "center",
      render: (_, record) => (
        <Space>
          {user?.data?.role === "admin" && (
            <>
              <Tooltip title="Edit Item">
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    setCurrentItem(record);
                    setModalVisible(true);
                  }}
                  aria-label="Edit item"
                />
              </Tooltip>
              <Popconfirm
                title="Are you sure you want to delete this item?"
                onConfirm={() => handleDelete(record._id)}
                okText="Yes"
                cancelText="No"
              >
                <Tooltip title="Delete Item">
                  <Button
                    icon={<DeleteOutlined />}
                    danger
                    aria-label="Delete item"
                  />
                </Tooltip>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  const tableLoading = inventoryLoading && !searchTerm;

  let tablePaginationConfig;
  if (searchTerm) {
    tablePaginationConfig = {
      current: clientCurrentPage,
      pageSize: clientPageSize,
      total: filteredInventoryData.length,
      showSizeChanger: true,
      pageSizeOptions: ["10", "20", "50", "100"],
      showTotal: (total, range) =>
        `${range[0]}-${range[1]} of ${total} items (filtered)`,
      onChange: (page, newPageSize) => {
        setClientCurrentPage(page);
        if (newPageSize) setClientPageSize(newPageSize);
      },
    };
  } else {
    tablePaginationConfig = {
      current: pagination.currentPage,
      pageSize: pageSize,
      total: pagination.totalItems,
      showSizeChanger: true,
      pageSizeOptions: ["10", "20", "50", "100"],
      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
    };
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: "24px" }}>
        <div
          style={{
            background: "#fff",
            padding: "24px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <h1 style={{ margin: 0 }}>Inventory Management</h1>
            <Space wrap>
              <Input
                placeholder="Search by Name/Description..."
                allowClear
                value={searchTerm}
                onChange={handleSearchInputChange}
                style={{ width: 300 }}
                prefix={<SearchOutlined />}
              />
              {(user?.data?.role === "admin" ||
                user?.data?.role === "staff") && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setCurrentItem(null);
                    setModalVisible(true);
                  }}
                >
                  Add Item
                </Button>
              )}
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={filteredInventoryData}
            loading={tableLoading}
            rowKey="_id"
            scroll={{ x: "max-content" }}
            locale={{
              emptyText: tableLoading
                ? "Loading..."
                : searchTerm && filteredInventoryData.length === 0
                ? "No items match your search."
                : "No inventory items found. Add items to get started!",
            }}
            style={{ flex: 1 }}
            pagination={tablePaginationConfig}
            onChange={
              searchTerm ? handleClientTableChange : handleServerTableChange
            }
          />

          <Modal
            title={currentItem ? "Edit Item" : "Add Item"}
            open={modalVisible}
            onCancel={() => {
              setModalVisible(false);
              setCurrentItem(null);
            }}
            footer={null}
            destroyOnClose
            width={600}
          >
            <InventoryForm
              initialValues={currentItem}
              onSuccess={handleModalSuccess}
              onCancel={() => {
                setModalVisible(false);
                setCurrentItem(null);
              }}
            />
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default Inventory;
