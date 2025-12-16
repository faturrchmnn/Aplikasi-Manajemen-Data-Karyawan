const express = require('express');
const router = express.Router();
const controller = require('../controllers/departmentController');

router.get('/', controller.getAllDepartments);

module.exports = router;
