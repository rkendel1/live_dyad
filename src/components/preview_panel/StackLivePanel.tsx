import { useEffect, useState } from "react";
import { RefreshCw, FileCode, Folder, Copy } from "lucide-react";
import { ipc } from "@/ipc/types";
import type { StackLiveFile } from "@/ipc/types";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

/**
 * Get syntax highlighting language from file extension
 */
function getLanguage(filename: string): string {
  if (filename.endsWith(".svelte")) return "html";
  if (filename.endsWith(".json")) return "json";
  if (filename.endsWith(".ts")) return "typescript";
  if (filename.endsWith(".js")) return "javascript";
  return "text";
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FileListProps {
  title: string;
  files: StackLiveFile[];
  selectedFile: StackLiveFile | null;
  onFileSelect: (file: StackLiveFile) => void;
}

/**
 * File list component with file type badges
 */
function FileList({ title, files, selectedFile, onFileSelect }: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2 text-sm font-medium">
          <Folder size={16} />
          {title}
        </div>
        <div className="text-sm text-muted-foreground pl-6">
          No files generated
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-2 text-sm font-medium">
        <Folder size={16} />
        {title}
      </div>
      <div className="space-y-1">
        {files.map((file) => (
          <button
            key={file.path}
            onClick={() => onFileSelect(file)}
            className={cn(
              "w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 transition-colors",
              selectedFile?.path === file.path
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <FileCode size={14} />
            <span className="flex-1 truncate">{file.name}</span>
            <span className="text-xs opacity-70">{file.type}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface FileViewerProps {
  file: StackLiveFile | null;
}

/**
 * File viewer with syntax highlighting
 */
function FileViewer({ file }: FileViewerProps) {
  const { data: fileContent, isLoading } = useQuery({
    queryKey: queryKeys.stacklive.file({ path: file?.path || "" }),
    queryFn: () => {
      if (!file) throw new Error("No file selected");
      return ipc.stacklive.readFile({ path: file.path });
    },
    enabled: !!file,
  });

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <FileCode size={48} className="mx-auto mb-2 opacity-50" />
          <p>Select a file to view its contents</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="animate-spin" size={24} />
      </div>
    );
  }

  if (!fileContent) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Failed to load file
      </div>
    );
  }

  const language = getLanguage(file.name);

  return (
    <div className="h-full flex flex-col">
      {/* File header */}
      <div className="border-b px-4 py-2 flex items-center justify-between bg-muted/30">
        <div>
          <div className="text-sm font-medium">{file.name}</div>
          <div className="text-xs text-muted-foreground">
            {formatFileSize(file.size)} • Modified{" "}
            {new Date(file.modifiedAt).toLocaleString()}
          </div>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(fileContent.content);
          }}
          className="text-xs px-2 py-1 rounded hover:bg-accent flex items-center gap-1"
          title="Copy to clipboard"
        >
          <Copy size={12} />
          Copy
        </button>
      </div>

      {/* File content */}
      <div className="flex-1 overflow-auto">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: "13px",
            lineHeight: "1.5",
          }}
        >
          {fileContent.content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

/**
 * StackLive Output Panel
 *
 * Displays generated StackLive files from:
 * - src/creator/generated/
 * - public/embed-components/
 */
export function StackLivePanel() {
  const [selectedFile, setSelectedFile] = useState<StackLiveFile | null>(null);

  const {
    data: files,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: queryKeys.stacklive.list,
    queryFn: () => ipc.stacklive.getFiles(),
  });

  const totalFiles =
    (files?.creatorGenerated.length || 0) +
    (files?.embedComponents.length || 0);

  // Auto-select first file when data loads
  useEffect(() => {
    if (files && !selectedFile) {
      const firstFile =
        files.creatorGenerated[0] || files.embedComponents[0] || null;
      setSelectedFile(firstFile);
    }
  }, [files, selectedFile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="flex items-center p-2 border-b space-x-2">
        <button
          onClick={() => refetch()}
          className="p-1 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh Files"
        >
          <RefreshCw size={16} />
        </button>
        <div className="text-sm text-muted-foreground">{totalFiles} files</div>
        <div className="flex-1" />
        <div className="text-xs text-muted-foreground">StackLive Output</div>
      </div>

      {/* Content */}
      {totalFiles === 0 ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center p-8">
            <FileCode size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="font-medium mb-2">No StackLive Output Yet</h3>
            <p className="text-sm max-w-md">
              Generated components will appear here when you create StackLive
              embeds. Configure StackLive generation in Settings.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* File tree sidebar */}
          <div className="w-1/3 border-r overflow-auto">
            <FileList
              title="Creator Manifest"
              files={files?.creatorGenerated || []}
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
            />
            <FileList
              title="Embed Components"
              files={files?.embedComponents || []}
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
            />
          </div>

          {/* File viewer */}
          <div className="w-2/3">
            <FileViewer file={selectedFile} />
          </div>
        </div>
      )}
    </div>
  );
}
