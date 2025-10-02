import React, {useMemo} from 'react';
import {DetailedRaidEvent, EncounterSelection, RaidSignup, Role} from '../types';
import {Divider, FlexboxGrid, Image, Panel, Placeholder, Table, Tag, Tooltip, Whisper} from 'rsuite';

// Import role icons
import TankIcon from '../assets/tank.svg';
import HealIcon from '../assets/healer.svg';
import MDPSIcon from '../assets/mdps.svg';
import RDPSIcon from '../assets/rdps.svg';

import deathknightIcon from '../assets/deathknight.png';
import demonhunterIcon from '../assets/demonhunter.png';
import druidIcon from '../assets/druid.png';
import evokerIcon from '../assets/evoker.png';
import hunterIcon from '../assets/hunter.png';
import mageIcon from '../assets/mage.png';
import monkIcon from '../assets/monk.png';
import paladinIcon from '../assets/paladin.png';
import priestIcon from '../assets/priest.png';
import rogueIcon from '../assets/rogue.png';
import shamanIcon from '../assets/shaman.png';
import warlockIcon from '../assets/warlock.png';
import warriorIcon from '../assets/warrior.png';

// Add class icon mapping immediately after imports
const CLASS_ICONS: Record<string, string> = {
  'Death Knight': deathknightIcon,
  'Demon Hunter': demonhunterIcon,
  'Druid': druidIcon,
  'Evoker': evokerIcon,
  'Hunter': hunterIcon,
  'Mage': mageIcon,
  'Monk': monkIcon,
  'Paladin': paladinIcon,
  'Priest': priestIcon,
  'Rogue': rogueIcon,
  'Shaman': shamanIcon,
  'Warlock': warlockIcon,
  'Warrior': warriorIcon,
};

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


// NEW: custom sort weights -> Tank (0) -> Heal (1) -> DPS (2)
const ROLE_SORT_WEIGHT: Record<string, number> = {
  'Tank': 0,
  'Heal': 1,
  'Melee': 2,
  'Ranged': 3,
};

interface RowDataShape {
  id: number;
  name: string;
  fullName: string; // name-realm
  class: string;
  role: string;
  overallSelected: boolean;
  signupStatus: string;
  _origIndex?: number; // internal for stable sorting
  encounterSelections: Record<number, EncounterSelection | undefined>;
}

const RaidSelectionBoard: React.FC<RaidSelectionBoardProps> = ({raid, loading = false, height}) => {

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
        encounterSelections: {}
      };
      enabledEncounters.forEach(enc => {
        row.encounterSelections[enc.id] = enc.selections?.find(s => s.character_id === charId);
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

    return data.filter(r => r.overallSelected);
  }, [raid, enabledEncounters]);

  if (!raid) {
    return (
        <Panel bordered header="Raid Selection">
          {loading ? <Placeholder.Paragraph rows={4}/> : <Placeholder.Paragraph rows={3}/>}<span style={{opacity: 0.6}}>Select a raid to view its encounter selection matrix.</span>
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
        </FlexboxGrid>
        <Divider style={{margin: '8px 0'}}/>
        <div style={{width: '100%', overflowX: 'auto'}}>
          <Table
              data={rows}
              autoHeight={!height}
              height={height}
              rowHeight={32}
              headerHeight={56}
              bordered
              cellBordered
              wordWrap
              affixHeader
              loading={loading}
          >
            <Column width={200} fixed verticalAlign="middle" fullText>
              <HeaderCell><b>Character</b></HeaderCell>
              <Cell>
                {(rowData: RowDataShape) => {
                  const color = CLASS_COLORS[rowData.class] || '#888';
                  const iconSrc = CLASS_ICONS[rowData.class];
                  return (
                      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <Image src={iconSrc} alt={rowData.class} width={28} height={28} circle
                               style={{objectFit: 'contain', marginBottom: 2}}/>
                        <div className="raid-char-name" style={styleForClassColor(color)}>{rowData.name}</div>
                      </div>
                  );
                }}
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
                  <Column key={enc.id} width={100} align="center" verticalAlign="middle">
                    <HeaderCell>{headerCell}</HeaderCell>
                    <Cell>
                      {(rowData: RowDataShape) => {
                        const sel = rowData.encounterSelections[enc.id];
                        if (!sel) return <span style={{opacity: 0.25}}>—</span>;
                        const role = sel.role as Role;
                        const selected = sel.selected;
                        if (!selected) {
                          // Benched for this encounter
                          return (
                              <Whisper placement="top" trigger="hover"
                                       speaker={<Tooltip>{role} (bench)</Tooltip>}>
                                <Tag size="sm" color="red"
                                     style={{minWidth: 48, textAlign: 'center', fontWeight: 600}}>Bench</Tag>
                              </Whisper>
                          );
                        }
                        // Selected: show role icon
                        let iconSrc: string;
                        switch (role) {
                          case 'Tank':
                            iconSrc = TankIcon;
                            break;
                          case 'Heal':
                            iconSrc = HealIcon;
                            break;
                          case 'Melee':
                            iconSrc = MDPSIcon;
                            break;
                          case 'Ranged':
                          default:
                            iconSrc = RDPSIcon;
                            break;
                        }
                        const img = <img src={iconSrc} alt={role}
                                         style={{width: 28, height: 28, objectFit: 'contain'}}/>;
                        return (
                            <Whisper placement="top" trigger="hover"
                                     speaker={<Tooltip>{role} (selected)</Tooltip>}>
                              {img}
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
  const isDark = typeof document !== 'undefined' && document.body.getAttribute('data-theme') === 'dark';
  if (isDark) {
    // On dark background, brighten very dark colors slightly and keep bright colors vivid with subtle glow
    if (lum < 0.25) {
      return {fontWeight: 600, color: hex, filter: 'brightness(1.25)'};
    }
    return {fontWeight: 600, color: hex};
  }
  if (lum > 0.8) {
    return {fontWeight: 400, color: hex, textShadow: '1px 1px 5px #000', fontSize: '1.25em'};
  }
  return {fontWeight: 600, color: hex, fontSize: '1.25em'};
}
