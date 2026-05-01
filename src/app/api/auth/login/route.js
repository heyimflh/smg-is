import { NextResponse } from "next/server";
import { authenticateUser, createToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password wajib diisi" }, { status: 400 });
    }
    const user = await authenticateUser(username, password);
    if (!user) {
      return NextResponse.json({ error: "Username atau password salah!" }, { status: 401 });
    }
    const token = createToken(user);

    // Audit log
    await prisma.auditLog.create({
      data: { userId: user.id, action: "LOGIN", tableName: "users", recordId: user.id },
    });

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
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
