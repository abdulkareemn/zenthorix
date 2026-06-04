const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ['admin', 'student'],
      default: 'student'
    },
    status: {
      type: String,
      enum: ['approved', 'blocked'],
      default: 'approved'
    },
    registerNumber: {
      type: String,
      trim: true,
      default: ''
    },
    department: {
      type: String,
      trim: true,
      default: ''
    },
    registeredPhoto: {
      type: String,
      trim: true,
      default: ''
    },
    sessionVersion: {
      type: Number,
      default: 0
    },
    lastLoginAt: {
      type: Date
    },
    lastLoginIp: {
      type: String,
      trim: true,
      default: ''
    },
    lastLoginDevice: {
      type: String,
      trim: true,
      default: ''
    },
    assignedExams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
      }
    ]
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
