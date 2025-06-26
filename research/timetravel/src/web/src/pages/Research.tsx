import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

export function Research() {
  const { id } = useParams()
  const [topic, setTopic] = useState('')
  const [depth, setDepth] = useState('comprehensive')
  const [isResearching, setIsResearching] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsResearching(true)
    // TODO: Implement research submission
    console.log('Starting research:', { topic, depth })
    setTimeout(() => setIsResearching(false), 2000)
  }

  if (id) {
    return (
      <div className='p-6'>
        <h1 className='text-2xl font-bold mb-4'>Research Details</h1>
        <p>Viewing research ID: {id}</p>
        {/* TODO: Load and display research details */}
      </div>
    )
  }

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-bold mb-6'>New Research</h1>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <label htmlFor='topic' className='block text-sm font-medium text-gray-700 mb-2'>
            Research Topic
          </label>
          <input
            type='text'
            id='topic'
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            placeholder='Enter your research topic...'
            required
          />
        </div>

        <div>
          <label htmlFor='depth' className='block text-sm font-medium text-gray-700 mb-2'>
            Research Depth
          </label>
          <select
            id='depth'
            value={depth}
            onChange={(e) => setDepth(e.target.value)}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            <option value='quick'>Quick (5-10 min)</option>
            <option value='standard'>Standard (15-30 min)</option>
            <option value='comprehensive'>Comprehensive (30-60 min)</option>
            <option value='deep'>Deep Dive (60+ min)</option>
          </select>
        </div>

        <button
          type='submit'
          disabled={isResearching || !topic}
          className='w-full py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
        >
          {isResearching ? 'Researching...' : 'Start Research'}
        </button>
      </form>
    </div>
  )
}
