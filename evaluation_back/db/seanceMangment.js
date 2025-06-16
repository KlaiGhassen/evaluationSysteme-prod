require("dotenv").config();
const fs = require("fs");
let knex = require("./knex");
const moment = require("moment");
const { RRuleSet, RRule } = require("rrule");

const PDFDocument = require("pdfkit");

async function generatePDF(seance) {
  const pdfName = "pdf-" + Date.now() + ".pdf";

  const doc = new PDFDocument();
  const absoluteImagePath = require("path").resolve(__dirname, "../uploads/");
  const logo = require("path").resolve(__dirname, "../utils/");

  // Pipe the PDF into a writable stream
  doc.pipe(fs.createWriteStream(absoluteImagePath + "/pdf/" + pdfName));
  const teacher = await knex("user").where("id", seance.id_teacher).first();
  const module = await knex("module")
    .where("id_module", seance.id_module)
    .first();

  // Define layout parameters
  const logoPath = logo + "/logo.png"; // Update with the path to your logo
  const imagePath = absoluteImagePath + "/qrs/" + seance.qrcode; // Update with the path to your image
  const moduleName = module.name_module;
  const teacherName = teacher.first_name + " " + teacher.last_name;
  const date = seance.start;

  try {
    doc.image(logoPath, 50, 50, { width: 100 });
  } catch (error) {
    console.error("Error adding logo:", error);
  }

  // Add the text in the center
  doc.fontSize(20).text(moduleName, { align: "center" });

  // Add the date to the right
  doc.fontSize(12).text(date, 400, 50, { width: 150, align: "right" });
  // Add the image to the center of the page
  try {
    const image = doc.openImage(imagePath);
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // Determine image dimensions
    const imageOriginalWidth = image.width;
    const imageOriginalHeight = image.height;

    // Calculate scaling factor to fit image within desired dimensions
    const maxWidth = 500; // Desired max width of the image
    const maxHeight = 300; // Desired max height of the image
    const scaleFactor = Math.min(
      maxWidth / imageOriginalWidth,
      maxHeight / imageOriginalHeight
    );

    const imageWidth = imageOriginalWidth * scaleFactor;
    const imageHeight = imageOriginalHeight * scaleFactor;

    // Calculate coordinates to center the image
    const x = (pageWidth - imageWidth) / 2;
    const y = (pageHeight - imageHeight) / 2;
    const textHeight = doc.heightOfString(teacherName, {
      width: imageWidth,
      align: "center",
    });
    doc.fontSize(20).text(teacherName, x, y - textHeight - 10, {
      width: imageWidth,
      align: "center",
    });

    doc.image(imagePath, x, y, { width: imageWidth, height: imageHeight });
  } catch (error) {
    console.error("Error adding image:", error);
  }

  // Finalize the PDF and end the stream
  doc.end();
  return pdfName;
}

// Generate the PDF

const sessionTimes = {
  S1S2: {
    start_time: "09:00",
    end_time: "12:15",
  },
  S4S5: {
    start_time: "13:30",
    end_time: "16:45",
  },
};

function base64ToImage(base64String, filePath) {
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  try {
    fs.writeFileSync(filePath, buffer);
    console.log(`Image saved to ${filePath}`);
  } catch (error) {
    console.log(error);
  }
}
async function convertFullNameToEmail(fullName) {
  // Convert full name to lowercase
  const lowerCaseName = fullName.toLowerCase();

  // Replace the first space with a dot and remove any remaining spaces
  const emailName = lowerCaseName.replace(/\s/, ".").replace(/\s/g, "");

  // Append the domain
  const email = `${emailName}@esprit.tn`;

  return email;
}

exports.addSeance = async (req, res, next) => {
  try {
    if (!req.body || !Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({ error: "Invalid request body. Expected non-empty array of seances." });
    }

    const absoluteImagePath = require("path").resolve(
      __dirname,
      "../uploads/qrs"
    );

    const results = await Promise.all(req.body.map(async (data) => {
      try {
        // Validate required fields
        if (!data.module || !data.full_name || !data.qrcode || !data.date_cours || !data.seance || !data.classe) {
          throw new Error("Missing required fields");
        }

        if (!data.qrcode.__zone_symbol__value) {
          throw new Error("Invalid QR code data");
        }

        const imageName = "qr-" + Date.now() + ".png";

        base64ToImage(
          data.qrcode.__zone_symbol__value,
          absoluteImagePath + "/" + imageName
        );

        const req_seance = {
          title: data.module,
          full_name: data.full_name,
          qrcode: imageName,
          module: data.module,
          description: data.module,
          date_course: data.date_cours,
          seance: data.seance,
          classe: data.classe.toUpperCase(),
        };

        const module = await knex("module")
          .where("name_module", req_seance.module)
          .first();

        if (!module) {
          throw new Error(`Module "${req_seance.module}" not found`);
        }

        const user = await knex("user")
          .where("email", await convertFullNameToEmail(req_seance.full_name))
          .first();

        if (!user) {
          throw new Error(`Teacher "${req_seance.full_name}" not found`);
        }

        if (!sessionTimes[req_seance.seance]) {
          throw new Error(`Invalid session "${req_seance.seance}"`);
        }

        const seance = await knex("seance").insert({
          title: req_seance.title,
          qrcode: req_seance.qrcode,
          description: req_seance.description,
          classe: req_seance.classe,
          start:
            req_seance.date_course +
            " " +
            sessionTimes[req_seance.seance].start_time,
          end:
            req_seance.date_course + " " + sessionTimes[req_seance.seance].end_time,
          id_module: module.id_module,
          id_teacher: user.id,
          pdfName: await generatePDF({
            title: req_seance.title,
            qrcode: req_seance.qrcode,
            description: req_seance.description,
            start:
              req_seance.date_course +
              " " +
              sessionTimes[req_seance.seance].start_time,
            end:
              req_seance.date_course +
              " " +
              sessionTimes[req_seance.seance].end_time,
            id_module: module.id_module,
            id_teacher: user.id,
          }),
        });

        return { success: true, seance };
      } catch (error) {
        return { 
          success: false, 
          error: error.message,
          data: {
            module: data.module,
            full_name: data.full_name,
            classe: data.classe
          }
        };
      }
    }));

    const hasErrors = results.some(result => !result.success);
    if (hasErrors) {
      return res.status(207).json({ 
        message: "Some seances failed to be created",
        results 
      });
    } else {
      return res.status(200).json({ 
        message: "All seances created successfully",
        results 
      });
    }
  } catch (error) {
    console.error("Error in addSeance:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
};
const _exceptions = [];

exports.getSeances = async (req, res, next) => {
  try {
    console.log(`User role: ${req.payload.role}`);
    let events = [];

    // Helper function to fetch scanned seances with student details
    const fetchScannedSeances = async (event) => {
      console.log(`Processing event ID: ${event.id}`);
      
      // Fetch teacher details
      const teacher = await knex("user")
        .where("id", event.id_teacher)
        .select("id", "first_name", "last_name", "email")
        .first();
      
      console.log(`Teacher details for event ${event.id}:`, teacher);
      
      const scannedSeances = await knex("seance_student")
        .where("id_seance", event.id)
        .orderBy("created_at", "asc");
      
      console.log(`Found ${scannedSeances.length} scans for event ${event.id}`);
      
      const scannedSeancesWithDetails = await Promise.all(
        scannedSeances.map(async (scan) => {
          const student = await knex("user")
            .where("id", scan.id_student)
            .select("first_name", "last_name", "email")
            .first();
          
          console.log(`Student scan details:`, {
            scanId: scan.id,
            studentName: student ? `${student.first_name} ${student.last_name}` : 'Not found',
            scanTime: scan.created_at
          });
          
          return {
            ...scan,
            student_details: student
          };
        })
      );

      return {
        ...event,
        teacher_details: teacher, // Add teacher details to the event
        scanned_seances: scannedSeancesWithDetails
      };
    };

    if (req.payload.role === "ADMIN") {
      // Fetch all events from the database
      events = await knex("seance")
        .orderBy("start", "desc"); // Order by start date, most recent first
      console.log(`Found ${events.length} total events`);
      
      // Fetch all scanned seances for each event
      events = await Promise.all(events.map(fetchScannedSeances));

    } else if (
      req.payload.role === "TEACHER" ||
      req.payload.role === "RDI" ||
      req.payload.role === "CUP"
    ) {
      events = await knex("seance")
        .where("id_teacher", req.payload.id)
        .orderBy("start", "desc");
      console.log(`Found ${events.length} events for teacher ${req.payload.id}`);
      
      // Fetch scanned seances for teacher's events
      events = await Promise.all(events.map(fetchScannedSeances));

    } else if (req.payload.role === "STUDENT") {
      const classroom = await knex("classroom")
        .where("classroom_id", req.payload.student_class)
        .first();
      
      events = await knex("seance")
        .where("classe", classroom.name_class)
        .orderBy("start", "desc");
      console.log(`Found ${events.length} events for student's class ${classroom.name_class}`);
    }

    // Log final processed events
    console.log('Final processed events:', events.map(event => ({
      id: event.id,
      title: event.title,
      date: event.start,
      teacher: event.teacher_details ? `${event.teacher_details.first_name} ${event.teacher_details.last_name}` : 'Unknown',
      scannedCount: event.scanned_seances ? event.scanned_seances.length : 0
    })));

    // Add calendar ID to each event
    events = events.map(event => ({
      ...event,
      calendarId: event.classe
    }));

    res.seances = events;
    next();
  } catch (error) {
    console.error("Error fetching seances:", error);
    res.status(500).send("Internal Server Error");
  }
};

function _generateRuleset(event, dtStart, until) {
  console.log(`Generating ruleset for event: ${event.id}`);
  const parsedRules = {};
  event.recurrence.split(";").forEach((rule) => {
    const parsedRule = rule.split("=");
    if (parsedRule[0] === "UNTIL" || parsedRule[0] === "COUNT") {
      return;
    }
    parsedRules[parsedRule[0]] = parsedRule[1];
  });

  const rules = [];
  Object.keys(parsedRules).forEach((key) => {
    rules.push(`${key}=${parsedRules[key]}`);
  });

  const ruleSet = [];
  ruleSet.push(`DTSTART:${dtStart.format("YYYYMMDD[T]HHmmss[Z]")}`);
  ruleSet.push(
    `RRULE:${rules.join(";")};UNTIL=${until.format("YYYYMMDD[T]HHmmss[Z]")}`
  );

  _exceptions.forEach((item) => {
    if (item.eventId === event.id) {
      ruleSet.push(
        `EXDATE:${moment(item.exdate).format("YYYYMMDD[T]HHmmss[Z]")}`
      );
    }
  });

  return rrulestr(ruleSet.join("\n"), { forceset: true });
}

exports.getCalendarsPerClasses = async (req, res, next) => {
  try {
    mode_calendar = req.params.mode;
    let calendar;
    switch (mode_calendar) {
      case "classes":
        calendar = await knex.select("*").from("classroom");
        break;
      case "teachers":
        calendar = await knex.select("*").from("user").where("role", "TEACHER");
        break;
      case "students":
        calendar = await knex.select("*").from("user").where("role", "STUDENT");
        break;
      default:
        calendar = await knex.select("*").from("classroom");
        break;
    }
    let data = calendar.map((classroom) => {
      let calendar = {
        id: classroom.name_class,
        title: classroom.name_class,
        color: "bg-teal-500",
        visible: true,
      };
      return calendar;
    });
    console.log(data);
    res.calendars = data;
    next();
  } catch (e) {
    console.error("Error fetching seances:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.presence = async (req, res, next) => {
  console.log(req.body);
  let StudentId = req.payload.id;
  let classe = req.body.data.classe.toUpperCase();
  console.log(req.body);
  const teacher = await knex("user")
    .where("email", await convertFullNameToEmail(req.body.data.full_name))
    .first();

  const classroom = await knex("classroom").where("name_class", classe).first();
  const seance = await knex("seance")
    .where(
      "start",
      "=",
      moment(
        req.body.data.date_cours +
          " " +
          sessionTimes[req.body.data.seance].start_time
      )
        .utc()
        .toISOString()
    )
    .first();

  if (teacher && classroom && seance) {
    try {
      const seance_student = await knex("seance_student").insert({
        id_seance: seance.id,
        classroom_id: classroom.classroom_id,
        id_student: StudentId,
        seance: req.body.data.seance,
        seance_status: getSession(),
      });
      res.seance_student = true;
      next();
    } catch (error) {
      res.seance_student = true;
      next();
    }
  } else {
    res.seance_student = false;
    next();
  }
};

function getSession() {
  const currentTime = moment();
  const s1Start = moment().set({ hour: 9, minute: 0 });
  const s1End = moment().set({ hour: 10, minute: 15 });
  const s2Start = moment().set({ hour: 10, minute: 30 });
  const s2End = moment().set({ hour: 12, minute: 15 });
  const s4Start = moment().set({ hour: 13, minute: 30 });
  const s4End = moment().set({ hour: 14, minute: 45 });
  const s5Start = moment().set({ hour: 15, minute: 0 });
  const s5End = moment().set({ hour: 16, minute: 45 });
  if (currentTime.isBetween(s1Start, s1End)) {
    return "s1";
  } else if (currentTime.isBetween(s2Start, s2End)) {
    return "s2";
  } else if (currentTime.isBetween(s4Start, s4End)) {
    return "s4";
  } else if (currentTime.isBetween(s5Start, s5End)) {
    return "s5";
  } else {
    return "No session";
  }
}

exports.getSessionAudience = async (sessionId) => {
    try {
        // Get the session details
        const session = await knex('seance')
            .where('id_seance', sessionId)
            .first();

        if (!session) {
            throw new Error('Session not found');
        }

        // Get all students enrolled in the course
        const students = await knex('student')
            .select('student.*', knex.raw("'STUDENT' as role"))
            .innerJoin('enrollment', 'student.id_student', 'enrollment.id_student')
            .where('enrollment.id_course', session.id_course);

        // Get the teacher of the course
        const teacher = await knex('teacher')
            .select('teacher.*', knex.raw("'TEACHER' as role"))
            .innerJoin('course', 'teacher.id_teacher', 'course.id_teacher')
            .where('course.id_course', session.id_course);

        // Combine students and teacher into audience
        const audience = [...students, ...teacher];

        return audience;
    } catch (error) {
        console.error('Error getting session audience:', error);
        throw error;
    }
};

exports.getSessionAttendance = async (sessionId) => {
    try {
        // Get all students who have scanned for this session
        const attendance = await knex('seance_student')
            .select(
                'seance_student.*',
                'user.first_name',
                'user.last_name',
                'user.email'
            )
            .leftJoin('user', 'seance_student.id_student', 'user.id')
            .where('seance_student.id_seance', sessionId)
            .orderBy('seance_student.created_at', 'asc');

        return attendance;
    } catch (error) {
        console.error('Error getting session attendance:', error);
        throw error;
    }
};
