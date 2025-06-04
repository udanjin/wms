const ErrorResponse = require('../utils/errorResponse');
const Inventory = require('../models/inventory');
// const User = require('../models/user'); // Tidak perlu di-require di sini jika sudah di server.js

// @desc    Get all inventory items with pagination
// @route   GET /api/v1/inventory
// @access  Private
exports.getInventory = async (req, res, next) => {
  try {
    // Paginasi
    const page = parseInt(req.query.page, 10) || 1; // Halaman saat ini, default 1
    const limit = parseInt(req.query.limit, 10) || 10; // Item per halaman, default 10
    const startIndex = (page - 1) * limit; // Index awal untuk skip
    const endIndex = page * limit; // Index akhir (tidak langsung dipakai di query, tapi untuk info)

    // Query untuk mendapatkan total dokumen (tanpa paginasi, tapi bisa ditambahkan filter jika ada)
    const total = await Inventory.countDocuments();

    // Query utama untuk mendapatkan data inventaris dengan paginasi dan populate
    const inventory = await Inventory.find()
      .populate({
        path: 'user',
        select: 'name email',
      })
      .sort({ createdAt: -1 }) // Urutkan berdasarkan yang terbaru (opsional, bisa disesuaikan)
      .skip(startIndex)
      .limit(limit);

    // Metadata paginasi untuk respons
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
      count: inventory.length, // Jumlah item di halaman ini
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        ...pagination, // Menyertakan info next/prev jika ada
      },
      data: inventory,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single inventory item
// @route   GET /api/v1/inventory/:id
// @access  Private
exports.getInventoryItem = async (req, res, next) => {
  try {
    const inventory = await Inventory.findById(req.params.id).populate({
      path: 'user',
      select: 'name email',
    });

    if (!inventory) {
      return next(
        new ErrorResponse(`Inventory not found with id of ${req.params.id}`, 404)
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

// @desc    Create new inventory item
// @route   POST /api/v1/inventory
// @access  Private
exports.createInventoryItem = async (req, res, next) => {
  try {
    // Add user to req.body (pengguna yang sedang login)
    req.body.user = req.user.id;

    const inventory = await Inventory.create(req.body);

    // Untuk konsistensi, populate user setelah create jika diperlukan oleh frontend
    // Namun, biasanya data user yang login sudah diketahui oleh frontend.
    // Jika ingin mengembalikan data user yang di-populate:
    // await inventory.populate({ path: 'user', select: 'name email' });

    res.status(201).json({
      success: true,
      data: inventory,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update inventory item
// @route   PUT /api/v1/inventory/:id
// @access  Private
exports.updateInventoryItem = async (req, res, next) => {
  try {
    let inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return next(
        new ErrorResponse(`Inventory not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is inventory owner or admin
    // Asumsi field 'user' di skema Inventory menyimpan ObjectId dari User
    if (inventory.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this inventory`,
          401
        )
      );
    }

    // Hindari mengupdate field 'user' secara manual dari req.body jika tidak diinginkan
    // delete req.body.user; // Jika Anda tidak ingin field user bisa diubah dari request body

    inventory = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Mengembalikan dokumen yang sudah diupdate
      runValidators: true, // Menjalankan validator Mongoose
    }).populate({ // Populate user setelah update
        path: 'user',
        select: 'name email',
    });

    res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/v1/inventory/:id
// @access  Private
exports.deleteInventoryItem = async (req, res, next) => {
  try {
    const inventoryToDelete = await Inventory.findById(req.params.id);

    if (!inventoryToDelete) {
      return next(
        new ErrorResponse(`Inventory not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is inventory owner or admin
    if (inventoryToDelete.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete this inventory`,
          401
        )
      );
    }

    await Inventory.findByIdAndDelete(req.params.id); // Menggunakan findByIdAndDelete

    res.status(200).json({
      success: true,
      data: {}, // Tidak ada data yang dikembalikan setelah delete
    });
  } catch (err) {
    next(err);
  }
};
