import mongoose, { Schema } from "mongoose";

const gameSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    image: {
      src: { type: String, required: true },
      alt: { type: String, required: true },
    },
    description: {
      about: { type: String, required: true },
    },
    release_date: {
      type: Date,
      required: true,
    },
    publisher: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      required: true,
      index: true,
    },
    original_size: {
      type: String,
      required: true,
    },
    repack_size: {
      type: String,
      required: true,
    },
    download_url: {
      onedrive: { type: String },
      torrent: { type: String },
      fast_url: { type: String },
    },
    trailer: {
      type: String,
      required: true,
    },
    screenshots: {
      snap1: { type: String, required: true },
      snap2: { type: String, required: true },
      snap3: { type: String, required: true },
      snap4: { type: String, required: true },
    },
    system_req: {
      minimum_req: {
        os: { type: [String], required: true },
        processor: { type: String, required: true },
        memory: { type: String, required: true },
        graphics: { type: String, required: true },
        storage: { type: String, required: true },
        audio: { type: String },
      },
      recommended_req: {
        os: { type: [String], required: true },
        processor: { type: String, required: true },
        memory: { type: String, required: true },
        graphics: { type: String, required: true },
        storage: { type: String, required: true },
        audio: { type: String },
      },
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for text search
gameSchema.index({
  title: "text",
  description: "text",
  tags: "text",
});
export const Game = mongoose.model("Game", gameSchema);
