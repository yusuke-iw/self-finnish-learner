const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');

router.get('/', progressController.getProgress);
router.post('/', progressController.saveProgress);

module.exports = router;
