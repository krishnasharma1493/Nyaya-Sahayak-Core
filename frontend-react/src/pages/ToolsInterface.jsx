import React, { useState } from 'react';
import NoticeGenerator from '../components/NoticeGenerator';
import ResultsPanel from '../components/ResultsPanel';

const ToolsInterface = () => {
    const [result, setResult] = useState(null);

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Legal Tools</h1>
                <p className="text-gray-400">Generate notices and analyze documents.</p>
            </div>

            {!result ? (
                <NoticeGenerator onGenerate={setResult} />
            ) : (
                <ResultsPanel noticeContent={result} onReset={() => setResult(null)} />
            )}
        </div>
    );
};

export default ToolsInterface;
