require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Jerusalem');
const cron = require('node-cron');
require('./config/database');  // connect to MongoDB
const BabyService = require('./services/babyService');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
let lastChatId = null;

bot.on('message', async msg => {
  const chatId = msg.chat.id;
  lastChatId = chatId;
  const parts = msg.text.trim().split(/\s+/);
  const cmd = parts[0];
  let text;

  const validators = {
    '/eat':    p => (p.length >= 2 && p.length <= 3) ? null : 'שימוש נכון: /eat <amount> [HH:mm]',
    '/diaper': p => (p.length >= 2 && p.length <= 3) ? null : 'שימוש נכון: /diaper <pee|poop> [HH:mm]',
    '/med':    p => (p.length >= 2 && p.length <= 4) ? null : 'שימוש נכון: /med <name> [dosage] [HH:mm]',
    '/nextEat':    p => p.length === 1        ? null : 'שימוש נכון: /nextEat',
    '/totalEatToday': p => p.length === 1     ? null : 'שימוש נכון: /totalEatToday',
    '/totalDiaperToday': p => p.length === 1  ? null : 'שימוש נכון: /totalDiaperToday',
    '/totalMedToday':    p => p.length === 1  ? null : 'שימוש נכון: /totalMedToday'
  };
  if (validators[cmd]) {
    const err = validators[cmd](parts);
    if (err) {
      return bot.sendMessage(chatId, err);
    }
  }


  switch (cmd) {
    case '/eat': {
      const amount = parseInt(parts[1], 10);
      let time;
      if (parts[2]) {
        const m = moment.tz(parts[2], 'HH:mm', 'Asia/Jerusalem');
        if (!m.isValid()) {
          bot.sendMessage(chatId, 'פורמט זמן לא תקין. השתמש HH:mm');
          return;
        }
        time = m.toDate();
      } else {
        time = new Date();
      }
      try {
        await BabyService.recordFeeding(amount, time);
        text = `הוכנסה ארוחה של ${amount} מ\"ל ב-${moment(time).format('HH:mm')}`;
      } catch (err) {
        console.error(err);
        text = 'אירעה שגיאה בשמירת הארוחה';
      }
      break;
    }
    case '/nextEat': {
      const mins = await BabyService.timeSinceLastFeeding();
      if (mins === null) {
        text = 'לא נמצאה ארוחה אחרונה.';
      } else {
        const passedH = Math.floor(mins / 60);
        const passedM = mins % 60;
        const recommendedInterval = 180; // דקות (3 שעות)
        const remaining = Math.max(0, recommendedInterval - mins);
        const remH = Math.floor(remaining / 60);
        const remM = remaining % 60;

        text = `עברו ${passedH} ש' ו${passedM} ד' מאז הארוחה.` +
          `\nמומלץ לאכול שוב בעוד ${remH} ש' ו${remM} ד'.` + `\n בכל אופן אל דאגה אני אזכיר לכם חצי שעה לפני הארוחה הבאה שלה`;
      }
      break;
    }
    case '/totalEatToday': {
      const total = await BabyService.totalFeedingToday();
      const feedings = await BabyService.listFeedingsToday();

      // פירוט לפי שעת ההזנה המדויקת
      text = 'פירוט אכילה היום:';
      feedings.forEach(f => {
        text += `\n${moment(f.timestamp).format('HH:mm')} = ${f.amount} מ\"ל`;
      });

      // סיכום סה״כ בסוף
      text += `\n\nסה\"כ היום: ${total} מ\"ל`;
      break;
    }
    case '/totalDiaperToday': {
      const diapers = await BabyService.listDiapersToday();
      text = 'פירוט החלפות חיתול היום:';
      diapers.forEach(d => {
        text += `\n${moment(d.timestamp).format('HH:mm')} = ${d.type}`;
      });
      text += `\n\nסה״כ החלפות חיתול היום: ${diapers.length}`;
      break;
    }

    case '/totalMedToday': {
      const meds = await BabyService.listMedicationsToday();
      text = 'פירוט תרופות היום:';
      meds.forEach(m => {
        const dose = m.dosage ? ` (${m.dosage})` : '';
        text += `\n${moment(m.timestamp).format('HH:mm')} = ${m.name}${dose}`;
      });
      text += `\n\nסה״כ תרופות תועדו היום: ${meds.length}`;
      break;
    }

    case '/diaper': {
      if (parts.length < 2) {
        text = 'שימוש נכון: /diaper <pee|poop> [YYYY-MM-DD HH:mm]';
        break;
      }
      const type = parts[1].toLowerCase();
      if (!['pee', 'poop'].includes(type)) {
        text = 'סוג לא חוקי. השתמש: pee או poop';
        break;
      }
      let timestamp = new Date();
      if (parts[2]) {
        const dt = moment.tz(parts[2], 'HH:mm', 'Asia/Jerusalem');
        if (!dt.isValid()) {
          text = 'פורמט שעה לא חוקי. השתמש: HH:mm';
          break;
        }
        timestamp = dt.toDate();
      }
      await BabyService.recordDiaper(type, timestamp);
      text = `הוכנסה החלפת חיתול: ${type} ב-${moment(timestamp).format('YYYY-MM-DD HH:mm')}`;
      break;
    }
    case '/med': {
      if (parts.length < 2) {
        text = 'שימוש נכון: /med <name> [dosage] [YYYY-MM-DD HH:mm]';
        break;
      }
      const name = parts[1];
      // dosage = הכמות או המינון, למשל "10mg" או "5ml"
      const dosage = parts[2] && !/\d{2}:\d{2}/.test(parts[2]) ? parts[2] : null;
      let timestamp = new Date();
      const timePart = parts.find(p => /\d{2}:\d{2}/.test(p));
      if (timePart) {
        const dt = moment.tz(timePart, 'HH:mm', 'Asia/Jerusalem');
        if (dt.isValid()) timestamp = dt.toDate();
      }
      await BabyService.recordMedication(name, dosage, timestamp);
      text = `תרופה '${name}'${dosage ? ' ' + dosage : ''} תועדה ב-${moment(timestamp).format('YYYY-MM-DD HH:mm')}`;
      break;
    }
    default:
      text = 'פקודה לא מוכרת. נסה: /eat, /nextEat, /totalEatToday, /diaper, /med, /totalDiaperToday, /totalMedToday';
  }
  bot.sendMessage(chatId, text);
});

// במקום previous range check, השתמש ב:
cron.schedule('* * * * *', async () => {
  if (!lastChatId) return;
  const mins = await BabyService.timeSinceLastFeeding();
  if (mins !== null && mins >= 150) {
    bot.sendMessage(
      lastChatId,
      'התינוקת צריכה לאכול בעוד חצי שעה (עברו 2.5 שעות מאז הארוחה האחרונה).'
    );
  }
});

// Start Express
const app = express();
app.listen(process.env.PORT, () => {
  console.log(`Server on port ${process.env.PORT}`);
});
