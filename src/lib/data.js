// ============================================================
// SMG-IS v2.0 — API Client
// Connects frontend to Next.js API routes
// ============================================================

export const api = {
  auth: {
    async login(username, password) {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
    async logout() {
      await fetch("/api/auth/logout", { method: "POST" });
    },
    async me() {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return null;
      return (await res.json()).user;
    }
  },

  categories: {
    async list() {
      const res = await fetch("/api/categories");
      if (!res.ok) return [];
      return (await res.json()).categories;
    }
  },

  items: {
    async list(params = {}) {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`/api/items?${query}`);
      if (!res.ok) return [];
      return (await res.json()).items;
    },
    async search(q) {
      if (!q || q.length < 2) return [];
      const res = await fetch(`/api/items/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return [];
      return (await res.json()).items;
    },
    async get(id) {
      const res = await fetch(`/api/items/${id}`);
      if (!res.ok) return null;
      return (await res.json()).item;
    },
    async create(data) {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
    async import(data) {
      const res = await fetch("/api/items/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
    async update(id, data) {
      const res = await fetch(`/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
    async delete(id) {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      return true;
    }
  },

  transactions: {
    async list(params = {}) {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`/api/transactions?${query}`);
      if (!res.ok) return [];
      return (await res.json()).transactions;
    },
    async create(data) {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    }
  },

  reports: {
    async get(startDate, endDate) {
      const query = new URLSearchParams();
      if (startDate) query.append("startDate", startDate);
      if (endDate) query.append("endDate", endDate);
      const res = await fetch(`/api/reports?${query.toString()}`);
      if (!res.ok) throw new Error("Gagal mengambil laporan");
      return res.json();
    }
  },

  dashboard: {
    async stats() {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) return null;
      return res.json();
    },
    async activity() {
      const res = await fetch("/api/dashboard/activity");
      if (!res.ok) return [];
      return (await res.json()).activity;
    },
    async topUsage() {
      const res = await fetch("/api/dashboard/top-usage");
      if (!res.ok) return [];
      return (await res.json()).topItems;
    }
  },

  users: {
    async list() {
      const res = await fetch("/api/users");
      if (!res.ok) return [];
      return (await res.json()).users;
    },
    async create(data) {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
    async update(id, data) {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
    async delete(id) {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      return true;
    }
  }
};

// Utilities
export const units = ["Pcs", "Liter", "Set", "Box", "Lusin"];
export const adjustReasons = ["Rusak", "Hilang", "Salah Hitung", "Lainnya"];

export function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

export function formatDate(dateStr) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(dateStr));
}
