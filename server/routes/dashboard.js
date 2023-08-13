const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/checkAuth');
const dashboardController = require('../controllers/dashboardController');

router.get('/dashboard', isLoggedIn, dashboardController.dashboard);
router.get(
    '/dashboard/item/:id',
    isLoggedIn,
    dashboardController.dashboardViewClothing
);
router.put(
    '/dashboard/item/:id',
    isLoggedIn,
    dashboardController.dashboardUpdateClothing
);

module.exports = router;
