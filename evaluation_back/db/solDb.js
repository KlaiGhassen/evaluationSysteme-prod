let knex = require("./knex");

exports.updateKeyUser = async (req, res, next) => {
  try {
    const id = req.payload.id;
    const user = await knex("user")
      .update({ pubKey: req.body.pubKey })
      .where("id", id)
      .returning("*")
      .then((rows) => rows[0]);
    res.user = user;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.addTokenInfo = async (req, res, next) => {
  try {
    const id = req.payload.id;
    let data = {
      mint: req.body.mint,
      fromTokenAccount: req.body.fromTokenAccount,
      id_user: id,
    };
    const spl = await knex("spl").insert(data);
    res.spl = spl;
    next();
  } catch (error) {
    console.error(error);
  }
};
exports.getTokenInfo = async (req, res, next) => {
  try {
    const spl = await knex("spl").first();
    res.spl = spl;
    next();
  } catch (error) {
    console.error(error);
  }
};
