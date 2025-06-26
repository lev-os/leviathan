import React, { useState } from 'react'

export function Settings() {
  const [apiKeys, setApiKeys] = useState({
    perplexity: '',
    brave: '',
    exa: '',
    firecrawl: '',
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Save settings to API
    console.log('Saving settings:', apiKeys)
  }

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-bold mb-6'>Settings</h1>

      <form onSubmit={handleSave} className='space-y-6'>
        <div className='bg-white shadow rounded-lg p-6'>
          <h2 className='text-xl font-semibold mb-4'>API Configuration</h2>

          <div className='space-y-4'>
            <div>
              <label htmlFor='perplexity' className='block text-sm font-medium text-gray-700 mb-1'>
                Perplexity API Key
              </label>
              <input
                type='password'
                id='perplexity'
                value={apiKeys.perplexity}
                onChange={(e) => setApiKeys({ ...apiKeys, perplexity: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                placeholder='sk-...'
              />
            </div>

            <div>
              <label htmlFor='brave' className='block text-sm font-medium text-gray-700 mb-1'>
                Brave Search API Key
              </label>
              <input
                type='password'
                id='brave'
                value={apiKeys.brave}
                onChange={(e) => setApiKeys({ ...apiKeys, brave: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                placeholder='BSA...'
              />
            </div>

            <div>
              <label htmlFor='exa' className='block text-sm font-medium text-gray-700 mb-1'>
                Exa API Key
              </label>
              <input
                type='password'
                id='exa'
                value={apiKeys.exa}
                onChange={(e) => setApiKeys({ ...apiKeys, exa: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                placeholder='exa-...'
              />
            </div>

            <div>
              <label htmlFor='firecrawl' className='block text-sm font-medium text-gray-700 mb-1'>
                Firecrawl API Key
              </label>
              <input
                type='password'
                id='firecrawl'
                value={apiKeys.firecrawl}
                onChange={(e) => setApiKeys({ ...apiKeys, firecrawl: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                placeholder='fc-...'
              />
            </div>
          </div>
        </div>

        <button
          type='submit'
          className='px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors'
        >
          Save Settings
        </button>
      </form>
    </div>
  )
}
