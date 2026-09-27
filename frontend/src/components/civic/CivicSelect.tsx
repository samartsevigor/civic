'use client';

import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';

export type CivicSelectOption = {
  value: string;
  label: string;
};

export function CivicSelect({
  value,
  onValueChange,
  options,
  ariaLabel,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: CivicSelectOption[];
  ariaLabel: string;
}) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger className="civic-select" aria-label={ariaLabel}>
        <Select.Value />
        <Select.Icon className="civic-select-icon">
          <ChevronDown size={16} strokeWidth={2.4} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="civic-select-menu"
          position="popper"
          sideOffset={6}
          collisionPadding={12}
          style={{ zIndex: 2000 }}
        >
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item key={option.value} value={option.value} className="civic-select-item">
                <Select.ItemIndicator className="civic-select-check">
                  <Check size={14} strokeWidth={2.6} />
                </Select.ItemIndicator>
                <Select.ItemText>{option.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
