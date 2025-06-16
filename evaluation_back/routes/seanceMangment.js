require("dotenv").config();
const express = require("express");
const {
  addSeance,
  getSeances,
  presence,
  getCalendarsPerClasses,
  getSessionAudience,
  getSessionAttendance
} = require("../db/seanceMangment");
const storage = require("../middleware/storage");
const knex = require("../db/knex");
const moment = require("moment");

const router = express.Router();
router.get("/calendars", getCalendarsPerClasses, (req, res) => {
  res.status(200).json(res.calendars);
});
router.post("/", addSeance, (req, res) => {
  res.status(200).json(true);
});

router.get("/", getSeances, (req, res) => {
  res.status(200).json(res.seances);
});
router.get("/qrcode/:nom", storage.getQrCode);
router.get("/pdf/:nom", storage.getPdfQrCode);
//TODO: CH7AB YGOUL B :MODE
//router.post("/presence/:mode", presence, (req, res) => {
//  res.json(res.seance_student);
//});
router.post("/presence", presence, (req, res) => {
  res.json(res.seance_student);
});

router.get('/audience/:sessionId', async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const audience = await getSessionAudience(sessionId);
        res.json(audience);
    } catch (error) {
        console.error('Error getting session audience:', error);
        res.status(500).json({ message: 'Error getting session audience' });
    }
});

router.get('/attendance/:sessionId', async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const attendance = await getSessionAttendance(sessionId);
        res.json(attendance);
    } catch (error) {
        console.error('Error getting session attendance:', error);
        res.status(500).json({ message: 'Error getting session attendance' });
    }
});

router.post('/attendance/:sessionId', async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const { studentId, present } = req.body;
        
        console.log('Updating attendance:', {
            sessionId,
            studentId,
            present,
            body: req.body
        });

        // Get session details to get the class
        const session = await knex('seance')
            .where('id', sessionId)
            .first();
            
        console.log('Session details:', session);
            
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Get classroom_id for the session's class
        const classroom = await knex('classroom')
            .where('name_class', session.classe)
            .first();

        console.log('Classroom details:', classroom);

        if (!classroom) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // Determine the session period (S1S2 or S4S5) based on the start time
        const startTime = moment(session.start).format('HH:mm');
        const sessionPeriod = startTime <= '12:15' ? 'S1S2' : 'S4S5';

        console.log('Session period:', {
            startTime,
            sessionPeriod
        });

        if (present) {
            // Insert attendance record
            const insertData = {
                id_seance: sessionId,
                classroom_id: classroom.classroom_id,
                id_student: studentId,
                seance: sessionPeriod,
                seance_status: sessionPeriod
            };
            console.log('Inserting attendance:', insertData);
            
            await knex('seance_student').insert(insertData)
                .onConflict(['id_seance', 'classroom_id', 'id_student', 'seance_status'])
                .merge();
        } else {
            // Remove attendance record
            const deleteData = {
                id_seance: sessionId,
                classroom_id: classroom.classroom_id,
                id_student: studentId,
                seance: sessionPeriod,
                seance_status: sessionPeriod
            };
            console.log('Deleting attendance:', deleteData);
            
            await knex('seance_student')
                .where(deleteData)
                .del();
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating attendance:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            message: 'Error updating attendance',
            error: error.message,
            stack: error.stack
        });
    }
});

module.exports = router;
