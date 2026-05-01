import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request) {
  const auth = requireAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    // 1. Total Active Items
    const totalItems = await prisma.item.count({ where: { isActive: true } });

    // 2. Total Stock Value
    const activeItems = await prisma.item.findMany({ where: { isActive: true }, select: { buyPrice: true, currentStock: true } });
    const totalValue = activeItems.reduce((sum, i) => sum + (i.buyPrice * i.currentStock), 0);

    // 3. Low Stock Items (critical)
    const lowStockCount = await prisma.item.count({
      where: { 
        isActive: true, 
        currentStock: { lte: prisma.item.fields.minStock } 
      }
    });

    // 4. Today's Transactions
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayTransactionsCount = await prisma.transaction.count({
      where: { createdAt: { gte: startOfDay } }
    });

    return NextResponse.json({
      totalItems,
      totalValue,
      lowStockCount,
      todayTransactionsCount
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
