let knex = require("./knex");

exports.addQuestions = async (req, res, next) => {
  try {
    const question = {
      question: "",
      questions_order: 0,
    };
    const questions = await knex("questions")
      .insert(question)
      .returning("*")
      .then((rows) => rows[0]);
    res.question = questions;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.updateQuestions = async (req, res, next) => {
  try {
    let id = req.body.task.id_question;
    let updatedQuestion = {
      question: req.body.task.question,
      questions_order: req.body.task.questions_order,
      section_id: req.body.task.section_id,
    };
    const question = await knex("questions")
      .where({ id_question: id })
      .update(updatedQuestion)
      .returning("*")
      .then((rows) => rows[0]);
    res.question = question;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.getAllQuestions = async (req, res, next) => {
  try {
    const questions = await await knex
      .select("*")
      .from("questions_section")
      .leftJoin(
        "questions",
        "questions_section.section_id",
        "questions.section_id"
      );
    res.questions = questions;
    next();
  } catch (error) {
    console.error(error);
  }
};
//! section
exports.addSection = async (req, res, next) => {
  try {
    const section = {
      title: "",
      notes: null,
      dueDate: null,
    };
    const sections = await knex("questions_section")
      .insert(section)
      .returning("*")
      .then((rows) => rows[0]);

    const sectionsData = await knex("questions_section").select("*");

    sectionsData.unshift(sections);
    sectionsData.forEach(async (sectionTask, index) => {
      sectionTask.order = index;
      const finalSections = await knex("questions_section")
        .update(sectionTask)
        .where({ section_id: sectionTask.section_id });
    });
    res.sections = sections;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.updateSection = async (req, res, next) => {
  try {
    let id = req.params.id;
    let updatedSection = req.body;
    const section = await knex("questions_section")
      .where({ id: id })
      .update(updatedSection)
      .returning("*")
      .then((rows) => rows[0]);
    res.section = section;
  } catch (error) {
    console.error(error);
  }
};
exports.getAllSection = async (req, res, next) => {
  try {
    const sections = await knex("questions_section").select("*");
    res.sections = sections;
    next();
  } catch (error) {
    console.error(error);
  }
};
//! affectation section
exports.addAffectation = async (req, res, next) => {
  try {
    id = req.params.id;
    let updatedSection = req.body;
    const affectations = await knex("questions_section")
      .where({ id: id })
      .update(updatedSection)
      .returning("*")
      .then((rows) => rows[0]);
    res.affectations = affectations;
    next();
  } catch (error) {
    console.error(error);
  }
};
// join questions and section
exports.getQuestionsAffectation = async (req, res, next) => {
  try {
    const affectation = await knex
      .select("*", "questions_section.section_id as qs_id")
      .from("questions_section")
      .leftJoin(
        "questions",
        "questions_section.section_id",
        "questions.section_id"
      );
    // Group the questions by their respective section
    const sections = {};
    affectation.forEach((row, index) => {
      const sectionId = row.qs_id;
      if (!sections[sectionId]) {
        sections[sectionId] = {
          section_id: row.qs_id,
          title: row.title,
          notes: row.notes,
          questions: [],
          classRooms: [],
        };
      }
      if (row.question != null && row.question != undefined) {
        let question = {
          id_question: row.id_question,
          question: row.question,
          order: row.questions_order,
        };
        sections[sectionId].questions.push(question);
      }
    });
    const result = Object.values(sections);
    res.affectation = result;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.getQuestionsAffectationById = async (req, res, next) => {
  try {
    const affectation = await await knex
      .select("*")
      .from("questions_section")
      .leftJoin(
        "questions",
        "questions_section.section_id",
        "questions.section_id"
      )
      .where("questions.section_id", req.params.id);
    // Group the questions by their respective section
    const sections = {};
    affectation.forEach((row) => {
      const sectionId = row.section_id;
      if (!sections[sectionId]) {
        sections[sectionId] = {
          section_id: row.section_id,
          title: row.title,
          notes: row.notes,
          questions: [],
        };
      }
      sections[sectionId].questions.push(row.question);
    });

    const result = Object.values(sections);

    res.affectation = result[0];
    next();
  } catch (error) {
    console.error(error);
  }
};

exports.updateSectionAffectation = async (req, res, next) => {
  try {
    let id = req.body.task.section_id;
    let updatedSection = {
      title: req.body.task.title,
      notes: req.body.task.notes,
      dueDate: req.body.task.dueDate,
    };

    const section = await knex("questions_section")
      .where({ section_id: id })
      .update(updatedSection)
      .returning("*")
      .then((rows) => rows[0]);
    res.section = section;
  } catch (error) {
    console.error(error);
  }
};
// exports.updateOrder = async (req, res, next) => {
//   // Go through the tasks
//   const sectionsData = await knex("questions_section").select("*");

//   sectionsData.forEach(async (sectionTask, index) => {
//     sectionTask.order = index;
//     await knex("questions_section")
//       .update(sectionTask)
//       .where({ section_id: sectionTask.section_id });
//   });
// };
// questions for students that gonna answer
exports.getQuestionsForStudents = async (req, res, next) => {
  try {
    const classRoom = req.params.id;
    const questionsToAnswer = await knex("questions_to_answer")
      .select("*")
      .where({ classroom_id: classRoom })
      .first();
    const section_id = questionsToAnswer.section_id;

    const affectation = await knex
      .select("*")
      .from("questions_section")
      .leftJoin(
        "questions",
        "questions_section.section_id",
        "questions.section_id"
      )
      .orderBy("questions.questions_order", "asc")
      .where("questions.section_id", section_id);
    // Group the questions by their respective section
    const sections = {};
    affectation.forEach((row) => {
      const sectionId = row.section_id;
      if (!sections[sectionId]) {
        sections[sectionId] = {
          section_id: row.section_id,
          category: classRoom,
          title: row.title,
          description: row.notes,
          progress: { currentStep: 0, completed: 1 },
          steps: [],
          duration: 5,
          totalSteps: 6,
        };
      }
      let questionSteps = {
        order: row.questions_order,
        title: "question " + row.questions_order + " :",
        content: row.question,
        subtitle: row.question,
      };
      sections[sectionId].steps.push(questionSteps);
    });

    const result = Object.values(sections);
    // Group the questions by their respective section
    res.affectation = result[0];
    next();
  } catch (error) {
    console.error(error);
  }
};
