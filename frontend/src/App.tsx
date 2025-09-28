import {useState, useEffect} from 'react';
import './App.css';
import {ProcessText} from "../wailsjs/go/main/App";

interface ProcessedResult {
    comments: string;
    finalText: string;
    rawResult: string;
}

function App() {
    const [inputText, setInputText] = useState('');
    const [result, setResult] = useState<ProcessedResult | null>(null);
    const [apiKey, setApiKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [selectedAction, setSelectedAction] = useState('grammar');
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [copySuccess, setCopySuccess] = useState('');
    const [customPrompt, setCustomPrompt] = useState('');

    const actionOptions = [
        { value: 'grammar', label: 'Check Grammar & Spelling', labelId: 'Periksa Tata Bahasa & Ejaan' },
        { value: 'improve', label: 'Improve It', labelId: 'Tingkatkan Teks' },
        { value: 'rephrase', label: 'Re-paraphrase It', labelId: 'Parafrase Ulang' },
        { value: 'formal', label: 'Make It Formal', labelId: 'Buat Lebih Formal' },
        { value: 'detailed', label: 'Make It More Detailed', labelId: 'Buat Lebih Detail' },
        { value: 'custom', label: 'Custom Action', labelId: 'Aksi Kustom' }
    ];

    const languageOptions = [
        { value: 'en', label: '🇺🇸 US English', flag: '🇺🇸' },
        { value: 'id', label: '🇮🇩 Bahasa Indonesia', flag: '🇮🇩' }
    ];

    const parseResult = (rawResult: string): ProcessedResult => {
        // Split by common patterns to separate comments and final text (English and Indonesian)
        const patterns = [
            /^(ANALYSIS:|IMPROVEMENTS MADE:|REPHRASING NOTES:|FORMALIZATION NOTES:|EXPANSION DETAILS:|ANALISIS:|PERBAIKAN YANG DILAKUKAN:|CATATAN PARAFRASA:|CATATAN FORMALISASI:|DETAIL PENGEMBANGAN:)([\s\S]*?)(CORRECTED TEXT:|IMPROVED TEXT:|REPHRASED TEXT:|FORMAL TEXT:|DETAILED TEXT:|FINAL RESULT:|TEKS YANG DIPERBAIKI:|TEKS YANG DITINGKATKAN:|TEKS YANG DIPARAFRASA:|TEKS FORMAL:|TEKS YANG DIPERLUAS:|HASIL AKHIR:)([\s\S]*)$/i,
        ];

        for (const pattern of patterns) {
            const match = rawResult.match(pattern);
            if (match) {
                let finalText = match[4].trim();
                // Remove surrounding double quotes from final text
                if (finalText.startsWith('"') && finalText.endsWith('"')) {
                    finalText = finalText.slice(1, -1);
                }
                return {
                    comments: match[2].trim(),
                    finalText,
                    rawResult
                };
            }
        }

        // Fallback: try to split by common keywords (English and Indonesian)
        const lines = rawResult.split('\n');
        let commentsEnd = -1;
        let finalTextStart = -1;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].toLowerCase();
            if (line.includes('corrected text:') || line.includes('improved text:') ||
                line.includes('rephrased text:') || line.includes('formal text:') ||
                line.includes('detailed text:') || line.includes('final result:') ||
                line.includes('teks yang diperbaiki:') || line.includes('teks yang ditingkatkan:') ||
                line.includes('teks yang diparafrasa:') || line.includes('teks formal:') ||
                line.includes('teks yang diperluas:') || line.includes('hasil akhir:')) {
                finalTextStart = i + 1;
                break;
            }
        }

        if (finalTextStart > 0) {
            const comments = lines.slice(0, finalTextStart - 1).join('\n').trim();
            let finalText = lines.slice(finalTextStart).join('\n').trim();
            // Remove surrounding double quotes from final text
            if (finalText.startsWith('"') && finalText.endsWith('"')) {
                finalText = finalText.slice(1, -1);
            }
            return { comments, finalText, rawResult };
        }

        // If no clear separation found, treat entire result as comments
        return {
            comments: rawResult,
            finalText: '',
            rawResult
        };
    };

    const handleProcessText = async () => {
        if (!apiKey.trim()) {
            setShowApiKeyModal(true);
            return;
        }

        if (!inputText.trim()) {
            setResult({
                comments: 'Please enter some text to process.',
                finalText: '',
                rawResult: 'Please enter some text to process.'
            });
            return;
        }

        if (selectedAction === 'custom' && !customPrompt.trim()) {
            setResult({
                comments: getText('Please enter a custom prompt.', 'Silakan masukkan prompt kustom.'),
                finalText: '',
                rawResult: getText('Please enter a custom prompt.', 'Silakan masukkan prompt kustom.')
            });
            return;
        }

        setIsLoading(true);
        setResult(null);
        setCopySuccess('');

        try {
            const actionToUse = selectedAction === 'custom' ? customPrompt : selectedAction;
            const response = await ProcessText(inputText, apiKey, actionToUse, selectedLanguage);
            const parsedResult = parseResult(response);
            setResult(parsedResult);
        } catch (error) {
            setResult({
                comments: `Error: ${error}`,
                finalText: '',
                rawResult: `Error: ${error}`
            });
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (text: string, type: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess(`${type} copied!`);
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err) {
            setCopySuccess('Failed to copy');
            setTimeout(() => setCopySuccess(''), 2000);
        }
    };

    const saveApiKey = () => {
        if (apiKey.trim()) {
            localStorage.setItem('claude_api_key', apiKey);
            setShowApiKeyModal(false);
        }
    };

    useEffect(() => {
        const savedKey = localStorage.getItem('claude_api_key');
        const savedLanguage = localStorage.getItem('selected_language');
        if (savedKey) {
            setApiKey(savedKey);
        }
        if (savedLanguage) {
            setSelectedLanguage(savedLanguage);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('selected_language', selectedLanguage);
    }, [selectedLanguage]);

    // Multilingual text based on selected language
    const getText = (enText: string, idText: string) => {
        return selectedLanguage === 'id' ? idText : enText;
    };

    const clearText = () => {
        setInputText('');
        setResult(null);
        setCopySuccess('');
        setCustomPrompt('');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto">
                <header className="bg-white border border-gray-200 rounded-lg p-5 mb-5 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900 mb-1">{getText('OpenGrammar', 'OpenGrammar')}</h1>
                            <p className="text-sm text-gray-600">{getText('Open Source AI Text Processor - Bring Your Own Key', 'Prosesor Teks AI Open Source - Bawa Kunci Anda Sendiri')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                            >
                                {languageOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <button
                                className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                                onClick={() => setShowApiKeyModal(true)}
                            >
                                {getText(
                                    apiKey ? 'Update API Key' : 'Set API Key',
                                    apiKey ? 'Perbarui API Key' : 'Atur API Key'
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <h3 className="text-base font-medium text-gray-900 mb-3">{getText('Enter Text to Process:', 'Masukkan Teks untuk Diproses:')}</h3>
                        <textarea
                            className="w-full h-40 p-2.5 border border-gray-300 rounded text-sm leading-relaxed resize-y bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={getText(
                                'Type or paste your text here...',
                                'Ketik atau tempel teks Anda di sini...'
                            )}
                        />

                        <div className="mt-3">
                            <label htmlFor="action-select" className="block text-sm font-medium text-gray-700 mb-1.5">{getText('Choose Action:', 'Pilih Aksi:')}</label>
                            <select
                                id="action-select"
                                className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-sm bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                value={selectedAction}
                                onChange={(e) => setSelectedAction(e.target.value)}
                            >
                                {actionOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {selectedLanguage === 'id' ? option.labelId : option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedAction === 'custom' && (
                            <div className="mt-3">
                                <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700 mb-1.5">{getText('Custom Prompt:', 'Prompt Kustom:')}</label>
                                <textarea
                                    id="custom-prompt"
                                    className="w-full h-24 p-2.5 border border-gray-300 rounded text-sm leading-relaxed resize-y bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    placeholder={getText(
                                        'Enter your custom instructions here (e.g., "Translate to Spanish", "Summarize in bullet points")...',
                                        'Masukkan instruksi kustom Anda di sini (mis., "Terjemahkan ke bahasa Spanyol", "Ringkas dalam poin-poin")...'
                                    )}
                                />
                            </div>
                        )}

                        <div className="flex gap-2 mt-3">
                            <button
                                className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                onClick={handleProcessText}
                                disabled={isLoading}
                            >
                                {getText(
                                    isLoading ? 'Processing...' : 'Process Text',
                                    isLoading ? 'Memproses...' : 'Proses Teks'
                                )}
                            </button>
                            <button
                                className="bg-gray-500 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-600 transition-colors"
                                onClick={clearText}
                            >
                                {getText('Clear', 'Hapus')}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <h3 className="text-base font-medium text-gray-900 mb-3">{getText('Results:', 'Hasil:')}</h3>

                        {copySuccess && (
                            <div className="copy-success bg-green-100 text-green-800 px-2.5 py-1.5 rounded text-sm font-medium mb-3 text-center border border-green-200">{copySuccess}</div>
                        )}

                        <div className="bg-gray-50 border border-gray-200 rounded min-h-40 max-h-80 overflow-y-auto">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                                    <div className="spinner w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full mb-2"></div>
                                    <p className="text-sm">{getText('Processing your text...', 'Memproses teks Anda...')}</p>
                                </div>
                            ) : result ? (
                                <div>
                                    {result.comments && (
                                        <div className="border-b border-gray-200 last:border-b-0">
                                            <div className="flex justify-between items-center px-3 py-2 bg-gray-100 border-b border-gray-200">
                                                <h4 className="text-sm font-medium text-gray-900">{getText('Analysis & Comments', 'Analisis & Komentar')}</h4>
                                                <button
                                                    className="bg-blue-600 text-white px-2.5 py-1 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                                                    onClick={() => copyToClipboard(result.comments, getText('Comments', 'Komentar'))}
                                                >
                                                    📋 {getText('Copy', 'Salin')}
                                                </button>
                                            </div>
                                            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400">
                                                <pre className="text-sm leading-relaxed whitespace-pre-wrap text-yellow-900 font-mono">{result.comments}</pre>
                                            </div>
                                        </div>
                                    )}

                                    {result.finalText && (
                                        <div className="border-b border-gray-200 last:border-b-0">
                                            <div className="flex justify-between items-center px-3 py-2 bg-gray-100 border-b border-gray-200">
                                                <h4 className="text-sm font-medium text-gray-900">{getText('Final Result', 'Hasil Akhir')}</h4>
                                                <button
                                                    className="bg-blue-600 text-white px-2.5 py-1 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                                                    onClick={() => copyToClipboard(result.finalText, getText('Final text', 'Teks akhir'))}
                                                >
                                                    📋 {getText('Copy', 'Salin')}
                                                </button>
                                            </div>
                                            <div className="p-3 bg-green-50 border-l-4 border-green-500">
                                                <pre className="text-sm leading-relaxed whitespace-pre-wrap text-green-900 font-mono">{result.finalText}</pre>
                                            </div>
                                        </div>
                                    )}

                                    {!result.comments && !result.finalText && (
                                        <div className="border-b border-gray-200 last:border-b-0">
                                            <div className="flex justify-between items-center px-3 py-2 bg-gray-100 border-b border-gray-200">
                                                <h4 className="text-sm font-medium text-gray-900">{getText('Result', 'Hasil')}</h4>
                                                <button
                                                    className="bg-blue-600 text-white px-2.5 py-1 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                                                    onClick={() => copyToClipboard(result.rawResult, getText('Result', 'Hasil'))}
                                                >
                                                    📋 {getText('Copy', 'Salin')}
                                                </button>
                                            </div>
                                            <div className="p-3">
                                                <pre className="text-sm leading-relaxed whitespace-pre-wrap text-gray-900 font-mono">{result.rawResult}</pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-6 text-center text-gray-500">
                                    <p className="text-sm mb-1">{getText('Results will appear here...', 'Hasil akan muncul di sini...')}</p>
                                    <p className="text-xs text-gray-400">
                                        {getText(
                                            'Select an action and process your text to see results.',
                                            'Pilih aksi dan proses teks Anda untuk melihat hasil.'
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {showApiKeyModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowApiKeyModal(false)}>
                        <div className="bg-white p-5 rounded-lg w-full max-w-md mx-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-base font-semibold mb-2 text-gray-900">{getText('Enter Claude API Key', 'Masukkan Claude API Key')}</h3>
                            <p className="mb-3 text-gray-600 text-sm">{getText(
                                'Get your API key from',
                                'Dapatkan API key Anda dari'
                            )} <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">Anthropic Console</a></p>
                            <input
                                type="password"
                                className="w-full px-2.5 py-2 border border-gray-300 rounded text-sm mb-3 font-mono text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="sk-ant-..."
                            />
                            <div className="flex gap-2 justify-end">
                                <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition-colors" onClick={saveApiKey}>
                                    {getText('Save', 'Simpan')}
                                </button>
                                <button className="bg-gray-500 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-600 transition-colors" onClick={() => setShowApiKeyModal(false)}>
                                    {getText('Cancel', 'Batal')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default App
