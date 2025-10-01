import './App.css'
import RaidSelect, {WowAuditRaidEvent} from "./raid-select/RaidSelect.tsx";
import {useEffect, useState} from "react";
import 'rsuite/dist/rsuite.min.css';
import './theme.css';
import {Character, DetailedRaidEvent} from "./types.ts";
import RaidSelectionBoard from './raid-selection-board/RaidSelectionBoard.tsx';
import {Container, Content, CustomProvider, Loader, Toggle} from 'rsuite';
import {applyTheme, initTheme, rsuiteTheme, ThemeMode} from './theme';

const fetchRaidData = async (raidId) => {
    return fetch(`/api/wowaudit?targetRoute=${encodeURIComponent(`raids/${raidId}`)}`)
        .then(response => response.json())
}

function App() {
    // Access Vercel environment variables exposed via VITE_ prefix
    const [selectedRaid, setSelectedRaid] = useState<WowAuditRaidEvent | null>(null);
    const [selectedRaidData, setSelectedRaidData] = useState<DetailedRaidEvent | null>(null);
    const [characters, setCharacters] = useState<Character[]>([]);
    const [raidLoading, setRaidLoading] = useState(false);
    const [theme, setTheme] = useState<ThemeMode>(() => (typeof document !== 'undefined' ? initTheme() : 'light'));

    const switchTheme = (next: boolean) => {
        const t: ThemeMode = next ? 'dark' : 'light';
        setTheme(t);
        applyTheme(t);
    };

    console.log(characters)
    useEffect(() => {
        // load all characters from /api/wowaudit?targetRoute=${encodeURIComponent('characters')}
        fetch(`/api/wowaudit?targetRoute=${encodeURIComponent('characters')}`)
            .then(response => response.json())
            .then(data => {
                setCharacters(data);
            });
    }, []);


    useEffect(() => {
        // load the selected raid from /api/wowaudit?targetRoute=${encodeURIComponent(`raids/${raidId}`)}
        if (selectedRaid && selectedRaid.id) {
            let cancelled = false;
            setRaidLoading(true);
            fetchRaidData(selectedRaid.id).then(data => {
                if (cancelled) return;
                setSelectedRaidData(data);
            }).finally(() => !cancelled && setRaidLoading(false));
            return () => {
                cancelled = true;
            };
        } else {
            setSelectedRaidData(null);
        }
    }, [selectedRaid]);

    return (
        <CustomProvider theme={rsuiteTheme(theme)}>
            <Container style={{padding: 24, maxWidth: 1400, margin: '0 auto'}}>
                <Content>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                            <div style={{flex: 1}}>
                                <RaidSelect onChange={setSelectedRaid}/>
                            </div>
                            <Toggle checked={theme === 'dark'} onChange={switchTheme} checkedChildren="Dark"
                                    unCheckedChildren="Light"/>
                        </div>
                        {selectedRaid && raidLoading && !selectedRaidData && (
                            <div style={{padding: 32, textAlign: 'center'}}>
                                <Loader size="md" content="Loading raid details..."/>
                            </div>
                        )}
                        <RaidSelectionBoard raid={selectedRaidData} loading={raidLoading}/>
                    </div>
                </Content>
            </Container>
        </CustomProvider>
    )
}

export default App
