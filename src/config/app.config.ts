export const EnvConfiguration = () => ({
  mongodbUri: process.env.MONGODB_URI,
  mongodbName: process.env.MONGODB_NAME,
  port: +process.env.PORT,
});
