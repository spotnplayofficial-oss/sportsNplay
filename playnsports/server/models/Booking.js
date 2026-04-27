import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ground: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ground',
      required: true,
    },
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    advancePrice: { type: Number, required: true },
    remainingPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending_approval','advance_pending', 'advance_paid', 'final_pending', 'completed', 'cancelled', 'refunded'],
      default: 'advance_pending',
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);