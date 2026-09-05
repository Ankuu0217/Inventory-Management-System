const { Router } = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { getDashboardStats } = require('../controllers/dashboard.controller');

const router = Router();

/**
 * @openapi
 * /api/dashboard:
 *   get:
 *     summary: Aggregate inventory statistics
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Inventory statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalProducts: { type: integer }
 *                     totalQuantity: { type: integer }
 *                     lowStockCount: { type: integer }
 *                     outOfStockCount: { type: integer }
 *                     totalInventoryValue: { type: number, description: "Additional metric beyond the core 4" }
 *                     categoryBreakdown:
 *                       type: array
 *                       description: "Additional metric beyond the core 4"
 *                       items:
 *                         type: object
 *                         properties:
 *                           category: { type: string }
 *                           count: { type: integer }
 *       500:
 *         description: Server error
 */
router.get('/', asyncHandler(getDashboardStats));

module.exports = router;
