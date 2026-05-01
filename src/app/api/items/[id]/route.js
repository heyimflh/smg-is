import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth";

export async function GET(request, { params }) {
  const auth = requireAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const item = await prisma.item.findUnique({
      where: { id: parseInt(params.id) },
      include: { category: true }
    });
    
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = requireAdmin(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const id = parseInt(params.id);
    const data = await request.json();
    
    const oldItem = await prisma.item.findUnique({ where: { id } });
    if (!oldItem) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const item = await prisma.item.update({
      where: { id },
      data: {
        name: data.name,
        alias: data.alias || null,
        categoryId: parseInt(data.categoryId),
        unit: data.unit,
        buyPrice: parseInt(data.buyPrice),
        sellPrice: parseInt(data.sellPrice),
        minStock: parseInt(data.minStock),
      }
    });

    await prisma.auditLog.create({
      data: { 
        userId: auth.session.id, 
        action: "UPDATE", 
        tableName: "items", 
        recordId: id,
        oldValue: JSON.stringify(oldItem),
        newValue: JSON.stringify(item)
      }
    });

    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = requireAdmin(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const id = parseInt(params.id);
    const item = await prisma.item.update({
      where: { id },
      data: { isActive: false }
    });

    await prisma.auditLog.create({
      data: { userId: auth.session.id, action: "DELETE", tableName: "items", recordId: id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
