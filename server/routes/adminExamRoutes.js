const express = require('express');
const {
  assignExamToStudent,
  createExam,
  listSubmissions,
  listExams,
  publishSubmissionResult,
  warnSubmission,
  updateExam
} = require('../controllers/adminExamController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(protect, requireRole('admin'));

router.post('/create', createExam);
router.get('/', listExams);
router.get('/submissions', listSubmissions);
router.post('/submissions/:id/warn', warnSubmission);
router.post('/submissions/:id/publish', publishSubmissionResult);
router.put('/:id', updateExam);
router.post('/:examId/assign/:studentId', assignExamToStudent);

module.exports = router;
