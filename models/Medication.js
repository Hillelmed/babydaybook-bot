const { Schema, model } = require('mongoose');

const medicationSchema = new Schema({
  name: { type: String, required: true },
  dosage:   { type: String, default: null },        // מינון/כמות אופציונלי
  timestamp: { type: Date, required: true }
});

module.exports = model('Medication', medicationSchema);
