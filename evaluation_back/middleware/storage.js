const multer = require("multer");
const path = require("path");
const fs = require("fs");

const picsPath = require("path").resolve(__dirname, "../uploads");
//storage var (najmou nzidou constraints ba3d , mimeType, maxsize, ...)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    console.log(req.body);
    let filetype = "";
    let fileExtension = "";
    if (file.mimetype === "image/gif") {
      filetype = "image-";
      fileExtension = "gif";
    }
    if (file.mimetype === "image/png") {
      filetype = "image-";
      fileExtension = "png";
    }
    if (file.mimetype === "image/jpeg") {
      filetype = "image-";
      fileExtension = "jpeg";
    }
    if (file.mimetype === "application/pdf") {
      filetype = "pdf-";
      fileExtension = "pdf";
    }
    if (file.mimetype === "application/json") {
      filetype = "image-";
      fileExtension = "jpeg";
    }

    cb(null, filetype + Date.now() + "." + fileExtension);
    h = cb;
  },
});
const upload = multer({ storage: storage });

module.exports = {
  upload_file: function (file) {
    return upload.single(file);
  },
  //Getting Image from uploads Directory
  getUserImage: async function (req, res) {
    let nom = req.params.nom;
    const file = picsPath + "/" + nom;
    try {
      // Check if file exists
      fs.accessSync(file, fs.constants.F_OK);
      res.sendFile(file);
    } catch (err) {
      console.error("File does not exist");
      res.json({ message: "file not found" });
    }
  },
  getQrCode: async function (req, res) {
    let nom = req.params.nom;
    const file = picsPath + "/qrs/" + nom;
    try {
      // Check if file exists
      fs.accessSync(file, fs.constants.F_OK);
      res.sendFile(file);
    } catch (err) {
      console.error("File does not exist");
      res.json({ message: "file not found" });
    }
  },
  getPdfQrCode: async function (req, res) {
    let nom = req.params.nom;
    console.log("pdf", nom);

    const file = picsPath + "/pdf/" + nom;
    try {
      // Check if file exists
      fs.accessSync(file, fs.constants.F_OK);
      res.download(file);
    } catch (err) {
      console.error("File does not exist");
      res.json({ message: "file not found" });
    }
  },
};
