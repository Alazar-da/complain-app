import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IComplaint extends Document {
  title: string;
  department: string;
  subDepartment?: string;
  level: "Low" | "Medium" | "High";
  description: string;
  mediaUrl?: string;
  status: "Pending" | "Canceled" | "In Progress" | "Completed";
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    title: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    subDepartment: { type: String, trim: true },
    level: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },
    description: { type: String, required: true, trim: true },
    mediaUrl: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Canceled", "In Progress", "Completed"],
      required: true,
      default: "Pending",
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 🔹 Indexes for faster analytics/filtering
ComplaintSchema.index({ department: 1 });
ComplaintSchema.index({ status: 1 });
ComplaintSchema.index({ date: 1 });

export default models.Complaint || model<IComplaint>("Complaint", ComplaintSchema);
