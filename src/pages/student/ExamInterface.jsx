import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import Button from '../../components/ui/Button';
import { Clock, Camera, Mic, AlertTriangle, CheckCircle2, ChevronRight, ChevronLeft, Flag, Play, Send } from 'lucide-react';
import { useAuth } from '../../utils/AuthContext';

const DEFAULT_CODE = {
  java: 'public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}',
  c: '#include <stdio.h>\nint main() {\n    // Write your code here\n    return 0;\n}',
  cpp: '#include <iostream>\nusing namespace std;\nint main() {\n    // Write your code here\n    return 0;\n}',
  python: '# Write your code here\n'
};

const MONACO_LANGUAGE_MAP = {
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  python: 'python'
};

const ExamInterface = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(5400); // 90 mins in seconds
  const [activeQuestion, setActiveQuestion] = useState(1);
  
  const [selectedLanguage, setSelectedLanguage] = useState('java');
  const [codeByLanguage, setCodeByLanguage] = useState(DEFAULT_CODE);
  
  const [inputVal, setInputVal] = useState('');
  const [outputVal, setOutputVal] = useState('');
  const [status, setStatus] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  // Proctoring States
  const [warnings, setWarnings] = useState([]);
  const [audioLevel, setAudioLevel] = useState(20);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const audioInterval = setInterval(() => {
      setAudioLevel(Math.floor(Math.random() * 40) + 10);
    }, 500);
    return () => clearInterval(audioInterval);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}h ` : ''}${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const handleTabSwitch = () => {
    setWarnings(prev => [...prev, { id: Date.now(), msg: "Tab switch detected! Return to exam immediately." }]);
    setTimeout(() => setWarnings(prev => prev.slice(1)), 5000);
  };

  const submitExam = () => {
    navigate('/student/results');
  };

  const handleEditorChange = (value) => {
    setCodeByLanguage(prev => ({
      ...prev,
      [selectedLanguage]: value
    }));
  };

  const handleRunCode = () => {
    setIsExecuting(true);
    setStatus('Running...');
    setOutputVal('');
    setTimeout(() => {
      setIsExecuting(false);
      // Simulate pass/fail
      const isPassed = Math.random() > 0.5;
      if (isPassed) {
        setStatus('Passed');
        setOutputVal('Compiler Output:\nBuild successful\nExecution successful.\n\nAll test cases passed.');
      } else {
        setStatus('Failed');
        setOutputVal('Compiler Output:\nRuntime Error at line 4.\n\nTest cases failed.');
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50" onMouseLeave={handleTabSwitch}>
      {/* Top Bar */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-md font-bold tracking-widest text-sm border border-red-100">
            <Clock size={16} />
            {formatTime(timeLeft)}
          </div>
          <span className="h-6 w-px bg-gray-300"></span>
          <span className="font-semibold text-gray-800">{user?.userName || 'Candidate'}</span>
        </div>
        
        <div className="flex items-center gap-6">
          <select 
            value={selectedLanguage} 
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="border border-gray-300 rounded-md py-1 px-3 text-sm focus:ring-primary focus:border-primary font-medium"
          >
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="python">Python</option>
          </select>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5 text-green-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <Camera size={14} /> Camera ON
            </div>
            <div className="flex items-center gap-1.5 text-green-600">
              <Mic size={14} /> Mic ON
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* Center Panel */}
        <section className="flex-1 flex flex-col bg-gray-50 overflow-hidden relative">
          
          {warnings.length > 0 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-2">
              <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 font-semibold">
                <AlertTriangle className="animate-pulse" />
                {warnings[warnings.length - 1].msg}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 flex flex-col xl:flex-row gap-4 h-full">
            {/* Question Display */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 xl:w-1/3 xl:overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Problem {activeQuestion}</h2>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">Medium</span>
              </div>
              <div className="prose prose-sm max-w-none text-gray-700">
                <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p>
                <p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>
                <p>You can return the answer in any order.</p>
                <div className="mt-6 border border-gray-200 rounded overflow-hidden">
                   <div className="bg-gray-100 px-3 py-2 text-xs font-bold border-b border-gray-200 text-gray-600">Sample Input</div>
                   <div className="p-3 bg-gray-50 text-xs font-mono">
                     nums = [2,7,11,15]<br/>target = 9
                   </div>
                </div>
                <div className="mt-4 border border-gray-200 rounded overflow-hidden">
                   <div className="bg-gray-100 px-3 py-2 text-xs font-bold border-b border-gray-200 text-gray-600">Expected Output</div>
                   <div className="p-3 bg-gray-50 text-xs font-mono">
                     [0,1]
                   </div>
                </div>
              </div>
            </div>

            {/* Editor & Console */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden xl:w-2/3 h-full">
               <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col bg-white">
                  <Editor
                    height="100%"
                    language={MONACO_LANGUAGE_MAP[selectedLanguage]}
                    theme="vs-dark"
                    value={codeByLanguage[selectedLanguage]}
                    onChange={handleEditorChange}
                    options={{
                       minimap: { enabled: false },
                       fontSize: 14,
                       wordWrap: 'on'
                    }}
                  />
               </div>
               
               {/* I/O Console below the editor */}
               <div className="h-64 border border-gray-200 bg-white rounded-xl shadow-sm flex flex-col overflow-hidden shrink-0">
                  <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 bg-gray-50">
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-semibold text-gray-700">Test Console</span>
                       {status && (
                         <span className={`text-xs px-2 py-0.5 rounded font-bold ${status === 'Passed' ? 'bg-green-100 text-green-700' : status === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                           {status}
                         </span>
                       )}
                    </div>
                    <div className="flex gap-2">
                       <Button size="sm" variant="outline" onClick={handleRunCode} disabled={isExecuting}>
                         {isExecuting ? <Loader size={14} className="animate-spin mr-1"/> : <Play size={14} className="mr-1"/>} Run Code
                       </Button>
                       <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleRunCode} disabled={isExecuting}>
                          <Send size={14} className="mr-1"/> Submit Code
                       </Button>
                    </div>
                  </div>
                  <div className="flex flex-1 overflow-hidden">
                     <div className="w-1/2 p-4 border-r border-gray-200 flex flex-col">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-2">Custom Input</label>
                        <textarea 
                           className="flex-1 border border-gray-300 rounded p-2 text-sm font-mono resize-none focus:ring-1 focus:ring-primary outline-none"
                           value={inputVal}
                           onChange={(e) => setInputVal(e.target.value)}
                           placeholder="Enter input here..."
                        />
                     </div>
                     <div className="w-1/2 p-4 flex flex-col bg-gray-50">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-2">Output</label>
                        <div className="flex-1 border border-gray-300 bg-white rounded p-2 text-sm font-mono overflow-y-auto whitespace-pre-wrap">
                           {outputVal}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

          </div>

          {/* Bottom Navigation */}
          <div className="h-16 bg-white border-t border-gray-200 shrink-0 flex items-center justify-between px-6 z-10">
            <Button 
              variant="outline" 
              disabled={activeQuestion === 1}
              onClick={() => setActiveQuestion(p => p - 1)}
            >
              <ChevronLeft size={16} className="mr-1"/> Previous Problem
            </Button>
            <Button 
              onClick={() => activeQuestion < 5 ? setActiveQuestion(p => p + 1) : submitExam()}
            >
              {activeQuestion < 5 ? <span className="flex items-center">Next Problem <ChevronRight size={16} className="ml-1"/></span> : 'Finish Assessment'}
            </Button>
          </div>
        </section>

        {/* Right Panel: Proctoring UI */}
        <aside className="w-64 bg-white border-l border-gray-200 shrink-0 hidden lg:flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Live Proctoring</h3>
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-300 shadow-inner">
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera size={32} className="opacity-20 text-white" />
              </div>
              <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span> REC
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs font-medium text-gray-500 mb-1.5">
                <span>Microphone</span>
                {audioLevel > 30 ? <span className="text-orange-500">High Noise</span> : <span className="text-green-500">Normal</span>}
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-100 ${audioLevel > 30 ? 'bg-orange-500' : 'bg-green-500'}`}
                  style={{ width: `${audioLevel}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">System Logs</h3>
             <ul className="space-y-3">
               <li className="flex gap-2 text-xs text-gray-600">
                 <CheckCircle2 size={14} className="text-green-500 shrink-0"/>
                 <span>Face detected clearly. Lighting optimal.</span>
               </li>
               <li className="flex gap-2 text-xs text-gray-600">
                 <CheckCircle2 size={14} className="text-green-500 shrink-0"/>
                 <span>Audio environment normal.</span>
               </li>
             </ul>
          </div>
        </aside>
      </main>
    </div>
  );
};
export default ExamInterface;
