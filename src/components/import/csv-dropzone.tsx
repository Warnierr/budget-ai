'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CSVDropzoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  error?: string | null;
  success?: boolean;
}

export function CSVDropzone({ onFileSelect, isLoading, error, success }: CSVDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);
  
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);
  
  const handleClick = () => {
    inputRef.current?.click();
  };
  
  return (
    <Card 
      className={`border-2 border-dashed transition-colors cursor-pointer ${
        isDragging 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
          : success 
            ? 'border-green-500 bg-green-50 dark:bg-green-950'
            : error 
              ? 'border-red-500 bg-red-50 dark:bg-red-950'
              : 'border-gray-300 hover:border-gray-400 dark:border-gray-700'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <CardContent className="flex flex-col items-center justify-center py-12 px-6">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileInput}
          className="hidden"
          disabled={isLoading}
        />
        
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Import en cours...</p>
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-green-600 dark:text-green-400 font-medium">Import reussi !</p>
            <p className="text-sm text-gray-500 mt-2">Cliquez pour importer un autre fichier</p>
          </>
        ) : error ? (
          <>
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            <p className="text-sm text-gray-500 mt-2">Cliquez pour reessayer</p>
          </>
        ) : selectedFile ? (
          <>
            <FileSpreadsheet className="h-12 w-12 text-blue-500 mb-4" />
            <p className="text-gray-800 dark:text-gray-200 font-medium">{selectedFile.name}</p>
            <p className="text-sm text-gray-500 mt-1">
              {(selectedFile.size / 1024).toFixed(1)} Ko
            </p>
          </>
        ) : (
          <>
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-center">
              <span className="font-medium">Glissez votre fichier CSV ici</span>
              <br />
              <span className="text-sm">ou cliquez pour parcourir</span>
            </p>
            <p className="text-xs text-gray-400 mt-4">
              Formats supportes : Revolut, Societe Generale, BNP, Boursorama
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
