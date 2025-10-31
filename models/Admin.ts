import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IAdmin extends Document {
  username: string;
  password: string;
}

const adminSchema = new Schema<IAdmin>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.Admin || model<IAdmin>("Admin", adminSchema);
