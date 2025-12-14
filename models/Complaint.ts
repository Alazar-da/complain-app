import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IComplaint extends Document {
  trackingNumber: string;
  // Step 1: Personal Information
  fullName: string;
  city: string;//New field
  subCity: string;//New field
  houseNo: string;//New field
  phoneNumber: string;
  gender: "male" | "female";
  educationCommunity: "student" | "student_family" | "teacher" | "supervisor" | "expert";
  schoolName: string;
  wereda: string;

  // Step 2: Complaint Information
  title: string;
  complaintMadeDate: Date;//New field
  complaintMadePlace: string;//New field
  responsibleBody: string;//New field
  responceGived:string;//New field
  department: string;
  subDepartment?: string;
  level: "Low" | "Medium" | "High";
  description: string;
  mediaUrl?: string;
  publicId?: string;
  status: "Pending" | "Appropriate" | "In Progress" | "Completed" | "Inappropriate";
  responsiblePerson?: string; // New field for person who resolved the issue
  reason?: string; // Field for completion/inappropriate reason
  resolvedAt?: Date; // Field for when complaint was resolved
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    trackingNumber: { type: String, required: true, unique: true },

    // Personal Info
    fullName: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    subCity: { type: String, required: true, trim: true },
    houseNo: { type: String, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    gender: { type: String, enum: ["male", "female"], required: true },
    educationCommunity: {
      type: String,
      enum: ["student", "student_family", "teacher", "supervisor", "expert"],
      required: true,
    },
    schoolName: { type: String, trim: true },
    wereda: { type: String, trim: true },

    // Complaint Info
    title: { type: String, required: true, trim: true },
    complaintMadeDate: { type: Date, required: true },
    complaintMadePlace: { type: String, required: true, trim: true },
    responsibleBody: { type: String, trim: true },
    responceGived: { type: String, trim: true },
    department: { type: String, required: true, trim: true },
    subDepartment: { type: String, trim: true },
    level: { type: String, enum: ["Low", "Medium", "High"], required: true },
    description: { type: String, required: true, trim: true },
    mediaUrl: { type: String },
    publicId: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Appropriate", "In Progress", "Completed", "Inappropriate"],
      required: true,
      default: "Pending",
    },
    responsiblePerson: { type: String, trim: true }, // New field
    reason: { type: String, trim: true },
    resolvedAt: { type: Date },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 🔹 Indexes for filtering
ComplaintSchema.index({ department: 1 });
ComplaintSchema.index({ status: 1 });
ComplaintSchema.index({ date: 1 });
ComplaintSchema.index({ resolvedAt: 1 });
ComplaintSchema.index({ responsiblePerson: 1 }); // New index

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