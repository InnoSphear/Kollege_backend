import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    content: String,
    language: { type: String, default: 'en', index: true },
    isPublished: { type: Boolean, default: false, index: true },
    seo: { metaTitle: String, metaDescription: String, schemaType: String },
  },
  { timestamps: true }
);

export default mongoose.model('BlogPost', blogPostSchema);
