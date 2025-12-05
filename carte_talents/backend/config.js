// Configuration de l'application
export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'carte_talents_secret_key_2024_cesi',
  nodeEnv: process.env.NODE_ENV || 'development'
};
