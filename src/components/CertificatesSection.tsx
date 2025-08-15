import React, { useState } from 'react';
import { Save, Plus, Edit2, Trash2, Award, ExternalLink } from 'lucide-react';

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  dateIssued: string;
  expiryDate: string;
  credentialId: string;
  credentialUrl: string;
  description: string;
  hasExpiry: boolean;
}

export default function CertificatesSection() {
  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: '1',
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      dateIssued: '2023-06',
      expiryDate: '2026-06',
      credentialId: 'AWS-SA-12345',
      credentialUrl: 'https://aws.amazon.com/verification',
      description: 'Validates expertise in designing distributed systems on AWS',
      hasExpiry: true
    },
    {
      id: '2',
      name: 'Google Cloud Professional Developer',
      issuer: 'Google Cloud',
      dateIssued: '2023-03',
      expiryDate: '',
      credentialId: 'GCP-DEV-67890',
      credentialUrl: 'https://cloud.google.com/certification/verification',
      description: 'Demonstrates ability to build scalable applications on Google Cloud Platform',
      hasExpiry: false
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    dateIssued: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
    description: '',
    hasExpiry: false
  });

  const handleAddCertificate = () => {
    const newCertificate: Certificate = {
      id: Date.now().toString(),
      ...formData
    };
    setCertificates([...certificates, newCertificate]);
    resetForm();
  };

  const handleEditCertificate = (certificate: Certificate) => {
    setEditingCertificate(certificate);
    setFormData({
      name: certificate.name,
      issuer: certificate.issuer,
      dateIssued: certificate.dateIssued,
      expiryDate: certificate.expiryDate,
      credentialId: certificate.credentialId,
      credentialUrl: certificate.credentialUrl,
      description: certificate.description,
      hasExpiry: certificate.hasExpiry
    });
    setIsEditing(true);
  };

  const handleUpdateCertificate = () => {
    if (editingCertificate) {
      setCertificates(certificates.map(cert => 
        cert.id === editingCertificate.id ? { ...editingCertificate, ...formData } : cert
      ));
      resetForm();
    }
  };

  const handleDeleteCertificate = (id: string) => {
    setCertificates(certificates.filter(cert => cert.id !== id));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      issuer: '',
      dateIssued: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
      description: '',
      hasExpiry: false
    });
    setIsEditing(false);
    setEditingCertificate(null);
  };

  const handleSave = () => {
    console.log('Saving certificates:', certificates);
    alert('Certificates section updated successfully!');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const isExpired = (expiryDate: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate: string) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const monthsUntilExpiry = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsUntilExpiry <= 3 && monthsUntilExpiry > 0;
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Certificates Management</h2>
        <p className="text-gray-600 mt-2">Manage your professional certifications and credentials</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isEditing ? 'Edit Certificate' : 'Add New Certificate'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., AWS Certified Solutions Architect"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issuing Organization</label>
              <input
                type="text"
                value={formData.issuer}
                onChange={(e) => setFormData(prev => ({ ...prev, issuer: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Amazon Web Services"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Issued</label>
              <input
                type="month"
                value={formData.dateIssued}
                onChange={(e) => setFormData(prev => ({ ...prev, dateIssued: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="hasExpiry"
                checked={formData.hasExpiry}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  hasExpiry: e.target.checked,
                  expiryDate: e.target.checked ? prev.expiryDate : ''
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="hasExpiry" className="text-sm text-gray-700">This certificate expires</label>
            </div>

            {formData.hasExpiry && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                <input
                  type="month"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Credential ID</label>
              <input
                type="text"
                value={formData.credentialId}
                onChange={(e) => setFormData(prev => ({ ...prev, credentialId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., AWS-SA-12345"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Credential URL</label>
              <input
                type="url"
                value={formData.credentialUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, credentialUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of what this certificate validates"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={isEditing ? handleUpdateCertificate : handleAddCertificate}
                disabled={!formData.name || !formData.issuer}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
              >
                <Plus size={16} />
                <span>{isEditing ? 'Update Certificate' : 'Add Certificate'}</span>
              </button>
              
              {isEditing && (
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Certificates ({certificates.length})</h3>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Save size={16} />
              <span>Save All</span>
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {certificates.map(cert => (
              <div key={cert.id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Award size={16} className="text-blue-500" />
                      <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                    </div>
                    <p className="text-gray-700 font-medium">{cert.issuer}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEditCertificate(cert)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCertificate(cert.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600">
                    <span>Issued: {formatDate(cert.dateIssued)}</span>
                    {cert.hasExpiry && cert.expiryDate && (
                      <span className="ml-4">
                        Expires: {formatDate(cert.expiryDate)}
                        {isExpired(cert.expiryDate) && (
                          <span className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                            Expired
                          </span>
                        )}
                        {isExpiringSoon(cert.expiryDate) && !isExpired(cert.expiryDate) && (
                          <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                            Expiring Soon
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {cert.credentialId && (
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Credential ID:</span> {cert.credentialId}
                  </div>
                )}

                {cert.credentialUrl && (
                  <div className="mb-2">
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-blue-500 hover:text-blue-700 text-sm"
                    >
                      <ExternalLink size={14} />
                      <span>Verify Certificate</span>
                    </a>
                  </div>
                )}
                
                {cert.description && (
                  <p className="text-sm text-gray-600">{cert.description}</p>
                )}
              </div>
            ))}

            {certificates.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No certificates yet. Add your first one!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}