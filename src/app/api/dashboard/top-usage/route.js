import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request) {
  const auth = requireAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get all OUT items in last 7 days
    const items = await prisma.transactionItem.findMany({
      where: {
        transaction: {
          type: "OUT",
          createdAt: { gte: sevenDaysAgo }
        }
      },
      include: { item: true }
    });

    // Aggregate by item
    const usageMap = {};
    for (const i of items) {
      if (!usageMap[i.itemId]) {
        usageMap[i.itemId] = {
          name: i.item.name,
          qty: 0,
          color: `hsl(${Math.random() * 360}, 70%, 50%)`
        };
      }
      usageMap[i.itemId].qty += i.qty;
    }

    const topItems = Object.values(usageMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return NextResponse.json({ topItems });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
