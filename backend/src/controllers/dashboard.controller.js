const { Product, stockStatusToQuantityQuery } = require('../models/product.model');
const { sendSuccess } = require('../utils/ApiResponse');

/**
 * GET /api/dashboard — aggregate inventory statistics computed in a single
 * MongoDB aggregation pipeline (via $facet) rather than multiple round-trips
 * or in-memory reduction over all documents.
 */
async function getDashboardStats(req, res) {
  const [result] = await Product.aggregate([
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              totalProducts: { $sum: 1 },
              totalQuantity: { $sum: '$quantity' },
              totalInventoryValue: { $sum: { $multiply: ['$price', '$quantity'] } },
            },
          },
        ],
        lowStockCount: [{ $match: stockStatusToQuantityQuery('lowStock') }, { $count: 'count' }],
        outOfStockCount: [
          { $match: stockStatusToQuantityQuery('outOfStock') },
          { $count: 'count' },
        ],
        categoryBreakdown: [
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $project: { _id: 0, category: '$_id', count: 1 } },
          { $sort: { category: 1 } },
        ],
      },
    },
  ]);

  const totals = result.totals[0] || { totalProducts: 0, totalQuantity: 0, totalInventoryValue: 0 };
  const lowStockCount = result.lowStockCount[0]?.count || 0;
  const outOfStockCount = result.outOfStockCount[0]?.count || 0;

  sendSuccess(res, 200, {
    totalProducts: totals.totalProducts,
    totalQuantity: totals.totalQuantity,
    lowStockCount,
    outOfStockCount,
    totalInventoryValue: totals.totalInventoryValue,
    categoryBreakdown: result.categoryBreakdown,
  });
}

module.exports = { getDashboardStats };
