'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [componentName, setComponentName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (componentName) {
        formData.append('name', componentName);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Upload Component
        </h1>
        <p style={{ color: '#666' }}>
          Upload a ZIP file containing your React component
        </p>
      </header>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div>
            <label className="label" htmlFor="name">
              Component Name (optional)
            </label>
            <input
              id="name"
              type="text"
              className="input"
              value={componentName}
              onChange={(e) => setComponentName(e.target.value)}
              placeholder="e.g., HeroBanner"
            />
          </div>

          <div>
            <label className="label" htmlFor="file">
              Component ZIP File
            </label>
            <input
              id="file"
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              style={{ marginBottom: '1rem' }}
            />
            {file && (
              <p style={{ color: '#666', fontSize: '0.875rem' }}>
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {error && (
            <div
              style={{
                padding: '1rem',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                borderRadius: '4px',
                marginBottom: '1rem',
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                padding: '1rem',
                backgroundColor: '#d4edda',
                color: '#155724',
                borderRadius: '4px',
                marginBottom: '1rem',
              }}
            >
              Component uploaded successfully! Redirecting...
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={uploading || !file}
          >
            {uploading ? 'Uploading...' : 'Upload Component'}
          </button>
        </form>
      </div>
    </div>
  );
}


