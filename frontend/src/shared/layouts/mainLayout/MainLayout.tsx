import Header from "../components/header/Header";
import Sidebar from "../components/sidebar/Sidebar";
import BottomNav from "../components/bottomNav/BottomNav";

type Props = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
    <>  
        <div className="layout">
            <Header />
            <Sidebar />
            <div className="main-area">
                <main>
                    <div className="container">
                        {children}
                    </div>
                </main>
            </div>
            <BottomNav />
        </div>
    </>
  );
}