require("dotenv").config();
const { ideahub } = require("googleapis/build/src/apis/ideahub");
let knex = require("./knex");
exports.getTeachingData = async (req, res, next) => {
  try {
    const id = req.payload.id;
    const teachers = await knex("teacher_class")
      .where("teacher_class.teacher_id", id)
      .leftJoin(
        "student_ratting",
        "student_ratting.teacher_ratting_id",
        "teacher_class.teacher_id"
      )
      .select(
        knex.raw(
          "count(distinct student_ratting.student_ratting_id) as num_students_rated"
        ),
        knex.raw("count(distinct teacher_class.classroom) as num_classrooms")
      );

    res.teachers = teachers;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.getTeachingDataByClassRooms = async (req, res, next) => {
  try {
    const id = req.payload.id;
    const teachers = await knex("classroom")
      .join(
        "teacher_class",
        "classroom.classroom_id",
        "=",
        "teacher_class.classroom"
      )
      .join("user", "user.id", "=", "teacher_class.teacher_id")
      .join("module", "teacher_class.module", "=", "module.id_module") // add join statement for the "module" table
      .leftJoin("student_ratting", function () {
        this.on(
          "classroom.classroom_id",
          "=",
          knex.raw("student_ratting.classroom_id")
        ).andOn(
          "teacher_class.teacher_id",
          "=",
          "student_ratting.teacher_ratting_id"
        );
      })
      .select(
        "module.name_module",
        "classroom.name_class",
        "classroom.university_year",
        knex.raw(
          "COUNT(DISTINCT student_ratting.student_ratting_id) as num_students_rated"
        ),
        knex.raw("COUNT(DISTINCT student.id) as num_students")
      )
      .leftJoin(
        "user as student",
        "student.student_class",
        "=",
        "classroom.classroom_id"
      )
      .groupBy(
        "classroom.name_class",
        "classroom.university_year",
        "module.name_module"
      )
      .where("user.id", id)
      .orderBy("classroom.name_class");

    res.teachers = teachers;
    next();
  } catch (error) {
    console.error(error);
  }
};

exports.getStudentTeacherRatting = async (req, res, next) => {
  try {
    let id = req.payload.id;
    const allStudentRate = await knex("student_ratting")
      .select("value")
      .count("* as count")
      .where("teacher_ratting_id", id)
      .whereIn("value", [1, 2, 3, 4, 5])
      .groupBy("value");
    const allFramingRate = await knex("framing_ratting")
      .select("value")
      .count("* as count")
      .where("teacher_rated_id", id)
      .whereIn("value", [1, 2, 3, 4, 5])
      .groupBy("value");
    const allRoRatting = await knex("ro_ratting")
      .select("value")
      .count("* as count")
      .where("teacher_ratting_id", id)
      .whereIn("value", [1, 2, 3, 4, 5])
      .groupBy("value");
    const allRdiRate = await knex("teacher_ratting")
      .select("value")
      .count("* as count")
      .where("teacher_rated_id", id)
      .whereIn("value", [1, 2, 3, 4, 5])
      .andWhere({ type: "RDI" })
      .groupBy("value");
    const allGestionRate = await knex("teacher_ratting")
      .select("value")
      .count("* as count")
      .where("teacher_rated_id", id)
      .andWhereNot({ type: "RDI" })
      .whereIn("value", [1, 2, 3, 4, 5])
      .groupBy("value");

    const studentRate = await knex("student_ratting")
      .select("value")
      .count("* as count")
      .where("teacher_ratting_id", id)
      .whereIn("value", [1, 2, 3, 4, 5])
      .groupBy("value");

    const framingRate = await knex("framing_ratting")
      .select("value")
      .count("* as count")
      .where("teacher_rated_id", id)
      .whereIn("value", [1, 2, 3, 4, 5])
      .groupBy("value");
    const roRatting = await knex("ro_ratting")
      .select("value")
      .count("* as count")
      .where("teacher_ratting_id", id)
      .whereIn("value", [1, 2, 3, 4, 5])
      .groupBy("value");

    const rdiRate = await knex("teacher_ratting")
      .select("value")
      .count("* as count")
      .where({ teacher_rated_id: id, type: "RDI" })
      .whereIn("value", [1, 2, 3, 4, 5])
      .andWhere({ type: "RDI" })
      .groupBy("value");

    const GestionRate = await knex("teacher_ratting")
      .select("value")
      .count("* as count")
      .where({ teacher_rated_id: id })
      .andWhereNot({ type: "RDI" })
      .whereIn("value", [1, 2, 3, 4, 5])
      .groupBy("value");

    const ratingsAll = {
      "1star": 0,
      "2star": 0,
      "3star": 0,
      "4star": 0,
      "5star": 0,
    };
    const ratings = {
      "1star": 0,
      "2star": 0,
      "3star": 0,
      "4star": 0,
      "5star": 0,
    };
    if (allStudentRate.length > 0) {
      allStudentRate.forEach((element) => {
        ratingsAll["" + element.value + "star"] += Number(element.count);
      });
    }

    if (allFramingRate.length > 0) {
      allFramingRate.forEach((element) => {
        ratingsAll["" + element.value + "star"] += Number(element.count);
      });
    }

    if (allRdiRate.length > 0) {
      allRdiRate.forEach((element) => {
        ratingsAll["" + element.value + "star"] += Number(element.count);
      });
    }

    if (allGestionRate.length > 0) {
      allGestionRate.forEach((element) => {
        ratingsAll["" + element.value + "star"] += Number(element.count);
      });
    }

    if (allRoRatting.length > 0) {
      allRoRatting.forEach((element) => {
        ratingsAll["" + element.value + "star"] += Number(element.count);
      });
    }

    if (studentRate.length > 0) {
      studentRate.forEach((element) => {
        ratings["" + element.value + "star"] += Number(element.count);
      });
    }

    if (framingRate.length > 0) {
      framingRate.forEach((element) => {
        ratings["" + element.value + "star"] += Number(element.count);
      });
    }

    if (rdiRate.length > 0) {
      rdiRate.forEach((element) => {
        ratings["" + element.value + "star"] += Number(element.count);
      });
    }

    if (GestionRate.length > 0) {
      GestionRate.forEach((element) => {
        ratings["" + element.value + "star"] += Number(element.count);
      });
    }

    if (roRatting.length > 0) {
      roRatting.forEach((element) => {
        ratings["" + element.value + "star"] += Number(element.count);
      });
    }
    let allSum = 0;
    let allcount = 0;

    for (const rating in ratingsAll) {
      const weight = ratingsAll[rating];
      const numericRating = parseInt(rating.charAt(0));

      allSum += numericRating * weight;
      allcount += weight;
    }

    let sum = 0;
    let count = 0;

    for (const rating in ratings) {
      const weight = ratings[rating];
      const numericRating = parseInt(rating.charAt(0));

      sum += numericRating * weight;
      count += weight;
    }
    const averageRating = parseFloat(sum / count).toFixed(2);
    res.teachers = {
      rating: ratings,
      allRating: ratingsAll,
      moy: averageRating,
      allRates: allcount,
    };
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.getStudentTeacherRattingUser = async (req, res, next) => {
  try {
    let id = req.params.id;
    let data = [];
    const ratings = {
      "1star": 0,
      "2star": 0,
      "3star": 0,
      "4star": 0,
      "5star": 0,
    };
    const ratingsAll = {
      "1star": 0,
      "2star": 0,
      "3star": 0,
      "4star": 0,
      "5star": 0,
    };
    const studentRate = await knex("student_ratting")
      .select("value")
      .count("* as count")
      .where("teacher_ratting_id", id)
      .whereIn("value", [1, 2, 3, 4, 5])
      .groupBy("value");
    console.log("ahla wa sahla", studentRate);

    const framingRate = await knex("framing_ratting")
      .select("value")
      .count("* as count")
      .where("teacher_rated_id", id)
      .whereIn("value", [1, 2, 3, 4, 5])
      .groupBy("value");

    const rdiRate = await knex("teacher_ratting")
      .select("value")
      .count("* as count")
      .where({ teacher_rated_id: id, type: "RDI" })
      .whereIn("value", [1, 2, 3, 4, 5])
      .andWhere({ type: "RDI" })
      .groupBy("value");
    const roRatting = await knex("ro_ratting")
      .select("value")
      .count("* as count")
      .where("teacher_ratting_id", id)
      .whereIn("value", [1, 2, 3, 4, 5])
      .groupBy("value");
    const GestionRate = await knex("teacher_ratting")
      .select("value")
      .count("* as count")
      .where({ teacher_rated_id: id })
      .andWhereNot({ type: "RDI" })
      .whereIn("value", [1, 2, 3, 4, 5])
      .groupBy("value");

    const allStudentRate = await knex("student_ratting")
      .select("value")
      .count("* as count")
      .where("teacher_ratting_id", id)
      .whereIn("value", [1, 2, 3, 4, 5])
      .groupBy("value");
    const allFramingRate = await knex("framing_ratting")
      .select("value")
      .count("* as count")
      .where("teacher_rated_id", id)
      .whereIn("value", [1, 2, 3, 4, 5])
      .groupBy("value");
    const allRoRatting = await knex("ro_ratting")
      .select("value")
      .count("* as count")
      .where("teacher_ratting_id", id)
      .whereIn("value", [1, 2, 3, 4, 5])
      .groupBy("value");
    const allRdiRate = await knex("teacher_ratting")
      .select("value")
      .count("* as count")
      .where("teacher_rated_id", id)
      .whereIn("value", [1, 2, 3, 4, 5])
      .andWhere({ type: "RDI" })
      .groupBy("value");
    const allGestionRate = await knex("teacher_ratting")
      .select("value")
      .count("* as count")
      .where("teacher_rated_id", id)
      .andWhereNot({ type: "RDI" })
      .whereIn("value", [1, 2, 3, 4, 5])
      .groupBy("value");

    if (allStudentRate.length > 0) {
      allStudentRate.forEach((element) => {
        ratingsAll["" + element.value + "star"] += Number(element.count);
      });
    }

    if (allFramingRate.length > 0) {
      allFramingRate.forEach((element) => {
        ratingsAll["" + element.value + "star"] += Number(element.count);
      });
    }

    if (allRdiRate.length > 0) {
      allRdiRate.forEach((element) => {
        ratingsAll["" + element.value + "star"] += Number(element.count);
      });
    }

    if (allGestionRate.length > 0) {
      allGestionRate.forEach((element) => {
        ratingsAll["" + element.value + "star"] += Number(element.count);
      });
    }

    if (allRoRatting.length > 0) {
      allRoRatting.forEach((element) => {
        ratingsAll["" + element.value + "star"] += Number(element.count);
      });
    }

    if (studentRate.length > 0) {
      studentRate.forEach((element) => {
        console.log("element", element);
        ratings["" + element.value + "star"] += Number(element.count);
      });
    }

    if (framingRate.length > 0) {
      framingRate.forEach((element) => {
        ratings["" + element.value + "star"] += Number(element.count);
      });
    }

    if (rdiRate.length > 0) {
      rdiRate.forEach((element) => {
        ratings["" + element.value + "star"] += Number(element.count);
      });
    }

    if (GestionRate.length > 0) {
      GestionRate.forEach((element) => {
        ratings["" + element.value + "star"] += Number(element.count);
      });
    }

    if (roRatting.length > 0) {
      roRatting.forEach((element) => {
        ratings["" + element.value + "star"] += Number(element.count);
      });
    }

    let teaching = {
      data: studentRate,
      name: "teaching Ratting",
      type: "column",
    };
    let rdi = {
      data: rdiRate,
      name: "Rdi Ratting",
      type: "column",
    };
    let framing = {
      data: framingRate,
      name: "supervising Ratting",
      type: "column",
    };
    let Gestion = {
      data: GestionRate,
      name: "appresoation rate",
      type: "column",
    };
    let allSum = 0;
    let allcount = 0;

    for (const rating in ratingsAll) {
      console.log(ratingsAll);
      const weight = ratingsAll[rating];
      console.log("weight", weight);

      const numericRating = parseInt(rating.charAt(0));
      console.log("numericRating", numericRating);

      allSum += numericRating * weight;
      allcount += weight;
    }

    let sum = 0;
    let count = 0;

    for (const rating in ratings) {
      const weight = ratings[rating];
      const numericRating = parseInt(rating.charAt(0));

      sum += numericRating * weight;
      count += weight;
    }
    const averageRating = parseFloat(sum / count).toFixed(2);

    data.push(teaching, rdi, framing, Gestion, averageRating, allcount);
    // series.push(dataToSee);
    res.teachers = data;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.getFramingDataById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const teachers = await knex("user")
      .where("user.framing", id)
      .join("classroom", "classroom.classroom_id", "=", "user.student_class");
    res.teachers = teachers;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.getFramingData = async (req, res, next) => {
  try {
    const id = req.payload.id;
    const teachers = await knex("user")
      .where("user.framing", id)
      .join("classroom", "classroom.classroom_id", "=", "user.student_class");
    res.teachers = teachers;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.studentNumber = async (req, res, next) => {
  try {
    const id = req.payload.id;
    const teachers = await knex("teacher_class").where(
      "teacher_class.teacher_id",
      id
    );
    const teachersRating = await knex("teacher_class")
      .where("teacher_class.teacher_id", id)
      .join(
        "student_ratting",
        "student_ratting.teacher_ratting_id",
        "teacher_class.teacher_id"
      );
    const uniqueRatting = teachersRating.filter((obj, index) => {
      return (
        index ===
        teachersRating.findIndex(
          (o) =>
            obj.student_ratting_id === o.student_ratting_id &&
            obj.teacher_ratting_id === o.teacher_ratting_id
        )
      );
    });
    const uniqueModule = teachers.filter((obj, index) => {
      return index === teachers.findIndex((o) => obj.module === o.module);
    });

    const unique = teachers.filter((obj, index) => {
      return index === teachers.findIndex((o) => obj.classroom === o.classroom);
    });
    let data;
    let studentNumber = 0;
    for (let element of unique) {
      const classroom_id = element.classroom;
      let dataCounted = await knex("user as student")
        .count("*")
        .where("student.student_class", classroom_id);
      dataToAdd = {
        studentNumber: (studentNumber += Number(dataCounted[0].count)),
        classRoomsNumbaer: unique.length,
        studentRatedNumber: uniqueRatting.length,
        moduleNumber: uniqueModule.length,
      };
      data = dataToAdd;
    }
    res.teachers = data;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.getTeachersRate = async (req, res, next) => {
  try {
    const id = req.params.id;

    var data = [];
    const rateTeaching = await knex("teacher_ratting").where(
      "teacher_rated_id",
      id
    );

    for (const element of rateTeaching) {
      const teacher = await knex("user").where("id", element.teacher_rate_id);
      let rateData = {
        nameTeacher: teacher[0].first_name + " " + teacher[0].last_name,
        value: element.value,
      };
      data.push(rateData);
    }

    res.teachers = data;
    next();
  } catch (error) {
    console.error(error);
  }
};
