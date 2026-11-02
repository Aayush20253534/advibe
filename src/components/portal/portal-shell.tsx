"use client";

import * as React from "react";
import Link from "next/link";
import * as RadixDialog from "@radix-ui/react-dialog";
import { Bell, LogOut, MapPin, Menu, ShieldCheck, X } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button, PageHeader, Tooltip, type Crumb } from "@/components/ui";
import { portalNavigation, type NavItem, type PortalRole } from "@/config/navigation";
import { cn } from "@/lib/utils";

/** Plain-language names shown in the sidebar, breadcrumbs and header. */
export const portalLabel: Record<PortalRole, string> = {
  advertiser: "Advertiser portal",
  driver: "Driver partner portal",
  admin: "Admin portal",
};

const roleName: Record<PortalRole, string> = {
  advertiser: "Advertiser",
  driver: "Driver partner",
  admin: "Admin",
};

const groupHeading: Record<PortalRole, Record<NonNullable<NavItem["group"]>, string | null>> = {
  advertiser: { main: null, management: "Billing and reports", account: "Account" },
  driver: { main: null, management: "Earnings and activity", account: "Account" },
  admin: { main: null, management: "Finance and governance", account: "Account" },
};

/** The nav item for the current path: exact match, or the longest section prefix. */
export function activeNavItem(role: PortalRole, pathname: string): NavItem | undefined {
  const items = portalNavigation[role];
  const root = "/" + role;
  return (
    items.find((item) => item.href === pathname) ??
    items
      .filter((item) => item.href !== root && pathname.startsWith(item.href + "/"))
      .sort((a, b) => b.href.length - a.href.length)[0] ??
    (pathname === root ? items.find((item) => item.href === root) : undefined)
  );
}

type PortalShellProps = {
  role: PortalRole;
  pathname: string;
  /** Page title (h1). Defaults to the active navigation label. */
  title?: string;
  description?: React.ReactNode;
  /** Page-level actions, shown beside the title. */
  actions?: React.ReactNode;
  /** Workspace context shown in the header, e.g. the advertiser's business switcher. */
  context?: React.ReactNode;
  onSignOut: () => void;
  signingOut?: boolean;
  /** Called when a navigation link is followed (for portals that reset view state). */
  onNavigate?: (href: string) => void;
  children: React.ReactNode;
};

function NavList({
  role,
  pathname,
  dense,
  onNavigate,
}: {
  role: PortalRole;
  pathname: string;
  dense: boolean;
  onNavigate: (href: string) => void;
}) {
  const active = activeNavItem(role, pathname);
  const groups: NonNullable<NavItem["group"]>[] = ["main", "management", "account"];
  return (
    <div className="space-y-5">
      {groups.map((group) => {
        const items = portalNavigation[role].filter((item) => (item.group ?? "main") === group);
        if (!items.length) return null;
        const heading = groupHeading[role][group];
        return (
          <div key={group}>
            {heading ? (
              <p className="mb-1.5 px-3 text-xs font-semibold text-[#9fb0cc]">{heading}</p>
            ) : null}
            <ul className="space-y-0.5">
              {items.map((item) => {
                const current = active?.href === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => onNavigate(item.href)}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white",
                        dense ? "min-h-9" : "min-h-11",
                        current
                          ? "bg-signal text-white"
                          : "text-[#c3d0e4] hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function SidebarContent({
  role,
  pathname,
  onNavigate,
}: {
  role: PortalRole;
  pathname: string;
  onNavigate: (href: string) => void;
}) {
  return (
    <>
      <div className="px-5 pt-5 pb-4">
        <BrandLogo href={"/" + role} width={132} />
        <p className="mt-3 text-sm font-semibold text-white">{portalLabel[role]}</p>
        <p className="mt-1 text-xs text-[#c3d0e4]">Prayagraj launch workspace</p>
      </div>
      <nav aria-label={portalLabel[role]} className="flex-1 overflow-y-auto px-2 pb-6">
        <NavList role={role} pathname={pathname} dense={role === "admin"} onNavigate={onNavigate} />
      </nav>
    </>
  );
}

/**
 * Shared application shell for the advertiser, driver and admin portals.
 * It only renders chrome; session checks, role checks and data loading stay
 * in each portal so their behaviour is unchanged.
 */
export function PortalShell({
  role,
  pathname,
  title,
  description,
  actions,
  context,
  onSignOut,
  signingOut = false,
  onNavigate,
  children,
}: PortalShellProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const active = activeNavItem(role, pathname);
  const pageTitle = title ?? active?.label ?? portalLabel[role];
  const root = "/" + role;
  const crumbs: Crumb[] = [{ label: portalLabel[role], href: root }];
  if (active && active.href !== root) {
    crumbs.push({ label: active.label, href: active.href });
  }
  if (pageTitle !== crumbs[crumbs.length - 1]!.label) crumbs.push({ label: pageTitle });
  const navigate = (href: string) => {
    setMenuOpen(false);
    onNavigate?.(href);
  };
  const dense = role === "admin";

  return (
    <div className="min-h-dvh bg-paper text-ink lg:flex">
      <a
        href="#portal-content"
        className="sr-only z-50 rounded-md bg-surface px-4 py-2 font-semibold text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:outline-2 focus:outline-signal"
      >
        Skip to main content
      </a>

      {/* The ink column stretches to the full page height; the menu inside it stays in view. */}
      <aside className="hidden w-64 shrink-0 bg-ink lg:block">
        <div className="sticky top-0 flex h-dvh flex-col">
          <SidebarContent role={role} pathname={pathname} onNavigate={navigate} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-surface">
          <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <RadixDialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
              <RadixDialog.Trigger asChild>
                <Button variant="outline" className="lg:hidden" aria-label="Open menu">
                  <Menu className="size-4" aria-hidden />
                  Menu
                </Button>
              </RadixDialog.Trigger>
              <RadixDialog.Portal>
                <RadixDialog.Overlay className="fixed inset-0 z-50 bg-ink/60 lg:hidden" />
                <RadixDialog.Content
                  aria-describedby={undefined}
                  className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,calc(100vw-3rem))] flex-col bg-ink shadow-overlay focus-visible:outline-none motion-safe:data-[state=open]:animate-[advibe-fade-in_150ms_ease-out] lg:hidden"
                >
                  <RadixDialog.Title className="sr-only">
                    {portalLabel[role]} menu
                  </RadixDialog.Title>
                  <RadixDialog.Close
                    aria-label="Close menu"
                    className="absolute top-4 right-3 grid size-10 place-items-center rounded-md text-[#c3d0e4] hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
                  >
                    <X className="size-5" aria-hidden />
                  </RadixDialog.Close>
                  <SidebarContent role={role} pathname={pathname} onNavigate={navigate} />
                </RadixDialog.Content>
              </RadixDialog.Portal>
            </RadixDialog.Root>

            <p className="hidden min-w-0 truncate text-sm font-semibold text-ink sm:block lg:hidden">
              {portalLabel[role]}
            </p>

            <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
              {context ? <div className="hidden min-w-0 md:block">{context}</div> : null}
              <span className="hidden items-center gap-1.5 rounded-md bg-paper px-3 py-1.5 text-xs font-semibold text-ink-muted sm:inline-flex"><MapPin className="size-3.5" aria-hidden="true" /> Prayagraj</span>
              {role === "admin" ? (
                <span className="hidden items-center gap-1.5 text-sm text-ink-muted xl:inline-flex">
                  <ShieldCheck className="size-4 text-success-fg" aria-hidden />
                  MFA-protected session
                </span>
              ) : null}
              <Tooltip content="Notifications">
                <Link
                  href={root + "/notifications"}
                  onClick={() => onNavigate?.(root + "/notifications")}
                  aria-label="Notifications"
                  aria-current={pathname === root + "/notifications" ? "page" : undefined}
                  className="grid size-11 place-items-center rounded-md text-ink-muted hover:bg-surface-sunken hover:text-ink focus-visible:outline-2 focus-visible:outline-signal aria-[current=page]:bg-signal-soft aria-[current=page]:text-ink"
                >
                  <Bell className="size-5" aria-hidden />
                </Link>
              </Tooltip>
              <span className="hidden text-sm text-ink-muted sm:inline">
                Signed in as <span className="font-semibold text-ink">{roleName[role]}</span>
              </span>
              <Button
                variant="outline"
                className="px-3 lg:min-h-9"
                loading={signingOut}
                onClick={onSignOut}
              >
                <LogOut className="size-4" aria-hidden />
                Sign out
              </Button>
            </div>
          </div>
          {context ? (
            <div className="border-t border-line px-4 py-2 sm:px-6 md:hidden">{context}</div>
          ) : null}
        </header>

        <main
          id="portal-content"
          tabIndex={-1}
          className={cn(
            "mx-auto w-full max-w-7xl flex-1 px-4 focus:outline-none sm:px-6 lg:px-8",
            dense ? "space-y-5 py-5" : "space-y-6 py-6 lg:py-8",
          )}
        >
          <PageHeader
            breadcrumbs={crumbs}
            title={pageTitle}
            description={description}
            actions={actions}
          />
          {children}
        </main>
      </div>
    </div>
  );
}
