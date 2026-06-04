const mongoose = require('mongoose');

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function validateAssignedExams(assignedExams) {
  if (assignedExams === undefined) return true;
  return Array.isArray(assignedExams) && assignedExams.every(isValidObjectId);
}

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

module.exports = {
  isValidObjectId,
  normalizeEmail,
  validateAssignedExams
};
