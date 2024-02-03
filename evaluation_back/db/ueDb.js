require("dotenv").config();
let knex = require("./knex");
const slugify = require("slugify");

exports.getAllCourses = async () => {
  try {
    const courses = await knex("UE").select("*");
    return courses;
  } catch (error) {
    console.error(error);
  }
};
exports.getAllClassRooms = async () => {
  try {
    const classRs = await knex("class").select("*");
    return classRs;
  } catch (error) {
    console.error(error);
  }
};
function getFirstCharacters(str) {
  if (!str) return;
  const trimmedStr = str.trim();
  const hasSpace = trimmedStr.includes(" ");

  let result = "";

  if (hasSpace) {
    const words = trimmedStr.split(" ");
    const alphabeticChars = words
      .map((word) => word.match(/[A-Za-z]+/g))
      .filter(Boolean);
    if (alphabeticChars.length > 0) {
      result = alphabeticChars.map((chars) => chars[0]).join(" ");
    } else {
      result = trimmedStr;
    }
  } else {
    const alphabeticChars = trimmedStr.match(/[A-Za-z]+/g);
    if (alphabeticChars) {
      result = alphabeticChars.join("");
    } else {
      result = trimmedStr;
    }
  }

  return result;
}

exports.getAllUCM = async () => {
  try {
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
        "classroom.classroom_id",
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
        "classroom.classroom_id",
        "module.name_module"
      )
      .orderBy("classroom.name_class");
    const dataWJoin = await knex("class")
      .join("classroom", "classroom.class", "class.class_name_class")
      .leftOuterJoin("UE", "UE.class", "classroom.class")
      .leftOuterJoin("module", "module.UE", "UE.name_ue")
      .leftOuterJoin(
        "user as student",
        "student.student_class",
        "=",
        "classroom.classroom_id"
      )
      .groupBy(
        "class.id_class",
        "UE.id_Ue",
        "module.id_module",
        "classroom.classroom_id",
        "module.name_module",
        "UE.name_ue"
      )
      .select(
        "class.*",
        "UE.*",
        "module.*",
        "classroom.*",
        knex.raw('count("student"."id") AS "student_count"')
      );
      console.log("the data of teachers",teachers)
    const module = {};
    dataWJoin.forEach((element) => {
      const moduleId = element.id_class;
      if (!module[moduleId]) {
        module[moduleId] = {
          id: element.id_module,
          name_module: element.name_module,
          name_ue: element.name_ue,
          class: element.class_name_class,
          classRooms: [],
          totalSteps: 0,
          currentStep: 0,
          rate: element.rate,
        };
      }
      let classroomRate = teachers.filter(
        (rate) =>
          rate.classroom_id == element.classroom_id &&
          rate.name_module == element.name_module
      );
      if (element.classroom_id != null) {
        if (classroomRate.length > 0) {
          console.log(classroomRate);
          module[moduleId].classRooms.push({
            classroom_id: element.classroom_id,
            classroom: element.name_class,
            name_module: getFirstCharacters(element.name_module),
            classroomRate: classroomRate[0],
          });
        } else {
          let classRate = {
            num_students_rated: 0,
            num_students: element.student_count,
          };
          classroomRate.push(classRate);

          module[moduleId].classRooms.push({
            classroom_id: element.classroom_id,
            classroom: element.name_class,
            name_module: getFirstCharacters(element.name_module),

            classroomRate: classroomRate[0],
          });
        }
      }
     
     
      for (let progress of classroomRate) {
        module[moduleId].currentStep =
          module[moduleId].currentStep +
          Number(progress.num_students_rated);
        module[moduleId].totalSteps =
          module[moduleId].totalSteps + Number(progress.num_students);
      }
    });
    const result = Object.values(module);
    return result;
  } catch (error) {
    console.error(error);
  }
};
exports.getModuleById = async (req, res, next) => {
  let id = req.params.id;
  try {
    const dataWJoin = await knex({
      u: "UE",
      m: "module",
    })
      .select("*")
      .where({ id_Ue: id });
    return dataWJoin;
  } catch (error) {
    console.error(error);
  }
  next();
};
exports.getAllModules = async (req, res, next) => {
  try {
    const dataWJoin = await knex("module")
      .select("*")
      .join("UE", "UE.name_ue", "=", "module.UE");
    return dataWJoin;
  } catch (error) {
    console.error(error);
  }
};
exports.addUe = async (req, res, next) => {
  try {
    const moduleToAdd = req.body;
    let ue = await knex("UE")
      .insert(moduleToAdd)
      .returning("*")
      .then((rows) => rows[0]);
    res.data = ue;
    next();
  } catch (error) {
    console.error(error);
  }
};

exports.addModule = async (req, res, next) => {
  try {
    const moduleToAdd = req.body;
    await knex("module")
      .insert(moduleToAdd)
      .returning("*")
      .then((rows) => rows[0]);
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
        "classroom.classroom_id",
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
        "classroom.classroom_id",
        "module.name_module"
      )
      .orderBy("classroom.name_class");
    const dataWJoin = await knex("class")
      .join("classroom", "classroom.class", "class.class_name_class")
      .leftOuterJoin("UE", "UE.class", "classroom.class")
      .leftOuterJoin("module", "module.UE", "UE.name_ue")
      .leftOuterJoin(
        "user as student",
        "student.student_class",
        "=",
        "classroom.classroom_id"
      )
      .groupBy(
        "class.id_class",
        "UE.id_Ue",
        "module.id_module",
        "classroom.classroom_id",
        "module.name_module",
        "UE.name_ue"
      )
      .select(
        "class.*",
        "UE.*",
        "module.*",
        "classroom.*",
        knex.raw('count("student"."id") AS "student_count"')
      );
    const module = {};
    dataWJoin.forEach((element) => {
      const moduleId = element.id_class;
      if (!module[moduleId]) {
        module[moduleId] = {
          id: element.id_module,
          name_module: element.name_module,
          name_ue: element.name_ue,
          class: element.class_name_class,
          classRooms: [],
          totalSteps: 0,
          currentStep: 0,
          rate: element.rate,
        };
      }
      let classroomRate = teachers.filter(
        (rate) =>
          rate.classroom_id == element.classroom_id &&
          rate.name_module == element.name_module
      );
      if (element.classroom_id != null) {
        if (classroomRate.length > 0) {
          module[moduleId].classRooms.push({
            classroom_id: element.classroom_id,
            classroom: element.name_class,
            name_module: getFirstCharacters(element.name_module),
            classroomRate: classroomRate[0],
          });
          for (let progress of classroomRate) {
            module[moduleId].currentStep =
              module[moduleId].currentStep + progress.num_students_rated;
            module[moduleId].totalSteps =
              module[moduleId].totalSteps + progress.num_students;
          }
          classroomRate = [];
        } else {
          let classRate = {
            num_students_rated: 0,
            num_students: element.student_count,
          };
          classroomRate.push(classRate);

          module[moduleId].classRooms.push({
            classroom_id: element.classroom_id,
            classroom: element.name_class,
            name_module: getFirstCharacters(element.name_module),

            classroomRate: classroomRate[0],
          });
        }
      }
    });
    const result = Object.values(module);
    res.data = result;
    next();
  } catch (error) {
    console.error(error);
  }
};
