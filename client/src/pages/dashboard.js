import React from "react";
import { Card, Row, Col, Statistic } from "antd";
import { useInventory } from "../hooks/useInventory";

const Dashboard = () => {
  const { inventory, loading } = useInventory();

  if (loading) {
    return <div>Loading...</div>;
  }

  const totalItems = inventory.length;
  const totalQuantity = Array.isArray(inventory)
    ? inventory.reduce((sum, item) => sum + item.quantity, 0)
    : 0;
  const totalValue = inventory.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Total Items" value={totalItems} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Total Quantity" value={totalQuantity} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Value"
              value={totalValue.toFixed(0)}
              prefix="Rp"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
