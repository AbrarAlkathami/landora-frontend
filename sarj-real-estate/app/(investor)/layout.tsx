import { PortfolioProvider } from "@/components/investor/portfolio";
import { InvestorShell } from "@/components/investor/shell";
export default function InvestorLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <PortfolioProvider>
    <InvestorShell>
      {children}
    </InvestorShell>
  </PortfolioProvider>;
}
