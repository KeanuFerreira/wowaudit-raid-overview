import React, {useMemo, useState} from 'react';
import {DetailedRaidEvent, RaidEncounter, RaidSignup} from '../types';
import {Checkbox, Divider, FlexboxGrid, Panel, Placeholder, Table, Tag, Tooltip, Whisper} from 'rsuite';

const {Column, HeaderCell, Cell} = Table;

interface RaidSelectionBoardProps {
    raid: DetailedRaidEvent | null;
    loading?: boolean;
    height?: number; // optional override height
}

// Basic class color map (can be refined to match in-game colors)
const CLASS_COLORS: Record<string, string> = {
    'Death Knight': '#C41E3A',
    'Demon Hunter': '#A330C9',
    'Druid': '#FF7D0A',
    'Evoker': '#33937F',
    'Hunter': '#ABD473',
    'Mage': '#3FC7EB',
    'Monk': '#00FF96',
    'Paladin': '#F58CBA',
    'Priest': '#FFFFFF',
    'Rogue': '#FFF569',
    'Shaman': '#0070DE',
    'Warlock': '#8788EE',
    'Warrior': '#C79C6E'
};

const ROLE_BADGE_COLOR: Record<string, 'cyan' | 'violet' | 'green' | 'red'> = {
    'Ranged': 'cyan',
    'Melee': 'violet',
    'Heal': 'green',
    'Tank': 'red'
};

// Helper to safely get selection status for a character within an encounter
function isCharacterSelectedForEncounter(encounter: RaidEncounter, characterId: number): boolean {
    if (!encounter.enabled) return false;
    if (!encounter.selections) return false;
    return !!encounter.selections.find(sel => sel.character_id === characterId && sel.selected);
}

interface RowDataShape {
    id: number;
    name: string;
    fullName: string; // name-realm
    class: string;
    role: string;
    overallSelected: boolean;
    signupStatus: string;

    // dynamic encounter flags: encounter_<id>: boolean
    [key: `encounter_${number}`]: any; // allow dynamic keys
}

const RaidSelectionBoard: React.FC<RaidSelectionBoardProps> = ({raid, loading = false, height}) => {
    const [showOnlyRaidRoster, setShowOnlyRaidRoster] = useState(false);
    const [compact, setCompact] = useState(false);

    const enabledEncounters = useMemo(() => raid?.encounters.filter(e => e.enabled) ?? [], [raid]);

    const rows: RowDataShape[] = useMemo(() => {
        if (!raid) return [];
        const data: RowDataShape[] = raid.signups.map((signup: RaidSignup) => {
            const charId = signup.character.id;
            const row: RowDataShape = {
                id: charId,
                name: signup.character.name,
                fullName: `${signup.character.name}-${signup.character.realm}`,
                class: signup.class,
                role: signup.role,
                overallSelected: signup.selected,
                signupStatus: signup.status,
            } as RowDataShape;
            enabledEncounters.forEach(enc => {
                (row as any)[`encounter_${enc.id}`] = isCharacterSelectedForEncounter(enc, charId);
            });
            return row;
        });

        // Optional filter
        return showOnlyRaidRoster ? data.filter(r => r.overallSelected) : data;
    }, [raid, enabledEncounters, showOnlyRaidRoster]);

    const encounterSelectionCounts = useMemo(() => {
        return enabledEncounters.map(enc => {
            let selected = 0;
            raid?.signups.forEach(su => {
                if (isCharacterSelectedForEncounter(enc, su.character.id)) selected++;
            });
            return {id: enc.id, name: enc.name, selected};
        });
    }, [enabledEncounters, raid]);

    if (!raid) {
        return (
            <Panel bordered header="Raid Selection">
                {loading ? <Placeholder.Paragraph rows={4}/> : <Placeholder.Paragraph rows={3}/>}
                <span style={{opacity: 0.6}}>Select a raid to view its encounter selection matrix.</span>
            </Panel>
        );
    }

    return (
        <Panel bordered header={`Raid Selection • ${raid.instance} • ${raid.date} (${raid.difficulty})`}
               style={{marginTop: 16}}>
            <FlexboxGrid justify="space-between" align="middle" style={{marginBottom: 8, rowGap: 8}}>
                <FlexboxGrid.Item>
                    <strong>{raid.signups.length}</strong> signups
                    • <strong>{raid.signups.filter(s => s.selected).length}</strong> in raid roster
                </FlexboxGrid.Item>
                <FlexboxGrid.Item>
                    <div style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
                        <Checkbox checked={showOnlyRaidRoster}
                                  onChange={(_, checked) => setShowOnlyRaidRoster(checked)}>
                            Only raid roster
                        </Checkbox>
                        <Checkbox checked={compact} onChange={(_, checked) => setCompact(checked)}>
                            Compact
                        </Checkbox>
                    </div>
                </FlexboxGrid.Item>
            </FlexboxGrid>
            <Divider style={{margin: '8px 0'}}/>
            <div style={{width: '100%', overflowX: 'auto'}}>
                <Table
                    data={rows}
                    autoHeight={!height}
                    height={height}
                    rowHeight={compact ? 32 : 44}
                    headerHeight={56}
                    bordered
                    cellBordered
                    wordWrap
                    affixHeader
                    loading={loading}
                >
                    <Column width={compact ? 160 : 200} fixed verticalAlign="middle" fullText>
                        <HeaderCell>Character</HeaderCell>
                        <Cell>
                            {(rowData: RowDataShape) => {
                                const color = CLASS_COLORS[rowData.class] || '#888';
                                return (
                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                        <div style={{fontWeight: 600, color}}>{rowData.name}</div>
                                        {!compact && (
                                            <span style={{fontSize: 11, opacity: 0.65}}>{rowData.fullName}</span>
                                        )}
                                    </div>
                                );
                            }}
                        </Cell>
                    </Column>
                    <Column width={90} align="center" verticalAlign="middle">
                        <HeaderCell>Role</HeaderCell>
                        <Cell>
                            {(rowData: RowDataShape) => (
                                <Tag size="sm" color={ROLE_BADGE_COLOR[rowData.role] || 'cyan'}>{rowData.role}</Tag>
                            )}
                        </Cell>
                    </Column>
                    <Column width={80} align="center" verticalAlign="middle">
                        <HeaderCell>Roster</HeaderCell>
                        <Cell>
                            {(rowData: RowDataShape) => rowData.overallSelected ?
                                <span style={{color: 'var(--rs-green-600)'}}>✔</span> :
                                <span style={{opacity: 0.25}}>—</span>}
                        </Cell>
                    </Column>
                    {enabledEncounters.map((enc, idx) => {
                        const count = encounterSelectionCounts[idx]?.selected ?? 0;
                        const header = (
                            <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                <span style={{fontWeight: 600, fontSize: 12}}>{enc.name}</span>
                                <span style={{fontSize: 11, opacity: 0.7}}>{count} sel.</span>
                            </div>
                        );
                        const headerCell = enc.notes ? (
                            <Whisper placement="top" trigger="hover"
                                     speaker={<Tooltip style={{maxWidth: 300}}>{enc.notes}</Tooltip>}>
                                {header}
                            </Whisper>
                        ) : header;
                        return (
                            <Column key={enc.id} width={compact ? 90 : 110} align="center" verticalAlign="middle">
                                <HeaderCell>{headerCell}</HeaderCell>
                                <Cell>
                                    {(rowData: RowDataShape) => (rowData as any)[`encounter_${enc.id}`] ? (
                                        <span style={{color: '#52c41a', fontWeight: 600}}>✔</span>
                                    ) : (
                                        <span style={{opacity: 0.15}}>✖</span>
                                    )}
                                </Cell>
                            </Column>
                        );
                    })}
                </Table>
            </div>
        </Panel>
    );
};

export default RaidSelectionBoard;
