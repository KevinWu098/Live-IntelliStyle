const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/checkAuth');
const stylistController = require('../controllers/stylistController');

router.get('/stylist', isLoggedIn, stylistController.stylist);

module.exports = router;
