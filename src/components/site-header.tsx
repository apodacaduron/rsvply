import Link from 'next/link';
import React from 'react';

import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

import { ThemeToggle } from './ThemeToggle';

type Props = {
  breadcrumbs: { href?: string; label: string; }[]
  actions?: React.ReactNode
}

export function SiteHeader(props: Props) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) sticky top-0 bg-background z-10 rounded-t-xl">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/manage/dashboard" className="flex items-center gap-1 font-medium text-muted-foreground hover:underline hover:text-foreground">
            Home
          </Link>
          {props.breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              /
              {crumb.href ? (
                <Link href={crumb.href} className="hover:underline text-muted-foreground hover:text-foreground font-medium">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {props.actions}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
