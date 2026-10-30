import React, { useCallback, useRef, useState } from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

interface Props {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const DEBOUNCE_MS = 300;

export const MarketSearchBar: React.FC<Props> = ({ value, onChange, placeholder }) => {
  const [local, setLocal] = useState(value ?? "");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLocal(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(v), DEBOUNCE_MS);
  }, [onChange]);

  return (
    <Input
      prefix={<SearchOutlined />}
      value={local}
      onChange={handleChange}
      placeholder={placeholder}
      allowClear
      style={{ width: 360 }}
    />
  );
};