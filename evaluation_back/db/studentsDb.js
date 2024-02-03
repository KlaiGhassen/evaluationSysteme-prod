require("dotenv").config();
const { raw } = require("express");
let knex = require("./knex");
exports.searchStudent = async (req, res, next) => {
  try {
    const query = req.query.query;
    const contacts = await knex("user")
      .join("classroom", "user.student_class", "=", "classroom.classroom_id")
      .select("*")
      .where("role", "STUDENT");
    let filtredContacts = [];
    // If the query exists...
    if (query) {
      // Filter the contacts
      filtredContacts = contacts.filter(
        (contact) =>
          contact.first_name &&
          contact.first_name.toLowerCase().includes(query.toLowerCase())
      );
    }
    // Sort the contacts by the name field by default
    filtredContacts.sort((a, b) => a.first_name.localeCompare(b.first_name));
    res.student = filtredContacts;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.getAllStudents = async (req, res, next) => {
  try {
    const student = await knex
      .select("*")
      .from("user")
      .join("classroom", "user.student_class", "=", "classroom.classroom_id")
      .leftOuterJoin(
        "student_ratting ",
        "user.id",
        "=",
        "student_ratting.student_ratting_id"
      )
      .where("role", "STUDENT");
    student.sort((a, b) => a.first_name.localeCompare(b.first_name));
    res.student = student;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.getTeam = async (req, res, next) => {
  try {
    const role = req.payload.role;
    const id = req.payload.id;
    const up = req.payload.up;
    var student = [];
    switch (role) {
      case "TEACHER":
        student = await knex("user")
          .select("*")
          .whereNot("id", id)
          .where("role", "CUP")
          .orWhere("role", "RO")
          .orWhere("role", "RDI")
          .orWhere("role", "CD")
          .andWhere("up", up)
          .leftOuterJoin("teacher_ratting", "user.id", "=", "teacher_rated_id");
        break;
      case "CUP":
        student = await knex("user")
          .select("*")
          .whereNot("id", id)
          .where("role", "TEACHER")
          .orWhere("role", "RO")
          .orWhere("role", "RDI")
          .orWhere("role", "CD")

          .andWhere("up", up)
          .leftOuterJoin("teacher_ratting", "user.id", "=", "teacher_rated_id");

        break;
      case "RO":
        student = await knex("user")
          .select("*")
          .whereNot("id", id)
          .where("role", "TEACHER")
          .orWhere("role", "RO")
          .orWhere("role", "RDI")
          .orWhere("role", "CD")

          .andWhere("up", up)
          .leftOuterJoin("teacher_ratting", "user.id", "=", "teacher_rated_id");
        break;
      default:
        student = await knex("user")
          .select("*")
          .whereNot("id", id)
          .andWhere("up", up)
          .leftOuterJoin("teacher_ratting", "user.id", "=", "teacher_rated_id");
        break;
    }

    res.student = student;

    next();
  } catch (error) {
    console.error(error);
  }
};
exports.addStudent = async (req, res, next) => {
  try {
    const teacher = req.body;
    studentId = await knex("user")
      .insert(teacher)
      .returning("id")
      .returning("*")
      .then((rows) => rows[0]);
    studentDb = await knex("user")
      .where({ id: studentId.id })
      .join("classroom", "user.student_class", "=", "classroom.classroom_id")
      .leftOuterJoin(
        "student_ratting ",
        "user.id",
        "=",
        "student_ratting.student_ratting_id"
      );
    res.student = studentDb[0];
    next();
  } catch (error) {
    console.error(error);
  }
};
function getClassFromClassName(str) {
  const match = str.match(/(\d+)[^\d]*/);

  if (match) {
    const prefix = match[0];
    return prefix;
  }
}
exports.addStudentFile = async (req, res, next) => {
  try {
    const students = req.body.dataStudents;
    for (student of students) {
      let classroom = await knex
        .select("*")
        .from("classroom")
        .where("name_class", student.class)
        .first();
      if (!classroom) {
        let classNameCat = getClassFromClassName(student.class);
        await knex("class")
          .insert({ class_name_class: classNameCat })
          .onConflict("class_name_class")
          .ignore();
        if (student.class) {
          await knex("classroom")
            .insert({
              name_class: student.class,
              class: classNameCat,
              university_year: new Date("2023-09-15"),
            })
            .onConflict("name_class")
            .ignore()
            .returning("classroom_id")
            .then((raw) => raw[0]);
        } else {
          console.log("class is null, skipping insert");
        }
      } else {
        if (student.email) {
          await knex("user")
            .insert({
              first_name: student.first_name,
              last_name: student.last_name,
              email: student.email,
              student_class: classroom.classroom_id,
              id_et: student.id_et,
              role: "STUDENT",
            })
            .onConflict("email")
            .ignore();
        }
      }
    }

    var products = await knex("user")
      .select("*")
      .where("role", "STUDENT")
      .join("classroom", "user.student_class", "=", "classroom.classroom_id")
      .leftOuterJoin(
        "student_ratting ",
        "user.id",
        "=",
        "student_ratting.student_ratting_id"
      );
    // Get available queries
    //const search = req.query.search;
    const sort = req.query.sort || "first_name";
    const order = req.query.order || "asc";
    const page = parseInt(req.query.page ?? "1", 10);
    const size = parseInt(req.query.size ?? "10", 10);

    // Clone the products

    // Sort the products
    if (
      sort === "first_name" ||
      sort === "id_et" ||
      sort === "serial_number" ||
      sort === "email" ||
      sort === "createdAt"
    ) {
      products = products.sort((a, b) => {
        const fieldA = a[sort].toString().toUpperCase();
        const fieldB = b[sort].toString().toUpperCase();
        return order === "asc"
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      });
    } else {
      products = products.sort((a, b) =>
        order === "asc" ? a[sort] - b[sort] : b[sort] - a[sort]
      );
    }
    // Paginate - Start
    const productsLength = products.length;

    // Calculate pagination details
    const begin = page * size;
    const end = Math.min(size * (page + 1), productsLength);
    const lastPage = Math.max(Math.ceil(productsLength / size), 1);

    // Prepare the pagination object
    let pagination = {};

    // If the requested page number is bigger than the last possible page number, return null for
    // products but also send the last possible page so the app can navigate to there

    if (page > lastPage) {
      products = null;
      pagination = {
        lastPage: lastPage,
      };
    } else {
      // Paginate the results by size

      products = products.slice(begin, end);

      // Prepare the pagination mock-api
      pagination = {
        length: productsLength,
        size: size,
        page: page,
        lastPage: lastPage,
        startIndex: begin,
        endIndex: end - 1,
      };
    }

    // Return the response

    res.status(200).json({ products, pagination });
  } catch (error) {
    console.error(error);
  }
};

exports.studentsById = async (req, res, next) => {
  try {
    const id = req.query.id;
    const contacts = await knex("user")
      .join("classroom", "user.student_class", "=", "classroom.classroom_id")
      .select("*")
      .where({ "user.id": id })
      .first();
    const framer = await knex("user")
      .select("*")
      .where("id", contacts.framing)
      .first();
    let updatedJson = Object.assign({}, contacts, { framer: framer });
    res.student = updatedJson;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.affectationFraming = async (req, res, next) => {
  try {
    const framingId = req.body.framingId;
    const studentId = req.body.studentId;
    const contacts = await knex("user")
      .where("id", studentId)
      .update({ framing: framingId })
      .returning("*")
      .then((rows) => rows[0]);
    const framer = await knex("user")
      .select("*")
      .where("id", contacts.framing)
      .first();
    let updatedJson = Object.assign({}, contacts, { framer: framer });

    res.student = updatedJson;
    next();
  } catch (error) {
    console.error(error);
  }
};

exports.searchMiddleware = async (req, res, next) => {
  const id = req.payload.id;
  const role = req.payload.role;
  const search = req.query.search;
  const searchOption = req.query.searchOption;
  const classRoomId = req.query.classRoomId;
  var products = [];
  if (role === "ADMIN") {
    products = await knex
      .select("*")
      .from("user")
      .join("classroom", "user.student_class", "=", "classroom.classroom_id")
      .where("role", "STUDENT")
      .leftOuterJoin(
        "student_ratting",
        "user.id",
        "=",
        "student_ratting.student_ratting_id"
      );
  } else {
    products = await knex
      .select("*")
      .from("user")
      .join("classroom", "user.student_class", "=", "classroom.classroom_id")
      .where("role", "STUDENT")
      .join("teacher_class", function () {
        this.on("teacher_class.classroom", "=", "user.student_class").andOn(
          "teacher_class.teacher_id",
          "=",
          id
        );
      })
      .leftOuterJoin(
        "student_ratting",
        "user.id",
        "=",
        "student_ratting.student_ratting_id"
      );
  }
  const student = {};
  products.forEach((element) => {
    const student_id = element.id;
    if (!student[student_id]) {
      student[student_id] = {
        id: element.id,
        id_et: element.id_et,
        first_name: element.first_name,
        last_name: element.last_name,
        email: element.email,
        phone: element.phone,
        address: element.address,
        about: element.about,
        framing: element.framing,
        social_image: element.social_image,
        social_logeed_in: element.social_logeed_in,
        image: element.image,
        role: element.role,
        student_class: element.student_class,
        classroom_id: element.classroom_id,
        name_class: element.name_class,
        class: element.class,
        university_year: element.university_year,
        rate: element.rate,
        value: element.value,
        student_ratting_id: element.student_ratting_id,
        teacher_ratting_id: element.teacher_ratting_id,
        pubKey: element.pubKey,
      };
    }
  });
  const result = Object.values(student);

  if (search != null || search != "") {
    switch (searchOption) {
      case "first_name":
        product = result.filter((w) => w.first_name.includes(search));
        break;
      case "email":
        product = result.filter((w) => w.email.includes(search));
        break;
      case "id_et":
        product = result.filter((w) => w.id_et.includes(search));
        break;
      default:
        product = result.filter((w) => w.first_name.includes(search));
        break;
    }
    res.product = result;
  }
  if (classRoomId != "all") {
    product = result.filter((w) => w.student_class == parseInt(classRoomId));
  }
  res.product = product;
  next();
};

// !(from front to back : params => query , return {products, paginayion} , slice() , fazet typescript)
exports.getSortedPorducts = async (req, res, next) => {
  try {
    var products = res.product;
    // Get available queries
    //const search = req.query.search;
    const sort = req.query.sort || "first_name";
    const order = req.query.order || "asc";
    const page = parseInt(req.query.page ?? "1", 10);
    const size = parseInt(req.query.size ?? "10", 10);

    // Clone the products
    // Sort the products
    if (
      sort === "id_et" ||
      sort === "first_name" ||
      sort === "serial_number" ||
      sort === "email" ||
      sort === "class" ||
      sort === "updated_at"
    ) {
      products = products.sort((a, b) => {
        const fieldA = a[sort].toString().toUpperCase();
        const fieldB = b[sort].toString().toUpperCase();
        return order === "asc"
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      });
    } else {
      products = products.sort((a, b) =>
        order === "asc" ? a[sort] - b[sort] : b[sort] - a[sort]
      );
    }
    // Paginate - Start
    const productsLength = products.length;

    // Calculate pagination details
    const begin = page * size;
    const end = Math.min(size * (page + 1), productsLength);
    const lastPage = Math.max(Math.ceil(productsLength / size), 1);

    // Prepare the pagination object
    let pagination = {};

    // If the requested page number is bigger than the last possible page number, return null for
    // products but also send the last possible page so the app can navigate to there

    if (page > lastPage) {
      products = null;
      pagination = {
        lastPage: lastPage,
      };
    } else {
      // Paginate the results by size

      products = products.slice(begin, end);

      // Prepare the pagination mock-api
      pagination = {
        length: productsLength,
        size: size,
        page: page,
        lastPage: lastPage,
        startIndex: begin,
        endIndex: end - 1,
      };
    }

    // Return the response

    res.status(200).json({ products, pagination });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
