const express = require('express');
const {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} = require('../controllers/inventoryController');
const { protect} = require('../middlerwares/auth');
const {authorize} = require('../middlerwares/role');

const router = express.Router();

router
  .route('/')
  .get(protect, getInventory)
  .post(protect, authorize('admin', 'staff'), createInventoryItem);

router
  .route('/:id')
  .get(protect, getInventoryItem)
  .put(protect, authorize('admin'), updateInventoryItem)
  .delete(protect, authorize('admin'), deleteInventoryItem);

module.exports = router;