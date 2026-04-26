import { loginSchema, registerSchema } from "../../../src/utils/validator";

// Helper — resolves promise to { valid: true } or { valid: false, errors }
const validate = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { valid: true, errors: [] };
  } catch (err) {
    return { valid: false, errors: err.errors };
  }
};

// ─── loginSchema ──────────────────────────────────────────────────────────────

describe("loginSchema", () => {
  const valid = { email: "user@example.com", password: "secret123", rememberMe: false };

  it("passes with valid email, password and rememberMe", async () => {
    const result = await validate(loginSchema, valid);
    expect(result.valid).toBe(true);
  });

  it("fails when email is missing", async () => {
    const result = await validate(loginSchema, { ...valid, email: "" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Email is required");
  });

  it("fails when email is invalid format", async () => {
    const result = await validate(loginSchema, { ...valid, email: "not-an-email" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Enter a valid email");
  });

  it("fails when password is missing", async () => {
    const result = await validate(loginSchema, { ...valid, password: "" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Password is required");
  });

  it("fails when password is shorter than 6 characters", async () => {
    const result = await validate(loginSchema, { ...valid, password: "abc" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Password must be at least 6 characters");
  });

  it("passes when rememberMe is omitted (optional field)", async () => {
    const { rememberMe, ...data } = valid;
    const result = await validate(loginSchema, data);
    expect(result.valid).toBe(true);
  });
});

// ─── registerSchema ───────────────────────────────────────────────────────────

describe("registerSchema", () => {
  const valid = {
    name: "Alice",
    email: "alice@example.com",
    password: "secure123",
    confirmPassword: "secure123",
  };

  it("passes with all valid fields", async () => {
    const result = await validate(registerSchema, valid);
    expect(result.valid).toBe(true);
  });

  it("fails when name is missing", async () => {
    const result = await validate(registerSchema, { ...valid, name: "" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Name is required");
  });

  it("fails when name is shorter than 2 characters", async () => {
    const result = await validate(registerSchema, { ...valid, name: "A" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Name must be at least 2 characters");
  });

  it("fails when email is invalid", async () => {
    const result = await validate(registerSchema, { ...valid, email: "bad-email" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Enter a valid email");
  });

  it("fails when password is too short", async () => {
    const result = await validate(registerSchema, { ...valid, password: "12", confirmPassword: "12" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Password must be at least 6 characters");
  });

  it("fails when confirmPassword does not match password", async () => {
    const result = await validate(registerSchema, { ...valid, confirmPassword: "different" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Passwords do not match");
  });

  it("fails when confirmPassword is missing", async () => {
    const result = await validate(registerSchema, { ...valid, confirmPassword: "" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Confirm password is required");
  });

  it("reports multiple errors at once with abortEarly:false", async () => {
    const result = await validate(registerSchema, { name: "", email: "bad", password: "x", confirmPassword: "y" });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});