const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://YOUR_FULL_URI")
.then(() => {
    console.log("Connected successfully");
    process.exit();
})
.catch(err => {
    console.error(err);
    process.exit();
});