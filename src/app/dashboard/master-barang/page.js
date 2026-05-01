"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { items as allItems, categories, units, getCategoryName, formatCurrency, searchItems } from "@/lib/data";

export default function MasterBarangPage() {
  const [itemsList, setItemsList] = useState(allItems.filter(i => i.isActive));
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: "", alias: "", categoryId: "1", unit: "Pcs", buyPrice: "", sellPrice: "", minStock: "2", currentStock: "0" });
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const filtered = itemsList.filter(i => {
    if (catFilter !== "all" && i.categoryId !== parseInt(catFilter)) return false;
    if (search.length >= 2) {
      const q = search.toLowerCase();
      return i.name.toLowerCase().includes(q) || (i.alias || "").toLowerCase().includes(q) || i.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: "", alias: "", categoryId: "1", unit: "Pcs", buyPrice: "", sellPrice: "", minStock: "2", currentStock: "0" });
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, alias: item.alias || "", categoryId: String(item.categoryId), unit: item.unit, buyPrice: String(item.buyPrice), sellPrice: String(item.sellPrice), minStock: String(item.minStock), currentStock: String(item.currentStock) });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.buyPrice || !form.sellPrice) return;
    if (editItem) {
      setItemsList(prev => prev.map(i => i.id === editItem.id ? { ...i, name: form.name, alias: form.alias, categoryId: parseInt(form.categoryId), unit: form.unit, buyPrice: parseInt(form.buyPrice), sellPrice: parseInt(form.sellPrice), minStock: parseInt(form.minStock), currentStock: parseInt(form.currentStock) } : i));
      showToast("Barang berhasil diperbarui!");
    } else {
      const catCode = { 1: "OLI", 2: "FLT", 3: "BSI", 4: "BAN", 5: "SPR", 6: "AKS", 7: "LNY" };
      const newItem = { id: Date.now(), sku: `SMG-${catCode[form.categoryId] || "LNY"}-${String(itemsList.length + 1).padStart(4, "0")}`, name: form.name, alias: form.alias, categoryId: parseInt(form.categoryId), unit: form.unit, buyPrice: parseInt(form.buyPrice), sellPrice: parseInt(form.sellPrice), minStock: parseInt(form.minStock), currentStock: parseInt(form.currentStock), isActive: true, photoUrl: null };
      setItemsList(prev => [...prev, newItem]);
      showToast("Barang baru berhasil ditambahkan!");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    setItemsList(prev => prev.filter(i => i.id !== deleteDialog.id));
    setDeleteDialog(null);
    showToast("Barang berhasil dinonaktifkan!", "warning");
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl border text-sm font-medium animate-in slide-in-from-right ${toast.type === "success" ? "bg-success/15 border-success/30 text-success" : "bg-warning/15 border-warning/30 text-warning"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Master Barang</h1>
          <p className="text-sm text-muted-foreground">{itemsList.length} barang terdaftar</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Import Excel
          </Button>
          <Button className="gap-2 cursor-pointer" onClick={openAdd}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Tambah Barang
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="Cari nama, alias, atau SKU..." value={search} onChange={e => setSearch(e.target.value)} className="sm:w-72" />
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="sm:w-44"><SelectValue placeholder="Kategori" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground bg-accent/30">
                  <th className="px-4 py-3 text-left font-medium">SKU</th>
                  <th className="px-4 py-3 text-left font-medium">Nama Barang</th>
                  <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Kategori</th>
                  <th className="px-4 py-3 text-right font-medium hidden lg:table-cell">Harga Beli</th>
                  <th className="px-4 py-3 text-right font-medium hidden lg:table-cell">Harga Jual</th>
                  <th className="px-4 py-3 text-center font-medium">Stok</th>
                  <th className="px-4 py-3 text-center font-medium">Status</th>
                  <th className="px-4 py-3 text-center font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id} className={`border-b border-border/30 transition-colors ${item.currentStock <= item.minStock ? "bg-destructive/5" : "hover:bg-accent/50"}`}>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{item.sku}</td>
                    <td className="px-4 py-2.5">
                      <p className="font-medium">{item.name}</p>
                      {item.alias && <p className="text-xs text-muted-foreground">{item.alias}</p>}
                    </td>
                    <td className="px-4 py-2.5 hidden md:table-cell"><Badge variant="secondary" className="text-xs">{getCategoryName(item.categoryId)}</Badge></td>
                    <td className="px-4 py-2.5 text-right hidden lg:table-cell text-muted-foreground">{formatCurrency(item.buyPrice)}</td>
                    <td className="px-4 py-2.5 text-right hidden lg:table-cell">{formatCurrency(item.sellPrice)}</td>
                    <td className="px-4 py-2.5 text-center font-semibold">{item.currentStock} <span className="text-xs text-muted-foreground font-normal">{item.unit}</span></td>
                    <td className="px-4 py-2.5 text-center">
                      {item.currentStock <= item.minStock ? <Badge variant="destructive" className="text-xs">Kritis</Badge>
                        : item.currentStock <= item.minStock * 2 ? <Badge className="bg-warning/20 text-warning border-warning/30 text-xs">Rendah</Badge>
                        : <Badge variant="secondary" className="text-xs">Aman</Badge>}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(item)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={() => setDeleteDialog(item)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">Tidak ada barang ditemukan</p>}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Barang" : "Tambah Barang Baru"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Nama Barang *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Contoh: Oli Shell Helix HX7 1L" />
            </div>
            <div className="grid gap-2">
              <Label>Nama Alias</Label>
              <Input value={form.alias} onChange={e => setForm({ ...form, alias: e.target.value })} placeholder="Contoh: Oli Shell" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Kategori *</Label>
                <Select value={form.categoryId} onValueChange={v => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Satuan *</Label>
                <Select value={form.unit} onValueChange={v => setForm({ ...form, unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Harga Beli *</Label>
                <Input type="number" inputMode="numeric" value={form.buyPrice} onChange={e => setForm({ ...form, buyPrice: e.target.value })} placeholder="0" />
              </div>
              <div className="grid gap-2">
                <Label>Harga Jual *</Label>
                <Input type="number" inputMode="numeric" value={form.sellPrice} onChange={e => setForm({ ...form, sellPrice: e.target.value })} placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Stok Minimum</Label>
                <Input type="number" inputMode="numeric" value={form.minStock} onChange={e => setForm({ ...form, minStock: e.target.value })} />
              </div>
              {!editItem && (
                <div className="grid gap-2">
                  <Label>Stok Awal</Label>
                  <Input type="number" inputMode="numeric" value={form.currentStock} onChange={e => setForm({ ...form, currentStock: e.target.value })} />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">Batal</Button>
            <Button onClick={handleSave} className="cursor-pointer">{editItem ? "Simpan Perubahan" : "Tambah Barang"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nonaktifkan Barang?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Barang <strong>{deleteDialog?.name}</strong> akan dinonaktifkan dan tidak muncul di pencarian. Riwayat transaksi tetap tersimpan.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)} className="cursor-pointer">Batal</Button>
            <Button variant="destructive" onClick={handleDelete} className="cursor-pointer">Nonaktifkan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
