import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {SelectPicker} from 'rsuite';

export type WowAuditRaidEvent = {
    id: number;
    date: string;        // e.g. "2025-11-06"
    start_time: string;  // e.g. "19:30"
    end_time: string;    // e.g. "22:30"
    instance: string;
    optional: boolean;
    difficulty: string;
    status: string;
    present_size: number;
    total_size: number;
};

interface RaidPickerProps {
    onChange?: (event: WowAuditRaidEvent | null) => void;
    url?: string;
    placeholder?: string;
    value?: number | null;  // controlled selected id
    disabled?: boolean;
}

export default function RaidPicker({
    onChange,
    placeholder = 'Select a raid…',
    value: controlledValue,
    disabled = false,
}: RaidPickerProps) {
    const [events, setEvents] = useState<WowAuditRaidEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [value, setValue] = useState<number | null>(controlledValue ?? null);

    // Sync controlled prop
    useEffect(() => {
        if (controlledValue !== undefined) {
            setValue(controlledValue);
        }
    }, [controlledValue]);

    // Fetch events
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                const resp = await fetch('/api/wowaudit?targetRoute=raids%3Finclude_past%3Dfalse', {
                    headers: {
                        Accept: 'application/json',
                    }
                });
                if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
                const data = await resp.json();
                if (cancelled) return;
                setEvents(data.raids);
                // initially select next mythic raid
                const nextMythicRaid = data.raids.find(raid => raid.difficulty === 'Mythic')
                setValue(nextMythicRaid)
                onChange?.(nextMythicRaid)

            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    // Prepare the data list for SelectPicker
    const selectData = useMemo(() => {
        return events.map(ev => ({
            label: `${ev.instance} • ${ev.difficulty} • ${ev.date} ${ev.start_time}-${ev.end_time}`,
            value: ev.id,
            ev,  // attach full event for rendering/custom logic
        }));
    }, [events]);

    // When selection changes
    const handleChange = useCallback(
        (nextValue: number | null) => {
            setValue(nextValue);
            const ev = events.find(e => e.id === nextValue) || null;
            onChange?.(ev);
        },
        [events, onChange]
    );

    // Custom rendering of each menu item (in dropdown)
    const renderMenuItem = (_label: React.ReactNode, item) => {
        const ev: WowAuditRaidEvent = item.ev;
        return (
            <div style={{ padding: '4px 8px' }}>
                <div style={{ fontWeight: 'bold' }}>{ev.instance} ({ev.difficulty})</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                    {ev.date} {ev.start_time}–{ev.end_time} | {ev.status} | {ev.present_size}/{ev.total_size}
                </div>
            </div>
        );
    };

    // Custom rendering of selected value shown in the picker
    const renderValue = (_val: number, item) => {
        if (!item) return null;
        const ev: WowAuditRaidEvent = item.ev;
        return (
            <span>
        {ev.instance} — {ev.date} {ev.start_time}–{ev.end_time}
      </span>
        );
    };

    return (
        <div style={{ width: '100%', position: 'relative' }}>
            <SelectPicker
                data={selectData}
                value={value ?? undefined}
                onChange={handleChange}
                placeholder={placeholder}
                disabled={disabled || loading}
                loading={loading}
                labelKey="label"
                valueKey="value"
                renderMenuItem={renderMenuItem}
                renderValue={renderValue}
                cleanable={false}
                searchable={false}
                style={{ width: '100%' }}
            />
        </div>
    );
}
