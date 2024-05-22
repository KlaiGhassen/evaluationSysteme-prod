require("dotenv").config();
let knex = require("./knex");

exports.getAllUp = async (req, res, next) => {
  try {
    const Up = await knex("up").select("*");
    res.up = Up;
    next();
  } catch (error) {
    console.error(error);
  }
};

exports.addUp = async (req, res, next) => {
  try {
    up = req.body.title;
    await knex("up").insert({ name_up: up });
    const Ups = await knex("up").select("*");
    res.up = Ups;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.updateNameUp = async (req, res, next) => {
  try {
    await knex("up").insert(up);
    res.up = Ups;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.GetHeiarchy = async (req, res, next) => {
  try {
    const TeachersCd = await knex("user")
      .select("*")
      .where({
        up: req.query.upName,
        role: "CD",
        department: req.query.department,
      })
      .first();
    const TeachersCup = await knex("user")
      .select("*")
      .where({ up: req.query.upName })
      .andWhere({ role: "CUP" })
      .first();

    const Teachers = await knex("user")
      .select("*")
      .where({ up: req.query.upName });

    let orgData = {
      name: "",
      type: "",
      children: [],
    };

    orgData.name = TeachersCd.first_name + " " + TeachersCd.last_name;
    orgData.type = TeachersCd.role;
    let orgDataCup = {
      name: TeachersCup.first_name + " " + TeachersCup.last_name,
      type: TeachersCup.role,

      children: [],
    };
    orgData.children.push(orgDataCup);
    for (let user of Teachers) {
      if (user.role === "RO" || user.role === "RDI") {
        let orgDataCup = {
          name: user.first_name + " " + user.last_name,
          type: user.role,
          option: user.option,
          children: [],
        };
        orgData.children[0].children.push(orgDataCup);
      }
    }
    for (let user of Teachers) {
      if (user.rdi != null) {
        let orgDataCup = {
          name: user.first_name + " " + user.last_name,
          type: user.role,
          children: [],
        };
        for (let i = 0; i < orgData.children[0].children.length; i++) {
          if (orgData.children[0].children[i].type === "RDI") {
            orgData.children[0].children[i].children.push(orgDataCup);
          }
        }
      }
      if (user.role === "TEACHER" && user.option === "SIM") {
        let orgDataCup = {
          name: user.first_name + " " + user.last_name,
          type: user.role,
          children: [],
        };
        for (let i = 0; i < orgData.children[0].children.length; i++) {
          if (
            orgData.children[0].children[i].option === "SIM" &&
            user.role != "RO"
          ) {
            orgData.children[0].children[i].children.push(orgDataCup);
          }
        }
      }
      if (user.role === "TEACHER" && user.option === "GamiX") {
        let orgDataCup = {
          name: user.first_name + " " + user.last_name,
          type: user.role,
          children: [],
        };
        for (let i = 0; i < orgData.children[0].children.length; i++) {
          if (
            orgData.children[0].children[i].option === "GamiX" &&
            user.role != "RO"
          ) {
            orgData.children[0].children[i].children.push(orgDataCup);
          }
        }
      }
    }

    res.orgData = orgData;
    console.log(orgData);
    console.log(orgData.children);

    next();
  } catch (error) {
    console.error(error);
  }
};
