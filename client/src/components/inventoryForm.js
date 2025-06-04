// src/components/InventoryForm.js
import React, {useState} from 'react';
import { Form, Input, InputNumber, Button, message } from 'antd';
import { inventoryAPI } from '../api';

const InventoryForm = ({ initialValues, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (initialValues) {
        await inventoryAPI.update(initialValues._id, values);
        message.success('Item updated successfully');
      } else {
        await inventoryAPI.create(values);
        message.success('Item added successfully');
      }
      onSuccess();
    } catch (error) {
      message.error('Operation failed');
    }
    setLoading(false);
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        name="name"
        label="Name"
        rules={[{ required: true, message: 'Please input the name!' }]}
      >
        <Input placeholder="Enter name" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: 'Please input the description!' }]}
      >
        <Input.TextArea rows={4} placeholder="Enter description" />
      </Form.Item>

      <Form.Item
        name="quantity"
        label="Quantity"
        rules={[{ required: true, message: 'Please input the quantity!' }]}
      >
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="price"
        label="Price"
        rules={[{ required: true, message: 'Please input the price!' }]}
      >
        <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {initialValues ? 'Update' : 'Add'} Inventory
        </Button>
      </Form.Item>
    </Form>
  );
};

export default InventoryForm;