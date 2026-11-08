import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { brand } from "@/config/brand";

export function HomepageFooter() {
  const columns = [
    { title: "Explore", links: [["Ad formats", "/ad-formats"], ["How it works", "/#how-it-works"], ["Locations", "/locations"]] },
    { title: "Get started", links: [["For advertisers", "/for-advertisers"], ["For drivers", "/for-drivers"], ["Sign in", "/login"]] },
    { title: "Company", links: [["About", "/about"], ["Help centre", "/help-center"]] },
  ];
  return <div className="bma-ref-wrap bma-ref-footer">
    <div className="bma-ref-footer-top">
      <div className="bma-ref-footer-brand"><BrandLogo inverse width={240} /><p>Advertising that moves with the city.</p></div>
      {columns.map(column => <div className="bma-ref-footer-column" key={column.title}><h2>{column.title}</h2><ul>{column.links.map(([label, href]) => <li key={href}><Link prefetch={false} href={href}>{label}</Link></li>)}</ul></div>)}
    </div>
    <div className="bma-ref-footer-bottom"><p>© 2026 {brand.legalName}</p><div><Link prefetch={false} href="/privacy">Privacy policy</Link><Link prefetch={false} href="/terms">Terms of service</Link></div></div>
  </div>;
}
