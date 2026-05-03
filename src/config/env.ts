import "dotenv/config";

function validateAndGetEnv(name: string): string {
  const env = process.env[name];
  if (!env) {
    throw new Error(`Configuration Error for ${name}`);
  }
  return env;
}

const PORT:number = Number(validateAndGetEnv("PORT"));
const DATABASE_URL:string = validateAndGetEnv("DATABASE_URL");
const BYPASS_INVITE:boolean = process.env.BYPASS_INVITE === "true"? true:false || false;

export { PORT, DATABASE_URL, BYPASS_INVITE };
