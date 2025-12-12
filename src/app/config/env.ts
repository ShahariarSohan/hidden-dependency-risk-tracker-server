import dotenv from "dotenv";

if (globalThis.process.env.NODE_ENV !== "production") {
  dotenv.config();
}

interface EnvConfig {
  PORT: string;
  NODE_ENV: string;
  DATABASE_URL: string;
  FRONTEND_URL: string;
  ADMIN_NAME: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  BCRYPT_SALT_ROUND: string;
  ADMIN_CONTACT_NUMBER: string;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
}

const loadEnvVariables = (): EnvConfig => {
  const requiredVariables: string[] = [
    "PORT",
    "DATABASE_URL",
    "FRONTEND_URL",
    "ADMIN_EMAIL",
    "ADMIN_NAME",
    "ADMIN_PASSWORD",
    "BCRYPT_SALT_ROUND",
    "ADMIN_CONTACT_NUMBER",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "ACCESS_TOKEN_EXPIRES_IN",
    "REFRESH_TOKEN_EXPIRES_IN",
  ];
  requiredVariables.forEach((key) => {
    if (!globalThis.process.env[key]) {
      throw new Error(`Missing env variables ${key}`);
    }
  });

  return {
    PORT: globalThis.process.env.PORT as string,
    NODE_ENV: globalThis.process.env.NODE_ENV as string,
    DATABASE_URL: globalThis.process.env.DATABASE_URL as string,
    FRONTEND_URL: globalThis.process.env.FRONTEND_URL as string,
    ADMIN_NAME: globalThis.process.env.ADMIN_NAME as string,
    ADMIN_EMAIL: globalThis.process.env.ADMIN_EMAIL as string,
    ADMIN_PASSWORD: globalThis.process.env.ADMIN_PASSWORD as string,
    BCRYPT_SALT_ROUND: globalThis.process.env.BCRYPT_SALT_ROUND as string,
    ADMIN_CONTACT_NUMBER: globalThis.process.env.ADMIN_CONTACT_NUMBER as string,
    ACCESS_TOKEN_SECRET: globalThis.process.env.ACCESS_TOKEN_SECRET as string,
    REFRESH_TOKEN_SECRET: globalThis.process.env.REFRESH_TOKEN_SECRET as string,
    ACCESS_TOKEN_EXPIRES_IN: globalThis.process.env
      .ACCESS_TOKEN_EXPIRES_IN as string,
    REFRESH_TOKEN_EXPIRES_IN: globalThis.process.env
      .REFRESH_TOKEN_EXPIRES_IN as string,
  };
};

export const envVariables = loadEnvVariables();
