import { z } from "zod";

// Email validation schema
export const emailSchema = z
  .string()
  .trim()
  .email({ message: "Invalid email address" })
  .max(255, { message: "Email must be less than 255 characters" });

// Password validation schema (strengthened to 8 characters minimum)
export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(128, { message: "Password must be less than 128 characters" });

// Theme validation schema
export const themeSchema = z
  .string()
  .trim()
  .min(1, { message: "Theme cannot be empty" })
  .max(50, { message: "Theme must be less than 50 characters" })
  .regex(/^[a-zA-Z0-9\s]+$/, { message: "Theme can only contain letters, numbers, and spaces" });

// Image count validation
export const imageCountSchema = z.enum(["4", "6"], {
  errorMap: () => ({ message: "Image count must be 4 or 6" })
});

// Registration form schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  imageCount: imageCountSchema,
  theme: themeSchema,
});

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset password schema
export const resetPasswordSchema = z.object({
  password: passwordSchema,
  imageCount: imageCountSchema,
  theme: themeSchema,
});

// File upload validation
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ];

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "File size must be less than 10MB" };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: "File type not allowed" };
  }

  return { valid: true };
};
