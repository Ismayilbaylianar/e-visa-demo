"use client";

import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UN_COUNTRIES } from "@/data/un_countries";
import { COUNTRY_PHONE_CODES } from "@/data/country_phone_codes";

interface PhoneCodeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

interface CountryWithCode {
  name: string;
  cca2: string;
  flag: string;
  phoneCode: string;
}

export function PhoneCodeSelect({ value, onValueChange, disabled }: PhoneCodeSelectProps) {
  const [open, setOpen] = useState(false);

  const countriesWithCodes: CountryWithCode[] = useMemo(() => {
    return UN_COUNTRIES
      .filter((country) => COUNTRY_PHONE_CODES[country.cca2])
      .map((country) => ({
        name: country.name,
        cca2: country.cca2,
        flag: country.flag,
        phoneCode: COUNTRY_PHONE_CODES[country.cca2],
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const selectedCountry = countriesWithCodes.find((c) => c.phoneCode === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[140px] justify-between px-2"
          disabled={disabled}
        >
          {selectedCountry ? (
            <span className="flex items-center gap-1 truncate">
              <span>{selectedCountry.flag}</span>
              <span className="font-mono">{selectedCountry.phoneCode}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">+XXX</span>
          )}
          <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Ölkə və ya kod axtar..." />
          <CommandList>
            <CommandEmpty>Nəticə tapılmadı.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {countriesWithCodes.map((country) => (
                <CommandItem
                  key={country.cca2}
                  value={`${country.name} ${country.phoneCode} ${country.cca2}`}
                  onSelect={() => {
                    onValueChange(country.phoneCode);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === country.phoneCode ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="mr-2">{country.flag}</span>
                  <span className="flex-1 truncate">{country.name}</span>
                  <span className="font-mono text-muted-foreground ml-2">
                    {country.phoneCode}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
