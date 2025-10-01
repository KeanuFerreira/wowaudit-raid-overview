// String-literal unions from your sample
export type WoWClass =
    | 'Hunter'
    | 'Priest'
    | 'Demon Hunter'
    | 'Paladin'
    | 'Warlock'
    | 'Mage'
    | 'Shaman'
    | 'Warrior'
    | 'Death Knight'
    | 'Rogue'
    | 'Monk'
    | 'Evoker'
    | 'Druid';

export type Role = 'Ranged' | 'Heal' | 'Melee' | 'Tank';
export type Rank = 'Main' | 'Alt';
export type TrackingStatus = 'tracking'; // extend later if needed

export interface Character {
    id: number;
    name: string;                 // Unicode-safe (names like “Stòórmi”, “Yuukîî”)
    realm: string;                // e.g., "Eredar", "Blackhand", ...
    class: WoWClass;
    role: Role;
    rank: Rank;
    status: TrackingStatus;
}


// Reuse from your Character types:
// export type WoWClass = ...;
// export type Role = 'Ranged' | 'Heal' | 'Melee' | 'Tank';

export type RaidDifficulty = 'Mythic' | 'Heroic' | 'Normal';
export type RaidPlanStatus = 'Planned' | 'In Progress' | 'Completed' | 'Cancelled'; // extend as needed
export type SignupStatus = 'Present' | 'Absent' | 'Unknown';

// Branded primitives to indicate intended formats (no runtime enforcement)
export type ISODateYYYYMMDD = string;  // e.g., "2025-10-02"
export type HHMM = string;              // e.g., "19:30"
export type HttpUrl = string;

export interface InlineCharacter {
    id: number;
    name: string;
    realm: string;
    class: WoWClass;
    role: Role;       // role of the character (may differ from per-encounter assignment)
    guest: boolean;   // true if external/guest
}

export interface RaidSignup {
    character: InlineCharacter;
    status: SignupStatus; // Present/Absent/Unknown
    comment: string | null;
    selected: boolean;    // selected for the overall raid roster
    class: WoWClass;      // denormalized snapshot at signup time
    role: Role;           // denormalized snapshot at signup time
}

export interface EncounterSelection {
    character_id: number;
    selected: boolean;  // selected for THIS encounter specifically
    class: WoWClass;    // per-encounter class snapshot
    role: Role;         // per-encounter role assignment (can differ from character.role)
}

export interface RaidEncounter {
    name: string;
    id: number;
    enabled: boolean;      // whether the boss is enabled in planning
    extra: boolean;        // marks extra/optional bosses or pulls
    notes: string | null;  // may contain HTML (e.g., "<p>...</p>")
    selections?: EncounterSelection[]; // absent on disabled bosses
}

export interface DetailedRaidEvent {
    id: number;
    date: ISODateYYYYMMDD;     // "2025-10-02"
    start_time: HHMM;          // "19:30"
    end_time: HHMM;            // "22:30"
    instance: string;          // "Manaforge Omega"
    optional: boolean;         // whether the event itself is optional
    difficulty: RaidDifficulty;
    status: RaidPlanStatus;    // "Planned" in your sample
    present_size: number;      // current count of 'Present' signups (or selected)
    total_size: number;        // target/max roster size
    notes: string | null;      // may contain HTML
    selections_image: HttpUrl; // URL to composition image
    signups: RaidSignup[];
    encounters: RaidEncounter[];
}

// If you prefer enums instead of unions:
export enum RaidDifficultyEnum { Mythic = 'Mythic', Heroic = 'Heroic', Normal = 'Normal' }

export enum RaidPlanStatusEnum {
    Planned = 'Planned',
    InProgress = 'In Progress',
    Completed = 'Completed',
    Cancelled = 'Cancelled'
}

export enum SignupStatusEnum { Present = 'Present', Absent = 'Absent', Unknown = 'Unknown' }
