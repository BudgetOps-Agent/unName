import Header from "../components/header/Header";
import Sidebar from "../components/sidebar/Sidebar";

type Props = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <Sidebar />
      </aside>

      <div className="main-area">
        <header>
          <Header />
        </header>

        <main>
          { children }
        </main>
      </div>
    </div>
  );
}