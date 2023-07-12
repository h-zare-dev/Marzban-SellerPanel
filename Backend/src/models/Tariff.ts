import mongoose from "mongoose";

const schema = new mongoose.Schema({
  Title: { type: String, required: [true, "Title is required"] },

  DataLimit: Number,

  Duration: Number,
});

export default mongoose.model("Tariff", schema);
