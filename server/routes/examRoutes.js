const express = require('express');
const { appendProctorEvent, autosaveExam, getExamSession, listAssignedExams, listPublishedResults, startExamSession, submitExam, validateExamAccess } = require('../controllers/examController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/validate/:examId', protect, validateExamAccess);
router.get('/assigned', protect, listAssignedExams);
router.get('/results', protect, listPublishedResults);
router.get('/:examId/session', protect, getExamSession);
router.post('/:examId/start', protect, startExamSession);
router.post('/:examId/autosave', protect, autosaveExam);
router.post('/:examId/events', protect, appendProctorEvent);
router.post('/:examId/submit', protect, submitExam);

module.exports = router;
