'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Component {
  name: string;
  slug: string;
  latestVersion: string;
  description?: string;
  status: 'active' | 'deprecated';
}

export default function Home() {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/components')
      .then(res => res.json())
      .then(data => {
        setComponents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching components:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          MicroFE Component Manager
        </h1>
        <p style={{ color: '#666' }}>
          Upload and manage React components for WordPress
        </p>
      </header>

      <div style={{ marginBottom: '2rem' }}>
        <Link href="/upload" className="btn btn-primary">
          Upload New Component
        </Link>
      </div>

      {loading ? (
        <div className="card">
          <p>Loading components...</p>
        </div>
      ) : components.length === 0 ? (
        <div className="card">
          <p>No components uploaded yet. Upload your first component to get started.</p>
        </div>
      ) : (
        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>Components</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Latest Version</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {components.map(component => (
                <tr key={component.slug}>
                  <td>{component.name}</td>
                  <td>
                    <code>{component.slug}</code>
                  </td>
                  <td>{component.latestVersion}</td>
                  <td>
                    <span className={`badge badge-${component.status}`}>
                      {component.status}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/components/${component.slug}`}
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


