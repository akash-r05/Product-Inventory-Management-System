import React, { useState } from 'react';
import {
  DownloadCloud,
  FileCode,
  FolderTree,
  Copy,
  Check,
  CheckCircle2,
  FileText,
  Database,
  Layers,
  Server,
  Code2,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { CSHARP_FILES, generateCSharpSolutionZip, SolutionFile } from '../services/csharpSolutionGenerator';

export const DotNetSolutionModal: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<SolutionFile>(CSHARP_FILES[10]); // Program.cs
  const [copied, setCopied] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsGeneratingZip(true);
      const zipBlob = await generateCSharpSolutionZip();
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ProductInventory_CSharp_DotNet8_Solution.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Download CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 p-6 text-white border border-blue-900/60 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
            <span>MICROSOFT .NET 8</span>
            <span>·</span>
            <span>ASP.NET CORE MVC & WEB API</span>
            <span>·</span>
            <span>SQL SERVER 3NF</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            C# .NET Solution & Source Code Generator
          </h1>
          <p className="mt-1 text-xs text-slate-300 max-w-2xl">
            Complete clean architecture solution including Entity Framework Core, Identity, unit of work, transactional stock engine, SQL Server schema script, and Postman test collection ready for Visual Studio 2022.
          </p>
        </div>

        <div className="shrink-0">
          <button
            onClick={handleDownloadZip}
            disabled={isGeneratingZip}
            className="flex items-center gap-2.5 rounded-xl bg-blue-600 px-6 py-3.5 text-xs font-bold text-white hover:bg-blue-500 shadow-xl transition-all disabled:opacity-50"
          >
            {isGeneratingZip ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Compiling ZIP Archive...</span>
              </>
            ) : (
              <>
                <DownloadCloud className="h-4 w-4" />
                <span>Download .NET C# Solution (.ZIP)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="flex items-center gap-2 rounded-xl p-3.5 text-xs bg-emerald-50 text-emerald-900 border border-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Success!</strong> `ProductInventory_CSharp_DotNet8_Solution.zip` has been generated and downloaded to your computer. You can extract it and open `ProductInventory.sln` directly in Visual Studio 2022!
          </span>
        </div>
      )}

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Solution File Tree (Left 4 cols) */}
        <div className="lg:col-span-4 border-r border-slate-200 p-4 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 text-xs font-bold text-slate-800">
              <FolderTree className="h-4 w-4 text-blue-600" />
              <span>Solution Explorer (Clean Architecture)</span>
            </div>

            <div className="mt-3 space-y-1 max-h-[580px] overflow-y-auto text-xs font-mono">
              {CSHARP_FILES.map((file) => {
                const isSelected = selectedFile.path === file.path;
                const isSql = file.path.endsWith('.sql');
                const isCs = file.path.endsWith('.cs');
                const isJson = file.path.endsWith('.json');

                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-700 hover:bg-slate-200/70'
                    }`}
                  >
                    {isSql ? (
                      <Database className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-amber-600'}`} />
                    ) : isCs ? (
                      <Code2 className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
                    ) : (
                      <FileText className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    )}
                    <span className="truncate text-[11px]">{file.path}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 mt-4 text-[11px] text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700">Solution Statistics:</div>
            <div>· 3 C# .NET 8 Projects (.Core, .Infrastructure, .Web)</div>
            <div>· SQL Server 3NF Schema Script Included</div>
            <div>· EF Core Migrations & Identity Tables</div>
          </div>
        </div>

        {/* Code Viewer (Right 8 cols) */}
        <div className="lg:col-span-8 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-blue-600" />
                <span className="font-mono text-xs font-bold text-slate-900">{selectedFile.path}</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {selectedFile.category}
                </span>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Code container */}
            <div className="mt-3 max-h-[560px] overflow-auto rounded-xl bg-slate-950 p-4 text-[12px] font-mono leading-relaxed text-slate-200 border border-slate-800">
              <pre className="whitespace-pre">{selectedFile.content}</pre>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Visual Studio 2022 Solution Explorer View</span>
            <button
              onClick={handleDownloadZip}
              className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
            >
              <DownloadCloud className="h-3.5 w-3.5" />
              Download All as .ZIP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
