import React, {useMemo, useState} from 'react';
import {DetailedRaidEvent, EncounterSelection, RaidEncounter, RaidSignup, Role} from '../types';
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

// Replace ROLE_BADGE_COLOR to include blue for Tank
const ROLE_BADGE_COLOR: Record<string, 'cyan' | 'violet' | 'green' | 'blue'> = {
  'Ranged': 'cyan',
  'Melee': 'violet',
  'Heal': 'green',
  'Tank': 'blue'
};

// NEW: custom sort weights -> Tank (0) -> Heal (1) -> DPS (2)
const ROLE_SORT_WEIGHT: Record<string, number> = {
  'Tank': 0,
  'Heal': 1,
  'Melee': 2,
  'Ranged': 3,
};

// Role abbreviation for compact encounter cells
const ROLE_ABBR: Record<Role, string> = {
  'Tank': 'T',
  'Heal': 'H',
  'Melee': 'M',
  'Ranged': 'R'
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
  _origIndex?: number; // internal for stable sorting
  [key: `encounter_${number}`]: any; // will hold EncounterSelection | undefined
}

const RaidSelectionBoard: React.FC<RaidSelectionBoardProps> = ({raid, loading = false, height}) => {
  const [showOnlyRaidRoster, setShowOnlyRaidRoster] = useState(true);
  const [compact, setCompact] = useState(true);

  const enabledEncounters = useMemo(() => raid?.encounters.filter(e => e.enabled) ?? [], [raid]);

  const rows: RowDataShape[] = useMemo(() => {
    if (!raid) return [];
    const data: RowDataShape[] = raid.signups.map((signup: RaidSignup, idx) => {
      const charId = signup.character.id;
      const row: RowDataShape = {
        id: charId,
        name: signup.character.name,
        fullName: `${signup.character.name}-${signup.character.realm}`,
        class: signup.class,
        role: signup.role,
        overallSelected: signup.selected,
        signupStatus: signup.status,
        _origIndex: idx,
      };
      enabledEncounters.forEach(enc => {
        const sel = enc.selections?.find(s => s.character_id === charId);
        (row as any)[`encounter_${enc.id}`] = sel; // store selection object (can be undefined)
      });
      return row;
    });

    // Sort by role weight, then by class name (alphabetical), then by character name (alphabetical), then original index
    data.sort((a, b) => {
      const wa = ROLE_SORT_WEIGHT[a.role] ?? 99;
      const wb = ROLE_SORT_WEIGHT[b.role] ?? 99;
      if (wa !== wb) return wa - wb;
      const classCmp = a.class.localeCompare(b.class, 'en');
      if (classCmp !== 0) return classCmp;
      const nameCmp = a.name.localeCompare(b.name, 'en');
      if (nameCmp !== 0) return nameCmp;
      return (a._origIndex ?? 0) - (b._origIndex ?? 0);
    });

    return showOnlyRaidRoster ? data.filter(r => r.overallSelected) : data;
  }, [raid, enabledEncounters, showOnlyRaidRoster]);

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
                        <div style={styleForClassColor(color)}>{rowData.name}</div>
                        {!rowData.overallSelected && (
                            <Tag size="xs" color="red" style={{alignSelf: 'flex-start', marginTop: 2}}>Bench</Tag>
                        )}
                        {!compact && (
                            <span style={{fontSize: 11, opacity: 0.65}}>{rowData.fullName}</span>
                        )}
                      </div>
                  );
                }}
              </Cell>
            </Column>
            {/* Removed overall Role column */}
            <Column width={80} align="center" verticalAlign="middle">
              <HeaderCell>Roster</HeaderCell>
              <Cell>
                {(rowData: RowDataShape) => rowData.overallSelected ? (
                    <Tag color="green" size="sm" style={{fontWeight: 600}}>In</Tag>
                ) : (
                    <Tag color="red" size="sm" style={{fontWeight: 600}}>Out</Tag>
                )}
              </Cell>
            </Column>
            {enabledEncounters.map((enc) => {
              const header = (
                  <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
                    <span style={{fontWeight: 600, fontSize: 12}}>{enc.name}</span>
                  </div>
              );
              const headerCell = enc.notes ? (
                  <Whisper placement="top" trigger="hover"
                           speaker={<Tooltip style={{maxWidth: 300}}>{enc.notes}</Tooltip>}>
                    {header}
                  </Whisper>
              ) : header;
              return (
                  <Column key={enc.id} width={compact ? 68 : 90} align="center" verticalAlign="middle">
                    <HeaderCell>{headerCell}</HeaderCell>
                    <Cell>
                      {(rowData: RowDataShape) => {
                        const sel: EncounterSelection | undefined = (rowData as any)[`encounter_${enc.id}`];
                        if (!sel) return <span style={{opacity: 0.25}}>—</span>;
                        const role = sel.role as Role;
                        const abbr = ROLE_ABBR[role] || role[0];
                        const selected = sel.selected;
                        const color = ROLE_BADGE_COLOR[role] || 'cyan';
                        const baseStyle: React.CSSProperties = selected ? {
                          fontWeight: 600
                        } : {
                          opacity: 0.45,
                          fontWeight: 500,
                          filter: 'grayscale(40%)'
                        };
                        const tag = <Tag size={compact ? 'sm' : 'md'} color={color} style={{
                          minWidth: compact ? 28 : 34,
                          textAlign: 'center', ...baseStyle
                        }}>{abbr}</Tag>;
                        return (
                            <Whisper placement="top" trigger="hover"
                                     speaker={<Tooltip>{role}{selected ? ' (selected)' : ' (bench)'}</Tooltip>}>
                              {tag}
                            </Whisper>
                        );
                      }}
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

// NEW: helper to compute luminance for contrast adjustments
function hexToRgb(hex: string): [number, number, number] | null {
  const h = hex.replace('#', '');
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    return [r, g, b];
  }
  if (h.length === 6) {
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  return null;
}

function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function styleForClassColor(hex: string): React.CSSProperties {
  const lum = relativeLuminance(hex);
  // If very bright (e.g. white, pale yellow, bright neon green) add a dark text shadow for contrast
  if (lum > 0.6) {
    return {fontWeight: 600, color: hex, textShadow: 'rgba(0, 0, 0, 0.85) 0px 0px 1px'};
  }
  return {fontWeight: 600, color: hex};
}
