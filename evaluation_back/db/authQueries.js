require("dotenv").config();
let knex = require("./knex");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.CLIENT_ID);
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID,
  });
  const payload = ticket.getPayload();

  return payload;
}
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    user = await knex("user")
      .where({ email: email, password: password })
      .leftJoin("classroom", "classroom.classroom_id", "user.student_class")
      .first();
    if (!user) {
      return res
        .status(404)
        .json({ message: "No User with those information's " });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  let payload = {
    id: user.id,
    role: user.role,
    up: user.up,
    student_class: user.student_class,
  };
  const accessToken = generateAccessToken(payload);
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
  let newRefreshToken = {
    token: refreshToken,
    user_id: user.id,
  };
  await knex("refresh_tokens").insert(newRefreshToken);
  res.refreshToken = refreshToken;
  res.user = user;
  res.accessToken = accessToken;
  next();
};
exports.msallLogin = async (req, res, next) => {
  try {
    let credentials = req.body.credentialsData;
    const user = await knex("user")
      .where({ email: credentials.mail.toLowerCase() })
      .leftJoin("classroom", "classroom.classroom_id", "user.student_class")
      .first();
    await knex("user").where({ email: credentials.mail.toLowerCase() }).update({
      image: credentials.image,
      social_image: credentials.image,
      email_verified: true,
      social_logeed_in: true,
    });

    let payload = {
      id: user.id,
      role: user.role,
      up: user.up,
      student_class: user.student_class,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
    let newRefreshToken = {
      token: refreshToken,
      user_id: user.id,
    };
    await knex("refresh_tokens").insert(newRefreshToken);
    res.refreshToken = refreshToken;
    res.user = user;
    res.accessToken = accessToken;
    next();
    if (!user) {
      return res
        .status(404)
        .json({ message: "No User with those information's " });
    }
  } catch (error) {
    return res.status(404).json({ message: "check email" });
  }
};
exports.socialLogin = async (req, res, next) => {
  try {
    let credentials = req.body.credentialsData;
    const User = await verify(credentials);
    const user = await knex("user")
      .where({ email: User.email })
      .leftJoin("classroom", "classroom.classroom_id", "user.student_class")
      .first();
    await knex("user").where({ email: User.email }).update({
      social_image: User.picture,
      email_verified: true,
      social_logeed_in: true,
    });
    let payload = {
      id: user.id,
      role: user.role,
      up: user.up,
      student_class: user.student_class,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
    let newRefreshToken = {
      token: refreshToken,
      user_id: user.id,
    };
    await knex("refresh_tokens").insert(newRefreshToken);
    res.refreshToken = refreshToken;
    res.user = user;
    res.accessToken = accessToken;
    next();

    if (!user) {
      return res
        .status(404)
        .json({ message: "No User with those information's " });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.logout = async (req, res, next) => {
  const id = req.payload.id;
  const refreshToken = await knex("refresh_tokens")
    .where({ user_id: id })
    .del();
  if (refreshToken > 0) {
    res.cookie("refreshToken", "", {
      expiresIn: Date.now(),
      httpOnly: true,
    });
    res.status(201).json({ message: "logout" });
  } else {
    res.status(403).json({ message: "logout failed" });
  }
};

exports.getUserFromToken = async (req, res, next) => {
  const id = req.payload.id;
  const user = await knex("user")
    .where({ id: id })
    .leftJoin("classroom", "classroom.classroom_id", "user.student_class")
    .first();

  let newPayload = {
    id: user.id,
    role: user.role,
    up: user.up,
    student_class: user.student_class,
  };

  const accessToken = generateAccessToken(newPayload);
  res.user = user;
  res.accessToken = accessToken;
  next();
};

exports.getCurrentUser = async (req, res, next) => {
  let id = req.payload.id;
  const user = await knex("user")
    .where({ id: id })
    .leftJoin("classroom", "classroom.classroom_id", "user.student_class")
    .first();
  res.status(200).json(user);
};

// get access token from refresh token
exports.getAccesTokenFromRefreshToken = async (req, res, next) => {
  let verify = false;
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken == null) return res.sendStatus(401);
  const refreshTokens = await knex("refresh_tokens").select("*");
  for (let token of refreshTokens) {
    if (token.token == refreshToken) {
      verify = true;
      break;
    }
  }
  if (!verify) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
    let newPayload = {
      id: payload.id,
      role: payload.role,
      up: payload.up,
      student_class: payload.student_class,
    };
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken(newPayload);
    res.json({ accessToken: accessToken });
  });
};

function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "24h",
  });
}
