import { NextResponse } from "next/server";
import { authenticateUser, createToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password wajib diisi" }, { status: 400 });
    }
    let user;
    try {
      user = await authenticateUser(username, password);
    } catch (dbErr) {
      console.error("Database connection error:", dbErr);
      return NextResponse.json({ 
        error: "Database Error: Vercel tidak mendukung SQLite. Harap gunakan PostgreSQL (Supabase/Neon) dengan mengatur DATABASE_URL di Vercel Environment Variables. (" + dbErr.message + ")"
      }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: "Username atau password salah!" }, { status: 401 });
    }
    const token = createToken(user);

    // Audit log (Wrap in try-catch so it doesn't block login if DB is read-only)
    try {
      await prisma.auditLog.create({
        data: { userId: user.id, action: "LOGIN", tableName: "users", recordId: user.id },
      });
    } catch (auditErr) {
      console.warn("Gagal mencatat audit log (Mungkin karena database read-only di Vercel):", auditErr.message);
    }

    const response = NextResponse.json({ user, token });
    response.cookies.set("smg_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60, // 8 hours
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Login Route Error:", error);
    return NextResponse.json({ error: "Server error: " + error.message }, { status: 500 });
  }
}
