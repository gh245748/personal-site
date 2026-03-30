import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-obsidian flex">
      <AdminSidebar />
      <div className="flex-1 overflow-auto lg:pt-0 pt-14">
        {children}
      </div>
    </div>
  );
}
