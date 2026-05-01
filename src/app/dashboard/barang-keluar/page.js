"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { api, formatCurrency } from "@/lib/data";

export default function BarangKeluarPage() {
  const [txItems, setTxItems] = useState([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg] = useState(false);
  const [preview, setPreview] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length >= 2) {
        const results = await api.items.search(query);
        setSuggestions(results || []);
        setShowSugg(true);
      } else {
        setSuggestions([]);
        setShowSugg(false);
      }
    };
    
    const timeoutId = setTimeout(() => fetchSuggestions(), 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const addItem = (item) => {
    if (txItems.find(ti => ti.itemId === item.id)) return;
    setTxItems(prev => [...prev, { itemId: item.id, name: item.name, sku: item.sku, unit: item.unit, currentStock: item.currentStock, minStock: item.minStock, sellPrice: item.sellPrice, qty: 1, description: "" }]);
    setQuery(""); setShowSugg(false);
  };

  const updateItem = (idx, field, value) => {
    setTxItems(prev => prev.map((ti, i) => i === idx ? { ...ti, [field]: field === "qty" ? (parseInt(value) || 0) : value } : ti));
    if (field === "qty") {
      const ti = txItems[idx];
      const newQty = parseInt(value) || 0;
      if (newQty > ti.currentStock) {
        setErrors(prev => ({ ...prev, [idx]: `Stok tidak cukup! Tersedia: ${ti.currentStock}` }));
      } else {
        setErrors(prev => { const n = { ...prev }; delete n[idx]; return n; });
      }
    }
  };

  const removeItem = (idx) => { setTxItems(prev => prev.filter((_, i) => i !== idx)); setErrors(prev => { const n = { ...prev }; delete n[idx]; return n; }); };

  const canSubmit = txItems.length > 0 && txItems.every((ti, i) => ti.qty > 0 && ti.qty <= ti.currentStock && ti.description.trim()) && Object.keys(errors).length === 0;

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.transactions.create({
        type: "OUT",
        notes: "Barang keluar otomatis",
        items: txItems.map(ti => ({
          itemId: ti.itemId,
          qty: ti.qty,
          priceAtTime: ti.sellPrice,
          description: ti.description
        }))
      });
      
      setPreview(false); setSuccess(true);
      window.dispatchEvent(new Event("smg:stock_updated"));
      setTimeout(() => { setSuccess(false); setTxItems([]); setErrors({}); }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {success && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl border bg-success/15 border-success/30 text-success text-sm font-medium animate-in slide-in-from-right flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Transaksi barang keluar berhasil disimpan!
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl border bg-destructive/15 border-destructive/30 text-destructive text-sm font-medium animate-in slide-in-from-right flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Gagal: {error}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-destructive/15 flex items-center justify-center"><svg className="w-4 h-4 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg></span>
          Barang Keluar
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Catat barang yang digunakan untuk servis</p>
      </div>

      {/* Search */}
      <Card className="border-border/50 overflow-visible">
        <CardHeader className="pb-3"><CardTitle className="text-base">Cari & Tambah Barang</CardTitle></CardHeader>
        <CardContent className="overflow-visible">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <Input value={query} onChange={e => setQuery(e.target.value)} onFocus={() => query.length >= 2 && setShowSugg(true)} placeholder="Ketik minimal 2 huruf untuk mencari barang..." className="pl-10" />
            {showSugg && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
                {suggestions.map(item => (
                  <button key={item.id} onClick={() => addItem(item)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors cursor-pointer text-left border-b border-border/30 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.sku} • {item.category?.name || 'Lainnya'}</p>
                    </div>
                    <Badge variant={item.currentStock <= item.minStock ? "destructive" : "secondary"} className="text-xs">
                      {item.currentStock <= item.minStock && "⚠️ "}Stok: {item.currentStock} {item.unit}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Item List */}
      {txItems.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-base">Daftar Barang Keluar ({txItems.length} item)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {txItems.map((ti, idx) => (
              <div key={idx} className={`p-4 rounded-lg border ${errors[idx] ? "border-destructive/50 bg-destructive/5" : "border-border/30 bg-accent/30"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-sm">{ti.name}</p>
                    <p className="text-xs text-muted-foreground">{ti.sku} • Tersedia: <span className={ti.currentStock <= ti.minStock ? "text-destructive font-semibold" : ""}>{ti.currentStock} {ti.unit}</span></p>
                  </div>
                  <button onClick={() => removeItem(idx)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="grid gap-1">
                    <Label className="text-xs">Jumlah *</Label>
                    <Input type="number" inputMode="numeric" min="1" max={ti.currentStock} value={ti.qty} onChange={e => updateItem(idx, "qty", e.target.value)} className="h-9" />
                    {errors[idx] && <p className="text-xs text-destructive">{errors[idx]}</p>}
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Keterangan Penggunaan *</Label>
                    <Input value={ti.description} onChange={e => updateItem(idx, "description", e.target.value)} placeholder="Contoh: Ganti Oli – Motor Vario DK 4521 XY" className="h-9" />
                    {!ti.description.trim() && <p className="text-xs text-warning">Wajib diisi</p>}
                  </div>
                </div>
              </div>
            ))}
            <Separator />
            <Button className="w-full h-11 cursor-pointer" disabled={!canSubmit} onClick={() => setPreview(true)}>Preview & Simpan</Button>
            {!canSubmit && txItems.length > 0 && <p className="text-xs text-muted-foreground text-center">Pastikan semua jumlah valid dan keterangan terisi</p>}
          </CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreview(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Preview Transaksi Keluar</h3>
            <div className="space-y-2 mb-4">
              {txItems.map((ti, i) => (
                <div key={i} className="p-3 bg-accent/30 rounded-lg">
                  <div className="flex justify-between text-sm font-medium"><span>{ti.name} × {ti.qty}</span><span>{formatCurrency(ti.qty * ti.sellPrice)}</span></div>
                  <p className="text-xs text-muted-foreground mt-1">{ti.description}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 cursor-pointer" onClick={() => setPreview(false)} disabled={loading}>Kembali</Button>
              <Button className="flex-1 cursor-pointer" onClick={handleSubmit} disabled={loading}>
                {loading ? "Menyimpan..." : "Konfirmasi Simpan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
