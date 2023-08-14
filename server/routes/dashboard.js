const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/checkAuth');
const dashboardController = require('../controllers/dashboardController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Specify the destination folder for uploaded files

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
router.get(
    '/dashboard/aiAdd',
    isLoggedIn,
    dashboardController.dashboardAiAddClothing
);
router.post(
    '/dashboard/aiAdd',
    isLoggedIn,
    upload.single('imageUpload'),
    dashboardController.dashboardAiAddClothingSubmit
);

module.exports = router;
