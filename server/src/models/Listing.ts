import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User'; // Import IUser for type referencing

export interface IListing extends Document {
  restaurant: IUser['_id']; // Reference to User's ObjectId
  foodItem: string;
  quantity: string;
  expiryDate: Date;
  status: 'available' | 'claimed' | 'expired';
  claimedBy?: IUser['_id']; // Optional reference to User's ObjectId
  // Timestamps will be added by Mongoose
  createdAt?: Date;
  updatedAt?: Date;
}

const ListingSchema: Schema = new Schema({
  restaurant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  foodItem: { type: String, required: true },
  quantity: { type: String, required: true }, // Consider if a Number type with units might be better
  expiryDate: { type: Date, required: true },
  status: { type: String, enum: ['available', 'claimed', 'expired'], default: 'available' },
  claimedBy: { type: Schema.Types.ObjectId, ref: 'User', optional: true },
}, { timestamps: true }); // Added timestamps: true

export default mongoose.model<IListing>('Listing', ListingSchema);
