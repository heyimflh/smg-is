import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Dashboard | SMG-IS",
  description: "Dashboard sistem inventaris Surya Motor Group",
};

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
