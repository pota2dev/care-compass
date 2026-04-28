"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, Image as ImageIcon } from "lucide-react";

interface FileUploadDropzoneProps {
  name?: string;
  accept?: string;
  onFileChange?: (file: File | null) => void;
  labelText?: string;
  subText?: string;
  initialFile?: File | null;
}

export function FileUploadDropzone({
  name,
  accept,
  onFileChange,
  labelText = "Select File",
  subText = "Drag and drop, or click to browse",
  initialFile = null
}: FileUploadDropzoneProps) {
  const [file, setFile] = useState<File | null>(initialFile);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFile(initialFile);
  }, [initialFile]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Ignore if copying/pasting text into an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("image") !== -1 || item.type.indexOf("pdf") !== -1 || item.type.indexOf("document") !== -1) {
          const pastedFile = item.getAsFile();
          if (pastedFile) {
            handleFileSelection(pastedFile);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleFileSelection = (selectedFile: File) => {
    setFile(selectedFile);
    if (onFileChange) {
      onFileChange(selectedFile);
    }
    // Synchronize the always-mounted hidden input so native FormData (server actions) picks it up
    if (inputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(selectedFile);
      inputRef.current.files = dataTransfer.files;
    }
  };

  const removeFile = () => {
    setFile(null);
    if (onFileChange) onFileChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all duration-200 ${
        isDragging
          ? "border-forest-500 bg-forest-50 scale-[1.02]"
          : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFileSelection(e.dataTransfer.files[0]);
        }
      }}
    >
      {/* Always mounted — keeps the file in FormData even after the UI swaps to the file-info branch */}
      <input
        ref={inputRef}
        name={name}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelection(e.target.files[0]);
          }
        }}
      />

      {file ? (
        <div className="flex flex-col items-center space-y-3">
          <div className="p-3 bg-forest-100 rounded-full text-forest-600">
            {file.type.startsWith("image") ? (
              <ImageIcon className="w-8 h-8" />
            ) : (
              <FileText className="w-8 h-8" />
            )}
          </div>
          <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
            {file.name}
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="text-xs font-semibold text-red-500 hover:text-red-700 underline"
          >
            Remove file
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 text-gray-400">
            <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
            </svg>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="cursor-pointer bg-forest-600 shadow-sm text-white rounded-lg text-sm px-5 py-2.5 font-medium hover:bg-forest-700 focus:ring-2 focus:ring-forest-500 focus:outline-none transition-all"
          >
            {labelText}
          </button>
          <div className="mt-3 text-xs text-gray-500">
            <span className="font-semibold text-gray-700">Paste (Ctrl+V)</span>, drag and drop, or click
          </div>
          {subText && <p className="text-xs text-gray-400 mt-1">{subText}</p>}
        </>
      )}
    </div>
  );
}
