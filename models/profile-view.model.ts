import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IProfileView {
  profile: Types.ObjectId;
  viewer: Types.ObjectId;
  viewedAt: Date;
}

export interface IProfileViewDocument extends IProfileView, Document {
  _id: Types.ObjectId;
}

const profileViewSchema = new Schema<IProfileViewDocument>({
  profile: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  viewer: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  viewedAt: {
    type: Date,
    default: Date.now,
  },
});

profileViewSchema.index({ profile: 1, viewedAt: -1 });

export const ProfileView: Model<IProfileViewDocument> =
  mongoose.models?.ProfileView ||
  mongoose.model<IProfileViewDocument>("ProfileView", profileViewSchema);
