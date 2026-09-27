import { Sidebar } from "@/components/dashboard/sidebar";
export default function DashboardLayout({ children }: { children: React.ReactNode }) { return <div className="shell"><Sidebar/><main className="content">{children}</main></div>; }
