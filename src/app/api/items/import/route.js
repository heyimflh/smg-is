import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req) {
  const user = await requireAuth(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const data = await req.json();
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "Data kosong atau tidak valid" }, { status: 400 });
    }

    // Process categories
    const categoriesToCreate = new Set();
    data.forEach(item => {
      const catName = item.categoryName ? item.categoryName.trim() : "Lainnya";
      categoriesToCreate.add(catName);
    });

    // Ensure categories exist
    const categoryMap = {};
    for (const catName of categoriesToCreate) {
      // Find existing category ignoring case
      // Note: SQLite string comparison is case-sensitive by default, so we check using js or raw if needed, but since we create it exactly as typed, it's ok. We'll search exactly first.
      let cat = await prisma.category.findUnique({
        where: { name: catName }
      });

      if (!cat) {
        // Fallback: try case insensitive
        const allCats = await prisma.category.findMany();
        cat = allCats.find(c => c.name.toLowerCase() === catName.toLowerCase());
        
        if (!cat) {
          cat = await prisma.category.create({
            data: { name: catName }
          });
        }
      }
      categoryMap[catName.toLowerCase()] = cat.id;
    }

    // Build item records
    const itemRecords = data.map((item, index) => {
      const catName = item.categoryName ? item.categoryName.trim() : "Lainnya";
      const catId = categoryMap[catName.toLowerCase()];
      
      const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
      // To prevent SKU collisions within the same batch, append index
      const sku = `SMG-${catId}-${randomStr}${index}`;

      return {
        sku,
        name: item.name,
        alias: item.alias || null,
        categoryId: catId,
        unit: item.unit || "Pcs",
        buyPrice: parseInt(item.buyPrice) || 0,
        sellPrice: parseInt(item.sellPrice) || 0,
        minStock: parseInt(item.minStock) || 2,
        currentStock: parseInt(item.currentStock) || 0,
        isActive: true
      };
    });

    // Bulk insert items
    const result = await prisma.item.createMany({
      data: itemRecords,
      skipDuplicates: true
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    console.error("Bulk Import Error:", error);
    return NextResponse.json({ error: "Gagal mengimport data: " + error.message }, { status: 500 });
  }
}
