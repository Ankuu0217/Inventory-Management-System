const { Router } = require('express');
const productRoutes = require('./product.routes');
const dashboardRoutes = require('./dashboard.routes');
const healthRoutes = require('./health.routes');

const router = Router();

router.use('/products', productRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/health', healthRoutes);

module.exports = router;
