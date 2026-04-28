import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['player', 'ground_owner', 'coach', 'admin'],
      default: 'player',
    },
    phone: { type: String, trim: true },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // ── extended profile fields (all roles) ──
    gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
    dateOfBirth: { type: Date, default: null },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: 'India' },
    bio: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);