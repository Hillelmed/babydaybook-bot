const Feeding = require('../models/Feeding');
const Diaper = require('../models/Diaper');
const Medication = require('../models/Medication');
const moment = require('moment-timezone');

async function recordFeeding(amount, timestamp = new Date()) {
  return Feeding.create({ amount, timestamp });
}

async function recordDiaper(type, timestamp = new Date()) {
  return Diaper.create({ type, timestamp });
}

async function recordMedication(name, timestamp = new Date()) {
  return Medication.create({ name, timestamp });
}

async function getLastFeeding() {
  return Feeding.findOne().sort({ timestamp: -1 }).exec();
}

// סה״כ החלפות חיתול היום
async function totalDiaperToday() {
  const start = moment().startOf('day').toDate();
  return Diaper.countDocuments({ timestamp: { $gte: start } }).exec();
}

// סה״כ תרופות תועדו היום
async function totalMedicationToday() {
  const start = moment().startOf('day').toDate();
  return Medication.countDocuments({ timestamp: { $gte: start } }).exec();
}

async function timeSinceLastFeeding() {
  const last = await getLastFeeding();
  if (!last) return null;
  const diffMs = Date.now() - last.timestamp.getTime();
  return Math.floor(diffMs / 60000);
}

async function totalFeedingToday() {
  const start = moment().startOf('day').toDate();
  const end = new Date();
  const list = await Feeding.find({ timestamp: { $gte: start, $lte: end } }).exec();
  return list.reduce((sum, f) => sum + f.amount, 0);
}

async function feedingByHourToday() {
  const start = moment().startOf('day').toDate();
  const end = new Date();
  const list = await Feeding.find({ timestamp: { $gte: start, $lte: end } }).exec();
  const map = {};
  list.forEach(f => {
    const hour = moment(f.timestamp).hour();
    map[hour] = (map[hour] || 0) + f.amount;
  });
  return map;
}


async function listFeedingsToday() {
  const start = moment().startOf('day').toDate();
  return Feeding
    .find({ timestamp: { $gte: start } })
    .sort({ timestamp: 1 })
    .exec();
}
async function listDiapersToday() {
  const start = moment().startOf('day').toDate();
  return Diaper
    .find({ timestamp: { $gte: start } })
    .sort({ timestamp: 1 })
    .exec();
}

async function listMedicationsToday() {
  const start = moment().startOf('day').toDate();
  return Medication
    .find({ timestamp: { $gte: start } })
    .sort({ timestamp: 1 })
    .exec();
}

module.exports = { recordFeeding,
  recordDiaper,
  recordMedication,
  timeSinceLastFeeding,
  totalFeedingToday,
  listFeedingsToday,
  totalDiaperToday,        // ← הוסף
  totalMedicationToday,     // ← הוסף
  listDiapersToday,       // ← הוספת
  listMedicationsToday,    // ← הוספת
  feedingByHourToday
}; listFeedingsToday,
  recordFeeding,
  recordDiaper,
  recordMedication,
  timeSinceLastFeeding,
  totalFeedingToday,
  feedingByHourToday

