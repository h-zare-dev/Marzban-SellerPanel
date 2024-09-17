import mongoose, { Document, Schema } from "mongoose";
import { ISeller } from "./Seller"; // Import Seller interface
import { ITariff } from "./Tariff"; // Import Tariff interface

// Step 1: Define the IAccount interface
export interface IAccount extends Document {
  Username: string;
  Tariff: string;
  TariffId: mongoose.Types.ObjectId | ITariff; // Reference to Tariff model
  Seller: mongoose.Types.ObjectId | ISeller; // Reference to Seller model
  Payed: boolean;
}

// Step 2: Define the AccountSchema schema
export const AccountSchema: Schema = new Schema({
  Username: {
    type: String,
    required: [true, "Username is required"],
    index: true,
  },
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
    required: [true, "Seller Document is required"],
    index: true,
  },
  Payed: { type: Boolean, default: false },
});

// Step 3: Export the Account model with the IAccount interface
const Account = mongoose.model<IAccount>("Account", AccountSchema);
export default Account;
