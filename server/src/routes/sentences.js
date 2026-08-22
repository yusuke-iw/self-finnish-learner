const express = require('express');
const router = express.Router();
const sentencesController = require('../controllers/sentencesController');

router.get('/', sentencesController.getSentences);

module.exports = router;
