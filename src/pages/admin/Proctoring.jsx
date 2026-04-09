import React, { useState } from 'react';
import { Camera, Mic, LayoutDashboard, Maximize2, X } from 'lucide-react';
import Button from '../../components/ui/Button';

const mockLiveCandidates = [
  { id: 1, name: 'Alex Johnson', language: 'Java', faceDetected: true, audioLevel: 20, tabAlert: false, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop' },
  { id: 2, name: 'Samantha Lee', language: 'Python', faceDetected: false, audioLevel: 10, tabAlert: true, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop' },
  { id: 3, name: 'Michael Chen', language: 'C++', faceDetected: true, audioLevel: 85, tabAlert: false, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop' },
  { id: 4, name: 'Emily Davis', language: 'Python', faceDetected: true, audioLevel: 15, tabAlert: false, image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop' },
  { id: 5, name: 'David Smith', language: 'C', faceDetected: true, audioLevel: 45, tabAlert: false, image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop' },
  { id: 6, name: 'Rachel Green', language: 'Java', faceDetected: false, audioLevel: 5, tabAlert: false, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop' },
];

export default function Proctoring() {
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Live Proctoring</h1>
        <div className="flex gap-2">
          <span className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            6 Active Sessions
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockLiveCandidates.map((candidate) => (
          <div key={candidate.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden relative group">
            <div className="aspect-video bg-gray-900 relative">
              <img src={candidate.image} alt={candidate.name} className="w-full h-full object-cover opacity-80" />
              
              {!candidate.faceDetected && (
                <div className="absolute inset-0 bg-red-500/20 flex flex-col items-center justify-center border-4 border-red-500">
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">FACE NOT DETECTED</span>
                </div>
              )}

              {candidate.tabAlert && (
                <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                  <LayoutDashboard className="w-3 h-3" /> TAB SWITCH
                </div>
              )}

              <div className="absolute bottom-2 right-2 text-white flex items-center gap-2">
                <button 
                  onClick={() => setSelectedCandidate(candidate)}
                  className="bg-black/50 p-1.5 rounded-md hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                  <p className="text-xs text-gray-500">{candidate.language}</p>
                </div>
                <div className="flex gap-2">
                  <Camera className={`w-4 h-4 ${candidate.faceDetected ? 'text-green-500' : 'text-red-500'}`} />
                  <div className="flex items-center gap-1">
                    <Mic className={`w-4 h-4 ${candidate.audioLevel > 70 ? 'text-red-500' : candidate.audioLevel > 30 ? 'text-amber-500' : 'text-green-500'}`} />
                    <div className="w-8 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${candidate.audioLevel > 70 ? 'bg-red-500' : candidate.audioLevel > 30 ? 'bg-amber-500' : 'bg-green-500'}`} 
                        style={{ width: `${candidate.audioLevel}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="w-full text-xs py-1.5">Message</Button>
                <Button variant="danger" className="w-full text-xs py-1.5">Warn</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Candidate Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
            <div className="md:w-2/3 bg-black relative flex items-center justify-center">
               <img src={selectedCandidate.image} alt={selectedCandidate.name} className="w-full h-auto max-h-[60vh] object-contain" />
               <button 
                  onClick={() => setSelectedCandidate(null)}
                  className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 md:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
            </div>
            <div className="md:w-1/3 p-6 flex flex-col h-full bg-gray-50">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedCandidate.name}</h2>
                  <p className="text-sm text-gray-500">Live Session - {selectedCandidate.language}</p>
                </div>
                <button 
                  onClick={() => setSelectedCandidate(null)}
                  className="text-gray-400 hover:text-gray-700 hidden md:block"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 flex-1">
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Camera</span>
                      <span className={selectedCandidate.faceDetected ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {selectedCandidate.faceDetected ? 'Active & Detected' : 'No Face'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Audio Noise</span>
                      <span className={selectedCandidate.audioLevel > 70 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                        {selectedCandidate.audioLevel}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Tab Focus</span>
                      <span className={selectedCandidate.tabAlert ? 'text-amber-600 font-medium' : 'text-green-600 font-medium'}>
                        {selectedCandidate.tabAlert ? 'Lost Focus' : 'In Focus'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex-1">
                   <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
                   <div className="space-y-2">
                     <Button className="w-full justify-center">Send Warning Message</Button>
                     <Button variant="outline" className="w-full justify-center">Request Camera Check</Button>
                     <Button variant="danger" className="w-full justify-center mt-4">Terminate Exam</Button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
