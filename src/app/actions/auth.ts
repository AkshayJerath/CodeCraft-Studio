
"use server";

import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

interface ActionResult {
  success: boolean;
  error?: string;
}

// Mock login function
export async function loginUser(
  values: z.infer<typeof loginSchema>
): Promise<ActionResult> {
  console.log("Attempting login with:", values);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (values.email === "test@example.com" && values.password === "password") {
    console.log("Mock login successful for:", values.email);
    return { success: true };
  } else {
    console.log("Mock login failed for:", values.email);
    return { success: false, error: "Invalid email or password." };
  }
}

// Mock register function
export async function registerUser(
  values: z.infer<typeof registerSchema>
): Promise<ActionResult> {
  console.log("Attempting registration for:", values);
  // Simulate API call & user creation
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulate a scenario where email might already be taken
  if (values.email === "taken@example.com") {
    console.log("Mock registration failed: email taken", values.email);
    return { success: false, error: "This email is already registered." };
  }

  console.log("Mock registration successful for:", values.email);
  return { success: true };
}
