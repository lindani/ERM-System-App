import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const [risks, setRisks] = useState([]);

  useEffect(() => {
    axios.get('/api/risks')
      .then(res => setRisks(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-blue-800">Enterprise Risk Management</h1>
      <div className="mt-4 p-4 bg-black rounded shadow">
        <h2 className="text-xl font-semibold">Risk Register</h2>
        <ul className="mt-2">
          {risks.map(risk => (
            <li key={risk.id} className="py-2 border-b">
              {risk.name} (Score: {risk.score})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}