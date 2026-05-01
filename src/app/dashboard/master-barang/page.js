"use client";
import * as XLSX from "xlsx";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, units, formatCurrency } from "@/lib/data";

export default function MasterBarangPage() {
  const [itemsList, setItemsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: "", alias: "", categoryId: "1", unit: "Pcs", buyPrice: "", sellPrice: "", minStock: "2", currentStock: "0" });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Import states
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadData();
  }, [catFilter]);

  async function loadData() {
    setLoading(true);
    try {
      const [it, ct] = await Promise.all([
        api.items.list(catFilter !== "all" ? { category: catFilter } : {}),
        api.categories.list()
      ]);
      setItemsList(it || []);
      if (categories.length === 0) setCategories(ct || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const getCategoryName = (id) => categories.find(c => c.id === id)?.name || "Lainnya";

  const filtered = itemsList.filter(i => {
    if (search.length >= 2) {
      const q = search.toLowerCase();
      return i.name.toLowerCase().includes(q) || (i.alias || "").toLowerCase().includes(q) || i.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: "", alias: "", categoryId: categories[0]?.id.toString() || "1", unit: "Pcs", buyPrice: "", sellPrice: "", minStock: "2", currentStock: "0" });
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, alias: item.alias || "", categoryId: String(item.categoryId), unit: item.unit, buyPrice: String(item.buyPrice), sellPrice: String(item.sellPrice), minStock: String(item.minStock), currentStock: String(item.currentStock) });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.buyPrice || !form.sellPrice) return;
    try {
      if (editItem) {
        await api.items.update(editItem.id, form);
        showToast("Barang berhasil diperbarui!");
      } else {
        await api.items.create(form);
        showToast("Barang baru berhasil ditambahkan!");
      }
      setDialogOpen(false);
      loadData();
      window.dispatchEvent(new Event("smg:stock_updated"));
    } catch (err) {
      showToast(err.message, "warning");
    }
  };

  const handleDelete = async () => {
    try {
      await api.items.delete(deleteDialog.id);
      setDeleteDialog(null);
      showToast("Barang berhasil dinonaktifkan!", "warning");
      loadData();
      window.dispatchEvent(new Event("smg:stock_updated"));
    } catch (err) {
      showToast(err.message, "warning");
    }
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { name: "Oli Mesin Matic", alias: "Oli Matic", categoryName: "Oli", unit: "Pcs", buyPrice: 40000, sellPrice: 50000, minStock: 5, currentStock: 20 }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Barang");
    XLSX.writeFile(wb, "Template_Import_Barang.xlsx");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (data.length > 0) {
          setImportData(data);
        } else {
          showToast("File Excel kosong", "warning");
        }
      } catch (err) {
        showToast("Gagal membaca file Excel", "warning");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImportSubmit = async () => {
    if (importData.length === 0) return;
    setImporting(true);
    try {
      const res = await api.items.import(importData);
      showToast(`Berhasil mengimport ${res.count} barang!`);
      setImportDialogOpen(false);
      setImportData([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadData();
      window.dispatchEvent(new Event("smg:stock_updated"));
    } catch (err) {
      showToast(err.message, "warning");
    } finally {
      setImporting(false);
    }
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
          <Button variant="outline" size="sm" className="gap-2 cursor-pointer" onClick={() => setImportDialogOpen(true)}>
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
                {loading ? (
                  <tr><td colSpan="8" className="text-center py-8"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></td></tr>
                ) : filtered.map(item => (
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
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan="8" className="text-center py-8 text-muted-foreground">Tidak ada barang ditemukan</td></tr>
                )}
              </tbody>
            </table>
          </div>
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

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Excel Master Barang</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="bg-accent/30 p-3 rounded-lg border border-border/50 text-sm">
              <p className="font-medium mb-1">Langkah-langkah:</p>
              <ol className="list-decimal pl-4 space-y-1 text-muted-foreground">
                <li>Download template Excel.</li>
                <li>Isi data barang sesuai format template. <br/>(Kolom: <strong>name, alias, categoryName, unit, buyPrice, sellPrice, minStock, currentStock</strong>)</li>
                <li>Upload kembali file yang sudah diisi.</li>
              </ol>
            </div>
            
            <Button variant="outline" className="w-full cursor-pointer" onClick={handleDownloadTemplate}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download Template Excel
            </Button>

            <div className="grid gap-2 mt-4">
              <Label>Upload File Excel (.xlsx)</Label>
              <Input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} ref={fileInputRef} className="cursor-pointer" />
            </div>

            {importData.length > 0 && (
              <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm flex items-center justify-between">
                <span>Ditemukan <strong>{importData.length}</strong> barang siap import.</span>
                <Button size="sm" variant="ghost" onClick={() => { setImportData([]); if(fileInputRef.current) fileInputRef.current.value = ""; }} className="h-6 px-2 text-xs cursor-pointer">Reset</Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setImportDialogOpen(false); setImportData([]); if(fileInputRef.current) fileInputRef.current.value = ""; }} className="cursor-pointer" disabled={importing}>Batal</Button>
            <Button onClick={handleImportSubmit} className="cursor-pointer" disabled={importing || importData.length === 0}>
              {importing ? "Mengimport..." : "Import Data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
