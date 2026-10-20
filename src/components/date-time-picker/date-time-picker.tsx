"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimePickerDemo } from "./time-picker-demo";

export function DateTimePicker({ defaultValue, ...rest }: { name?: string, defaultValue?: Date, id?: string, required?: boolean }) {
  const [date, setDate] = React.useState<Date | undefined>(defaultValue);

  return (
    <>
      <Popover modal>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP HH:mm:ss") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <div className="grid gap-4">
            <Calendar
              mode="single"
							fromDate={new Date()}
              selected={date}
              onSelect={setDate}
              initialFocus
            />
            <div className="p-3 border-t border-border">
              <TimePickerDemo setDate={setDate} date={date} />
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <input className="hidden" {...rest} value={date ? date.toISOString() : ""} defaultValue={defaultValue ? defaultValue.toISOString() : ""} />
    </>
  )
}
