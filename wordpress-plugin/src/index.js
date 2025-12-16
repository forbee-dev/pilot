import { registerBlockType } from '@wordpress/blocks';
import { useState, useEffect } from '@wordpress/element';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl, Button, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const microfeConfig = window.microfeConfig || { apiUrl: 'http://localhost:3000' };

registerBlockType('microfe/react-component', {
	title: __('React Component', 'microfe-components'),
	icon: 'admin-plugins',
	category: 'widgets',
	attributes: {
		component: {
			type: 'string',
			default: '',
		},
		version: {
			type: 'string',
			default: '',
		},
		props: {
			type: 'object',
			default: {},
		},
	},
	edit: ({ attributes, setAttributes }) => {
		const [components, setComponents] = useState([]);
		const [loading, setLoading] = useState(false);
		const [error, setError] = useState(null);
		const [componentDetails, setComponentDetails] = useState(null);
		const [previewHtml, setPreviewHtml] = useState('');
		const [previewLoading, setPreviewLoading] = useState(false);
		const [propsSchema, setPropsSchema] = useState(null);
		const [propsValues, setPropsValues] = useState(attributes.props || {});

		const blockProps = useBlockProps({
			className: 'microfe-component-block',
		});

		// Fetch components list
		useEffect(() => {
			setLoading(true);
			setError(null);
			const apiUrl = microfeConfig.apiUrl || 'http://localhost:3000';
			const fetchUrl = `${apiUrl}/api/components`;

			console.log('Fetching components from:', fetchUrl);

			// Use fetch instead of apiFetch for external API
			fetch(fetchUrl)
				.then((response) => {
					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`);
					}
					return response.json();
				})
				.then((data) => {
					console.log('Components loaded:', data);
					if (Array.isArray(data)) {
						setComponents(data);
					} else {
						console.error('Unexpected response format:', data);
						setError('Invalid response format from API');
						setComponents([]);
					}
					setLoading(false);
				})
				.catch((error) => {
					console.error('Error fetching components:', error);
					console.error('API URL:', apiUrl);
					setError(`Failed to load components: ${error.message}. Check API URL in Settings → MicroFE`);
					setComponents([]);
					setLoading(false);
				});
		}, []);

		// Fetch component details when component is selected
		useEffect(() => {
			if (attributes.component) {
				fetch(`${microfeConfig.apiUrl}/api/components/${attributes.component}`)
					.then((response) => {
						if (!response.ok) {
							throw new Error(`HTTP error! status: ${response.status}`);
						}
						return response.json();
					})
					.then((data) => {
						setComponentDetails(data);
						const version = attributes.version || data.latestVersion;
						setAttributes({ version });

						// Find props schema for selected version
						const versionData = data.versions.find((v) => v.version === version);
						if (versionData && versionData.propsSchema) {
							setPropsSchema(versionData.propsSchema);
						}
					})
					.catch((error) => {
						console.error('Error fetching component details:', error);
					});
			}
		}, [attributes.component]);

		// Update preview when props change
		useEffect(() => {
			if (attributes.component && attributes.version) {
				updatePreview();
			}
		}, [attributes.component, attributes.version, propsValues]);

		const updatePreview = () => {
			if (!attributes.component || !attributes.version) return;

			setPreviewLoading(true);
			const propsJson = encodeURIComponent(JSON.stringify(propsValues));
			const renderUrl = `${microfeConfig.apiUrl}/api/render/${attributes.component}/${attributes.version}?props=${propsJson}`;

			fetch(renderUrl)
				.then((res) => res.json())
				.then((data) => {
					setPreviewHtml(data.html || '');
					setPreviewLoading(false);
				})
				.catch((error) => {
					console.error('Error rendering preview:', error);
					setPreviewLoading(false);
				});
		};

		const handleComponentChange = (value) => {
			setAttributes({ component: value, version: '', props: {} });
			setPropsValues({});
			setComponentDetails(null);
			setPropsSchema(null);
		};

		const handleVersionChange = (value) => {
			setAttributes({ version: value });
			if (componentDetails) {
				const versionData = componentDetails.versions.find((v) => v.version === value);
				if (versionData && versionData.propsSchema) {
					setPropsSchema(versionData.propsSchema);
				}
			}
		};

		const handlePropChange = (propName, value) => {
			const newProps = { ...propsValues, [propName]: value };
			setPropsValues(newProps);
			setAttributes({ props: newProps });
		};

		const renderPropField = (propName, propSchema) => {
			const propType = propSchema.type || 'string';
			const currentValue = propsValues[propName] || '';

			switch (propType) {
				case 'number':
					return (
						<TextControl
							key={propName}
							label={propName}
							type='number'
							value={currentValue}
							onChange={(value) => handlePropChange(propName, parseFloat(value) || 0)}
						/>
					);
				case 'boolean':
					return (
						<div key={propName} style={{ marginBottom: '1rem' }}>
							<label>
								<input
									type='checkbox'
									checked={currentValue || false}
									onChange={(e) => handlePropChange(propName, e.target.checked)}
								/>
								{propName}
							</label>
						</div>
					);
				default:
					return (
						<TextControl
							key={propName}
							label={propName}
							value={currentValue}
							onChange={(value) => handlePropChange(propName, value)}
						/>
					);
			}
		};

		return (
			<div {...blockProps}>
				<InspectorControls>
					<PanelBody title={__('Component Settings', 'microfe-components')}>
						{error && (
							<div
								style={{
									padding: '0.5rem',
									backgroundColor: '#f8d7da',
									color: '#721c24',
									borderRadius: '4px',
									marginBottom: '1rem',
									fontSize: '0.875rem',
								}}
							>
								{error}
							</div>
						)}
						{loading ? (
							<div>
								<Spinner />
								<p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Loading components...</p>
							</div>
						) : components.length === 0 && !error ? (
							<p style={{ fontSize: '0.875rem', color: '#666' }}>
								No components available. Make sure components are uploaded to MicroFE.
							</p>
						) : (
							<SelectControl
								label={__('Component', 'microfe-components')}
								value={attributes.component}
								options={[
									{ label: __('Select a component...', 'microfe-components'), value: '' },
									...components.map((c) => ({
										label: `${c.name} (${c.latestVersion})`,
										value: c.slug,
									})),
								]}
								onChange={handleComponentChange}
							/>
						)}

						{componentDetails && (
							<SelectControl
								label={__('Version', 'microfe-components')}
								value={attributes.version}
								options={componentDetails.versions.map((v) => ({
									label: v.version,
									value: v.version,
								}))}
								onChange={handleVersionChange}
							/>
						)}

						{propsSchema && propsSchema.properties && (
							<PanelBody title={__('Props', 'microfe-components')} initialOpen={true}>
								{Object.entries(propsSchema.properties).map(([propName, propSchema]) =>
									renderPropField(propName, propSchema)
								)}
							</PanelBody>
						)}
					</PanelBody>
				</InspectorControls>

				<div style={{ padding: '1rem', border: '1px dashed #ccc', minHeight: '100px' }}>
					{!attributes.component ? (
						<p>{__('Select a component from the sidebar to preview it.', 'microfe-components')}</p>
					) : previewLoading ? (
						<Spinner />
					) : previewHtml ? (
						<div dangerouslySetInnerHTML={{ __html: previewHtml }} />
					) : (
						<p>{__('Loading preview...', 'microfe-components')}</p>
					)}
				</div>
			</div>
		);
	},
	save: () => {
		// Dynamic block - no save function needed
		return null;
	},
});
