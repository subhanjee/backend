const mongoose = require("mongoose");
   

const businessSchema = mongoose.Schema(
  {
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Customer",
      },
    businessName: {
      type: String,
      required: true,
    },
    businessNiche: {
      type: String,
      required: true,
    },
  
    websiteLink: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

 
const BusinessUser = mongoose.model("BusinessUser", businessSchema);

module.exports = BusinessUser;
