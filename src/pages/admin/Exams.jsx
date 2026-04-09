import React, { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function Exams() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '60',
    languages: {
      java: true,
      c: true,
      cpp: true,
      python: true
    }
  });

  const [questions, setQuestions] = useState([
    { id: 1, statement: '', input: '', output: '' }
  ]);

  const handleLanguageChange = (lang) => {
    setFormData(prev => ({
      ...prev,
      languages: {
        ...prev.languages,
        [lang]: !prev.languages[lang]
      }
    }));
  };

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now(), statement: '', input: '', output: '' }]);
  };

  const removeQuestion = (id) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // mock save
    alert('Exam Saved Successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Create New Exam</h1>
        <Button variant="primary" onClick={handleSubmit} icon={<Save className="w-4 h-4" />}>
          Save Exam
        </Button>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Exam Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Title</label>
              <Input 
                placeholder="e.g., Software Engineering Campus Drive 2024" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 outline-none border"
                rows={3}
                placeholder="Provide details about the exam..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <Input 
                type="number" 
                min="1" 
                value={formData.duration}
                onChange={e => setFormData({...formData, duration: e.target.value})}
                className="max-w-xs"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Allowed Languages</label>
              <div className="flex gap-6">
                {['java', 'c', 'cpp', 'python'].map(lang => (
                  <label key={lang} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      checked={formData.languages[lang]}
                      onChange={() => handleLanguageChange(lang)}
                    />
                    <span className="text-sm font-medium text-gray-700 uppercase">{lang === 'cpp' ? 'c++' : lang}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Questions</h2>
            <Button variant="outline" type="button" onClick={addQuestion} icon={<Plus className="w-4 h-4" />}>
              Add Question
            </Button>
          </div>

          {questions.map((q, index) => (
            <div key={q.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900">Question {index + 1}</h3>
                {questions.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeQuestion(q.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Problem Statement</label>
                <textarea 
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 outline-none border font-mono text-sm"
                  rows={4}
                  value={q.statement}
                  onChange={e => updateQuestion(q.id, 'statement', e.target.value)}
                  placeholder="Describe the coding problem here..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sample Input</label>
                  <textarea 
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 outline-none border font-mono text-sm"
                    rows={3}
                    value={q.input}
                    onChange={e => updateQuestion(q.id, 'input', e.target.value)}
                    placeholder="e.g., 5\n1 2 3 4 5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Output</label>
                  <textarea 
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 outline-none border font-mono text-sm"
                    rows={3}
                    value={q.output}
                    onChange={e => updateQuestion(q.id, 'output', e.target.value)}
                    placeholder="e.g., 15"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}
