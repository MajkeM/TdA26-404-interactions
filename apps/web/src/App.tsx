import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [users, setUsers] = useState<unknown>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch('/api/users')
      const data = await response.json()
      setUsers(data)
    }
    
    fetchUsers()
  }, [])

  return (
    <div>
      <h1>Hello TdA</h1>
      <pre>
        {JSON.stringify(users, null, 2)}
      </pre>
      <div>
        <section>
          <h2>API Status</h2>
        </section>
      </div>
    </div>
  )
}

export default App
