import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many attempts. Please try again later.",
    });
  },
});

export const generateLimiter = rateLimit({
  windowMs: 5000, // 5 second window
  max: 3, // limit each user to 3 generate requests per 5 seconds
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?._id?.toString() || ipKeyGenerator(req),
  handler: (req, res) =>
    res.status(429).json({
      success: false,
      message:
        "Too many story generation requests. Please wait a moment and try again.",
    }),
});

