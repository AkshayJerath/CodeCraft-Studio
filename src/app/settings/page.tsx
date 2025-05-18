
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, User } from 'lucide-react';
import Link from 'next/link'; // Ensure Link is imported

export default function SettingsPage() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Load theme preference from localStorage on mount
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      const newIsDarkTheme = storedTheme === 'dark';
      setIsDarkTheme(newIsDarkTheme);
      document.documentElement.classList.toggle('dark', newIsDarkTheme);
    } else {
      // Default to dark or check system preference if no theme stored
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkTheme(prefersDark);
      document.documentElement.classList.toggle('dark', prefersDark);
      localStorage.setItem('theme', prefersDark ? 'dark' : 'light'); // Save initial preference
    }

    // Load username from localStorage
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const toggleTheme = (checked: boolean) => {
    setIsDarkTheme(checked);
    localStorage.setItem('theme', checked ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', checked);
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden">
      <header className="flex h-16 items-center justify-between border-b bg-card px-4 shadow-sm">
         <Link href="/" className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-primary">
                <path d="M7 8l-4 4 4 4" />
                <path d="M17 8l4 4-4 4" />
                <path d="M14 4l-4 16" />
            </svg>
            <h1 className="text-xl font-bold tracking-tight text-foreground">CodeCraft Studio</h1>
        </Link>
        <div className="flex items-center gap-2 md:gap-3">
            <Button variant="outline" asChild>
                <Link href="/">Back to Editor</Link>
            </Button>
        </div>
      </header>
      
      <main className="flex-grow overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>
          
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center">
                  {isDarkTheme ? <Moon className="mr-2 h-5 w-5 text-primary" /> : <Sun className="mr-2 h-5 w-5 text-yellow-500" />}
                  <Label htmlFor="theme-toggle" className="text-base">
                    {isDarkTheme ? "Dark Mode" : "Light Mode"}
                  </Label>
                </div>
                <Switch
                  id="theme-toggle"
                  checked={isDarkTheme}
                  onCheckedChange={toggleTheme}
                  aria-label="Toggle theme"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Your preferred theme is saved locally in your browser.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>View your account details.</CardDescription>
            </CardHeader>
            <CardContent>
              {username ? (
                <div className="flex items-center space-x-3 p-4 rounded-lg border bg-muted/50">
                  <User className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Logged in as:</p>
                    <p className="text-lg font-semibold text-foreground">{username}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  You are not currently logged in. Account details will appear here once you log in.
                </p>
              )}
               <div className="mt-6 space-x-2">
                <Button variant="outline" asChild>
                  <Link href="/login">Login Page</Link>
                </Button>
                 <Button variant="outline" asChild>
                  <Link href="/register">Register Page</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
        </div>
      </main>
    </div>
  );
}
