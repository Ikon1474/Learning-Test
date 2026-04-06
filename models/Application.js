const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    applicationNumber: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    learnerPassword: {
      type: String,
      required: true,
      trim: true
    },
    servicePrice: {
      type: Number,
      default: 70,
      min: 0
    },
    status: {
      type: String,
      enum: ["pending", "passed", "failed"],
      default: "pending"
    },
    licenceImage: {
      data: Buffer,
      contentType: String,
      fileName: String
    }
  },
  {
    timestamps: true
  }
);

applicationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.models.Application || mongoose.model("Application", applicationSchema);
