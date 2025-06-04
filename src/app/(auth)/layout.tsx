interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="bg-neutral-950 bg-top h-screen flex-grow flex items-center justify-center">
      <div className="h-full w-full md:h-auto md:w-[420px]">{children}</div>
    </div>
  );
};

export default AuthLayout;
