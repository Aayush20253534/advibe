import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CheckCircle2, Info, type LucideIcon } from "lucide-react";
import "./secondary-pages.css";

type Action = { label: string; href: string; secondary?: boolean };
type Accent = "blue" | "calm" | "legal";

export function DetailPage({ children, name }: { children: ReactNode; name: string }) {
  return <div className={"bma-detail bma-detail-" + name}>{children}</div>;
}

export function DetailHero({
  eyebrow, title, description, image, imageAlt = "", note, actions = [], accent = "blue", facts = [],
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  image?: string;
  imageAlt?: string;
  note?: string;
  actions?: Action[];
  accent?: Accent;
  facts?: string[];
}) {
  return <section className={"bma-detail-hero bma-detail-hero-" + accent} aria-labelledby="detail-page-title">
    {image ? <div className="bma-detail-hero-art" aria-hidden={!imageAlt}>
      <Image src={image} alt={imageAlt} fill priority sizes="(max-width: 700px) 100vw, (max-width: 1100px) 68vw, 64vw" />
    </div> : <div className="bma-detail-hero-abstract" aria-hidden="true">
      <span className="bma-detail-abstract-ring" />
      <span className="bma-detail-abstract-panel"><CheckCircle2 /></span>
    </div>}
    <div className="bma-detail-container bma-detail-hero-inner">
      <div className="bma-detail-hero-copy">
        <span className="bma-detail-eyebrow"><span aria-hidden="true" />{eyebrow}</span>
        <h1 id="detail-page-title">{title}</h1>
        <p className="bma-detail-hero-description">{description}</p>
        {actions.length ? <div className="bma-detail-hero-actions">
          {actions.map(action => <Link href={action.href} key={action.label} className={"bma-detail-button " + (action.secondary ? "bma-detail-button-secondary" : "bma-detail-button-primary")}>
            {action.label}{!action.secondary && <ArrowUpRight aria-hidden="true" />}
          </Link>)}
        </div> : null}
        {facts.length ? <ul className="bma-detail-hero-facts">{facts.map(fact => <li key={fact}><CheckCircle2 aria-hidden="true" />{fact}</li>)}</ul> : null}
        {note ? <p className="bma-detail-hero-note"><Info aria-hidden="true" />{note}</p> : null}
      </div>
    </div>
  </section>;
}

export function DetailSection({
  title, description, id, children, tone = "white", aside, className = "",
}: {
  title?: string;
  description?: string;
  id?: string;
  children: ReactNode;
  tone?: "white" | "blue";
  aside?: ReactNode;
  className?: string;
}) {
  return <section className={"bma-detail-section bma-detail-section-" + tone + " " + className} aria-labelledby={title && id ? id : undefined}>
    <div className="bma-detail-container">
      {(title || aside) && <div className="bma-detail-section-header">
        <div>{title && <h2 id={id}>{title}</h2>}{description && <p>{description}</p>}</div>
        {aside}
      </div>}
      {children}
    </div>
  </section>;
}

export function DetailCards({ items, columns = 3 }: {
  items: Array<{ icon: LucideIcon; title: string; text: string; href?: string }>;
  columns?: 2 | 3 | 4;
}) {
  return <div className={"bma-detail-cards bma-detail-cards-" + columns}>
    {items.map(({ icon: Icon, title, text, href }) => {
      const contents = <><span className="bma-detail-card-icon"><Icon aria-hidden="true" /></span>
        <h3>{title}</h3><p>{text}</p>{href && <span className="bma-detail-card-arrow">Explore <ArrowRight aria-hidden="true" /></span>}</>;
      return href ? <Link className="bma-detail-card bma-detail-card-link" key={title} href={href}>{contents}</Link>
        : <article className="bma-detail-card" key={title}>{contents}</article>;
    })}
  </div>;
}

export function DetailRibbon({ children, warning = false }: { children: ReactNode; warning?: boolean }) {
  return <div className={"bma-detail-ribbon" + (warning ? " bma-detail-ribbon-warning" : "")}>
    <Info aria-hidden="true" /><span>{children}</span>
  </div>;
}

export function DetailCTA({ title, description, action, secondaryAction }: {
  title: string; description: string; action: Action; secondaryAction?: Action;
}) {
  return <section className="bma-detail-cta" aria-label={title}>
    <div className="bma-detail-cta-copy"><h2>{title}</h2><p>{description}</p></div>
    <div className="bma-detail-cta-actions">
      <Link className="bma-detail-cta-primary" href={action.href}>{action.label}<ArrowUpRight aria-hidden="true" /></Link>
      {secondaryAction && <Link className="bma-detail-cta-secondary" href={secondaryAction.href}>{secondaryAction.label}</Link>}
    </div>
  </section>;
}
