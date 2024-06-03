require("dotenv").config();
const fs = require("fs");
let knex = require("./knex");
const moment = require("moment"); // require
const { RRuleSet, RRule } = require("rrule");
const sessionTimes = {
  S1S2: {
    start_time: "09:00",
    end_time: "12:15",
  },
  S4S5: {
    start_time: "15:30",
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

function convertFullNameToEmail(fullName) {
  // Convert full name to lowercase
  const lowerCaseName = fullName.toLowerCase();

  // Replace spaces with dots
  const emailName = lowerCaseName.replace(/\s+/g, ".");

  // Append the domain
  const email = `${emailName}@esprit.tn`;

  return email;
}

exports.addSeance = async (req, res, next) => {
  console.log("error", req.body);
  const imageName = "qr-" + Date.now() + ".png";
  const absoluteImagePath = require("path").resolve(
    __dirname,
    "../uploads/qrs"
  );
  base64ToImage(
    req.body.qrcode.__zone_symbol__value,
    absoluteImagePath + "/" + imageName
  );
  const req_seance = {
    title: req.body.module,
    full_name: req.body.full_name,
    qrcode: imageName,
    module: req.body.module,
    description: req.body.module,
    date_course: req.body.date_cours,
    seance: req.body.seance,
    class: req.body.Classe,
  };

  const module = await knex("module")
    .where("name_module", req_seance.module)
    .first();

  const user = await knex("user")
    .where("email", convertFullNameToEmail(req_seance.full_name))
    .first();

  console.log(
    req_seance.date_course + " " + sessionTimes[req_seance.seance].start_time
  );
  const seance = await knex("seance").insert({
    title: req_seance.title,
    qrcode: req_seance.qrcode,
    description: req_seance.description,
    start:
      req_seance.date_course + " " + sessionTimes[req_seance.seance].start_time,
    end:
      req_seance.date_course + " " + sessionTimes[req_seance.seance].end_time,
    id_module: module.id_module,
    id_teacher: user.id,
  });
  res.seance = seance;
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
    const events = await knex("seance").where("id_teacher", req.payload.id);
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
    .where("email", convertFullNameToEmail(req.body.data.full_name))
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
