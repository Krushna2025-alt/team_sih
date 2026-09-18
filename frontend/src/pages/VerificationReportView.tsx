import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import { ArrowLeft, Download, ShieldCheck, CheckCircle, MapPin, Scale } from 'lucide-react';
import { verificationService } from '../services/verificationService';
import { VerificationReport } from '../types';

const VerificationReportView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      verificationService.getVerification(id)
        .then(setReport)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleDownloadPDF = () => {
    if (!reportRef.current || !report) return;
    
    // Simple PDF generation (in a real app, use html2canvas + jsPDF for exact styling)
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(34, 139, 34); // Forest Green
    doc.text('KrishiLink AI Quality Verification Report', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`Verification ID: ${report.id}`, 20, 30);
    doc.text(`Date: ${new Date(report.createdAt).toLocaleString()}`, 20, 38);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Product Details', 20, 55);
    doc.setFontSize(12);
    doc.text(`Product: ${report.productName} ${report.variety ? `(${report.variety})` : ''}`, 20, 65);
    doc.text(`Quantity: ${report.quantityKg} Kg`, 20, 73);
    doc.text(`Location: ${report.location}`, 20, 81);
    
    doc.setFontSize(16);
    doc.text('AI Quality Assessment', 20, 98);
    doc.setFontSize(12);
    doc.text(`Visual Grade: ${report.visualGrade}`, 20, 108);
    doc.text(`Visual Score: ${report.visualScore}/100`, 20, 116);
    if (report.issues && report.issues.length > 0) {
      doc.text(`Notes: ${report.issues.join(', ')}`, 20, 124);
    }
    
    doc.setFontSize(16);
    doc.text('Trust & Pricing (Level ' + report.level + ')', 20, 140);
    doc.setFontSize(12);
    doc.text(`Trust Score: ${report.trustScore}/100`, 20, 150);
    doc.text(`Market Reference: ${report.marketPriceMin} - ${report.marketPriceMax} INR/Kg`, 20, 158);
    doc.text(`AI Suggested: ${report.suggestedPriceMin} - ${report.suggestedPriceMax} INR/Kg`, 20, 166);
    
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Disclaimer: This report is an AI-assisted assessment of submitted evidence.', 20, 280);
    doc.text('It is not a substitute for laboratory testing or official certification.', 20, 285);

    doc.save(`KrishiLink_Verification_${report.id.substring(0,8)}.pdf`);
  };

  if (loading) return <div className="p-8 text-center">Loading report...</div>;
  if (!report) return <div className="p-8 text-center text-red-500">Report not found.</div>;

  const qrUrl = window.location.href;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <Link to="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Link>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Verification Report</h1>
        <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-white border border-gray-300 shadow-sm px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>

      <div ref={reportRef} className="bg-white border rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-8 h-8 text-green-200" />
              <h2 className="text-2xl font-bold">KrishiLink AI Verified</h2>
            </div>
            <p className="text-green-100 font-mono text-sm opacity-90">ID: {report.id}</p>
            <p className="text-green-100 text-sm mt-1">{new Date(report.createdAt).toLocaleString()}</p>
          </div>
          <div className="bg-white p-2 rounded-lg">
            <QRCodeSVG value={qrUrl} size={80} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-3">Product Information</h3>
              <p className="text-xl font-bold">{report.productName} <span className="text-gray-500 text-lg font-normal">{report.variety && `(${report.variety})`}</span></p>
              <div className="mt-3 space-y-2 text-sm text-gray-700">
                <p className="flex items-center gap-2"><Scale className="w-4 h-4 text-gray-400" /> {report.quantityKg} Kg</p>
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> {report.location}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-3 flex justify-between items-center">
                <span>Trust Score</span>
                <span className="text-sm font-normal bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Level {report.level}</span>
              </h3>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-blue-600">{report.trustScore}</span>
                <span className="text-gray-500 mb-1">/ 100</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-3">AI Visual Assessment</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-green-50 rounded-lg p-3 text-center min-w-[80px]">
                  <p className="text-xs text-green-800 uppercase font-bold">Grade</p>
                  <p className="text-3xl font-black text-green-600">{report.visualGrade}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Score: <span className="font-semibold">{report.visualScore}/100</span></p>
                  <p className="text-sm text-gray-600">Confidence: <span className="font-semibold">{report.confidenceScore}%</span></p>
                </div>
              </div>
              {report.issues && report.issues.length > 0 && (
                <div className="bg-gray-50 rounded p-3 text-sm">
                  <p className="font-medium text-gray-700 mb-1">Notes:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {report.issues.map((i, idx) => <li key={idx}>{i}</li>)}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-3">Fair Price Intelligence</h3>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Expected:</span>
                  <span className="font-medium">₹{report.expectedPrice}/kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Market Reference:</span>
                  <span className="font-medium">₹{report.marketPriceMin} - ₹{report.marketPriceMax}/kg</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-yellow-200">
                  <span className="text-yellow-800 font-semibold">AI Suggested:</span>
                  <span className="font-bold text-yellow-900">₹{report.suggestedPriceMin} - ₹{report.suggestedPriceMax}/kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 sm:p-6 text-center border-t">
          <p className="text-xs text-gray-500 max-w-2xl mx-auto">
            This report is an AI-assisted assessment of submitted evidence. It is not a substitute for laboratory testing or official certification. KrishiLink makes no absolute guarantees based on this preliminary visual verification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationReportView;
