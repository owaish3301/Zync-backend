import "dotenv/config";

function validateAndGetEnv(name: string): string {
  const env = process.env[name];
  if (!env) {
    throw new Error(`Configuration Error for ${name}`);
  }
  return env;
}

const PORT = validateAndGetEnv("PORT");
const DATABASE_URL = validateAndGetEnv("DATABASE_URL");

export { PORT, DATABASE_URL };
