import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { verificationService } from '../../services/verificationService';
import { uploadProductImage } from '../../services/listingService';
import { VerificationReport } from '../../types';

interface AIQualityCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmerId: string;
  productId?: string;
  defaultProductName?: string;
  onSuccess: (report: VerificationReport) => void;
}

const AIQualityCheckModal: React.FC<AIQualityCheckModalProps> = ({ isOpen, onClose, farmerId, productId, defaultProductName, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{type: string, url: string, name: string}[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const [formData, setFormData] = useState({
    productName: defaultProductName || '',
    variety: '',
    quantityKg: '',
    location: '',
    expectedPrice: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Use uploaded files or fallback to mock if empty
      const evidenceData = uploadedFiles.length > 0 
        ? uploadedFiles.map(f => ({ type: f.type, url: f.url }))
        : [
            { type: 'image', url: 'https://example.com/mock-image1.jpg' },
            { type: 'image', url: 'https://example.com/mock-image2.jpg' }
          ];

      const res = await verificationService.createVerification({
        farmerId,
        productId,
        productName: formData.productName,
        variety: formData.variety,
        quantityKg: Number(formData.quantityKg),
        location: formData.location,
        expectedPrice: Number(formData.expectedPrice),
        evidence: evidenceData
      });

      setReport(res);
      setAiSummary(res.ai_summary || null);
      setStep(3); // Result step
    } catch (err: any) {
      setError(err.message || 'Failed to submit quality check');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b bg-green-50">
          <h2 className="text-xl font-semibold text-green-800">AI Quality Check</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {step === 1 && (
            <form id="quality-form" onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">Enter basic details to get a fair price estimate and quality grade.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input required name="productName" value={formData.productName} onChange={handleChange} className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500" placeholder="e.g. Wheat" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Variety</label>
                  <input required name="variety" value={formData.variety} onChange={handleChange} className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500" placeholder="e.g. Sharbati" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Kg)</label>
                  <input required type="number" name="quantityKg" value={formData.quantityKg} onChange={handleChange} className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input required name="location" value={formData.location} onChange={handleChange} className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500" placeholder="e.g. Pune, MH" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Price (₹/Kg)</label>
                  <input required type="number" name="expectedPrice" value={formData.expectedPrice} onChange={handleChange} className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500" />
                </div>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <UploadCloud className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <h3 className="text-lg font-medium">Upload Evidence</h3>
                <p className="text-sm text-gray-500">Please provide photos or videos for AI analysis.</p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 relative group">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,video/*"
                  disabled={uploadingFiles}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      setUploadingFiles(true);
                      setError(null);
                      try {
                        const newFiles = [...uploadedFiles];
                        for (const f of files) {
                          const url = await uploadProductImage(f);
                          newFiles.push({ type: f.type.startsWith('video/') ? 'video' : 'image', url, name: f.name });
                        }
                        setUploadedFiles(newFiles);
                      } catch (err: any) {
                        setError(err.message || 'Failed to upload files');
                      } finally {
                        setUploadingFiles(false);
                      }
                    }
                  }}
                />
                <p className="text-sm text-gray-600">Click or drag files here to upload images/videos</p>
                {uploadingFiles && <p className="mt-2 text-xs text-green-600 animate-pulse font-medium">Uploading files...</p>}
                
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 flex flex-wrap justify-center gap-2 relative z-30">
                    {uploadedFiles.map((f, i) => (
                      <span key={i} className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                        <span className="truncate max-w-[120px]" title={f.name}>{f.name}</span>
                        <button type="button" onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setUploadedFiles(prev => prev.filter((_, idx) => idx !== i));
                        }} className="hover:text-green-900 ml-1 bg-green-200 rounded-full p-0.5">
                           <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {error}
                </div>
              )}
            </div>
          )}

          {step === 3 && report && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-gray-800">Verification Complete</h3>
                <p className="text-sm text-gray-600 mt-1">{aiSummary}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm text-green-800 font-medium">AI Visual Grade</p>
                  <p className="text-3xl font-bold text-green-600">{report.visualGrade}</p>
                  <p className="text-xs text-green-700 mt-1">Score: {report.visualScore}/100</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-800 font-medium">Trust Score (Level {report.level})</p>
                  <p className="text-3xl font-bold text-blue-600">{report.trustScore}%</p>
                  <p className="text-xs text-blue-700 mt-1">Confidence: {report.confidenceScore}%</p>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                   Fair Price Intelligence
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Expected:</span>
                    <span className="font-semibold ml-1">₹{report.expectedPrice}/kg</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Market Avg:</span>
                    <span className="font-semibold ml-1">₹{report.marketPriceMin} - {report.marketPriceMax}</span>
                  </div>
                  <div className="col-span-2 mt-2 pt-2 border-t border-yellow-200">
                    <span className="text-yellow-800 font-medium">AI Suggested Price: </span>
                    <span className="font-bold text-lg text-yellow-900 ml-1">₹{report.suggestedPriceMin} - {report.suggestedPriceMax}/kg</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          {step === 1 && (
            <>
              <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
              <button form="quality-form" type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Next</button>
            </>
          )}
          {step === 2 && (
            <>
              <button onClick={() => setStep(1)} disabled={loading} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Back</button>
              <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2">
                {loading ? 'Analyzing...' : 'Submit to AI'}
              </button>
            </>
          )}
          {step === 3 && (
            <>
              <a href={`/verifications/${report.id}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-green-600 bg-green-50 border border-green-200 rounded hover:bg-green-100 flex items-center gap-2">
                <FileText className="w-4 h-4" /> View Certificate
              </a>
              <button onClick={() => { onSuccess(report!); onClose(); }} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Apply to Listing
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIQualityCheckModal;
