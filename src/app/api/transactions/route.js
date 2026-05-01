import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

async function sendWhatsAppAlerts(items) {
  const token = process.env.FONNTE_TOKEN;
  if (!token) {
    console.warn("FONNTE_TOKEN not set. Skipping WhatsApp alert.");
    return;
  }

  const targetNumber = "085700622035"; // Admin number from PRD
  
  let message = "*⚠️ ALERT STOK KRITIS SMG-IS*\n\nBeberapa barang telah mencapai batas minimum stok:\n\n";
  items.forEach((item, idx) => {
    message += `${idx + 1}. *${item.name}* (${item.sku})\n   Sisa Stok: ${item.newStock} (Min: ${item.minStock})\n`;
  });
  message += "\nMohon segera lakukan re-order untuk menghindari stockout.";

  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        "Authorization": token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        target: targetNumber,
        message: message,
        delay: "2"
      })
    });
    
    const data = await res.json();
    if (!data.status) {
      console.error("Fonnte API Error:", data.reason);
    } else {
      console.log("WhatsApp alert sent successfully!");
    }
  } catch (error) {
    console.error("Failed to send WhatsApp alert:", error);
  }
}

export async function GET(request) {
  const auth = requireAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const url = new URL(request.url);
  const dateStr = url.searchParams.get("date");
  const type = url.searchParams.get("type");

  try {
    const where = {};
    if (type) where.type = type;
    
    if (dateStr) {
      // dateStr is expected to be "YYYY-MM-DD"
      const start = new Date(dateStr);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateStr);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { gte: start, lte: end };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        items: { include: { item: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });
    
    return NextResponse.json({ transactions });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = requireAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const data = await request.json();
    const { type, refNumber, notes, items } = data;

    if (!["IN", "OUT", "ADJUST"].includes(type)) {
      return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Items cannot be empty" }, { status: 400 });
    }

    // Validate OUT transactions
    if (type === "OUT") {
      for (const reqItem of items) {
        const dbItem = await prisma.item.findUnique({ where: { id: reqItem.itemId } });
        if (!dbItem) return NextResponse.json({ error: `Item ${reqItem.itemId} not found` }, { status: 400 });
        if (dbItem.currentStock < reqItem.qty) {
          return NextResponse.json({ error: `Stok tidak cukup untuk ${dbItem.name}` }, { status: 400 });
        }
      }
    }

    // Use interactive transaction
    let itemsToAlert = [];
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create transaction
      const transaction = await tx.transaction.create({
        data: {
          type,
          refNumber: refNumber || null,
          notes,
          createdBy: auth.session.id,
          items: {
            create: items.map(i => ({
              itemId: i.itemId,
              qty: i.qty,
              priceAtTime: i.priceAtTime || 0,
              description: i.description || ""
            }))
          }
        },
        include: { items: true }
      });

      // 2. Update stock for each item
      for (const i of items) {
        let stockChange = 0;
        if (type === "IN") stockChange = i.qty;
        else if (type === "OUT") stockChange = -i.qty;
        else if (type === "ADJUST") stockChange = i.qty; // Can be negative or positive

        const dbItem = await tx.item.findUnique({ where: { id: i.itemId } });
        if (dbItem) {
          const newStock = dbItem.currentStock + stockChange;
          
          // Check if it crosses the threshold
          if (stockChange < 0 && newStock <= dbItem.minStock && dbItem.currentStock > dbItem.minStock) {
            itemsToAlert.push({ name: dbItem.name, sku: dbItem.sku, newStock, minStock: dbItem.minStock });
          }
        }

        await tx.item.update({
          where: { id: i.itemId },
          data: {
            currentStock: { increment: stockChange },
            ...(type === "IN" && i.priceAtTime ? { buyPrice: i.priceAtTime } : {})
          }
        });
      }

      return transaction;
    });

    if (itemsToAlert.length > 0) {
      sendWhatsAppAlerts(itemsToAlert).catch(console.error);
    }

    return NextResponse.json({ transaction: result });
  } catch (error) {
    return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 });
  }
}
