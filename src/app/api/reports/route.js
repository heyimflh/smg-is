import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request) {
  const auth = requireAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const url = new URL(request.url);
  const startDateStr = url.searchParams.get("startDate");
  const endDateStr = url.searchParams.get("endDate");

  try {
    let dateFilter = {};
    if (startDateStr && endDateStr) {
      const start = new Date(startDateStr);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDateStr);
      end.setHours(23, 59, 59, 999);
      dateFilter = { createdAt: { gte: start, lte: end } };
    }

    // 1. Transactions list (all in period)
    const transactions = await prisma.transaction.findMany({
      where: dateFilter,
      include: {
        user: { select: { name: true } },
        items: { include: { item: { select: { name: true, sku: true, unit: true, category: { select: { name: true } } } } } }
      },
      orderBy: { createdAt: "desc" }
    });

    // 2. Summary & Usage map
    let totalMasuk = 0;
    let totalKeluar = 0;
    const usageMap = {};

    transactions.forEach(tx => {
      tx.items.forEach(ti => {
        const val = ti.qty * ti.priceAtTime;
        if (tx.type === "IN") {
          totalMasuk += val;
        } else if (tx.type === "OUT") {
          totalKeluar += val;
          // Track usage for chart
          if (!usageMap[ti.itemId]) {
            usageMap[ti.itemId] = { name: ti.item.name, qty: 0 };
          }
          usageMap[ti.itemId].qty += ti.qty;
        }
      });
    });

    // Top Usage Chart Data
    const topUsage = Object.values(usageMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // 3. Current Stock Value (Rekap Nilai Stok)
    const allItems = await prisma.item.findMany({ where: { isActive: true } });
    const currentStockValue = allItems.reduce((sum, item) => sum + (item.currentStock * item.buyPrice), 0);

    return NextResponse.json({
      summary: { totalMasuk, totalKeluar, currentStockValue },
      topUsage,
      transactions
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 });
  }
}
