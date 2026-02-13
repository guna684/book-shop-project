import Header from './Header';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
    return (
        <div className="min-h-screen bg-secondary/20 flex flex-col font-sans text-foreground">
            <Header />
            <div className="flex flex-1 relative">
                <AdminSidebar />
                <main className="flex-1 p-6 md:p-8 overflow-y-auto h-[calc(100vh-4rem)]">
                    <div className="max-w-7xl mx-auto w-full animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
            {/* Background Grain/Pattern could be added here if desired */}
        </div>
    );
};

export default AdminLayout;
