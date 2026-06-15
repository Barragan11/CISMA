const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = path.resolve(__dirname, "../../uploads");

const crearCarpetaUploads = () => {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
};

crearCarpetaUploads();

console.log("Carpeta uploads configurada en:", uploadPath);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    crearCarpetaUploads();
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const nombreBase = path
      .basename(file.originalname, extension)
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "");

    const nombreArchivo = `${Date.now()}-${nombreBase}${extension}`;

    cb(null, nombreArchivo);
  },
});

const upload = multer({
  storage,
});

module.exports = upload;