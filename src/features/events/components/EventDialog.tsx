"use client";

import { format } from 'date-fns';
import { Check, ChevronDownIcon, ChevronsUpDown, Loader2Icon } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogProps } from '@radix-ui/react-dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Event } from './EventsTable';

const eventSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  event_type: z.string().min(1, { message: "Event type is required" }),
  event_date: z.date({ error: "Event date is required" }),
  client_id: z.uuidv4(),
});

type EventSchema = z.infer<typeof eventSchema>;

type Props = {
  onSuccess?: () => void;
  item: Event | null;
  dialogProps: DialogProps;
  queryKeyGetter(): unknown[];
};

export default function EventForm(props: Props) {
  const queryClient = useQueryClient();

  const form = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: props.item?.title ?? "",
      event_date: props.item?.event_date
        ? new Date(props.item.event_date)
        : new Date(),
      client_id: props.item?.client_id ?? "",
      event_type: props.item?.event_type ?? "",
    },
  });

  const [eventOpen, setEventOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  const clientsQuery = useQuery({
    queryKey: ["client-search", clientSearch],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, search")
        .ilike("search", `%${clientSearch}%`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: clientOpen || !!clientSearch,
  });

  const selectedClient = useMemo(
    () => clientsQuery.data?.find((c) => c.id === form.getValues("client_id")),
    [clientsQuery.data, form.watch("client_id")]
  );

  const createMutation = useMutation({
    mutationFn: async (
      data: Omit<
        Event,
        "id" | "created_at" | "created_by" | "search"
      >
    ) => {
      return supabase.from("events").insert(data).throwOnError();
    },
    async onSuccess(_, variables) {
      await queryClient.invalidateQueries({
        queryKey: props.queryKeyGetter(),
      });
      toast.success("Event added!", {
        description: variables.title,
      });
      form.reset();
      props.onSuccess?.();
    },
    onError(error) {
      toast.error("Failed to add event", {
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Event>) => {
      if (!props.item?.id)
        throw new Error("Could not update event, id was not provided");

      return supabase
        .from("events")
        .update(data)
        .eq("id", props.item.id)
        .throwOnError();
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event updated");
      form.reset();
      props.onSuccess?.();
    },
    onError(error) {
      toast.error("Failed to update event", {
        description: error.message,
      });
    },
  });

  async function onSubmit(data: EventSchema) {
    const isUpdating = Boolean(props.item?.id);

    // Map form fields to DB column names
    const payload = {
      ...data,
      event_date: data.event_date.toISOString(),
    };

    if (isUpdating) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }
  }

  useEffect(() => {
    form.reset({
      title: props.item?.title ?? "",
      event_date: props.item?.event_date
        ? new Date(props.item.event_date)
        : new Date(),
      client_id: props.item?.client_id ?? "",
      event_type: props.item?.event_type ?? "",
    });
  }, [props.item, form]);

  return (
    <Dialog {...props.dialogProps}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {props.item?.id ? "Update event" : "Add new event"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-2"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Event title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="event_type"
              render={({ field }) => {
                const eventTypes = [
                  { label: "Wedding", value: "wedding" },
                  { label: "Birthday", value: "birthday" },
                  { label: "Baby Shower", value: "baby-shower" },
                  { label: "Baptism", value: "baptism" },
                  { label: "Quinceañera", value: "quinceañera" },
                  { label: "Graduation", value: "graduation" },
                  { label: "Anniversary", value: "anniversary" },
                  { label: "Engagement", value: "engagement" },
                  { label: "Corporate", value: "corporate" },
                  { label: "Holiday", value: "holiday" },
                  { label: "Funeral", value: "funeral" },
                  { label: "Other", value: "other" },
                ];
                const selectedLabel = eventTypes.find(
                  (t) => t.value === field.value
                )?.label;

                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>Event Type</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="justify-between w-full"
                          >
                            {selectedLabel ?? "Select event type"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search event type..."
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>No event type found.</CommandEmpty>
                            <CommandGroup>
                              {eventTypes.map((type) => (
                                <CommandItem
                                  key={type.value}
                                  value={type.label}
                                  onSelect={() => field.onChange(type.value)}
                                >
                                  {type.label}
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      field.value === type.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Event Date + Time Picker */}
            <FormField
              control={form.control}
              name="event_date"
              render={({ field }) => {
                const date = field.value ? new Date(field.value) : undefined;
                const hours =
                  date?.getHours().toString().padStart(2, "0") ?? "00";
                const minutes =
                  date?.getMinutes().toString().padStart(2, "0") ?? "00";

                return (
                  <FormItem>
                    <div className="flex gap-4">
                      <div className="flex flex-col gap-1">
                        <FormLabel className="px-1 h-5">Event Date</FormLabel>
                        <Popover open={eventOpen} onOpenChange={setEventOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="justify-between font-normal"
                              >
                                {date ? format(date, "PPP") : "Select date"}
                                <ChevronDownIcon />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={date}
                              captionLayout="dropdown"
                              onSelect={(selectedDate) => {
                                if (!selectedDate) return;
                                const updated = new Date(selectedDate);
                                if (date)
                                  updated.setHours(
                                    date.getHours(),
                                    date.getMinutes()
                                  );
                                field.onChange(updated);
                                setEventOpen(false);
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="flex flex-col gap-1">
                        <Label htmlFor="time-picker" className="px-1 text-sm">
                          Time
                        </Label>
                        <Input
                          id="time-picker"
                          type="time"
                          step="60"
                          value={`${hours}:${minutes}`}
                          onChange={(e) => {
                            const [h, m] = e.target.value
                              .split(":")
                              .map(Number);
                            const updated = new Date(field.value || new Date());
                            updated.setHours(h ?? 0, m);
                            field.onChange(updated);
                          }}
                          className="w-28 appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                        />
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Client Selector */}
            <FormField
              control={form.control}
              name="client_id"
              render={() => (
                <FormItem className="flex flex-col">
                  <FormLabel>Client</FormLabel>
                  <Popover open={clientOpen} onOpenChange={setClientOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="justify-between w-full"
                        >
                          {selectedClient?.name ?? "Select a client"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search client..."
                          className="h-9"
                          value={clientSearch}
                          onValueChange={setClientSearch}
                        />
                        <CommandList>
                          <CommandEmpty>No client found.</CommandEmpty>
                          <CommandGroup>
                            {clientsQuery.data?.map((client) => (
                              <CommandItem
                                key={client.id}
                                value={client.name ?? ""}
                                onSelect={() => {
                                  form.setValue("client_id", client.id);
                                  setClientOpen(false);
                                }}
                              >
                                {client.name}
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    client.id === form.watch("client_id")
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full mt-4"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && (
                <Loader2Icon className="animate-spin" />
              )}
              Save
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
