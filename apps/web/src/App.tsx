import { useState, useEffect } from 'react'
import './App.css'

type Course = {
  uuid: string
  name: string
  description: string
}

function App() {
  const [courses, setCourses] = useState<Course[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses')
        if (!response.ok) {
          throw new Error('Failed to fetch courses')
        }
        const data = await response.json()
        setCourses(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    fetchCourses()
  }, [])

  return (
    <div>
      <h1>Hello TdA</h1>
      <section>
        <h2>Kurzy (API preview)</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!error && (
          <ul>
            {courses.map((course) => (
              <li key={course.uuid}>
                <strong>{course.name}</strong> – {course.description}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default App
