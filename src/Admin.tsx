import React, { useEffect, useState } from 'react';
import { buildDisplayName, buildInviteLink, buildInviteMessage, coupleNames, guestPrefixes } from './guest';

type Generated = { displayName: string; link: string; message: string };

async function copyText(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback for non-HTTPS / older browsers
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!ok) throw new Error('Copy failed');
}

export default function Admin() {
  const [prefix, setPrefix] = useState<string>('Mr.');
  const [guestName, setGuestName] = useState('');
  const [generated, setGenerated] = useState<Generated | null>(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const livePreview = buildDisplayName(prefix, guestName);

  const handleGenerateLink = () => {
    const displayName = buildDisplayName(prefix, guestName);
    if (!displayName) {
      setError('Please enter a guest name.');
      return;
    }
    setError('');
    const link = buildInviteLink(window.location.origin, displayName);
    setGenerated({ displayName, link, message: buildInviteMessage(displayName, link) });
  };

  const handleCopy = async (text: string, successMessage: string) => {
    try {
      await copyText(text);
      setToast(successMessage);
    } catch {
      setToast('Could not copy — please copy manually.');
    }
  };

  return (
    <div className="h-[100dvh] bg-theme-50 flex flex-col p-4 md:p-8 font-montserrat overflow-y-auto py-8 w-full">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-theme-200 w-full max-w-2xl m-auto shrink-0">
        <h1 className="text-3xl font-cinzel text-theme-900 mb-2 text-center font-bold">Invitation Link Generator</h1>
        <p className="text-center font-playball text-2xl text-theme-600 mb-8">{coupleNames}</p>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerateLink();
          }}
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="prefix" className="text-sm font-bold text-stone-600 uppercase tracking-widest">Select Prefix</label>
            <select
              id="prefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              className="w-full p-3 border border-theme-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-500 bg-white"
            >
              {guestPrefixes.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="guestName" className="text-sm font-bold text-stone-600 uppercase tracking-widest">Guest Name</label>
            <input
              id="guestName"
              type="text"
              value={guestName}
              onChange={(e) => {
                setGuestName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Sanjaya"
              className="w-full p-3 border border-theme-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-500"
            />
            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : (
              livePreview && (
                <p className="text-sm text-stone-500">
                  Greeting: <span className="font-semibold text-theme-800">Dear {livePreview} ❤️</span>
                </p>
              )
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-theme-800 text-white p-4 rounded-full font-bold uppercase tracking-widest hover:bg-theme-900 transition-colors shadow-md"
          >
            Generate Link
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-theme-200 space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-stone-600 uppercase tracking-widest">Generated Link</label>
            <div className="p-3 bg-stone-100 rounded-lg break-all text-sm font-mono text-stone-700 min-h-[2.75rem]">
              {generated ? (
                <a href={generated.link} target="_blank" rel="noopener noreferrer" className="text-theme-700 underline">
                  {generated.link}
                </a>
              ) : (
                <span className="text-stone-400">Generate a link to see it here.</span>
              )}
            </div>
          </div>

          {generated && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-stone-600 uppercase tracking-widest">Message Preview</label>
              <div className="p-4 bg-stone-100 rounded-lg text-sm text-stone-700 whitespace-pre-wrap border border-stone-200">
                {generated.message}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              disabled={!generated}
              onClick={() => generated && handleCopy(generated.link, 'Link copied!')}
              className="bg-stone-200 text-stone-800 p-3 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-stone-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Copy Link Only
            </button>
            <button
              type="button"
              disabled={!generated}
              onClick={() => generated && handleCopy(generated.message, 'Message copied!')}
              className="bg-theme-600 text-white p-3 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-theme-700 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Copy Full Message
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-sm font-semibold px-5 py-3 rounded-full shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
