import { Sidebar } from "@/features/common/components/Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <>
      <Sidebar />
      <div className="flex flex-col bg-neutral-950 h-screen items-center">
        <div className="flex flex-col w-[640px] items-center justify-center">{children}</div>
      </div>
    </>
  );
};

export default DashboardLayout;
