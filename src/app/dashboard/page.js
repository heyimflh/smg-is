"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, formatCurrency, formatDate } from "@/lib/data";

export default function DashboardPage() {
  const router = useRouter();
  const [catFilter, setCatFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  const [stats, setStats] = useState({ totalItems: 0, totalValue: 0, lowStockCount: 0, todayTransactionsCount: 0 });
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activity, setActivity] = useState([]);
  const [top5, setTop5] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [st, it, ct, ac, t5] = await Promise.all([
          api.dashboard.stats(),
          api.items.list(),
          api.categories.list(),
          api.dashboard.activity(),
          api.dashboard.topUsage()
        ]);
        if (st) setStats(st);
        if (it) setItems(it);
        if (ct) setCategories(ct);
        if (ac) setActivity(ac);
        if (t5) setTop5(t5);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getCategoryName = (id) => categories.find(c => c.id === id)?.name || "Lainnya";

  // Filter & sort items
  let filtered = items.filter(i => {
    if (catFilter !== "all" && i.categoryId !== parseInt(catFilter)) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase()) && !(i.alias || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  filtered.sort((a, b) => {
    let va, vb;
    if (sortCol === "name") { va = a.name; vb = b.name; }
    else if (sortCol === "stock") { va = a.currentStock; vb = b.currentStock; }
    else if (sortCol === "category") { va = getCategoryName(a.categoryId); vb = getCategoryName(b.categoryId); }
    else { va = a.name; vb = b.name; }
    if (typeof va === "string") return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    return sortDir === "asc" ? va - vb : vb - va;
  });

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const SortIcon = ({ col }) => sortCol === col ? (
    <svg className="w-3 h-3 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDir === "asc" ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} /></svg>
  ) : null;

  const maxQty = Math.max(...top5.map(t => t.qty), 1);

  const getRowClass = (item) => {
    if (item.currentStock <= item.minStock) return "bg-destructive/8 hover:bg-destructive/12";
    if (item.currentStock <= item.minStock * 2) return "bg-warning/8 hover:bg-warning/12";
    return "hover:bg-accent/50";
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Low stock alert banner */}
      {stats.lowStockCount > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center justify-between gap-4 animate-pulse-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="font-semibold text-destructive text-sm">⚠️ {stats.lowStockCount} Barang Stok Kritis!</p>
              <p className="text-xs text-muted-foreground">Beberapa barang sudah di bawah stok minimum</p>
            </div>
          </div>
          <Button variant="destructive" size="sm" className="shrink-0 cursor-pointer" onClick={() => router.push("/dashboard/barang-kritis")}>Lihat Detail</Button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button className="bg-success hover:bg-success/90 text-white gap-2 h-11 px-5 cursor-pointer" onClick={() => router.push("/dashboard/barang-masuk")}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Barang Masuk
        </Button>
        <Button className="bg-destructive hover:bg-destructive/90 text-white gap-2 h-11 px-5 cursor-pointer" onClick={() => router.push("/dashboard/barang-keluar")}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
          Barang Keluar
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Barang Aktif", value: stats.totalItems, icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", color: "text-primary" },
          { label: "Total Nilai Stok", value: formatCurrency(stats.totalValue), icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-success" },
          { label: "Stok Kritis", value: stats.lowStockCount, icon: "M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-destructive", alert: stats.lowStockCount > 0 },
          { label: "Transaksi Hari Ini", value: stats.todayTransactionsCount, icon: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "text-blue-400" },
        ].map((stat, i) => (
          <Card key={i} className={`border-border/50 ${stat.alert ? "border-destructive/30" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                  <p className={`text-xl md:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`w-9 h-9 rounded-lg bg-accent flex items-center justify-center ${stat.color}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} /></svg>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Stock Table */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-lg">Stok Semua Barang</CardTitle>
              <div className="flex gap-2">
                <Input placeholder="Cari barang..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 w-40" />
                <Select value={catFilter} onValueChange={setCatFilter}>
                  <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Kategori" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-border/50 text-muted-foreground">
                    <th className="px-4 py-2 text-left font-medium">No</th>
                    <th className="px-4 py-2 text-left font-medium cursor-pointer select-none" onClick={() => toggleSort("name")}>Nama Barang<SortIcon col="name" /></th>
                    <th className="px-4 py-2 text-left font-medium cursor-pointer select-none hidden md:table-cell" onClick={() => toggleSort("category")}>Kategori<SortIcon col="category" /></th>
                    <th className="px-4 py-2 text-center font-medium cursor-pointer select-none" onClick={() => toggleSort("stock")}>Stok<SortIcon col="stock" /></th>
                    <th className="px-4 py-2 text-left font-medium hidden sm:table-cell">Satuan</th>
                    <th className="px-4 py-2 text-center font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 15).map((item, idx) => (
                    <tr key={item.id} className={`border-b border-border/30 transition-colors ${getRowClass(item)}`}>
                      <td className="px-4 py-2 text-muted-foreground">{idx + 1}</td>
                      <td className="px-4 py-2 font-medium">{item.name}</td>
                      <td className="px-4 py-2 hidden md:table-cell"><Badge variant="secondary" className="text-xs">{getCategoryName(item.categoryId)}</Badge></td>
                      <td className="px-4 py-2 text-center font-semibold">{item.currentStock}</td>
                      <td className="px-4 py-2 text-muted-foreground hidden sm:table-cell">{item.unit}</td>
                      <td className="px-4 py-2 text-center">
                        {item.currentStock <= item.minStock ? <Badge variant="destructive" className="text-xs">Kritis</Badge>
                          : item.currentStock <= item.minStock * 2 ? <Badge className="bg-warning/20 text-warning border-warning/30 text-xs">Rendah</Badge>
                          : <Badge variant="secondary" className="text-xs">Aman</Badge>}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-muted-foreground">Tidak ada data ditemukan</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filtered.length > 15 && <p className="text-xs text-muted-foreground text-center py-3">Menampilkan 15 dari {filtered.length} barang. <button className="text-primary underline cursor-pointer" onClick={() => router.push("/dashboard/master-barang")}>Lihat semua</button></p>}
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activity.map(tx => (
                <div key={tx.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tx.type === "IN" ? "bg-success/15 text-success" : tx.type === "OUT" ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={tx.type === "IN" ? "M12 4v16m8-8H4" : tx.type === "OUT" ? "M20 12H4" : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"} />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{tx.type === "IN" ? "Barang Masuk" : tx.type === "OUT" ? "Barang Keluar" : "Koreksi"} ({tx.items.length} item)</p>
                    <p className="text-xs text-muted-foreground truncate">{tx.user?.name || "System"} • {formatDate(tx.createdAt)}</p>
                  </div>
                </div>
              ))}
              {activity.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Belum ada aktivitas</p>}
            </CardContent>
          </Card>

          {/* Bar Chart - Top 5 */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Top 5 Pemakaian</CardTitle>
              <p className="text-xs text-muted-foreground">7 hari terakhir</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {top5.map((entry, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="truncate font-medium">{entry.name}</span>
                    <span className="text-muted-foreground shrink-0 ml-2">{entry.qty}</span>
                  </div>
                  <div className="h-2.5 bg-accent rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-amber-light rounded-full animate-grow-up" style={{ width: `${(entry.qty / maxQty) * 100}%` }} />
                  </div>
                </div>
              ))}
              {top5.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Belum ada data pemakaian</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

