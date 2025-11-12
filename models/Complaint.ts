import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IComplaint extends Document {
  title: string;
  department: string;
  subDepartment: string;
  level: "Low" | "Medium" | "High";
  description: string;
  mediaUrl?: string; // 🔹 Cloudinary file URL
  status: "Pending" | "Canceled" | "In Progress" | "Completed";
  date: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    title: { type: String, required: true },
    department: { type: String, required: true },
    subDepartment: { type: String, required: false },
    level: { type: String, enum: ["Low", "Medium", "High"], required: true },
    description: { type: String, required: true },
    mediaUrl: { type: String, required: false }, // 🔹 Cloudinary file URL
    status: {
      type: String,
      enum: ["Pending", "Canceled","In Progress", "Completed"],
      required: true,
      default: "Pending",
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default models.Complaint || model<IComplaint>("Complaint", ComplaintSchema);
