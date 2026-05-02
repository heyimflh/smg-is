"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { api, formatCurrency, formatDate } from "@/lib/data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from "recharts";
import { format, subDays } from "date-fns";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/80 backdrop-blur-md border border-border/50 shadow-2xl rounded-xl p-4 min-w-[160px] animate-in zoom-in-95 duration-200">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full bg-primary" />
          <p className="text-3xl font-bold text-foreground">
            {payload[0].value} <span className="text-sm font-normal text-muted-foreground">unit</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function LaporanPage() {
  // Default to last 30 days
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  async function fetchReport() {
    setLoading(true);
    try {
      const res = await api.reports.get(startDate, endDate);
      setData(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const exportExcel = () => {
    if (!data) return;
    
    // Flat mapping the transactions for table view
    const exportData = [];
    data.transactions.forEach(tx => {
      tx.items.forEach(ti => {
        exportData.push({
          "Tanggal": formatDate(tx.createdAt),
          "Tipe": tx.type === "IN" ? "Masuk" : tx.type === "OUT" ? "Keluar" : "Koreksi",
          "Nomor Referensi": tx.refNumber || "-",
          "Barang": ti.item?.name || "Unknown",
          "Kategori": ti.item?.category?.name || "-",
          "Qty": ti.qty,
          "Harga/Unit": ti.priceAtTime,
          "Total": ti.qty * ti.priceAtTime,
          "User": tx.user?.name || "System"
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan_Transaksi");
    XLSX.writeFile(wb, `Laporan_SMG_${startDate}_to_${endDate}.xlsx`);
  };

  const exportPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("Laporan Transaksi SMG-IS", 14, 20);
    doc.setFontSize(10);
    doc.text(`Periode: ${startDate} s/d ${endDate}`, 14, 28);
    
    doc.text(`Total Masuk: ${formatCurrency(data.summary.totalMasuk)}`, 14, 35);
    doc.text(`Total Keluar: ${formatCurrency(data.summary.totalKeluar)}`, 14, 40);
    doc.text(`Nilai Stok Saat Ini: ${formatCurrency(data.summary.currentStockValue)}`, 14, 45);

    const tableData = [];
    data.transactions.forEach(tx => {
      tx.items.forEach(ti => {
        tableData.push([
          formatDate(tx.createdAt).split(" ")[0], // Date only
          tx.type,
          ti.item?.name || "Unknown",
          String(ti.qty),
          formatCurrency(ti.priceAtTime),
          formatCurrency(ti.qty * ti.priceAtTime)
        ]);
      });
    });

    autoTable(doc, {
      startY: 50,
      head: [["Tanggal", "Tipe", "Barang", "Qty", "Harga", "Total"]],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 }
    });

    doc.save(`Laporan_SMG_${startDate}_to_${endDate}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </span>
            Laporan & Grafik
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Ringkasan transaksi dan nilai inventaris bengkel</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 cursor-pointer" onClick={exportPDF} disabled={loading || !data}>
            <svg className="w-4 h-4 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            Export PDF
          </Button>
          <Button variant="outline" className="gap-2 cursor-pointer" onClick={exportExcel} disabled={loading || !data}>
            <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filter Card */}
      <Card className="border-border/50">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-end">
          <div className="grid gap-1.5 flex-1">
            <Label>Tanggal Mulai</Label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="grid gap-1.5 flex-1">
            <Label>Tanggal Akhir</Label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <Button onClick={fetchReport} className="w-full sm:w-auto cursor-pointer" disabled={loading}>
            {loading ? "Memproses..." : "Terapkan Filter"}
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-success/20 bg-success/5">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-success mb-1">Total Pembelian (Masuk)</p>
                    <h3 className="text-2xl font-bold text-success">{formatCurrency(data.summary.totalMasuk)}</h3>
                  </div>
                  <div className="p-2 bg-success/20 rounded-lg text-success"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-destructive mb-1">Total Pemakaian (Keluar)</p>
                    <h3 className="text-2xl font-bold text-destructive">{formatCurrency(data.summary.totalKeluar)}</h3>
                  </div>
                  <div className="p-2 bg-destructive/20 rounded-lg text-destructive"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg></div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-primary mb-1">Total Nilai Stok (Saat Ini)</p>
                    <h3 className="text-2xl font-bold text-primary">{formatCurrency(data.summary.currentStockValue)}</h3>
                  </div>
                  <div className="p-2 bg-primary/20 rounded-lg text-primary"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chart */}
            <Card className="lg:col-span-1 border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Grafik Pemakaian Barang</CardTitle>
                <CardDescription>Top 5 barang paling sering keluar</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {data.topUsage.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.topUsage} layout="vertical" margin={{ top: 20, right: 60, left: 10, bottom: 5 }} barSize={36}>
                      <defs>
                        <linearGradient id="colorQty" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.7}/>
                          <stop offset="100%" stopColor="var(--primary)" stopOpacity={1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.4} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={110} axisLine={false} tickLine={false} stroke="var(--foreground)" fontSize={12} tickFormatter={(val) => val.length > 15 ? val.substring(0,15)+'...' : val} />
                      <Tooltip 
                        content={<CustomTooltip />}
                        cursor={{fill: 'var(--accent)', opacity: 0.6, radius: 8}} 
                        offset={40}
                      />
                      <Bar dataKey="qty" fill="url(#colorQty)" radius={[0, 8, 8, 0]} animationDuration={1500} animationEasing="ease-out">
                        <LabelList dataKey="qty" position="right" style={{ fill: 'var(--foreground)', fontSize: '13px', fontWeight: 'bold' }} formatter={(val) => `${val} unit`} />
                        {data.topUsage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#colorQty)`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Belum ada pemakaian</div>
                )}
              </CardContent>
            </Card>

            {/* Table */}
            <Card className="lg:col-span-2 border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Rincian Transaksi</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto h-[300px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-accent/90 backdrop-blur z-10 shadow-sm">
                      <tr className="border-b border-border/50 text-muted-foreground">
                        <th className="px-4 py-3 text-left font-medium">Tanggal</th>
                        <th className="px-4 py-3 text-left font-medium">Tipe</th>
                        <th className="px-4 py-3 text-left font-medium">Barang</th>
                        <th className="px-4 py-3 text-center font-medium">Qty</th>
                        <th className="px-4 py-3 text-right font-medium">Total (Rp)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.transactions.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-8 text-muted-foreground">Tidak ada transaksi pada periode ini</td></tr>
                      ) : (
                        data.transactions.flatMap(tx => 
                          tx.items.map(ti => (
                            <tr key={`${tx.id}-${ti.id}`} className="border-b border-border/30 hover:bg-accent/50">
                              <td className="px-4 py-2 text-xs text-muted-foreground">{formatDate(tx.createdAt)}</td>
                              <td className="px-4 py-2">
                                <Badge variant={tx.type === "IN" ? "success" : tx.type === "OUT" ? "destructive" : "secondary"} className="text-[10px] px-1.5">
                                  {tx.type}
                                </Badge>
                              </td>
                              <td className="px-4 py-2 font-medium">{ti.item?.name || "Unknown"}</td>
                              <td className="px-4 py-2 text-center font-semibold">{ti.qty}</td>
                              <td className="px-4 py-2 text-right">{formatCurrency(ti.qty * ti.priceAtTime)}</td>
                            </tr>
                          ))
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
