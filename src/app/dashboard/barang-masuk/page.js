"use client";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { searchItems, getCategoryName, formatCurrency } from "@/lib/data";

export default function BarangMasukPage() {
  const [refNumber, setRefNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [txItems, setTxItems] = useState([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [preview, setPreview] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (query.length >= 2) { setSuggestions(searchItems(query)); setShowSuggestions(true); }
    else { setSuggestions([]); setShowSuggestions(false); }
  }, [query]);

  const addItem = (item) => {
    if (txItems.find(ti => ti.itemId === item.id)) return;
    setTxItems(prev => [...prev, { itemId: item.id, name: item.name, alias: item.alias, sku: item.sku, unit: item.unit, currentStock: item.currentStock, qty: 1, price: item.buyPrice }]);
    setQuery(""); setShowSuggestions(false);
  };

  const updateItem = (idx, field, value) => {
    setTxItems(prev => prev.map((ti, i) => i === idx ? { ...ti, [field]: parseInt(value) || 0 } : ti));
  };

  const removeItem = (idx) => setTxItems(prev => prev.filter((_, i) => i !== idx));

  const totalValue = txItems.reduce((sum, ti) => sum + ti.qty * ti.price, 0);

  const handleSubmit = () => {
    setPreview(false);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setTxItems([]); setRefNumber(""); setNotes(""); }, 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Success toast */}
      {success && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl border bg-success/15 border-success/30 text-success text-sm font-medium animate-in slide-in-from-right flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Transaksi barang masuk berhasil disimpan!
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center"><svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></span>
          Barang Masuk
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Catat barang yang masuk ke gudang</p>
      </div>

      {/* Ref & Notes */}
      <Card className="border-border/50">
        <CardContent className="p-4 grid sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Nomor Nota / Supplier (opsional)</Label>
            <Input value={refNumber} onChange={e => setRefNumber(e.target.value)} placeholder="Contoh: NOTA-2025-001" />
          </div>
          <div className="grid gap-2">
            <Label>Catatan (opsional)</Label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Contoh: Restock bulanan" />
          </div>
        </CardContent>
      </Card>

      {/* Search & Add Item */}
      <Card className="border-border/50 overflow-visible">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Cari & Tambah Barang</CardTitle>
        </CardHeader>
        <CardContent className="overflow-visible">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <Input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onFocus={() => query.length >= 2 && setShowSuggestions(true)} placeholder="Ketik minimal 2 huruf untuk mencari barang..." className="pl-10" />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
                {suggestions.map(item => (
                  <button key={item.id} onClick={() => addItem(item)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors cursor-pointer text-left border-b border-border/30 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.sku} • {getCategoryName(item.categoryId)}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={item.currentStock <= item.minStock ? "destructive" : "secondary"} className="text-xs">
                        Stok: {item.currentStock} {item.unit}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {showSuggestions && query.length >= 2 && suggestions.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-xl z-20 p-4 text-center text-sm text-muted-foreground">Barang tidak ditemukan</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Item List */}
      {txItems.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Daftar Barang ({txItems.length} item)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {txItems.map((ti, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-accent/30 rounded-lg border border-border/30">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{ti.name}</p>
                  <p className="text-xs text-muted-foreground">{ti.sku} • Stok saat ini: {ti.currentStock} {ti.unit}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="grid gap-1">
                    <Label className="text-xs">Jumlah</Label>
                    <Input type="number" inputMode="numeric" min="1" value={ti.qty} onChange={e => updateItem(idx, "qty", e.target.value)} className="w-20 h-8 text-center" />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Harga Beli</Label>
                    <Input type="number" inputMode="numeric" value={ti.price} onChange={e => updateItem(idx, "price", e.target.value)} className="w-28 h-8" />
                  </div>
                  <button onClick={() => removeItem(idx)} className="mt-5 p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Nilai</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(totalValue)}</p>
            </div>
            <Button className="w-full h-11 cursor-pointer" onClick={() => setPreview(true)}>Preview & Simpan</Button>
          </CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreview(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Preview Transaksi Masuk</h3>
            {refNumber && <p className="text-sm text-muted-foreground mb-2">Nota: {refNumber}</p>}
            <div className="space-y-2 mb-4">
              {txItems.map((ti, i) => (
                <div key={i} className="flex justify-between text-sm p-2 bg-accent/30 rounded">
                  <span>{ti.name} × {ti.qty}</span>
                  <span className="font-medium">{formatCurrency(ti.qty * ti.price)}</span>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between font-bold mb-4">
              <span>Total</span><span className="text-primary">{formatCurrency(totalValue)}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 cursor-pointer" onClick={() => setPreview(false)}>Kembali</Button>
              <Button className="flex-1 cursor-pointer" onClick={handleSubmit}>Konfirmasi Simpan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
