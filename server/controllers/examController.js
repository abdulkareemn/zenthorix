const Exam = require('../models/Exam');
const Submission = require('../models/Submission');
const { isValidObjectId } = require('../utils/validators');

async function validateExamAccess(req, res) {
  try {
    const { examId } = req.params;

    if (!isValidObjectId(examId)) {
      return res.status(400).json({ allowed: false, reason: 'Invalid exam' });
    }

    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ allowed: false, reason: 'Unauthorized' });
    }

    if (req.user.status !== 'approved') {
      return res.status(403).json({ allowed: false, reason: 'Not approved' });
    }

    const isAssigned = req.user.assignedExams.some((assignedExam) => assignedExam.toString() === examId);

    if (!isAssigned) {
      return res.status(403).json({ allowed: false, reason: 'Not assigned' });
    }

    const exam = await Exam.findOne({ _id: examId, status: 'published' });

    if (!exam) {
      return res.status(404).json({ allowed: false, reason: 'Exam not found' });
    }

    if (!Array.isArray(exam.questions) || exam.questions.length === 0) {
      return res.status(403).json({ allowed: false, reason: 'No questions available' });
    }

    const existingSubmission = await Submission.findOne({ exam: examId, student: req.user._id });

    if (existingSubmission && existingSubmission.status !== 'in-progress') {
      return res.status(403).json({ allowed: false, reason: 'This exam has already been submitted' });
    }

    return res.status(200).json({ allowed: true, reason: 'Allowed' });
  } catch (error) {
    return res.status(500).json({ allowed: false, reason: 'Validation failed' });
  }
}

async function listAssignedExams(req, res) {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (req.user.status !== 'approved') {
      return res.status(403).json({ message: 'Not approved' });
    }

    const exams = await Exam.find({
      _id: { $in: req.user.assignedExams },
      status: 'published',
      'questions.0': { $exists: true }
    }).sort({ createdAt: -1 });
    const submissions = await Submission.find({ student: req.user._id, status: { $ne: 'in-progress' } }).select('exam submittedAt status publishedAt resultNote');
    const submittedByExam = new Map(submissions.map((submission) => [submission.exam.toString(), submission.submittedAt]));
    const serializedExams = exams.map((exam) => {
      const plainExam = exam.toObject();
      const submittedAt = submittedByExam.get(exam._id.toString());
      return submittedAt ? { ...plainExam, submittedAt } : plainExam;
    });

    return res.status(200).json({ exams: serializedExams });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load assigned exams' });
  }
}

async function listPublishedResults(req, res) {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const results = await Submission.find({ student: req.user._id, status: 'published' })
      .populate('exam', 'title language')
      .sort({ publishedAt: -1 });

    return res.status(200).json({ results });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load results' });
  }
}

async function startExamSession(req, res) {
  try {
    const { examId } = req.params;

    if (!isValidObjectId(examId)) {
      return res.status(400).json({ message: 'Invalid exam' });
    }

    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const validationRequest = { ...req, params: { examId } };
    let validationStatus = 200;
    let validationPayload = null;
    await validateExamAccess(validationRequest, {
      status(code) {
        validationStatus = code;
        return this;
      },
      json(payload) {
        validationPayload = payload;
        return payload;
      }
    });

    if (validationStatus >= 400 || !validationPayload?.allowed) {
      return res.status(validationStatus).json({ message: validationPayload?.reason || 'Not authorized' });
    }

    const session = await Submission.findOneAndUpdate(
      { exam: examId, student: req.user._id },
      {
        $setOnInsert: {
          exam: examId,
          student: req.user._id,
          status: 'in-progress',
          cameraStatus: 'starting',
          microphoneStatus: 'starting',
          startedAt: new Date()
        }
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({ session });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to start exam session' });
  }
}

async function appendProctorEvent(req, res) {
  try {
    const { examId } = req.params;

    if (!isValidObjectId(examId)) {
      return res.status(400).json({ message: 'Invalid exam' });
    }

    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const events = normalizeProctorEvents([req.body]);
    if (events.length === 0) {
      return res.status(400).json({ message: 'Event message is required' });
    }

    const session = await Submission.findOneAndUpdate(
      { exam: examId, student: req.user._id, status: 'in-progress' },
      { $push: { proctorEvents: events[0] } },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ message: 'Active exam session not found' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to record proctor event' });
  }
}

async function getExamSession(req, res) {
  try {
    const { examId } = req.params;

    if (!isValidObjectId(examId)) {
      return res.status(400).json({ message: 'Invalid exam' });
    }

    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const session = await Submission.findOne({ exam: examId, student: req.user._id }).select('adminWarning status');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    return res.status(200).json({ adminWarning: session.adminWarning, status: session.status });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load exam session' });
  }
}

function normalizeAnswers(answers) {
  if (!Array.isArray(answers)) return [];

  return answers.map((answer, index) => ({
    questionIndex: Number.isFinite(Number(answer.questionIndex)) ? Number(answer.questionIndex) : index,
    code: typeof answer.code === 'string' ? answer.code : '',
    input: typeof answer.input === 'string' ? answer.input : '',
    output: typeof answer.output === 'string' ? answer.output : ''
  }));
}

function normalizeProctorEvents(events) {
  if (!Array.isArray(events)) return [];

  return events
    .map((event) => ({
      type: typeof event.type === 'string' ? event.type.trim() : 'proctor-warning',
      message: typeof event.message === 'string' ? event.message.trim() : '',
      severity: ['info', 'warning', 'critical'].includes(event.severity) ? event.severity : 'warning',
      createdAt: event.createdAt ? new Date(event.createdAt) : new Date()
    }))
    .filter((event) => event.message);
}

async function submitExam(req, res) {
  try {
    const { examId } = req.params;

    if (!isValidObjectId(examId)) {
      return res.status(400).json({ message: 'Invalid exam' });
    }

    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const isAssigned = req.user.assignedExams.some((assignedExam) => assignedExam.toString() === examId);

    if (!isAssigned) {
      return res.status(403).json({ message: 'Not assigned' });
    }

    const exam = await Exam.findOne({ _id: examId, status: 'published' });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const existingSubmission = await Submission.findOne({ exam: exam._id, student: req.user._id });

    if (existingSubmission && existingSubmission.status !== 'in-progress') {
      return res.status(409).json({ message: 'This exam has already been submitted' });
    }

    const recording = req.body.recording && typeof req.body.recording === 'object'
      ? {
        mimeType: typeof req.body.recording.mimeType === 'string' ? req.body.recording.mimeType : '',
        data: typeof req.body.recording.data === 'string' ? req.body.recording.data : '',
        size: Number(req.body.recording.size) || 0
      }
      : {};
    const update = {
      exam: exam._id,
      student: req.user._id,
      answers: normalizeAnswers(req.body.answers),
      cameraStatus: typeof req.body.cameraStatus === 'string' ? req.body.cameraStatus : 'unknown',
      microphoneStatus: typeof req.body.microphoneStatus === 'string' ? req.body.microphoneStatus : 'unknown',
      recording,
      tabSwitchCount: Number(req.body.tabSwitchCount) || 0,
      fullscreenExitCount: Number(req.body.fullscreenExitCount) || 0,
      status: 'submitted',
      endedAt: new Date(),
      submittedAt: new Date()
    };

    const submission = existingSubmission
      ? await Submission.findByIdAndUpdate(
        existingSubmission._id,
        {
          $set: update,
          $push: { proctorEvents: { $each: normalizeProctorEvents(req.body.proctorEvents) } }
        },
        { new: true }
      )
      : await Submission.create({ ...update, proctorEvents: normalizeProctorEvents(req.body.proctorEvents) });

    return res.status(201).json({ submission });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to submit exam' });
  }
}

async function autosaveExam(req, res) {
  try {
    const { examId } = req.params;

    if (!isValidObjectId(examId)) {
      return res.status(400).json({ message: 'Invalid exam' });
    }

    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const isAssigned = req.user.assignedExams.some((assignedExam) => assignedExam.toString() === examId);

    if (!isAssigned) {
      return res.status(403).json({ message: 'Not assigned' });
    }

    const exam = await Exam.findOne({ _id: examId, status: 'published' });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const existingSubmission = await Submission.findOne({ exam: exam._id, student: req.user._id });

    if (existingSubmission && existingSubmission.status !== 'in-progress') {
      return res.status(409).json({ message: 'This exam has already been submitted' });
    }

    const update = {
      exam: exam._id,
      student: req.user._id,
      answers: normalizeAnswers(req.body.answers),
      tabSwitchCount: Number(req.body.tabSwitchCount) || 0,
      fullscreenExitCount: Number(req.body.fullscreenExitCount) || 0,
      cameraStatus: typeof req.body.cameraStatus === 'string' ? req.body.cameraStatus : 'unknown',
      microphoneStatus: typeof req.body.microphoneStatus === 'string' ? req.body.microphoneStatus : 'unknown',
      status: 'in-progress'
    };

    const submission = await Submission.findOneAndUpdate(
      { exam: exam._id, student: req.user._id, status: 'in-progress' },
      {
        $set: update,
        $setOnInsert: { startedAt: new Date() },
        $push: { proctorEvents: { $each: normalizeProctorEvents(req.body.proctorEvents).slice(0, 10) } }
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({ submission });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to autosave exam' });
  }
}

module.exports = {
  appendProctorEvent,
  autosaveExam,
  getExamSession,
  listAssignedExams,
  listPublishedResults,
  startExamSession,
  submitExam,
  validateExamAccess
};
