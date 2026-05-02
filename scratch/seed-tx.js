const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  // Get an admin and a staff
  const admin = await prisma.user.findFirst({ where: { role: "admin" } });
  const staff = await prisma.user.findFirst({ where: { role: "staff" } });
  
  if (!admin || !staff) {
    console.error("Missing admin or staff user");
    return;
  }

  // Get some items
  const items = await prisma.item.findMany({ take: 5 });
  if (items.length < 5) {
    console.error("Not enough items");
    return;
  }

  const h = (hoursAgo) => new Date(new Date().getTime() - hoursAgo * 3600000);

  const txData = [
    { type: "IN", refNumber: "NOTA-2025-001", notes: "Restock bulanan dari supplier utama", createdBy: admin.id, createdAt: h(2), items: [{ itemId: items[0].id, qty: 10, priceAtTime: 65000 }, { itemId: items[1].id, qty: 15, priceAtTime: 28000 }, { itemId: items[2].id, qty: 20, priceAtTime: 22000 }] },
    { type: "OUT", notes: "Servis rutin", createdBy: staff.id, createdAt: h(3), items: [{ itemId: items[0].id, qty: 1, priceAtTime: 85000, description: "Ganti Oli - Honda Beat DK 4521 XY" }, { itemId: items[3].id, qty: 1, priceAtTime: 20000, description: "Ganti Filter - Honda Beat DK 4521 XY" }] },
    { type: "OUT", notes: "Servis besar", createdBy: staff.id, createdAt: h(5), items: [{ itemId: items[4].id, qty: 1, priceAtTime: 120000, description: "Ganti Part - Honda Beat B 1234 CD" }] },
    { type: "IN", refNumber: "NOTA-2025-002", notes: "Restok busi dan filter", createdBy: admin.id, createdAt: h(24), items: [{ itemId: items[3].id, qty: 15, priceAtTime: 22000 }, { itemId: items[4].id, qty: 5, priceAtTime: 55000 }] },
    { type: "OUT", notes: "Servis ringan", createdBy: staff.id, createdAt: h(26), items: [{ itemId: items[2].id, qty: 1, priceAtTime: 35000, description: "Ganti Busi - Yamaha NMAX AB 2345 GH" }] },
  ];

  for (const tx of txData) {
    await prisma.transaction.create({
      data: {
        type: tx.type,
        refNumber: tx.refNumber || null,
        notes: tx.notes,
        createdBy: tx.createdBy,
        createdAt: tx.createdAt,
        items: {
          create: tx.items.map(i => ({
            itemId: i.itemId,
            qty: i.qty,
            priceAtTime: i.priceAtTime,
            description: i.description || "",
          })),
        },
      },
    });
  }
  console.log(`✅ ${txData.length} transaksi dummy ditambahkan`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
