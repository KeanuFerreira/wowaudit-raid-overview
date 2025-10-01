import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  // Access Vercel environment variables exposed via VITE_ prefix
  const wowauditCredential = import.meta.env.VITE_WOWAUDIT_CREDENTIAL;
  const wowauditUrl = import.meta.env.VITE_WOWAUDIT_URL;
    console.log('env', {
        VITE_WOWAUDIT_CREDENTIAL: import.meta.env.VITE_WOWAUDIT_CREDENTIAL,
        VITE_WOWAUDIT_URL: import.meta.env.VITE_WOWAUDIT_URL,
        MODE: import.meta.env.MODE,
        e: import.meta.env
    });
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <div>
          Credential: {wowauditCredential}
        </div>
        <div>
          URL: {wowauditUrl}
        </div>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
