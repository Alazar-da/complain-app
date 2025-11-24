import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IComplaint extends Document {
  trackingNumber: string;
  // Step 1: Personal Information
  fullName: string;
  phoneNumber: string;
  gender: "male" | "female";
  educationCommunity: "student" | "student_family" | "teacher" | "supervisor" | "expert";
  schoolName: string;
  wereda: string;

  // Step 2: Complaint Information
  title: string;
  department: string;
  subDepartment?: string;
  level: "Low" | "Medium" | "High";
  description: string;
  mediaUrl?: string;
  publicId?: string;
  status: "Pending" | "Canceled" | "In Progress" | "Completed";
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    trackingNumber: { type: String, required: true, unique: true },

    // Personal Info
    fullName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    gender: { type: String, enum: ["male", "female"], required: true },
    educationCommunity: {
      type: String,
      enum: ["student", "student_family", "teacher", "supervisor", "expert"],
      required: true,
    },
    schoolName: { type: String, required: true, trim: true },
    wereda: { type: String, required: true, trim: true },

    // Complaint Info
    title: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    subDepartment: { type: String, trim: true },
    level: { type: String, enum: ["Low", "Medium", "High"], required: true },
    description: { type: String, required: true, trim: true },
    mediaUrl: { type: String },
    publicId: { type: String },
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

// 🔹 Indexes for filtering
ComplaintSchema.index({ department: 1 });
ComplaintSchema.index({ status: 1 });
ComplaintSchema.index({ date: 1 });

// 🔹 Pre-save hook for unique tracking number
ComplaintSchema.pre("validate", async function (next) {
  if (!this.trackingNumber) {
    const generateTrackingNumber = () => "CMP-" + Math.random().toString(36).substr(2, 9).toUpperCase();

    let trackingNumber = generateTrackingNumber();
    while (await models.Complaint.findOne({ trackingNumber })) {
      trackingNumber = generateTrackingNumber();
    }
    this.trackingNumber = trackingNumber;
  }
  next();
});

export default models.Complaint || model<IComplaint>("Complaint", ComplaintSchema);
