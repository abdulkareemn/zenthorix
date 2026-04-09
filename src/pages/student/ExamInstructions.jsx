import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { AlertCircle, CheckCircle2, Shield, AlertTriangle, Monitor, Webhook } from 'lucide-react';

const ExamInstructions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  const rules = [
    { title: "No tab switching", description: "Navigating away from the exam tab will trigger an alert.", icon: Monitor, color: "text-red-500" },
    { title: "Webcam must be ON", description: "Your face must remain visible within the camera frame.", icon: Webhook, color: "text-blue-500" },
    { title: "No external help", description: "Microphone captures background noise. Strictly no talking.", icon: AlertTriangle, color: "text-orange-500" },
    { title: "Stable Connection", description: "Ensure an uninterrupted internet connection before starting.", icon: Shield, color: "text-green-500" },
  ];

  const handleStart = () => {
    navigate(`/exam/${examId}/start`);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 shadow-2xl">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">Exam Instructions</h1>
        <p className="text-gray-500 mt-2">Please read the proctoring guidelines carefully before proceeding.</p>
      </div>

      <Card className="border-0 shadow-xl ring-1 ring-gray-200">
        <CardContent className="p-8 space-y-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Proctoring Active</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  This assessment is strictly AI-proctored. Any violations may lead to immediate disqualification.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {rules.map((rule, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                <rule.icon className={`shrink-0 h-6 w-6 ${rule.color}`} />
                <div>
                  <h4 className="font-semibold text-gray-900">{rule.title}</h4>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{rule.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-6 mt-8">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary shadow-sm"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
              </div>
              <div className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                <span className="font-semibold block mb-1">I agree to the terms and conditions</span>
                I confirm that my webcam and microphone are working, and I agree to be monitored via AI proctoring for the duration of this assessment.
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button 
              size="lg" 
              disabled={!agreed} 
              onClick={handleStart}
              className="px-8 shadow-lg shadow-primary/30"
            >
              Start Exam Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamInstructions;
