import Header from "../components/header/Header";
import Sidebar from "../components/sidebar/Sidebar";

type Props = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
    <>
      <Header />
      <Sidebar />
      <main>{children}</main>
    </>
  );
}