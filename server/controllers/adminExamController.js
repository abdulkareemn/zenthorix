const Exam = require('../models/Exam');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { isValidObjectId } = require('../utils/validators');

function serializeExam(exam) {
  return exam.toObject ? exam.toObject() : exam;
}

function normalizeQuestions(questions) {
  if (!Array.isArray(questions)) return [];

  return questions
    .map((question) => {
      const sample = typeof question.sample === 'string' ? question.sample.trim() : '';
      const expected = typeof question.expected === 'string' ? question.expected.trim() : '';
      const rawTestCases = Array.isArray(question.testCases) ? question.testCases : [];
      const testCases = rawTestCases
        .map((testCase) => ({
          input: typeof testCase.input === 'string' ? testCase.input.trim() : '',
          expected: typeof testCase.expected === 'string' ? testCase.expected.trim() : ''
        }))
        .filter((testCase) => testCase.input || testCase.expected);

      if (testCases.length === 0 && (sample || expected)) {
        testCases.push({ input: sample, expected });
      }

      return {
        prompt: typeof question.prompt === 'string' ? question.prompt.trim() : '',
        sample,
        expected,
        testCases
      };
    })
    .filter((question) => question.prompt);
}

async function createExam(req, res) {
  try {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
    const duration = Number(req.body.duration);
    const language = typeof req.body.language === 'string' ? req.body.language.trim() : '';
    const status = req.body.status || 'published';
    const questions = normalizeQuestions(req.body.questions);

    if (!title || !duration || !language) {
      return res.status(400).json({ message: 'Title, duration, and language are required' });
    }

    if (questions.length === 0) {
      return res.status(400).json({ message: 'At least one question is required' });
    }

    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ message: 'Invalid exam status' });
    }

    const exam = await Exam.create({
      title,
      description,
      duration,
      language,
      status,
      questions
    });

    let assignedStudents = 0;

    if (status === 'published') {
      const assignment = await User.updateMany(
        { role: 'student', status: 'approved' },
        { $addToSet: { assignedExams: exam._id } }
      );
      assignedStudents = assignment.modifiedCount || 0;
    }

    return res.status(201).json({ exam: serializeExam(exam), assignedStudents });
  } catch (error) {
    return res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Unable to create exam' : `Unable to create exam: ${error.message}` });
  }
}

async function listExams(req, res) {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 });
    return res.status(200).json({ exams: exams.map(serializeExam) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load exams' });
  }
}

async function updateExam(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid exam id' });
    }

    const allowed = ['title', 'description', 'duration', 'language', 'status', 'questions'];
    const updates = {};

    for (const field of allowed) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (updates.questions !== undefined) {
      updates.questions = normalizeQuestions(updates.questions);

      if (updates.questions.length === 0) {
        return res.status(400).json({ message: 'At least one question is required' });
      }
    }

    if (updates.status && !['draft', 'published', 'archived'].includes(updates.status)) {
      return res.status(400).json({ message: 'Invalid exam status' });
    }

    const exam = await Exam.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    let assignedStudents = 0;

    if (exam.status === 'published') {
      const assignment = await User.updateMany(
        { role: 'student', status: 'approved' },
        { $addToSet: { assignedExams: exam._id } }
      );
      assignedStudents = assignment.modifiedCount || 0;
    }

    return res.status(200).json({ exam: serializeExam(exam), assignedStudents });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update exam' });
  }
}

async function assignExamToStudent(req, res) {
  try {
    const { examId, studentId } = req.params;

    if (!isValidObjectId(examId) || !isValidObjectId(studentId)) {
      return res.status(400).json({ message: 'Invalid exam or student id' });
    }

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (exam.status !== 'published') {
      return res.status(400).json({ message: 'Only published exams can be assigned' });
    }

    const student = await User.findOne({ _id: studentId, role: 'student' });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const alreadyAssigned = student.assignedExams.some((assignedExam) => assignedExam.toString() === examId);

    if (!alreadyAssigned) {
      student.assignedExams.push(exam._id);
      await student.save();
    }

    return res.status(200).json({ student: student.toSafeJSON(), exam: serializeExam(exam) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to assign exam' });
  }
}

async function listSubmissions(req, res) {
  try {
    const submissions = await Submission.find()
      .populate('exam', 'title language duration questions')
      .populate('student', 'name email')
      .sort({ submittedAt: -1 });

    return res.status(200).json({ submissions });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load submissions' });
  }
}

async function warnSubmission(req, res) {
  try {
    const { id } = req.params;
    const message = typeof req.body.message === 'string' && req.body.message.trim()
      ? req.body.message.trim()
      : 'Admin warning issued during proctoring.';

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid submission id' });
    }

    const submission = await Submission.findByIdAndUpdate(
      id,
      {
        $set: { adminWarning: message },
        $push: {
          proctorEvents: {
            type: 'admin-warning',
            message,
            severity: 'critical',
            createdAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    return res.status(200).json({ submission });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to warn candidate' });
  }
}

async function publishSubmissionResult(req, res) {
  try {
    const { id } = req.params;
    const resultNote = typeof req.body.resultNote === 'string' ? req.body.resultNote.trim() : '';

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid submission id' });
    }

    const submission = await Submission.findByIdAndUpdate(
      id,
      {
        status: 'published',
        resultNote,
        reviewedAt: new Date(),
        publishedAt: new Date()
      },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const populatedSubmission = await Submission.findById(submission._id)
      .populate('exam', 'title language duration questions')
      .populate('student', 'name email');

    return res.status(200).json({ submission: populatedSubmission });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to publish result' });
  }
}

module.exports = {
  assignExamToStudent,
  createExam,
  listSubmissions,
  listExams,
  publishSubmissionResult,
  warnSubmission,
  updateExam
};
