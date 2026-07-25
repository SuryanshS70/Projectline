import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReactNode } from "react";

export interface TabDef {
  value: string;
  label: string;
  content: ReactNode;
}

export function ResponsiveTabs({ tabs, defaultValue }: { tabs: TabDef[]; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? tabs[0]?.value);
  const active = useMemo(() => tabs.find((t) => t.value === value) ?? tabs[0], [tabs, value]);

  return (
    <div>
      {/* Mobile: dropdown */}
      <div className="sm:hidden">
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tabs.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="mt-4">{active?.content}</div>
      </div>

      {/* Tablet/Desktop: tabs */}
      <div className="hidden sm:block">
        <Tabs value={value} onValueChange={setValue}>
          <TabsList className="h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
            {tabs.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-md border border-slate-200 bg-white text-slate-600"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((t) => (
            <TabsContent key={t.value} value={t.value} className="mt-6">
              {t.content}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
