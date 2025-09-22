"use client";

import { PlusIcon } from 'lucide-react';
import { useCallback, useState } from 'react';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { DeleteEventDialog, EventDialog, EventsTable } from '@/features/events'; // adjust path as needed
import { Event } from '@/features/events/components/EventsTable';

export default function Page() {
  const [searchInput, setSearchInput] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Event | null>(null);

  const queryKeyGetter = useCallback(() => {
    return searchInput ? ["events", { searchInput }] : ["events"];
  }, [searchInput]);

  function openEditDialog(event: Event) {
    setCurrentItem(event);
    setFormDialogOpen(true);
  }

  function openDeleteDialog(event: Event) {
    setCurrentItem(event);
    setDeleteDialogOpen(true);
  }

  function handleFormDialogChange(open: boolean) {
    setFormDialogOpen(open);

    if (!open) setCurrentItem(null);
  }

  function handleDeleteDialogChange(open: boolean) {
    setDeleteDialogOpen(open);

    if (!open) setCurrentItem(null);
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader
          breadcrumbs={[
            {
              label: "Events",
            },
          ]}
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <div className="flex justify-between">
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search..."
                  className="max-w-64"
                  type="search"
                />

                {/* Create and edit dialog */}
                <EventDialog
                  onSuccess={() => {
                    setFormDialogOpen(false);
                    setCurrentItem(null);
                  }}
                  item={currentItem}
                  queryKeyGetter={queryKeyGetter}
                  dialogProps={{
                    open: formDialogOpen,
                    onOpenChange: handleFormDialogChange,
                  }}
                />
                <Button onClick={() => setFormDialogOpen(true)}>
                  <PlusIcon className="size-4" />
                  Create
                </Button>
              </div>

              <DeleteEventDialog
                onSuccess={() => {
                  setDeleteDialogOpen(false);
                  setCurrentItem(null);
                }}
                queryKeyGetter={queryKeyGetter}
                itemId={currentItem?.id}
                itemName={currentItem?.title}
                dialogProps={{
                  open: deleteDialogOpen,
                  onOpenChange: handleDeleteDialogChange,
                }}
              />

              {/* Events table */}
              <EventsTable
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
                queryKeyGetter={queryKeyGetter}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
