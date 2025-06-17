import React, { useState, useEffect } from 'react';
import { PersonalityConfig, PersonalityFilter, PersonalityWeights } from '../../../shared/personality-types';
import { Brain, Sliders, Plus, Trash2, Save, Download, Upload } from 'lucide-react';

interface PersonalityCustomizerProps {
  personality?: PersonalityConfig;
  onSave: (personality: PersonalityConfig) => void;
  onCancel: () => void;
}

export function PersonalityCustomizer({ personality, onSave, onCancel }: PersonalityCustomizerProps) {
  const [config, setConfig] = useState<PersonalityConfig>(
    personality || createEmptyPersonality()
  );

  const updateBasicInfo = (field: keyof PersonalityConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const updateWeight = (key: keyof PersonalityWeights, value: number) => {
    setConfig(prev => ({
      ...prev,
      weights: { ...prev.weights, [key]: value }
    }));
  };

  const addFilter = () => {
    const newFilter: PersonalityFilter = {
      type: 'content',
      condition: 'contains',
      value: '',
      weight: 0.5
    };
    setConfig(prev => ({
      ...prev,
      filters: [...prev.filters, newFilter]
    }));
  };

  const removeFilter = (index: number) => {
    setConfig(prev => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== index)
    }));
  };

  const updateFilter = (index: number, field: keyof PersonalityFilter, value: any) => {
    setConfig(prev => ({
      ...prev,
      filters: prev.filters.map((filter, i) => 
        i === index ? { ...filter, [field]: value } : filter
      )
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            {personality ? 'Edit' : 'Create'} Personality Mode
          </h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => exportPersonality(config)}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <input
            type="file"
            accept=".yaml,.yml,.json"
            onChange={(e) => importPersonality(e, setConfig)}
            className="hidden"
            id="import-personality"
          />
          <label
            htmlFor="import-personality"
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md flex items-center space-x-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </label>
        </div>
      </div>      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Personality Name
          </label>
          <input
            type="text"
            value={config.name}
            onChange={(e) => updateBasicInfo('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Innovation Hunter"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Personality ID
          </label>
          <input
            type="text"
            value={config.id}
            onChange={(e) => updateBasicInfo('id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., innovation_hunter"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={config.description}
            onChange={(e) => updateBasicInfo('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe this personality's focus and approach..."
          />
        </div>
      </div>

      {/* Focus Areas */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Focus Areas (comma-separated)
        </label>
        <input
          type="text"
          value={config.focus.join(', ')}
          onChange={(e) => updateBasicInfo('focus', e.target.value.split(',').map(s => s.trim()))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., innovation, breakthrough, disruption"
        />
      </div>      {/* Personality Weights */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Sliders className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Analysis Weights</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(config.weights).map(([key, value]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {key.replace('_', ' ').toUpperCase()}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={value}
                onChange={(e) => updateWeight(key as keyof PersonalityWeights, parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 text-center">{value.toFixed(1)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Filters */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Content Filters</h3>
          <button
            onClick={addFilter}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-1 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Filter</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {config.filters.map((filter, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
              <select
                value={filter.type}
                onChange={(e) => updateFilter(index, 'type', e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="content">Content</option>
                <option value="source">Source</option>
                <option value="relevance">Relevance</option>
                <option value="temporal">Temporal</option>
                <option value="quality">Quality</option>
              </select>
              
              <select
                value={filter.condition}
                onChange={(e) => updateFilter(index, 'condition', e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="contains">Contains</option>
                <option value="excludes">Excludes</option>
                <option value="equals">Equals</option>
                <option value="greater_than">Greater Than</option>
                <option value="less_than">Less Than</option>
              </select>              <input
                type="text"
                value={filter.value.toString()}
                onChange={(e) => updateFilter(index, 'value', e.target.value)}
                placeholder="Filter value..."
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              
              <input
                type="number"
                value={filter.weight}
                onChange={(e) => updateFilter(index, 'weight', parseFloat(e.target.value))}
                min="0"
                max="1"
                step="0.1"
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              
              <button
                onClick={() => removeFilter(index)}
                className="p-1 text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(config)}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Personality</span>
        </button>
      </div>
    </div>
  );
}

function createEmptyPersonality(): PersonalityConfig {
  return {
    id: '',
    name: '',
    description: '',
    focus: [],
    filters: [],
    prompts: {
      analysis: '',
      synthesis: '',
      critique: '',
      recommendation: ''
    },
    weights: {
      technical_depth: 0.5,
      practical_application: 0.5,
      novelty: 0.5,
      risk_assessment: 0.5,
      opportunity_identification: 0.5,
      implementation_feasibility: 0.5,
      competitive_advantage: 0.5,
      user_impact: 0.5
    },
    examples: [],
    enabled: true,
    custom: true
  };
}function exportPersonality(personality: PersonalityConfig) {
  const dataStr = JSON.stringify(personality, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${personality.id || 'personality'}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function importPersonality(
  event: React.ChangeEvent<HTMLInputElement>,
  setConfig: React.Dispatch<React.SetStateAction<PersonalityConfig>>
) {
  const file = event.target.files?.[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const imported = JSON.parse(content) as PersonalityConfig;
      setConfig(imported);
    } catch (error) {
      console.error('Failed to import personality:', error);
      alert('Failed to import personality file. Please check the format.');
    }
  };
  reader.readAsText(file);
}