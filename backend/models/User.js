const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    googleId: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // ✅ Password only required if no googleId
      },
      minlength: 6,
    },
    photo: {
      type: String,      // ✅ ADDED - stores Google profile picture URL
      default: "",
    },
    department: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  try {
    if (!this.password) return next();           // ✅ Skip for Google users
    if (!this.isModified("password")) return next(); // ✅ Skip if not changed

    if (typeof this.password !== "string") {
      return next(new Error("Password must be a string"));
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);