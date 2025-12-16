'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface ComponentDetails {
  name: string;
  slug: string;
  description?: string;
  latestVersion: string;
  versions: Array<{
    version: string;
    propsSchema: any;
    createdAt: string;
    status: string;
  }>;
  status: string;
}

function generateDefaultProps(schema: any): any {
  if (!schema || !schema.properties) return {};
  
  const props: any = {};
  Object.keys(schema.properties).forEach(key => {
    const prop = schema.properties[key];
    if (prop.type === 'string') {
      props[key] = prop.default || `Sample ${key}`;
    } else if (prop.type === 'number') {
      props[key] = prop.default || 0;
    } else if (prop.type === 'boolean') {
      props[key] = prop.default || false;
    } else if (prop.type === 'array') {
      props[key] = prop.default || [];
    }
  });
  return props;
}

export default function ComponentDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [component, setComponent] = useState<ComponentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewProps, setPreviewProps] = useState<any>({});
  const [showPropsEditor, setShowPropsEditor] = useState(false);

  useEffect(() => {
    if (slug) {
      fetch(`/api/components/${slug}`)
        .then(res => res.json())
        .then(data => {
          setComponent(data);
          // Generate default props from latest version schema
          if (data.versions && data.versions.length > 0) {
            const latestVersion = data.versions.find((v: any) => v.version === data.latestVersion) || data.versions[0];
            const defaultProps = generateDefaultProps(latestVersion.propsSchema);
            setPreviewProps(defaultProps);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching component:', err);
          setLoading(false);
        });
    }
  }, [slug]);

  // Load preview when component or props change
  useEffect(() => {
    if (component && component.latestVersion) {
      // Load preview even with empty props (component might not need props)
      loadPreview(component.slug, component.latestVersion, previewProps);
    }
  }, [component, previewProps]);

  // Load component CSS
  useEffect(() => {
    if (component && component.latestVersion) {
      const linkId = `microfe-css-${component.slug}-${component.latestVersion}`;
      // Remove existing link if any
      const existingLink = document.getElementById(linkId);
      if (existingLink) {
        existingLink.remove();
      }
      
      // Create and add new link
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = `/cdn/components/${component.slug}/${component.latestVersion}/style.css`;
      document.head.appendChild(link);

      return () => {
        const linkToRemove = document.getElementById(linkId);
        if (linkToRemove) {
          linkToRemove.remove();
        }
      };
    }
  }, [component]);

  const loadPreview = async (componentSlug: string, version: string, props: any) => {
    setPreviewLoading(true);
    setPreviewHtml(''); // Clear previous preview
    try {
      const propsJson = encodeURIComponent(JSON.stringify(props || {}));
      const response = await fetch(`/api/render/${componentSlug}/${version}?props=${propsJson}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Preview API error:', errorData);
        setPreviewHtml(`<div style="padding: 1rem; color: #dc3545;"><strong>Error:</strong> ${errorData.error || 'Failed to load preview'}</div>`);
        return;
      }
      
      const data = await response.json();
      if (data.html) {
        setPreviewHtml(data.html);
      } else {
        console.warn('Preview API returned no HTML:', data);
        setPreviewHtml('<div style="padding: 1rem; color: #666;">No HTML returned from render API</div>');
      }
    } catch (error: any) {
      console.error('Error loading preview:', error);
      setPreviewHtml(`<div style="padding: 1rem; color: #dc3545;"><strong>Error:</strong> ${error.message || 'Failed to load preview'}</div>`);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePropChange = (key: string, value: any) => {
    setPreviewProps((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderPropEditor = (schema: any) => {
    if (!schema || !schema.properties) return null;

    return (
      <div style={{ marginTop: '1rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Props</h3>
        {Object.entries(schema.properties).map(([key, prop]: [string, any]) => {
          const value = previewProps[key] || '';
          return (
            <div key={key} style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
                {key} {schema.required?.includes(key) && <span style={{ color: '#dc3545' }}>*</span>}
              </label>
              {prop.type === 'boolean' ? (
                <input
                  type="checkbox"
                  checked={value || false}
                  onChange={(e) => handlePropChange(key, e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
              ) : prop.type === 'number' ? (
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handlePropChange(key, parseFloat(e.target.value) || 0)}
                  className="input"
                  style={{ width: '100%', maxWidth: '300px' }}
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handlePropChange(key, e.target.value)}
                  className="input"
                  style={{ width: '100%', maxWidth: '300px' }}
                  placeholder={prop.type === 'string' ? `Enter ${key}...` : ''}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!component) {
    return (
      <div className="container">
        <div className="card">
          <p>Component not found</p>
          <Link href="/" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <Link href="/" style={{ color: '#0070f3', marginBottom: '1rem', display: 'block' }}>
          ← Back to Dashboard
        </Link>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          {component.name}
        </h1>
        <p style={{ color: '#666' }}>
          Slug: <code>{component.slug}</code>
        </p>
      </header>

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Details</h2>
        <p>
          <strong>Latest Version:</strong> {component.latestVersion}
        </p>
        <p>
          <strong>Status:</strong>{' '}
          <span className={`badge badge-${component.status}`}>
            {component.status}
          </span>
        </p>
        {component.description && (
          <p>
            <strong>Description:</strong> {component.description}
          </p>
        )}
      </div>

      {/* Component Preview */}
      {component.versions && component.versions.length > 0 ? (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Preview</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  if (component) {
                    loadPreview(component.slug, component.latestVersion, previewProps);
                  }
                }}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                disabled={previewLoading}
              >
                {previewLoading ? 'Loading...' : 'Refresh'}
              </button>
              <button
                onClick={() => setShowPropsEditor(!showPropsEditor)}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {showPropsEditor ? 'Hide' : 'Edit'} Props
              </button>
            </div>
          </div>

          {showPropsEditor && (() => {
            const latestVersionData = component.versions.find(v => v.version === component.latestVersion) || component.versions[0];
            return latestVersionData?.propsSchema ? (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  marginBottom: '1rem',
                  border: '1px solid #dee2e6',
                }}
              >
                {renderPropEditor(latestVersionData.propsSchema)}
              </div>
            ) : null;
          })()}

          <div
            style={{
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              padding: '2rem',
              backgroundColor: '#fff',
              minHeight: '200px',
              position: 'relative',
            }}
          >
            {previewLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Loading preview...</p>
              </div>
            ) : previewHtml ? (
              <div
                dangerouslySetInnerHTML={{ __html: previewHtml }}
                style={{ width: '100%' }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                <p>No preview available</p>
                <button
                  onClick={() => {
                    if (component) {
                      loadPreview(component.slug, component.latestVersion, previewProps);
                    }
                  }}
                  className="btn btn-primary"
                  style={{ marginTop: '1rem' }}
                >
                  Retry Preview
                </button>
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>Preview</h2>
          <p style={{ color: '#666' }}>No versions available for preview.</p>
        </div>
      )}

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Versions</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Version</th>
              <th>Created</th>
              <th>Status</th>
              <th>Props Schema</th>
            </tr>
          </thead>
          <tbody>
            {component.versions.map(version => (
              <tr key={version.version}>
                <td>{version.version}</td>
                <td>{new Date(version.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`badge badge-${version.status}`}>
                    {version.status}
                  </span>
                </td>
                <td>
                  <pre
                    style={{
                      fontSize: '0.75rem',
                      backgroundColor: '#f8f9fa',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      overflow: 'auto',
                      maxWidth: '400px',
                    }}
                  >
                    {JSON.stringify(version.propsSchema, null, 2)}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>API Endpoints</h2>
        <div style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
          <p>
            <strong>Render:</strong>{' '}
            <code>
              /api/render/{component.slug}/{component.latestVersion}?props=...
            </code>
          </p>
          <p>
            <strong>Client Bundle:</strong>{' '}
            <code>
              /cdn/components/{component.slug}/{component.latestVersion}/client.js
            </code>
          </p>
          <p>
            <strong>CSS:</strong>{' '}
            <code>
              /cdn/components/{component.slug}/{component.latestVersion}/style.css
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}

