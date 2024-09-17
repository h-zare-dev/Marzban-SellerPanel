import mongoose, { Document, Schema } from "mongoose";

// Step 1: Define the ITariff interface
export interface ITariff extends Document {
  Title: string;
  DataLimit: number;
  Duration: number;
  Price: number;
  IsFree: boolean;
  IsVisible: boolean;
}

// Step 2: Define the TariffSchema schema
export const TariffSchema: Schema = new Schema({
  Title: { type: String, required: [true, "Title is required"] },
  DataLimit: { type: Number, required: [true, "DataLimit is required"] },
  Duration: { type: Number, required: [true, "Duration is required"] },
  Price: { type: Number, required: [true, "Price is required"] },
  IsFree: { type: Boolean, default: false },
  IsVisible: { type: Boolean, default: true },
});

// Step 3: Export the Tariff model with the ITariff interface
const Tariff = mongoose.model<ITariff>("Tariff", TariffSchema);
export default Tariff;
