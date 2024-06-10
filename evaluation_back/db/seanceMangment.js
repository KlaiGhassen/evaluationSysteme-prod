require("dotenv").config();
const fs = require("fs");
let knex = require("./knex");
const moment = require("moment"); // require
const { RRuleSet, RRule } = require("rrule");

const PDFDocument = require("pdfkit");

async function generatePDF(seance) {
  const pdfName = "pdf-" + Date.now() + ".pdf";

  const doc = new PDFDocument();
  const absoluteImagePath = require("path").resolve(__dirname, "../uploads/");
  const logo = require("path").resolve(__dirname, "../utils/");

  // Pipe the PDF into a writable stream
  doc.pipe(fs.createWriteStream(absoluteImagePath + "/pdf/" + pdfName));
  const teacher = await knex("user").where("id", seance.teacherId).first();
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

  // Replace spaces with dots
  const emailName = lowerCaseName.replace(/\s+/g, ".");

  // Append the domain
  const email = `${emailName}@esprit.tn`;

  return email;
}

exports.addSeance = async (req, res, next) => {
  console.log(req.body);
  const absoluteImagePath = require("path").resolve(
    __dirname,
    "../uploads/qrs"
  );
  req.body.forEach(async (data) => {
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
      class: data.Classe,
    };

    const module = await knex("module")
      .where("name_module", req_seance.module)
      .first();

    const user = await knex("user")
      .where("email", await convertFullNameToEmail(req_seance.full_name))
      .first();

    const seance = await knex("seance").insert({
      title: req_seance.title,
      qrcode: req_seance.qrcode,
      description: req_seance.description,
      start:
        req_seance.date_course +
        " " +
        sessionTimes[req_seance.seance].start_time,
      end:
        req_seance.date_course + " " + sessionTimes[req_seance.seance].end_time,
      id_module: module.id_module,
      teacherId: user.id,
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
        teacherId: user.id,
      }),
    });
  });
  res.seance = true;
  next();
};
const _exceptions = [];

exports.getSeances = async (req, res, next) => {
  try {
    const viewStart = moment.utc(req.query.start);
    const viewEnd = moment.utc(req.query.end);
    console.log(`View Start: ${viewStart}`);
    console.log(`View End: ${viewEnd}`);

    // Fetch the events from the database
    const events = await knex("seance").where("teacherId", req.payload.id);
    console.log(`Fetched ${events.length} events`);

    // Prepare the results array
    const results = [];

    // Process each event
    events.forEach((event) => {
      event["calendarId"] = "1a470c8e-40ed-4c2d-b590-a4f1f6ead6cc";

      const eventStart = moment.utc(event.start).add(1, "hour");
      const eventEnd = moment.utc(event.end).add(1, "hour");
      console.log(
        `Processing event: ${
          event.id
        }, Start: ${eventStart.format()}, End: ${eventEnd.format()}`
      );

      // Check if event falls within view range
      if (!event.recurrence) {
        if (eventStart.isBefore(viewEnd) && eventEnd.isAfter(viewStart)) {
          results.push(event);
          console.log(`Added normal event: ${event.id}`);
        } else {
          console.log(`Normal event ${event.id} is out of view range`);
        }
      } else {
        // Recurring event handling
        if (eventStart.isAfter(viewEnd) || eventEnd.isBefore(viewStart)) {
          console.log(
            `Recurring event ${event.id} does not recur within the view range`
          );
          return;
        }

        // Set the DTSTART and UNTIL for RRule
        const dtStart = eventStart.clone();
        const until = viewEnd.isBefore(eventEnd)
          ? viewEnd.clone().utc()
          : eventEnd.clone().utc();

        // Create an RRuleSet
        const rruleset = _generateRuleset(event, dtStart, until);
        console.log(`Generated RRuleSet for event: ${event.id}`);

        // Generate the recurring dates and loop through them
        rruleset.all().forEach((date) => {
          const ruleDate = moment.utc(date);
          ruleDate.subtract(ruleDate.utcOffset(), "minutes");

          if (!ruleDate.isBetween(viewStart, viewEnd, "day", "[]")) {
            console.log(`Date ${ruleDate.format()} is out of view range`);
            return;
          }

          const eventInstance = {
            id: `${event.id}_${ruleDate
              .clone()
              .utc()
              .format("YYYYMMDD[T]HHmmss[Z]")}`,
            recurringEventId: event.id,
            isFirstInstance: event.start === ruleDate.clone().toISOString(),
            title: event.title,
            description: event.description,
            start: ruleDate.toISOString(),
            end: ruleDate.add(event.duration, "minutes").toISOString(),
            duration: event.duration,
            allDay: event.allDay,
            recurrence: event.recurrence,
          };

          results.push(eventInstance);
          console.log(`Added recurring event instance: ${eventInstance.id}`);
        });
      }
    });

    console.log(`Total results: ${results.length}`);
    res.seances = results;
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

exports.presence = async (req, res, next) => {
  let StudentId = req.payload.id;
  let classe = req.body.data.classe.toUpperCase();
  console.log(req.body);
  console.log(
    moment.utc(
      req.body.data.date_cours +
        " " +
        sessionTimes[req.body.data.seance].start_time
    )
  );
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
        status: getSession(),
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
