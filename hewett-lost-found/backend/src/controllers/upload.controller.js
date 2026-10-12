import { supabaseAdmin } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';

// ============================================
// UPLOAD MULTIPLE IMAGES — Ek saath 3 tak
// ============================================
export const uploadImages = async (req, res) => {
  try {
    // 1. Check karo files aayi ya nahi
    if (!req.files || req.files.length === 0) {
      return sendError(res, 'No image files provided', 400);
    }

    const files = req.files;
    const userId = req.user.id;

    // 2. Max 3 files
    if (files.length > 3) {
      return sendError(res, 'Maximum 3 images allowed per upload', 400);
    }

    // 3. Har file validate karo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    for (const file of files) {
      if (!allowedTypes.includes(file.mimetype)) {
        return sendError(res, `File ${file.originalname}: Only JPEG, PNG, WEBP allowed`, 400);
      }
      if (file.size > 10 * 1024 * 1024) {
        return sendError(res, `File ${file.originalname}: Size must be less than 10MB`, 400);
      }
    }

    // 4. Har file Supabase mein upload karo
    const uploadPromises = files.map(async (file, index) => {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${index}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from('item-images')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Upload failed for ${file.originalname}: ${uploadError.message}`);
      }

      // Public URL nikalo
      const { data: urlData } = supabaseAdmin.storage
        .from('item-images')
        .getPublicUrl(fileName);

      return {
        file_name: fileName,
        image_url: urlData.publicUrl,
      };
    });

    // 5. Saare uploads parallel mein complete karo
    const uploadedFiles = await Promise.all(uploadPromises);

    // 6. Success response
    return sendSuccess(
      res,
      {
        images: uploadedFiles,                          // Array of {file_name, image_url}
        image_urls: uploadedFiles.map(f => f.image_url), // Sirf URLs
        count: uploadedFiles.length,
      },
      `${uploadedFiles.length} image(s) uploaded successfully`,
      201
    );
  } catch (err) {
    console.error('❌ Upload error:', err.message);
    return sendError(res, err.message || 'Failed to upload images', 500);
  }
};