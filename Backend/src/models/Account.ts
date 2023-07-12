import mongoose from "mongoose";

const schema = new mongoose.Schema({
  Username: {
    type: String,
    unique: true,
    required: [true, "Username is required"],
  },

  Tariff: { type: String, required: [true, "Tariff is required"] },

  Seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    require: [true, "Seller Document is required"],
  },

  Payed: { type: Boolean, default: false },
});

export default mongoose.model("Account", schema);
