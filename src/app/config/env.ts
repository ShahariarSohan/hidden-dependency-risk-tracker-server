import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
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
  REVENUE_LOSS_PER_CRITICAL_SYSTEM: string;
 DOWNTIME_MINUTES_PER_CRITICAL_SYSTEM:string;
  COST_SAVINGS_PER_RESOLVED_RISK: string;
  SMTP_PASS: string;
  SMTP_HOST: string;
  SMTP_PORT: string;
  SMTP_USER: string;
  SMTP_FROM: string;
  RISK_WEIGHT_CRITICALITY: string;
  RISK_WEIGHT_PRIORITY: string;
  RISK_WEIGHT_WORKLOAD: string;
  DEFAULT_EMPLOYEE_CRITICALITY: string;
  TEAM_CAPACITY_FACTOR: string;
  SYSTEM_CAPACITY_FACTOR: string;
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
    "REVENUE_LOSS_PER_CRITICAL_SYSTEM",
    "DOWNTIME_MINUTES_PER_CRITICAL_SYSTEM",
    "COST_SAVINGS_PER_RESOLVED_RISK",
    "SMTP_PASS",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_FROM",
    "RISK_WEIGHT_CRITICALITY",
    "RISK_WEIGHT_PRIORITY",
    "RISK_WEIGHT_WORKLOAD",
    "DEFAULT_EMPLOYEE_CRITICALITY",
    "TEAM_CAPACITY_FACTOR",
    "SYSTEM_CAPACITY_FACTOR",
  ];
  requiredVariables.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing env variables ${key}`);
    }
  });

  return {
    PORT: process.env.PORT as string,
    NODE_ENV: process.env.NODE_ENV as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    ADMIN_NAME: process.env.ADMIN_NAME as string,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL as string,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string,
    BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,
    ADMIN_CONTACT_NUMBER: process.env.ADMIN_CONTACT_NUMBER as string,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
    REVENUE_LOSS_PER_CRITICAL_SYSTEM: process.env.REVENUE_LOSS_PER_CRITICAL_SYSTEM as string,
    DOWNTIME_MINUTES_PER_CRITICAL_SYSTEM: process.env.DOWNTIME_MINUTES_PER_CRITICAL_SYSTEM as string,
    COST_SAVINGS_PER_RESOLVED_RISK: process.env.COST_SAVINGS_PER_RESOLVED_RISK as string,
    SMTP_PASS: process.env.SMTP_PASS as string,
    SMTP_HOST: process.env.SMTP_HOST as string,
    SMTP_PORT: process.env.SMTP_PORT as string,
    SMTP_USER: process.env.SMTP_USER as string,
    SMTP_FROM: process.env.SMTP_FROM as string,
    RISK_WEIGHT_CRITICALITY: process.env.RISK_WEIGHT_CRITICALITY || "0.8",
    RISK_WEIGHT_PRIORITY: process.env.RISK_WEIGHT_PRIORITY || "0.6",
    RISK_WEIGHT_WORKLOAD: process.env.RISK_WEIGHT_WORKLOAD || "0.3",
    DEFAULT_EMPLOYEE_CRITICALITY: process.env.DEFAULT_EMPLOYEE_CRITICALITY || "3",
    TEAM_CAPACITY_FACTOR: process.env.TEAM_CAPACITY_FACTOR || "3",
    SYSTEM_CAPACITY_FACTOR: process.env.SYSTEM_CAPACITY_FACTOR || "2",
  };
};

export const envVariables = loadEnvVariables();
