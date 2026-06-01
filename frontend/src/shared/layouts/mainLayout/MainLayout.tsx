type Props = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
    <>
      <header>헤더</header>
      <main>{children}</main>
      <footer>푸터</footer>
    </>
  );
}