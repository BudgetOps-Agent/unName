import Header from "../components/header/Header";
import Sidebar from "../components/sidebar/Sidebar";

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
                    { children }
                </main>
            </div>
        </div>
    </>
  );
}