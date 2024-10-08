const mongoose = require("mongoose");

const profilePageSchema = mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Customer",
    },
    profilePicture: {
      type: String,
      required: true,
    },
    brandLogo: {
      type: String,
      required: true,
    },
    cnic: {
      type: String,
      required: true,
    },

    postalCode: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      default: false,
    },
    address: {
      type: String,
      default: false,
    },
    plans: {
      type: String,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const ProfilePage = mongoose.model("ProfilePage", profilePageSchema);

module.exports = ProfilePage;
