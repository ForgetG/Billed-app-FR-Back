const express = require('express');

const router = express.Router();
const dedController = require('../controllers/ded');

router.get('/', dedController.list);
router.get('/:id', dedController.get);
router.post('/', dedController.create);
router.patch('/:id', dedController.update);
router.delete('/:id', dedController.remove);

module.exports = router;
