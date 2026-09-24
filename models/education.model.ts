import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IEducation {
  user: Types.ObjectId;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
  grade: string;
}

export interface IEducationDocument extends IEducation, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const educationSchema = new Schema<IEducationDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    institution: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
    },
    degree: {
      type: String,
      default: "",
      maxlength: 100,
      trim: true,
    },
    fieldOfStudy: {
      type: String,
      default: "",
      maxlength: 100,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    current: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: "",
      maxlength: 500,
      trim: true,
    },
    grade: {
      type: String,
      default: "",
      maxlength: 50,
      trim: true,
    },
  },
  { timestamps: true }
);

educationSchema.index({ user: 1, startDate: -1 });

export const Education: Model<IEducationDocument> =
  mongoose.models?.Education ||
  mongoose.model<IEducationDocument>("Education", educationSchema);
