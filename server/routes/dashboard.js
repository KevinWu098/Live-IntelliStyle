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
router.delete(
    '/dashboard/item-delete/:id',
    isLoggedIn,
    dashboardController.dashboardDeleteClothing
);
router.get(
    '/dashboard/add',
    isLoggedIn,
    dashboardController.dashboardAddClothing
);
router.post(
    '/dashboard/add',
    isLoggedIn,
    dashboardController.dashboardAddClothingSubmit
);

module.exports = router;
