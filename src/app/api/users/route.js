import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(request) {
  const auth = requireAdmin(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, username: true, role: true, isActive: true }
    });
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = requireAdmin(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const data = await request.json();
    
    // Check if username exists
    const existing = await prisma.user.findUnique({ where: { username: data.username } });
    if (existing) {
      return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
    }

    const hash = await bcrypt.hash(data.password, 10);
    
    const user = await prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        passwordHash: hash,
        role: data.role || "staff"
      },
      select: { id: true, name: true, username: true, role: true, isActive: true }
    });

    await prisma.auditLog.create({
      data: { userId: auth.session.id, action: "CREATE", tableName: "users", recordId: user.id }
    });

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
