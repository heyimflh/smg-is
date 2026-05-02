import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request) {
  const auth = requireAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalItems, activeItems, lowStockCount, todayTransactionsCount] = await Promise.all([
      prisma.item.count({ where: { isActive: true } }),
      prisma.item.findMany({ where: { isActive: true }, select: { buyPrice: true, currentStock: true } }),
      prisma.item.count({
        where: { 
          isActive: true, 
          currentStock: { lte: prisma.item.fields.minStock } 
        }
      }),
      prisma.transaction.count({
        where: { createdAt: { gte: startOfDay } }
      })
    ]);

    const totalValue = activeItems.reduce((sum, i) => sum + (i.buyPrice * i.currentStock), 0);

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
