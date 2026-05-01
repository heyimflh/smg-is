// ============================================================
// SMG-IS v2.0 — Database Seed Script
// Seeds all 50 items, 7 categories, 5 users, 10 transactions
// ============================================================
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const categories = [
  { id: 1, name: "Oli" },
  { id: 2, name: "Filter" },
  { id: 3, name: "Busi" },
  { id: 4, name: "Ban" },
  { id: 5, name: "Spare Part" },
  { id: 6, name: "Aksesoris" },
  { id: 7, name: "Lainnya" },
];

const items = [
  { id: 1, sku: "SMG-OLI-0001", name: "Oli Shell Helix HX7 1L", alias: "Oli Shell", categoryId: 1, unit: "Liter", buyPrice: 65000, sellPrice: 85000, minStock: 5, currentStock: 12 },
  { id: 2, sku: "SMG-OLI-0002", name: "Oli Castrol Power 1 0.8L", alias: "Castrol Matic", categoryId: 1, unit: "Liter", buyPrice: 45000, sellPrice: 60000, minStock: 5, currentStock: 3 },
  { id: 3, sku: "SMG-OLI-0003", name: "Oli Federal Matic 0.8L", alias: "Federal Matic", categoryId: 1, unit: "Liter", buyPrice: 28000, sellPrice: 38000, minStock: 8, currentStock: 20 },
  { id: 4, sku: "SMG-OLI-0004", name: "Oli Yamalube Super 4T 1L", alias: "Yamalube", categoryId: 1, unit: "Liter", buyPrice: 35000, sellPrice: 48000, minStock: 5, currentStock: 7 },
  { id: 5, sku: "SMG-OLI-0005", name: "Oli Top 1 Action Matic 0.8L", alias: "Top 1 Matic", categoryId: 1, unit: "Liter", buyPrice: 42000, sellPrice: 55000, minStock: 4, currentStock: 2 },
  { id: 6, sku: "SMG-OLI-0006", name: "Oli Motul 5100 4T 1L", alias: "Motul 5100", categoryId: 1, unit: "Liter", buyPrice: 95000, sellPrice: 125000, minStock: 3, currentStock: 5 },
  { id: 7, sku: "SMG-OLI-0007", name: "Oli Shell Advance AX5 0.8L", alias: "Shell Advance", categoryId: 1, unit: "Liter", buyPrice: 32000, sellPrice: 45000, minStock: 6, currentStock: 15 },
  { id: 8, sku: "SMG-OLI-0008", name: "Oli Pertamina Enduro 4T 1L", alias: "Enduro 4T", categoryId: 1, unit: "Liter", buyPrice: 30000, sellPrice: 42000, minStock: 5, currentStock: 1 },
  { id: 9, sku: "SMG-FLT-0001", name: "Filter Oli Honda Beat", alias: "Filter Beat", categoryId: 2, unit: "Pcs", buyPrice: 12000, sellPrice: 20000, minStock: 5, currentStock: 18 },
  { id: 10, sku: "SMG-FLT-0002", name: "Filter Oli Yamaha NMAX", alias: "Filter NMAX", categoryId: 2, unit: "Pcs", buyPrice: 15000, sellPrice: 25000, minStock: 5, currentStock: 10 },
  { id: 11, sku: "SMG-FLT-0003", name: "Filter Udara Honda Vario 125", alias: "Filter Udara Vario", categoryId: 2, unit: "Pcs", buyPrice: 18000, sellPrice: 30000, minStock: 3, currentStock: 8 },
  { id: 12, sku: "SMG-FLT-0004", name: "Filter Udara Yamaha Mio", alias: "Filter Mio", categoryId: 2, unit: "Pcs", buyPrice: 14000, sellPrice: 22000, minStock: 4, currentStock: 2 },
  { id: 13, sku: "SMG-FLT-0005", name: "Filter Oli Suzuki Satria", alias: "Filter Satria", categoryId: 2, unit: "Pcs", buyPrice: 13000, sellPrice: 22000, minStock: 3, currentStock: 6 },
  { id: 14, sku: "SMG-BSI-0001", name: "Busi NGK CPR8EA-9", alias: "Busi NGK", categoryId: 3, unit: "Pcs", buyPrice: 22000, sellPrice: 35000, minStock: 10, currentStock: 25 },
  { id: 15, sku: "SMG-BSI-0002", name: "Busi Denso Iridium IU24", alias: "Busi Denso", categoryId: 3, unit: "Pcs", buyPrice: 55000, sellPrice: 75000, minStock: 5, currentStock: 8 },
  { id: 16, sku: "SMG-BSI-0003", name: "Busi NGK CR7HSA Standard", alias: "Busi CR7", categoryId: 3, unit: "Pcs", buyPrice: 15000, sellPrice: 25000, minStock: 10, currentStock: 30 },
  { id: 17, sku: "SMG-BSI-0004", name: "Busi Bosch UR2CC", alias: "Busi Bosch", categoryId: 3, unit: "Pcs", buyPrice: 18000, sellPrice: 28000, minStock: 5, currentStock: 4 },
  { id: 18, sku: "SMG-BAN-0001", name: "Ban Luar IRC NR73 80/90-14", alias: "IRC NR73", categoryId: 4, unit: "Pcs", buyPrice: 105000, sellPrice: 140000, minStock: 2, currentStock: 6 },
  { id: 19, sku: "SMG-BAN-0002", name: "Ban Luar FDR City Go 90/90-14", alias: "FDR City Go", categoryId: 4, unit: "Pcs", buyPrice: 125000, sellPrice: 165000, minStock: 2, currentStock: 4 },
  { id: 20, sku: "SMG-BAN-0003", name: "Ban Dalam IRC 80/90-14", alias: "Ban Dalam IRC", categoryId: 4, unit: "Pcs", buyPrice: 25000, sellPrice: 40000, minStock: 4, currentStock: 10 },
  { id: 21, sku: "SMG-BAN-0004", name: "Ban Luar Michelin Pilot Street 80/90-14", alias: "Michelin Pilot", categoryId: 4, unit: "Pcs", buyPrice: 185000, sellPrice: 240000, minStock: 2, currentStock: 1 },
  { id: 22, sku: "SMG-BAN-0005", name: "Ban Luar Swallow S-208 90/90-14", alias: "Swallow S208", categoryId: 4, unit: "Pcs", buyPrice: 95000, sellPrice: 130000, minStock: 2, currentStock: 5 },
  { id: 23, sku: "SMG-SPR-0001", name: "Kampas Rem Depan Honda Beat", alias: "Kampas Beat Depan", categoryId: 5, unit: "Set", buyPrice: 25000, sellPrice: 40000, minStock: 5, currentStock: 12 },
  { id: 24, sku: "SMG-SPR-0002", name: "Kampas Rem Belakang Honda Beat", alias: "Kampas Beat Blkg", categoryId: 5, unit: "Set", buyPrice: 22000, sellPrice: 35000, minStock: 5, currentStock: 8 },
  { id: 25, sku: "SMG-SPR-0003", name: "V-Belt Honda Beat FI", alias: "Vanbelt Beat", categoryId: 5, unit: "Pcs", buyPrice: 85000, sellPrice: 120000, minStock: 2, currentStock: 3 },
  { id: 26, sku: "SMG-SPR-0004", name: "Roller Set Honda Beat", alias: "Roller Beat", categoryId: 5, unit: "Set", buyPrice: 35000, sellPrice: 55000, minStock: 3, currentStock: 7 },
  { id: 27, sku: "SMG-SPR-0005", name: "Kampas Ganda Honda Beat", alias: "Kampas Ganda Beat", categoryId: 5, unit: "Set", buyPrice: 45000, sellPrice: 70000, minStock: 2, currentStock: 4 },
  { id: 28, sku: "SMG-SPR-0006", name: "Rantai Kit Set Honda Supra X", alias: "Gir Set Supra", categoryId: 5, unit: "Set", buyPrice: 120000, sellPrice: 175000, minStock: 2, currentStock: 3 },
  { id: 29, sku: "SMG-SPR-0007", name: "Kabel Gas Honda Vario", alias: "Kabel Gas Vario", categoryId: 5, unit: "Pcs", buyPrice: 18000, sellPrice: 30000, minStock: 3, currentStock: 6 },
  { id: 30, sku: "SMG-SPR-0008", name: "Per CVT Yamaha NMAX", alias: "Per CVT NMAX", categoryId: 5, unit: "Pcs", buyPrice: 55000, sellPrice: 80000, minStock: 2, currentStock: 2 },
  { id: 31, sku: "SMG-SPR-0009", name: "Bearing Roda Depan 6301", alias: "Bearing 6301", categoryId: 5, unit: "Pcs", buyPrice: 15000, sellPrice: 25000, minStock: 4, currentStock: 10 },
  { id: 32, sku: "SMG-SPR-0010", name: "Seal Shock Depan Honda Beat", alias: "Seal Shock Beat", categoryId: 5, unit: "Set", buyPrice: 20000, sellPrice: 35000, minStock: 3, currentStock: 5 },
  { id: 33, sku: "SMG-SPR-0011", name: "Piston Kit Honda Beat 50mm", alias: "Piston Beat", categoryId: 5, unit: "Set", buyPrice: 75000, sellPrice: 110000, minStock: 2, currentStock: 3 },
  { id: 34, sku: "SMG-SPR-0012", name: "CDI Racing YSS Honda Beat", alias: "CDI Beat", categoryId: 5, unit: "Pcs", buyPrice: 65000, sellPrice: 95000, minStock: 1, currentStock: 2 },
  { id: 35, sku: "SMG-AKS-0001", name: "Lampu LED H6 Motor AC/DC", alias: "LED H6", categoryId: 6, unit: "Pcs", buyPrice: 35000, sellPrice: 55000, minStock: 5, currentStock: 15 },
  { id: 36, sku: "SMG-AKS-0002", name: "Spion Standar Honda Beat", alias: "Spion Beat", categoryId: 6, unit: "Set", buyPrice: 25000, sellPrice: 40000, minStock: 3, currentStock: 6 },
  { id: 37, sku: "SMG-AKS-0003", name: "Grip / Handgrip Universal", alias: "Handgrip", categoryId: 6, unit: "Set", buyPrice: 12000, sellPrice: 22000, minStock: 4, currentStock: 10 },
  { id: 38, sku: "SMG-AKS-0004", name: "Jalu Stang Universal CNC", alias: "Jalu Stang", categoryId: 6, unit: "Set", buyPrice: 18000, sellPrice: 30000, minStock: 3, currentStock: 8 },
  { id: 39, sku: "SMG-AKS-0005", name: "Cover Body Honda Beat Pop", alias: "Cover Beat Pop", categoryId: 6, unit: "Set", buyPrice: 185000, sellPrice: 250000, minStock: 1, currentStock: 2 },
  { id: 40, sku: "SMG-LNY-0001", name: "Mur Baut Set M8x30", alias: "Mur Baut M8", categoryId: 7, unit: "Pcs", buyPrice: 1500, sellPrice: 3000, minStock: 20, currentStock: 50 },
  { id: 41, sku: "SMG-LNY-0002", name: "Lem Gasket Three Bond", alias: "Lem Three Bond", categoryId: 7, unit: "Pcs", buyPrice: 12000, sellPrice: 20000, minStock: 3, currentStock: 7 },
  { id: 42, sku: "SMG-LNY-0003", name: "Kunci Ring Pas Set 8-24mm", alias: "Kunci Set", categoryId: 7, unit: "Set", buyPrice: 85000, sellPrice: 120000, minStock: 1, currentStock: 2 },
  { id: 43, sku: "SMG-LNY-0004", name: "Selotip Listrik Nitto", alias: "Isolasi Listrik", categoryId: 7, unit: "Pcs", buyPrice: 5000, sellPrice: 8000, minStock: 5, currentStock: 12 },
  { id: 44, sku: "SMG-LNY-0005", name: "Kabel Body Motor Universal 1m", alias: "Kabel Body", categoryId: 7, unit: "Pcs", buyPrice: 8000, sellPrice: 15000, minStock: 5, currentStock: 8 },
  { id: 45, sku: "SMG-OLI-0009", name: "Oli Gardan Yamalube 100ml", alias: "Oli Gardan", categoryId: 1, unit: "Pcs", buyPrice: 15000, sellPrice: 22000, minStock: 6, currentStock: 14 },
  { id: 46, sku: "SMG-SPR-0013", name: "Koil Racing YSS", alias: "Koil Racing", categoryId: 5, unit: "Pcs", buyPrice: 45000, sellPrice: 70000, minStock: 2, currentStock: 3 },
  { id: 47, sku: "SMG-SPR-0014", name: "Pompa Oli Samping Yamaha RX King", alias: "Pompa Oli RXK", categoryId: 5, unit: "Pcs", buyPrice: 55000, sellPrice: 85000, minStock: 1, currentStock: 1 },
  { id: 48, sku: "SMG-AKS-0006", name: "Klakson Denso Waterproof", alias: "Klakson Denso", categoryId: 6, unit: "Pcs", buyPrice: 45000, sellPrice: 70000, minStock: 2, currentStock: 4 },
  { id: 49, sku: "SMG-FLT-0006", name: "Filter Oli Kawasaki KLX 150", alias: "Filter KLX", categoryId: 2, unit: "Pcs", buyPrice: 18000, sellPrice: 28000, minStock: 2, currentStock: 3 },
  { id: 50, sku: "SMG-BSI-0005", name: "Busi NGK Iridium CPR9EAIX-9", alias: "Busi Iridium NGK", categoryId: 3, unit: "Pcs", buyPrice: 72000, sellPrice: 95000, minStock: 3, currentStock: 6 },
];

const users = [
  { id: 1, name: "Hawari", username: "hawari", password: "admin123", role: "admin" },
  { id: 2, name: "Mufalah", username: "mufalah", password: "admin123", role: "admin" },
  { id: 3, name: "Andi Prasetyo", username: "andi", password: "staff123", role: "staff" },
  { id: 4, name: "Budi Santoso", username: "budi", password: "staff123", role: "staff" },
  { id: 5, name: "Rizky Ramadhan", username: "rizky", password: "staff123", role: "staff", isActive: false },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Check if already seeded
  const existingCategories = await prisma.category.count();
  if (existingCategories > 0) {
    console.log("Database sudah ter-seed. Skip.");
    return;
  }

  // Seed categories
  for (const cat of categories) {
    await prisma.category.create({ data: cat });
  }
  console.log(`✅ ${categories.length} kategori`);

  // Seed users with hashed passwords
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await prisma.user.create({
      data: {
        name: u.name,
        username: u.username,
        passwordHash: hash,
        role: u.role,
        isActive: u.isActive !== false,
      },
    });
  }
  console.log(`✅ ${users.length} users`);

  // Seed items
  for (const item of items) {
    await prisma.item.create({
      data: {
        sku: item.sku,
        name: item.name,
        alias: item.alias,
        categoryId: item.categoryId,
        unit: item.unit,
        buyPrice: item.buyPrice,
        sellPrice: item.sellPrice,
        minStock: item.minStock,
        currentStock: item.currentStock,
      },
    });
  }
  console.log(`✅ ${items.length} items`);

  // Seed some transactions
  const now = new Date();
  const h = (hoursAgo) => new Date(now.getTime() - hoursAgo * 3600000);

  const txData = [
    { type: "IN", refNumber: "NOTA-2025-001", notes: "Restock bulanan dari supplier utama", createdBy: 1, createdAt: h(2), items: [{ itemId: 1, qty: 10, priceAtTime: 65000 }, { itemId: 3, qty: 15, priceAtTime: 28000 }, { itemId: 14, qty: 20, priceAtTime: 22000 }] },
    { type: "OUT", notes: "Servis rutin", createdBy: 3, createdAt: h(3), items: [{ itemId: 1, qty: 1, priceAtTime: 85000, description: "Ganti Oli - Honda Beat DK 4521 XY" }, { itemId: 9, qty: 1, priceAtTime: 20000, description: "Ganti Filter - Honda Beat DK 4521 XY" }] },
    { type: "OUT", notes: "Servis besar", createdBy: 4, createdAt: h(5), items: [{ itemId: 25, qty: 1, priceAtTime: 120000, description: "Ganti V-Belt - Honda Beat B 1234 CD" }, { itemId: 26, qty: 1, priceAtTime: 55000, description: "Ganti Roller - Honda Beat B 1234 CD" }] },
    { type: "OUT", notes: "Ganti ban", createdBy: 3, createdAt: h(8), items: [{ itemId: 18, qty: 2, priceAtTime: 140000, description: "Ganti Ban - Yamaha Mio D 9876 EF" }, { itemId: 20, qty: 2, priceAtTime: 40000, description: "Ganti Ban Dalam - Yamaha Mio D 9876 EF" }] },
    { type: "IN", refNumber: "NOTA-2025-002", notes: "Restok busi dan filter", createdBy: 1, createdAt: h(24), items: [{ itemId: 14, qty: 15, priceAtTime: 22000 }, { itemId: 15, qty: 5, priceAtTime: 55000 }] },
    { type: "OUT", notes: "Servis ringan", createdBy: 3, createdAt: h(26), items: [{ itemId: 14, qty: 1, priceAtTime: 35000, description: "Ganti Busi - Yamaha NMAX AB 2345 GH" }] },
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
  console.log(`✅ ${txData.length} transaksi`);

  console.log("🎉 Seed selesai!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
