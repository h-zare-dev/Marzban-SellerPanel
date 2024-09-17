import mongoose, { Document, Schema } from "mongoose";

// Step 1: Define the ISeller interface
export interface ISeller extends Document {
  Title: string;
  Username: string;
  Password: string;
  MarzbanUsername: string;
  MarzbanPassword: string;
  Counter: number;
  Limit: number;
  Status: "Active" | "Deactive";
}

// Step 2: Define the SellerSchema schema
export const SellerSchema: Schema = new Schema({
  Title: { type: String, unique: true, required: [true, "Title is required"] },
  Username: {
    type: String,
    unique: true,
    required: [true, "Username is required"],
  },
  Password: { type: String, required: [true, "Password is required"] },
  MarzbanUsername: {
    type: String,
    unique: true,
    required: [true, "MarzbanUsername is required"],
  },
  MarzbanPassword: { type: String, required: [true, "Password is required"] },
  Counter: { type: Number, default: 0 },
  Limit: { type: Number, default: 0 },
  Status: {
    type: String,
    enum: {
      values: ["Active", "Deactive"],
      message: "{VALUE} is not supported",
    },
    default: "Active",
  },
});

// Step 3: Export the Seller model with the ISeller interface
const Seller = mongoose.model<ISeller>("Seller", SellerSchema);
export default Seller;
