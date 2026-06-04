const express = require('express');
const {
  createStudent,
  deleteStudent,
  listStudents,
  updateStudent
} = require('../controllers/adminStudentController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(protect, requireRole('admin'));

router.post('/create', createStudent);
router.get('/', listStudents);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

module.exports = router;
