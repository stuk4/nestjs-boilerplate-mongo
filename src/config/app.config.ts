export const EnvConfiguration = () => ({
  mongodbUri: process.env.MONGODB_URI,
  mongodbName: process.env.MONGODB_NAME,
  port: +process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleSecret: process.env.GOOGLE_SECRET,
});
