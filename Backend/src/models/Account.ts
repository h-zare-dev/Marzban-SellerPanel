import mongoose from "mongoose";

export const AccountSchema = new mongoose.Schema({
  Username: { type: String, index: true },

  Tariff: { type: String, required: [true, "Tariff is required"] },

  TariffId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Tariff is required"],
    ref: "Tariff",
    index: true,
  },

  Seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    require: [true, "Seller Document is required"],
    index: true,
  },

  Payed: { type: Boolean, default: false },
});

export default mongoose.model("Account", AccountSchema);
