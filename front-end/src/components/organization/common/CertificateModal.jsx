import React, { useState } from 'react';
import { X, Award, ShieldCheck, Download, Share2, Copy, Check, QrCode, ExternalLink, Printer } from 'lucide-react';
import { useToast } from './Toast';

export default function CertificateModal({ certificate, onClose }) {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!certificate) return null;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(certificate.verificationUrl || window.location.href);
    setCopied(true);
    addToast('Verification URL copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    addToast('Opening certificate print dialog...', 'info');
    window.print();
  };

  const handleShareLinkedIn = () => {
    addToast('Certificate credential added to LinkedIn profile format', 'success');
    window.open('https://www.linkedin.com/sharing/share-offsite/', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-surface-container-lowest rounded-3xl max-w-3xl w-full border border-outline-variant shadow-elevation-3 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-secondary" />
            <span>Verified Professional Credential Document</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Canvas / Layout */}
        <div className="p-8 overflow-y-auto bg-[#F4F1EA] flex flex-col items-center">
          
          {/* Certificate Board */}
          <div className="w-full bg-[#FCFBF8] border-[10px] border-[#D4AF37]/30 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden ring-1 ring-[#D4AF37]/60">
            
            {/* Background seal watermarks */}
            <div className="absolute -top-10 -right-10 transform opacity-5 pointer-events-none">
              <Award className="w-80 h-80 text-primary" />
            </div>

            {/* Top Emblem & Institution */}
            <div className="flex items-center justify-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-[#0056D2] text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                N
              </div>
              <span className="font-headline-md text-xl font-bold text-primary tracking-widest uppercase">
                {certificate.institution || "NexusPay Learning Institute"}
              </span>
            </div>

            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mb-4"></div>

            <p className="text-[11px] uppercase tracking-[0.25em] text-outline font-bold mb-2">
              Official Certificate of Professional Competency
            </p>

            <p className="text-xs text-on-surface-variant italic mb-2">This is proudly conferred upon</p>

            <h2 className="text-3xl md:text-4xl font-bold font-serif text-primary tracking-tight my-3 text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#0056D2] to-primary underline decoration-[#D4AF37] decoration-2 underline-offset-8">
              Alex Chen
            </h2>

            <p className="text-xs text-on-surface-variant max-w-md mx-auto my-4 leading-relaxed">
              for successfully completing all required coursework, rigorous enterprise architectural labs, and passing the capstone examination in
            </p>

            <h3 className="text-xl md:text-2xl font-extrabold text-on-surface mb-4 px-4 leading-snug">
              {certificate.title}
            </h3>

            {/* Skills Pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {certificate.skills?.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 rounded-full bg-primary-fixed/60 text-xs font-bold text-primary border border-primary/20">
                  {skill}
                </span>
              ))}
            </div>

            {/* Signatures & Seal Row */}
            <div className="pt-6 border-t border-outline-variant/60 grid grid-cols-3 gap-6 items-end text-xs">
              <div className="text-center">
                <p className="font-serif italic text-base font-bold text-on-surface mb-0.5">{certificate.issueDate || "October 15, 2024"}</p>
                <div className="w-28 h-px bg-outline-variant mx-auto mb-1"></div>
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Date of Issuance</p>
              </div>

              {/* Gold Ribbon / Seal */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFE58F] via-[#D4AF37] to-[#8C6D00] p-1 shadow-lg flex items-center justify-center text-amber-950">
                  <div className="w-full h-full rounded-full border border-amber-900/30 flex flex-col items-center justify-center">
                    <Award className="w-6 h-6 text-amber-950" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">VERIFIED</span>
                  </div>
                </div>
                <p className="text-[11px] font-bold text-secondary mt-1">{certificate.grade || "98.4% (Honors)"}</p>
              </div>

              <div className="text-center">
                <p className="font-serif italic text-base font-bold text-on-surface mb-0.5">{certificate.instructor || "Dr. Marcus Vance"}</p>
                <div className="w-28 h-px bg-outline-variant mx-auto mb-1"></div>
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Dean / Lead Architect</p>
              </div>
            </div>

            {/* Bottom Verification Hash & QR Code placeholder */}
            <div className="mt-8 pt-4 border-t border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between text-[10px] text-outline gap-2">
              <div className="flex items-center gap-1.5 font-mono">
                <QrCode className="w-4 h-4 text-primary" />
                <span>Credential ID: <strong className="text-on-surface font-bold">{certificate.credentialId}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-secondary font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SHA-256 On-Chain Verified • NexusPay Academic Registry</span>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-outline-variant flex flex-wrap items-center justify-between gap-3 bg-surface-container-low">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-colors border border-outline-variant"
            >
              {copied ? <Check className="w-4 h-4 text-secondary" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Link Copied!" : "Copy Verification URL"}</span>
            </button>
            <button
              onClick={handleShareLinkedIn}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0A66C2] text-white text-xs font-bold hover:bg-[#004182] shadow-sm transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share to LinkedIn</span>
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-elevation-1 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
}
