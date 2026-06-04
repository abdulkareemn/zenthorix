const mongoose = require('mongoose');

const proctorEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'warning'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const answerSchema = new mongoose.Schema(
  {
    questionIndex: {
      type: Number,
      required: true
    },
    code: {
      type: String,
      trim: true,
      default: ''
    },
    input: {
      type: String,
      trim: true,
      default: ''
    },
    output: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { _id: false }
);

const recordingSchema = new mongoose.Schema(
  {
    mimeType: {
      type: String,
      trim: true,
      default: ''
    },
    data: {
      type: String,
      default: ''
    },
    size: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    answers: [answerSchema],
    proctorEvents: [proctorEventSchema],
    cameraStatus: {
      type: String,
      trim: true,
      default: 'not-started'
    },
    microphoneStatus: {
      type: String,
      trim: true,
      default: 'not-started'
    },
    recording: {
      type: recordingSchema,
      default: () => ({})
    },
    startedAt: {
      type: Date
    },
    endedAt: {
      type: Date
    },
    tabSwitchCount: {
      type: Number,
      default: 0
    },
    fullscreenExitCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['in-progress', 'submitted', 'reviewed', 'published'],
      default: 'in-progress'
    },
    adminWarning: {
      type: String,
      trim: true,
      default: ''
    },
    resultNote: {
      type: String,
      trim: true,
      default: ''
    },
    reviewedAt: {
      type: Date
    },
    publishedAt: {
      type: Date
    },
    submittedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

submissionSchema.index({ exam: 1, student: 1 }, { unique: true });
submissionSchema.index({ submittedAt: -1 });

module.exports = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);
