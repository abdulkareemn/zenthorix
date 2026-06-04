const express = require('express');
const { runCode } = require('../controllers/codeRunnerController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/run', protect, runCode);

module.exports = router;
