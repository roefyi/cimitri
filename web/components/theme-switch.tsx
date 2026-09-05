'use client';

import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

  return (
    <ToggleGroup
      type='single'
      variant='outline'
      size='sm'
      value={theme ?? 'system'}
      onValueChange={(value) => {
        if (value) setTheme(value);
      }}
    >
      <ToggleGroupItem value='light' aria-label='Light theme'>
        <Sun />
      </ToggleGroupItem>
      <ToggleGroupItem value='dark' aria-label='Dark theme'>
        <Moon />
      </ToggleGroupItem>
      <ToggleGroupItem value='system' aria-label='System theme'>
        <Monitor />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
