
"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import type { Collection, Db } from 'mongodb';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

interface UserDocument {
  _id?: any;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

interface ActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(); // You can specify your database name here if it's not in the URI, e.g., client.db("myAppDb")
}

async function getUsersCollection(): Promise<Collection<UserDocument>> {
  const db = await getDb();
  return db.collection<UserDocument>("users");
}

export async function loginUser(
  values: z.infer<typeof loginSchema>
): Promise<ActionResult> {
  console.log("Attempting login with:", values.email);
  try {
    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ email: values.email });

    if (!user) {
      return { success: false, error: "Invalid email or password." };
    }

    const isPasswordValid = await bcrypt.compare(values.password, user.passwordHash);

    if (!isPasswordValid) {
      return { success: false, error: "Invalid email or password." };
    }

    console.log("Login successful for:", values.email);
    // Note: In a real app, you'd issue a session token (e.g., JWT) here.
    return { success: true, message: "Login successful!" };

  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "An unexpected error occurred during login." };
  }
}

export async function registerUser(
  values: z.infer<typeof registerSchema>
): Promise<ActionResult> {
  console.log("Attempting registration for:", values.email);
  try {
    const usersCollection = await getUsersCollection();

    const existingUser = await usersCollection.findOne({ email: values.email });
    if (existingUser) {
      return { success: false, error: "This email is already registered." };
    }
    
    const existingUsername = await usersCollection.findOne({ username: values.username });
    if (existingUsername) {
        return { success: false, error: "This username is already taken." };
    }


    const passwordHash = await bcrypt.hash(values.password, 10); // Salt rounds = 10

    const newUser: UserDocument = {
      username: values.username,
      email: values.email,
      passwordHash: passwordHash,
      createdAt: new Date(),
    };

    await usersCollection.insertOne(newUser);

    console.log("Registration successful for:", values.email);
    return { success: true, message: "Registration successful! You can now log in." };

  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "An unexpected error occurred during registration." };
  }
}
