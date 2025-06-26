import React from 'react'
import { useNavigate } from 'react-router-dom'

export function History() {
  const navigate = useNavigate()

  // TODO: Load research history from API
  const mockHistory = [
    { id: '1', topic: 'AI Reasoning Models', date: '2025-01-09', status: 'completed' },
    { id: '2', topic: 'Subquadratic Architectures', date: '2025-01-08', status: 'completed' },
    { id: '3', topic: 'World Models in AI', date: '2025-01-07', status: 'failed' },
  ]

  return (
    <div className='p-6'>
      <h1 className='text-3xl font-bold mb-6'>Research History</h1>

      <div className='bg-white shadow rounded-lg overflow-hidden'>
        <table className='min-w-full'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Topic</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Date</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
              <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {mockHistory.map((research) => (
              <tr key={research.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{research.topic}</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{research.date}</td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                      research.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {research.status}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                  <button onClick={() => navigate(`/research/${research.id}`)} className='text-blue-600 hover:text-blue-900'>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
