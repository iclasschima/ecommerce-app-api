const { default: mongoose } = require("mongoose");

const dbConnect = () => {
  try {
    const conn = mongoose.connect(process.env.MONGODB_URL);
    console.log("DB connected successfully!");
  } catch (error) {
    console.log("DB error", error);
  }
};

module.exports = dbConnect;
