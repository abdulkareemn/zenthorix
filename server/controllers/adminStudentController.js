const User = require('../models/User');
const { isValidObjectId, normalizeEmail, validateAssignedExams } = require('../utils/validators');

const validStatuses = ['approved', 'blocked'];

function serializeStudent(student) {
  return student.toSafeJSON ? student.toSafeJSON() : student;
}

function serverError(res, fallback, error) {
  console.error(fallback, error);
  return res.status(500).json({
    message: process.env.NODE_ENV === 'production' ? fallback : `${fallback}: ${error.message}`
  });
}

async function createStudent(req, res) {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;
    const status = req.body.status || 'approved';
    const assignedExams = req.body.assignedExams || [];
    const registerNumber = typeof req.body.registerNumber === 'string' ? req.body.registerNumber.trim() : '';
    const department = typeof req.body.department === 'string' ? req.body.department.trim() : '';
    const registeredPhoto = typeof req.body.registeredPhoto === 'string' ? req.body.registeredPhoto.trim() : '';

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or blocked' });
    }

    if (!validateAssignedExams(assignedExams)) {
      return res.status(400).json({ message: 'assignedExams must be an array of valid examIds' });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(409).json({ message: 'Student email already exists' });
    }

    const student = await User.create({
      name,
      email,
      password,
      status,
      registerNumber,
      department,
      registeredPhoto,
      assignedExams,
      role: 'student'
    });

    return res.status(201).json({ student: serializeStudent(student) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Student email already exists' });
    }

    return serverError(res, 'Unable to create student', error);
  }
}

async function listStudents(req, res) {
  try {
    const students = await User.find({ role: 'student' }).sort({ createdAt: -1 });
    return res.status(200).json({ students: students.map(serializeStudent) });
  } catch (error) {
    return serverError(res, 'Unable to load students', error);
  }
}

async function updateStudent(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid student id' });
    }

    const student = await User.findOne({ _id: id, role: 'student' }).select('+password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const updates = req.body;

    if (updates.email !== undefined) {
      const email = normalizeEmail(updates.email);

      if (!email) {
        return res.status(400).json({ message: 'Email cannot be empty' });
      }

      const duplicate = await User.findOne({ email, _id: { $ne: id } });

      if (duplicate) {
        return res.status(409).json({ message: 'Student email already exists' });
      }

      student.email = email;
    }

    if (updates.name !== undefined) {
      const name = typeof updates.name === 'string' ? updates.name.trim() : '';

      if (!name) {
        return res.status(400).json({ message: 'Name cannot be empty' });
      }

      student.name = name;
    }

    if (updates.password !== undefined) {
      if (!updates.password) {
        return res.status(400).json({ message: 'Password cannot be empty' });
      }

      student.password = updates.password;
    }

    if (updates.status !== undefined) {
      if (!validStatuses.includes(updates.status)) {
        return res.status(400).json({ message: 'Status must be approved or blocked' });
      }

      student.status = updates.status;
    }

    if (updates.registerNumber !== undefined) {
      student.registerNumber = typeof updates.registerNumber === 'string' ? updates.registerNumber.trim() : '';
    }

    if (updates.department !== undefined) {
      student.department = typeof updates.department === 'string' ? updates.department.trim() : '';
    }

    if (updates.registeredPhoto !== undefined) {
      student.registeredPhoto = typeof updates.registeredPhoto === 'string' ? updates.registeredPhoto.trim() : '';
    }

    if (updates.assignedExams !== undefined) {
      if (!validateAssignedExams(updates.assignedExams)) {
        return res.status(400).json({ message: 'assignedExams must be an array of valid examIds' });
      }

      student.assignedExams = updates.assignedExams;
    }

    await student.save();

    return res.status(200).json({ student: serializeStudent(student) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Student email already exists' });
    }

    return serverError(res, 'Unable to update student', error);
  }
}

async function deleteStudent(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid student id' });
    }

    const student = await User.findOneAndDelete({ _id: id, role: 'student' });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    return res.status(200).json({ message: 'Student deleted' });
  } catch (error) {
    return serverError(res, 'Unable to delete student', error);
  }
}

module.exports = {
  createStudent,
  deleteStudent,
  listStudents,
  updateStudent
};
