const mongoose = require("mongoose");
mongoose.set("strict", true);

exports.connectToDB = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URL);
		console.log("Connection à la base de donnée réussi ! ");
	} catch (err) {
		console.error(err);
	}
};

