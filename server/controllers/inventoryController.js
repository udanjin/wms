const ErrorResponse = require("../utils/errorResponse");
const Inventory = require("../models/inventory");

exports.getInventory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const total = await Inventory.countDocuments();

    const inventory = await Inventory.find()
      .populate({
        path: "user",
        select: "name email",
      })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: inventory.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        ...pagination,
      },
      data: inventory,
    });
  } catch (err) {
    next(err);
  }
};

exports.getInventoryItem = async (req, res, next) => {
  try {
    const inventory = await Inventory.findById(req.params.id).populate({
      path: "user",
      select: "name email",
    });

    if (!inventory) {
      return next(
        new ErrorResponse(
          `Inventory not found with id of ${req.params.id}`,
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (err) {
    next(err);
  }
};

exports.createInventoryItem = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    const inventory = await Inventory.create(req.body);

    res.status(201).json({
      success: true,
      data: inventory,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateInventoryItem = async (req, res, next) => {
  try {
    let inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return next(
        new ErrorResponse(
          `Inventory not found with id of ${req.params.id}`,
          404
        )
      );
    }

    if (
      inventory.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this inventory`,
          401
        )
      );
    }

    inventory = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate({
      path: "user",
      select: "name email",
    });

    res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteInventoryItem = async (req, res, next) => {
  try {
    const inventoryToDelete = await Inventory.findById(req.params.id);

    if (!inventoryToDelete) {
      return next(
        new ErrorResponse(
          `Inventory not found with id of ${req.params.id}`,
          404
        )
      );
    }

    if (
      inventoryToDelete.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete this inventory`,
          401
        )
      );
    }

    await Inventory.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};
