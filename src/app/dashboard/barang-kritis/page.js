"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/data";

export default function BarangKritisPage() {
  const [catFilter, setCatFilter] = useState("all");
  const [sortCol, setSortCol] = useState("deficit");
  const [sortDir, setSortDir] = useState("desc");
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [it, ct] = await Promise.all([
          api.items.list(),
          api.categories.list()
        ]);
        setItems(it || []);
        if (categories.length === 0) setCategories(ct || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getCategoryName = (id) => categories.find(c => c.id === id)?.name || "Lainnya";

  const kritisItems = items.filter(i => i.isActive && i.currentStock <= i.minStock * 2).map(i => ({ ...i, deficit: i.minStock - i.currentStock, isCritical: i.currentStock <= i.minStock }));

  let filtered = kritisItems.filter(i => catFilter === "all" || i.categoryId === parseInt(catFilter));

  filtered.sort((a, b) => {
    let va, vb;
    if (sortCol === "deficit") { va = a.deficit; vb = b.deficit; }
    else if (sortCol === "stock") { va = a.currentStock; vb = b.currentStock; }
    else { va = a.name; vb = b.name; }
    if (typeof va === "string") return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    return sortDir === "asc" ? va - vb : vb - va;
  });

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
  };

  const criticalCount = kritisItems.filter(i => i.isCritical).length;
  const warningCount = kritisItems.filter(i => !i.isCritical).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-destructive/15 flex items-center justify-center"><svg className="w-4 h-4 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
          Barang Kritis
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Barang yang perlu segera di-restock</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-destructive">{criticalCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Stok Kritis (≤ minimum)</p>
          </CardContent>
        </Card>
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-warning">{warningCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Peringatan Dini (≤ 2× minimum)</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Select value={catFilter} onValueChange={setCatFilter}>
        <SelectTrigger className="w-44"><SelectValue placeholder="Kategori" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Kategori</SelectItem>
          {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
        </SelectContent>
      </Select>

      {/* Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground bg-accent/30">
                  <th className="px-4 py-3 text-left font-medium cursor-pointer" onClick={() => toggleSort("name")}>Nama Barang</th>
                  <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Kategori</th>
                  <th className="px-4 py-3 text-center font-medium cursor-pointer" onClick={() => toggleSort("stock")}>Stok Saat Ini</th>
                  <th className="px-4 py-3 text-center font-medium">Stok Minimum</th>
                  <th className="px-4 py-3 text-center font-medium cursor-pointer" onClick={() => toggleSort("deficit")}>Kekurangan</th>
                  <th className="px-4 py-3 text-center font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-8"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></td></tr>
                ) : filtered.map(item => (
                  <tr key={item.id} className={`border-b border-border/30 transition-colors ${item.isCritical ? "bg-destructive/8" : "bg-warning/5"}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.sku}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell"><Badge variant="secondary" className="text-xs">{getCategoryName(item.categoryId)}</Badge></td>
                    <td className="px-4 py-3 text-center font-bold text-lg">{item.currentStock} <span className="text-xs font-normal text-muted-foreground">{item.unit}</span></td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{item.minStock}</td>
                    <td className="px-4 py-3 text-center">
                      {item.deficit > 0 ? <span className="text-destructive font-bold">-{item.deficit}</span> : <span className="text-warning">~{Math.abs(item.deficit)}</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.isCritical ? <Badge variant="destructive" className="animate-pulse-soft">⚠️ Kritis</Badge> : <Badge className="bg-warning/20 text-warning border-warning/30">Rendah</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">✅ Tidak ada barang kritis saat ini</p>}
        </CardContent>
      </Card>
    </div>
  );
}
