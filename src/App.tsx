import './App.css'
import RaidSelect from "./raid-select/RaidSelect.tsx";
import {useEffect, useState} from "react";


const fetchRaidData = async (raidId) => {
    return fetch(`/api/wowaudit?targetRoute=${encodeURIComponent(`raids/${raidId}`)}`)
        .then(response => response.json())
}

function App() {
    // Access Vercel environment variables exposed via VITE_ prefix
    const [selectedRaid, setSelectedRaid] = useState(null);
    const [selectedRaidData, setSelectedRaidData] = useState(null);
    const [characters, setCharacters] = useState([]);

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
        // @ts-ignore
        if (selectedRaid && selectedRaid.id) {
            fetchRaidData(selectedRaid.id).then(data => {
                console.log(data)
                setSelectedRaidData(data);
            })
        }
    }, [selectedRaid]);
    console.log({selectedRaid, selectedRaidData, characters})
    return (
        <>
            <RaidSelect
                // @ts-ignore
                onChange={setSelectedRaid}
            />
        </>
    )
}

export default App
