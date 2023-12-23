import mongoose from "mongoose";

export const TariffSchema = new mongoose.Schema({
  Title: { type: String, required: [true, "Title is required"] },

  DataLimit: { type: Number, required: [true, "DataLimit is required"] },

  Duration: { type: Number, required: [true, "Duration is required"] },

  IsFree: { type: Boolean, default: false },

  IsVisible: { type: Boolean, default: true },
});

export default mongoose.model("Tariff", TariffSchema);
