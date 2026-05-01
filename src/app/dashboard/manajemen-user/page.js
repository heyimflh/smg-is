"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { users as initialUsers } from "@/lib/data";

export default function ManajemenUserPage() {
  const [userList, setUserList] = useState(initialUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: "", username: "", role: "staff", password: "" });
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const openAdd = () => {
    setEditUser(null);
    setForm({ name: "", username: "", role: "staff", password: "" });
    setDialogOpen(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({ name: user.name, username: user.username, role: user.role, password: "" });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.username) return;
    if (editUser) {
      setUserList(prev => prev.map(u => u.id === editUser.id ? { ...u, name: form.name, username: form.username, role: form.role } : u));
      showToast("User berhasil diperbarui!");
    } else {
      setUserList(prev => [...prev, { id: Date.now(), name: form.name, username: form.username, role: form.role, isActive: true }]);
      showToast("User baru berhasil ditambahkan!");
    }
    setDialogOpen(false);
  };

  const toggleActive = (userId) => {
    setUserList(prev => prev.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
  };

  const resetPassword = (user) => {
    showToast(`Password ${user.name} berhasil di-reset!`);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl border bg-success/15 border-success/30 text-success text-sm font-medium animate-in slide-in-from-right">
          {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center"><svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg></span>
            Manajemen User
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola akun pengguna sistem (Admin only)</p>
        </div>
        <Button className="gap-2 cursor-pointer" onClick={openAdd}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Tambah User
        </Button>
      </div>

      {/* User Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {userList.map(user => (
          <Card key={user.id} className={`border-border/50 ${!user.isActive ? "opacity-60" : ""}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg ${user.role === "admin" ? "bg-primary/20 text-primary" : "bg-accent text-muted-foreground"}`}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                </div>
                <Badge variant={user.isActive ? "secondary" : "outline"} className="text-xs">{user.isActive ? "Aktif" : "Nonaktif"}</Badge>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Badge className={user.role === "admin" ? "bg-primary/15 text-primary border-primary/30" : "bg-accent text-muted-foreground"}>
                  {user.role === "admin" ? "👑 Admin" : "👷 Staff"}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 cursor-pointer text-xs" onClick={() => openEdit(user)}>Edit</Button>
                <Button variant="outline" size="sm" className="flex-1 cursor-pointer text-xs" onClick={() => resetPassword(user)}>Reset Pass</Button>
                <Button variant={user.isActive ? "outline" : "default"} size="sm" className="cursor-pointer text-xs" onClick={() => toggleActive(user.id)}>
                  {user.isActive ? "Off" : "On"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editUser ? "Edit User" : "Tambah User Baru"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Nama Lengkap *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nama lengkap" />
            </div>
            <div className="grid gap-2">
              <Label>Username *</Label>
              <Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Username untuk login" />
            </div>
            <div className="grid gap-2">
              <Label>Role *</Label>
              <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="staff">Staff Gudang</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!editUser && (
              <div className="grid gap-2">
                <Label>Password *</Label>
                <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password awal" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">Batal</Button>
            <Button onClick={handleSave} className="cursor-pointer">{editUser ? "Simpan" : "Tambah User"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
