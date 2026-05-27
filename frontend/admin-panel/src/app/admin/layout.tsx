import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import AdminMetadataUpdater from "@/components/common/AdminMetadataUpdater";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-900">
      <AdminMetadataUpdater />
      <div className="hidden md:block h-full shrink-0 shadow-lg z-20">
        <Sidebar />
      </div>
      
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
