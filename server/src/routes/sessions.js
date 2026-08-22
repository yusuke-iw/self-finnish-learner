const express = require('express');
const router = express.Router();
const sessionsController = require('../controllers/sessionsController');

router.post('/generate', sessionsController.generateSession);
router.post('/check', sessionsController.checkAnswer);

module.exports = router;
