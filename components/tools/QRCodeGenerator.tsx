'use client';

import { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  onClose?: () => void;
}

type QRType = 'url' | 'text' | 'email' | 'phone' | 'sms' | 'wifi' | 'vcard';
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export function QRCodeGenerator({ onClose }: QRCodeGeneratorProps) {
  const [qrType, setQRType] = useState<QRType>('url');
  const [qrData, setQRData] = useState('');
  const [qrDataURL, setQRDataURL] = useState('');
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>('M');
  const [size, setSize] = useState(300);
  const [darkColor, setDarkColor] = useState('#000000');
  const [lightColor, setLightColor] = useState('#ffffff');
  const [copied, setCopied] = useState(false);
  
  // Advanced options
  const [margin, setMargin] = useState(4);
  const [includeMargin, setIncludeMargin] = useState(true);

  // WiFi fields
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);

  // vCard fields
  const [vcardName, setVcardName] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  const [vcardOrg, setVcardOrg] = useState('');
  const [vcardUrl, setVcardUrl] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = async () => {
    let dataToEncode = qrData;

    // Format data based on type
    switch (qrType) {
      case 'email':
        dataToEncode = `mailto:${qrData}`;
        break;
      case 'phone':
        dataToEncode = `tel:${qrData}`;
        break;
      case 'sms':
        dataToEncode = `sms:${qrData}`;
        break;
      case 'wifi':
        dataToEncode = `WIFI:T:${wifiEncryption};S:${wifiSSID};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`;
        break;
      case 'vcard':
        dataToEncode = `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardName}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nORG:${vcardOrg}\nURL:${vcardUrl}\nEND:VCARD`;
        break;
    }

    if (!dataToEncode && qrType !== 'wifi' && qrType !== 'vcard') return;

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      await QRCode.toCanvas(canvas, dataToEncode, {
        errorCorrectionLevel: errorLevel,
        width: size,
        margin: includeMargin ? margin : 0,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      });

      // Also generate data URL for download
      const dataUrl = await QRCode.toDataURL(dataToEncode, {
        errorCorrectionLevel: errorLevel,
        width: size,
        margin: includeMargin ? margin : 0,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      });
      setQRDataURL(dataUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  useEffect(() => {
    generateQRCode();
  }, [qrData, qrType, errorLevel, size, darkColor, lightColor, margin, includeMargin, 
      wifiSSID, wifiPassword, wifiEncryption, wifiHidden,
      vcardName, vcardPhone, vcardEmail, vcardOrg, vcardUrl]);

  const downloadQRCode = () => {
    if (!qrDataURL) return;
    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.png`;
    link.href = qrDataURL;
    link.click();
  };

  const copyToClipboard = async () => {
    if (!qrDataURL) return;
    try {
      const response = await fetch(qrDataURL);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const renderInputFields = () => {
    switch (qrType) {
      case 'wifi':
        return (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Network Name (SSID)
              </label>
              <input
                type="text"
                value={wifiSSID}
                onChange={(e) => setWifiSSID(e.target.value)}
                placeholder="MyNetwork"
                className="w-full px-3 py-2.5 bg-[#0f141b] border border-[#283341] rounded text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="text"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                placeholder="password123"
                className="w-full px-3 py-2.5 bg-[#0f141b] border border-[#283341] rounded text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Encryption
              </label>
              <select
                value={wifiEncryption}
                onChange={(e) => setWifiEncryption(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-[#0f141b] border border-[#283341] rounded text-white text-sm focus:outline-none focus:border-cyan-500/50"
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Password</option>
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={wifiHidden}
                onChange={(e) => setWifiHidden(e.target.checked)}
                className="w-4 h-4 rounded bg-[#0f141b] border-[#283341]"
              />
              <span className="text-xs text-slate-300">Hidden Network</span>
            </label>
          </div>
        );
      
      case 'vcard':
        return (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={vcardName}
                onChange={(e) => setVcardName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3 py-2.5 bg-[#0f141b] border border-[#283341] rounded text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={vcardPhone}
                onChange={(e) => setVcardPhone(e.target.value)}
                placeholder="+1234567890"
                className="w-full px-3 py-2.5 bg-[#0f141b] border border-[#283341] rounded text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={vcardEmail}
                onChange={(e) => setVcardEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-3 py-2.5 bg-[#0f141b] border border-[#283341] rounded text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Organization
              </label>
              <input
                type="text"
                value={vcardOrg}
                onChange={(e) => setVcardOrg(e.target.value)}
                placeholder="Company Inc."
                className="w-full px-3 py-2.5 bg-[#0f141b] border border-[#283341] rounded text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Website
              </label>
              <input
                type="url"
                value={vcardUrl}
                onChange={(e) => setVcardUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2.5 bg-[#0f141b] border border-[#283341] rounded text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>
        );

      default:
        return (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              {qrType === 'url' ? 'URL' : 
               qrType === 'email' ? 'Email Address' :
               qrType === 'phone' ? 'Phone Number' :
               qrType === 'sms' ? 'Phone Number' : 'Text Content'}
            </label>
            <textarea
              value={qrData}
              onChange={(e) => setQRData(e.target.value)}
              placeholder={
                qrType === 'url' ? 'https://example.com' :
                qrType === 'email' ? 'email@example.com' :
                qrType === 'phone' ? '+1234567890' :
                qrType === 'sms' ? '+1234567890' :
                'Enter your text here...'
              }
              rows={3}
              className="w-full px-3 py-2.5 bg-[#0f141b] border border-[#283341] rounded text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white">
      {/* Header */}
      <header className="border-b border-[#1a1f3a]">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  QR Code Generator
                </h1>
                <p className="text-xs text-slate-400">Create custom QR codes instantly</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 transition-colors text-sm font-medium"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] gap-6">
          {/* Left Column - Settings */}
          <div className="space-y-4">
            {/* QR Type Selector */}
            <section className="bg-[#1a1f3a] rounded-lg border border-[#283341] p-5">
              <h2 className="text-base font-bold text-purple-400 mb-3">QR Code Type</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'url', label: 'URL', icon: '🔗' },
                  { value: 'text', label: 'Text', icon: '📝' },
                  { value: 'email', label: 'Email', icon: '📧' },
                  { value: 'phone', label: 'Phone', icon: '📞' },
                  { value: 'sms', label: 'SMS', icon: '💬' },
                  { value: 'wifi', label: 'WiFi', icon: '📶' },
                  { value: 'vcard', label: 'vCard', icon: '👤' },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setQRType(type.value as QRType)}
                    className={`
                      px-3 py-2.5 rounded text-sm font-medium transition-colors flex items-center gap-2 justify-center border
                      ${qrType === type.value
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                        : 'bg-[#0f141b] text-slate-400 hover:text-slate-200 hover:bg-[#141a24] border-[#283341]'
                      }
                    `}
                  >
                    <span className="text-base">{type.icon}</span>
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Input Fields */}
            <section className="bg-[#1a1f3a] rounded-lg border border-[#283341] p-5">
              <h2 className="text-base font-bold text-cyan-400 mb-3">Content</h2>
              {renderInputFields()}
            </section>

            {/* Customization */}
            <section className="bg-[#1a1f3a] rounded-lg border border-[#283341] p-5">
              <h2 className="text-base font-bold text-pink-400 mb-3">Customization</h2>
              
              <div className="space-y-3.5">
                {/* Size */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Size: {size}px
                  </label>
                  <input
                    type="range"
                    min="200"
                    max="600"
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Error Correction */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Error Correction
                  </label>
                  <select
                    value={errorLevel}
                    onChange={(e) => setErrorLevel(e.target.value as ErrorCorrectionLevel)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                  >
                    <option value="L">Low (7%)</option>
                    <option value="M">Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                  </select>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Foreground
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={darkColor}
                        onChange={(e) => setDarkColor(e.target.value)}
                        className="w-12 h-12 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={darkColor}
                        onChange={(e) => setDarkColor(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Background
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={lightColor}
                        onChange={(e) => setLightColor(e.target.value)}
                        className="w-12 h-12 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={lightColor}
                        onChange={(e) => setLightColor(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Margin */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">
                      Margin: {margin}
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeMargin}
                        onChange={(e) => setIncludeMargin(e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-800 border-white/10"
                      />
                      <span className="text-xs text-slate-400">Include margin</span>
                    </label>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    disabled={!includeMargin}
                    className="w-full disabled:opacity-30"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Preview & Actions */}
          <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            {/* QR Code Preview */}
            <section className="bg-[#1a1f3a] rounded-lg border border-[#283341] p-5">
              <h2 className="text-base font-bold text-emerald-400 mb-3">Preview</h2>
              <div className="flex items-center justify-center p-6 bg-[#0f141b] rounded-lg border-2 border-dashed border-[#283341]">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            </section>

            {/* Actions */}
            <section className="bg-[#1a1f3a] rounded-lg border border-[#283341] p-5">
              <h2 className="text-base font-bold text-amber-400 mb-3">Actions</h2>
              <div className="flex gap-2">
                <button
                  onClick={downloadQRCode}
                  disabled={!qrDataURL}
                  className="flex-1 px-4 py-2.5 bg-emerald-500/90 hover:bg-emerald-500 text-white font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-500/90 flex items-center justify-center gap-2 text-sm"
                >
                  <span>⬇</span>
                  Download
                </button>
                <button
                  onClick={copyToClipboard}
                  disabled={!qrDataURL}
                  className={`
                    flex-1 px-4 py-2.5 font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm
                    ${copied 
                      ? 'bg-green-500/90 hover:bg-green-500' 
                      : 'bg-purple-500/90 hover:bg-purple-500'
                    } text-white
                  `}
                >
                  <span>{copied ? '✓' : '📋'}</span>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </section>

            {/* Info */}
            <section className="bg-[#1a1f3a] rounded-lg border border-[#283341] p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">💡</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-blue-400 mb-2">Tips</h3>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <span className="text-cyan-400 mt-0.5">▸</span>
                      <span>Higher error correction allows damaged codes to still scan</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-cyan-400 mt-0.5">▸</span>
                      <span>Use high contrast colors for better scanning reliability</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-cyan-400 mt-0.5">▸</span>
                      <span>Test your QR code with multiple devices before printing</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
