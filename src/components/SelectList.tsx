import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';

export interface SelectItem<T = string> {
  label: string;
  value: T;
  hint?: string;
  separator?: boolean;
  dim?: boolean;
}

interface SelectListProps<T = string> {
  items: SelectItem<T>[];
  onSelect: (item: SelectItem<T>) => void;
  onCancel?: () => void;
  initialIndex?: number;
  hint?: string;
}

export function SelectList<T = string>({
  items,
  onSelect,
  onCancel,
  initialIndex = 0,
  hint,
}: SelectListProps<T>) {
  const selectable = items.filter(i => !i.separator);
  const [selIdx, setSelIdx] = useState(() => Math.max(0, initialIndex));

  useEffect(() => {
    setSelIdx(0);
  }, [items.length]);

  const selectedItem = selectable[selIdx];

  useInput((_, key) => {
    if (key.upArrow) {
      setSelIdx(i => Math.max(0, i - 1));
    } else if (key.downArrow) {
      setSelIdx(i => Math.min(selectable.length - 1, i + 1));
    } else if (key.return && selectedItem) {
      onSelect(selectedItem);
    } else if (key.escape && onCancel) {
      onCancel();
    }
  });

  return (
    <Box flexDirection="column">
      {items.map((item, i) => {
        if (item.separator) {
          return (
            <Box key={i} paddingX={2} marginY={0}>
              <Text dimColor>{'─'.repeat(38)}</Text>
            </Box>
          );
        }

        const isSelected = selectable[selIdx] === item;

        return (
          <Box key={i} paddingX={2}>
            <Text color="cyan">{isSelected ? '❯ ' : '  '}</Text>
            <Text
              bold={isSelected && !item.dim}
              color={item.dim ? undefined : isSelected ? 'cyan' : undefined}
              dimColor={!isSelected || item.dim}
            >
              {item.label}
            </Text>
            {item.hint && (
              <Text dimColor>{'   '}{item.hint}</Text>
            )}
          </Box>
        );
      })}
      {hint && (
        <Box marginTop={1} paddingX={2}>
          <Text dimColor>{hint}</Text>
        </Box>
      )}
    </Box>
  );
}
