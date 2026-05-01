import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PUT(request, { params }) {
  const auth = requireAdmin(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const id = parseInt(params.id);
    const data = await request.json();
    
    const updateData = {
      name: data.name,
      role: data.role,
      isActive: data.isActive
    };

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, username: true, role: true, isActive: true }
    });

    await prisma.auditLog.create({
      data: { userId: auth.session.id, action: "UPDATE", tableName: "users", recordId: id }
    });

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = requireAdmin(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const id = parseInt(params.id);
    if (id === auth.session.id) {
      return NextResponse.json({ error: "Tidak dapat menonaktifkan diri sendiri" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });

    await prisma.auditLog.create({
      data: { userId: auth.session.id, action: "DELETE", tableName: "users", recordId: id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
