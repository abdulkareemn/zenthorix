const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    duration: {
      type: Number,
      min: 1
    },
    language: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    questions: [
      {
        prompt: {
          type: String,
          required: true,
          trim: true
        },
        sample: {
          type: String,
          trim: true,
          default: ''
        },
        expected: {
          type: String,
          trim: true,
          default: ''
        },
        testCases: [
          {
            input: {
              type: String,
              trim: true,
              default: ''
            },
            expected: {
              type: String,
              trim: true,
              default: ''
            }
          }
        ]
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.models.Exam || mongoose.model('Exam', examSchema);
