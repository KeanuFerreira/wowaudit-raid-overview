import './App.css'
import RaidSelect, {WowAuditRaidEvent} from "./raid-select/RaidSelect.tsx";
import {useEffect, useState} from "react";
import 'rsuite/dist/rsuite-no-reset.min.css';
import {Character, DetailedRaidEvent} from "./types.ts";
import RaidSelectionBoard from './raid-selection-board/RaidSelectionBoard.tsx';
import {Container, Content, Loader} from 'rsuite';

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
        <Container style={{padding: 24, maxWidth: 1400, margin: '0 auto'}}>
            <Content>
                <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                    <RaidSelect onChange={setSelectedRaid}/>
                    {selectedRaid && raidLoading && !selectedRaidData && (
                        <div style={{padding: 32, textAlign: 'center'}}>
                            <Loader size="md" content="Loading raid details..."/>
                        </div>
                    )}
                    <RaidSelectionBoard raid={selectedRaidData} loading={raidLoading}/>
                </div>
            </Content>
        </Container>
    )
}

export default App
