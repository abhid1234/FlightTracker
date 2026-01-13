"use client";

import { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface AutocompleteInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onSelect'> {
    options: { value: string; label: string }[];
    onSelect: (value: string) => void;
    containerClassName?: string;
    inputClassName?: string;
    startIcon?: React.ReactNode;
}

export function AutocompleteInput({
    options,
    onSelect,
    containerClassName,
    inputClassName,
    value,
    onChange,
    startIcon,
    ...props
}: AutocompleteInputProps) {
    // State for managing suggestion visibility
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<{ value: string; label: string }[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof value === 'string' && value.length > 0) {
            const query = value.toLowerCase();
            const filtered = options.filter(
                (opt) =>
                    opt.value.toLowerCase().includes(query) ||
                    opt.label.toLowerCase().includes(query)
            );
            // Limit to top 5 suggestions
            setSuggestions(filtered.slice(0, 5));
            setShowSuggestions(filtered.length > 0);
        } else {
            setShowSuggestions(false);
        }
    }, [value, options]);

    // Close suggestions when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (selectedValue: string) => {
        onSelect(selectedValue);
        setShowSuggestions(false);
    };

    return (
        <div ref={wrapperRef} className={twMerge("relative w-full flex items-center", containerClassName)}>
            {startIcon && <div className="mr-2 flex-shrink-0">{startIcon}</div>}
            <input
                type="text"
                value={value}
                onChange={onChange}
                onFocus={() => {
                    if (typeof value === 'string' && value.length > 0) setShowSuggestions(true);
                }}
                className={twMerge("w-full bg-transparent border-none outline-none", inputClassName)}
                autoComplete="off"
                {...props}
            />
            
            {showSuggestions && (
                <ul className="absolute z-[100] top-full left-0 right-0 bg-gray-900/60 border border-white/10 rounded-xl mt-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-h-64 overflow-y-auto backdrop-blur-2xl divide-y divide-white/5 animate-in fade-in zoom-in-95 duration-200">
                    {suggestions.map((option) => (
                        <li
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className="px-5 py-4 text-sm text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer transition-all flex justify-between items-center group/item"
                        >
                            <div className="flex flex-col">
                                <span className="font-bold text-base tracking-tight group-hover/item:text-blue-400 transition-colors">{option.value}</span>
                                <span className="text-[10px] uppercase tracking-widest text-gray-500 group-hover/item:text-gray-400">{option.label}</span>
                            </div>
                            <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}