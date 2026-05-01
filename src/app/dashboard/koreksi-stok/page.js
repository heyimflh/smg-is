"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { api, adjustReasons, formatDate } from "@/lib/data";

export default function KoreksiStokPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg] = useState(false);
  const [newStock, setNewStock] = useState("");
  const [reason, setReason] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    setLogsLoading(true);
    try {
      const txs = await api.transactions.list({ type: 'ADJUST' });
      // Flatten the transaction items to show in the log
      const formattedLogs = [];
      txs.forEach(tx => {
        tx.items.forEach(item => {
          formattedLogs.push({
            id: `${tx.id}-${item.id}`,
            itemName: item.item?.name || 'Unknown Item',
            oldStock: '?', // We only have the difference in qty for adjustments in this schema design, not the historical stock before adj. Wait, we can calculate it or just hide it. Let's show difference instead of old/new stock.
            stockChange: item.qty,
            reason: tx.notes || item.description || '-',
            user: tx.user?.name || 'System',
            date: tx.createdAt
          });
        });
      });
      setLogs(formattedLogs);
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  }

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

  const selectItem = (item) => {
    setSelectedItem(item);
    setNewStock(String(item.currentStock));
    setQuery(""); setShowSugg(false);
  };

  const diff = selectedItem ? parseInt(newStock || 0) - selectedItem.currentStock : 0;

  const handleSubmit = async () => {
    if (!selectedItem || !reason || newStock === "") return;
    setLoading(true);
    setError(null);
    try {
      await api.transactions.create({
        type: "ADJUST",
        notes: reason,
        items: [{
          itemId: selectedItem.id,
          qty: diff, // The backend will increment stock by this qty (which can be negative)
          priceAtTime: selectedItem.buyPrice,
          description: reason
        }]
      });
      
      setSuccess(true); setSelectedItem(null); setNewStock(""); setReason("");
      loadLogs();
      window.dispatchEvent(new Event("smg:stock_updated"));
      setTimeout(() => setSuccess(false), 3000);
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
          Koreksi stok berhasil disimpan!
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
          <span className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center"><svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></span>
          Koreksi Stok
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Penyesuaian stok untuk hasil stock opname (Admin only)</p>
      </div>

      {/* Search */}
      <Card className="border-border/50 overflow-visible">
        <CardHeader className="pb-3"><CardTitle className="text-base">Pilih Barang</CardTitle></CardHeader>
        <CardContent className="overflow-visible">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <Input value={query} onChange={e => setQuery(e.target.value)} onFocus={() => query.length >= 2 && setShowSugg(true)} placeholder="Cari barang yang akan dikoreksi..." className="pl-10" />
            {showSugg && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
                {suggestions.map(item => (
                  <button key={item.id} onClick={() => selectItem(item)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors cursor-pointer text-left border-b border-border/30 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.sku}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">Stok: {item.currentStock} {item.unit}</Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Adjustment Form */}
      {selectedItem && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3"><CardTitle className="text-base">Koreksi: {selectedItem.name}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center p-4 bg-accent/30 rounded-lg">
              <div><p className="text-xs text-muted-foreground">Stok Saat Ini</p><p className="text-2xl font-bold">{selectedItem.currentStock}</p></div>
              <div><p className="text-xs text-muted-foreground">Perubahan</p><p className={`text-2xl font-bold ${diff > 0 ? "text-success" : diff < 0 ? "text-destructive" : ""}`}>{diff > 0 ? `+${diff}` : diff}</p></div>
              <div><p className="text-xs text-muted-foreground">Stok Baru</p><p className="text-2xl font-bold text-primary">{newStock || 0}</p></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Jumlah Stok Baru (Hasil Opname) *</Label>
                <Input type="number" inputMode="numeric" min="0" value={newStock} onChange={e => setNewStock(e.target.value)} className="h-11" />
              </div>
              <div className="grid gap-2">
                <Label>Alasan Koreksi *</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Pilih alasan..." /></SelectTrigger>
                  <SelectContent>{adjustReasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full h-11 cursor-pointer" disabled={!reason || newStock === "" || loading} onClick={handleSubmit}>
              {loading ? "Menyimpan..." : "Simpan Koreksi"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Audit Log */}
      <Card className="border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-base">Log Koreksi Stok</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground bg-accent/30">
                  <th className="px-4 py-3 text-left font-medium">Barang</th>
                  <th className="px-4 py-3 text-center font-medium">Perubahan</th>
                  <th className="px-4 py-3 text-left font-medium">Alasan</th>
                  <th className="px-4 py-3 text-left font-medium hidden md:table-cell">User</th>
                  <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {logsLoading ? (
                  <tr><td colSpan="5" className="text-center py-8"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></td></tr>
                ) : logs.map(log => (
                  <tr key={log.id} className="border-b border-border/30 hover:bg-accent/50">
                    <td className="px-4 py-2.5 font-medium">{log.itemName}</td>
                    <td className={`px-4 py-2.5 text-center font-semibold ${log.stockChange > 0 ? 'text-success' : log.stockChange < 0 ? 'text-destructive' : ''}`}>
                      {log.stockChange > 0 ? `+${log.stockChange}` : log.stockChange}
                    </td>
                    <td className="px-4 py-2.5"><Badge variant="secondary" className="text-xs">{log.reason}</Badge></td>
                    <td className="px-4 py-2.5 hidden md:table-cell text-muted-foreground">{log.user}</td>
                    <td className="px-4 py-2.5 hidden md:table-cell text-muted-foreground text-xs">{formatDate(log.date)}</td>
                  </tr>
                ))}
                {!logsLoading && logs.length === 0 && (
                  <tr><td colSpan="5" className="text-center py-8 text-muted-foreground">Belum ada riwayat koreksi stok</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
