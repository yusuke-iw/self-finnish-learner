const express = require('express');
const router = express.Router();
const passagesController = require('../controllers/passagesController');

router.get('/', passagesController.getPassages);
router.get('/:id', passagesController.getPassageById);

module.exports = router;
