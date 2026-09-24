import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type ConnectionStatus = "pending" | "accepted" | "declined";

export interface IConnection {
  requester: Types.ObjectId;
  recipient: Types.ObjectId;
  status: ConnectionStatus;
  note: string;
}

export interface IConnectionDocument extends IConnection, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const connectionSchema = new Schema<IConnectionDocument>(
  {
    requester: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    note: {
      type: String,
      default: "",
      maxlength: 300,
      trim: true,
    },
  },
  { timestamps: true }
);

connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });
connectionSchema.index({ recipient: 1, status: 1 });
connectionSchema.index({ requester: 1, status: 1 });

export const Connection: Model<IConnectionDocument> =
  mongoose.models?.Connection ||
  mongoose.model<IConnectionDocument>("Connection", connectionSchema);
