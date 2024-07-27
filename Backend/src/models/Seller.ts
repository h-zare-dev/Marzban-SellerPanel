import mongoose from "mongoose";

export const SellerSchema = new mongoose.Schema({
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

export default mongoose.model("Seller", SellerSchema);
