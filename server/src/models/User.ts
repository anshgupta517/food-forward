import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'restaurant' | 'organization';
  name: string;
  address?: string;
  phone?: string;
  // Timestamps will be added by Mongoose
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['restaurant', 'organization'], required: true },
  name: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
}, { timestamps: true }); // Added timestamps: true

export default mongoose.model<IUser>('User', UserSchema);
