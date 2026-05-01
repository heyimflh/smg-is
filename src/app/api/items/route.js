import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth";

export async function GET(request) {
  const auth = requireAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const categoryId = url.searchParams.get("category");
  const lowStock = url.searchParams.get("lowStock") === "true";

  try {
    const where = { isActive: true };
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { alias: { contains: search } }
      ];
    }
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }
    if (lowStock) {
      where.currentStock = { lte: prisma.item.fields.minStock };
    }

    const items = await prisma.item.findMany({
      where,
      include: { category: true },
      orderBy: { name: "asc" }
    });
    
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = requireAdmin(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const data = await request.json();
    
    // Auto-generate SKU
    const count = await prisma.item.count();
    const prefix = data.categoryId === 1 ? "OLI" : 
                   data.categoryId === 2 ? "FLT" : 
                   data.categoryId === 3 ? "BSI" : 
                   data.categoryId === 4 ? "BAN" : 
                   data.categoryId === 5 ? "SPR" : 
                   data.categoryId === 6 ? "AKS" : "LNY";
    const sku = `SMG-${prefix}-${String(count + 1).padStart(4, '0')}`;

    const item = await prisma.item.create({
      data: {
        sku,
        name: data.name,
        alias: data.alias || null,
        categoryId: parseInt(data.categoryId),
        unit: data.unit,
        buyPrice: parseInt(data.buyPrice) || 0,
        sellPrice: parseInt(data.sellPrice) || 0,
        minStock: parseInt(data.minStock) || 2,
        currentStock: parseInt(data.currentStock) || 0,
      }
    });

    await prisma.auditLog.create({
      data: { 
        userId: auth.session.id, 
        action: "CREATE", 
        tableName: "items", 
        recordId: item.id,
        newValue: JSON.stringify(item)
      }
    });

    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 });
  }
}
