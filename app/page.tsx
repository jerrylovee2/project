'use client';

import { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Lock, Shield, Plus, X } from 'lucide-react';

interface ClickTracker {
  count: number;
  startTime: number | null;
}

export default function Home() {
  const [clickTracker, setClickTracker] = useState<ClickTracker>({
    count: 0,
    startTime: null
  });
  const [showModal, setShowModal] = useState(false);
  const [masterKey, setMasterKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [secrets, setSecrets] = useState<any[]>([]);
  const [showSecrets, setShowSecrets] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout>();
  const modalTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (clickTracker.startTime) {
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - clickTracker.startTime!) / 1000;
        
        if (elapsed > 20) {
          setClickTracker({
            count: 0,
            startTime: null
          });
          clearInterval(timerRef.current);
        }
      }, 100);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [clickTracker.startTime]);

  useEffect(() => {
    if (showModal) {
      modalTimerRef.current = setTimeout(() => {
        setShowModal(false);
        setMasterKey('');
        setError('');
      }, 10000);
    }

    return () => {
      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current);
      }
    };
  }, [showModal]);

  const handlePenguinEyeClick = () => {
    const now = Date.now();
    
    if (!clickTracker.startTime) {
      setClickTracker({
        count: 1,
        startTime: now
      });
    } else {
      const elapsed = (now - clickTracker.startTime) / 1000;
      
      if (elapsed <= 20) {
        const newCount = clickTracker.count + 1;
        
        if (newCount >= 10) {
          setShowModal(true);
          setClickTracker({
            count: 0,
            startTime: null
          });
          clearInterval(timerRef.current);
        } else {
          setClickTracker(prev => ({
            ...prev,
            count: newCount
          }));
        }
      } else {
        setClickTracker({
          count: 1,
          startTime: now
        });
      }
    }
  };

  const handleAuthentication = async () => {
    if (!masterKey) {
      setError('Please enter the master key');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ masterKey }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsAuthenticated(true);
        setShowModal(false);
        loadSecrets();
        if (modalTimerRef.current) {
          clearTimeout(modalTimerRef.current);
        }
      } else {
        setError(data.message || 'Invalid master key');
      }
    } catch (error) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadSecrets = async () => {
    try {
      const response = await fetch('/api/secrets');
      const data = await response.json();

      if (response.ok) {
        setSecrets(data.secrets || []);
      }
    } catch (error) {
      console.error('Failed to load secrets:', error);
    }
  };

  const addSecret = async (email: string, password: string, description: string) => {
    try {
      const response = await fetch('/api/secrets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, description }),
      });

      if (response.ok) {
        loadSecrets();
      }
    } catch (error) {
      console.error('Failed to add secret:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
      {!isAuthenticated ? (
        <>
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              🐧 PenguinLock
            </h1>
            <p className="text-gray-600 text-lg">
              Your secrets are safe with Skipper
            </p>
          </div>

          <div className="flex justify-center items-center py-16">
            <div className="relative">
              <div className="w-80 h-80 relative">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <ellipse cx="100" cy="140" rx="45" ry="55" fill="#2c3e50" />
                  <ellipse cx="100" cy="140" rx="35" ry="45" fill="white" />
                  <circle cx="100" cy="80" r="40" fill="#2c3e50" />
                  <circle cx="100" cy="85" r="32" fill="white" />
                  <polygon points="100,95 110,105 90,105" fill="#f39c12" />
                  <circle cx="90" cy="75" r="8" fill="white" />
                  <circle cx="110" cy="75" r="8" fill="white" />
                  <circle 
                    cx="88" 
                    cy="73" 
                    r="4" 
                    fill="#2c3e50" 
                    className="cursor-pointer hover:fill-blue-600 transition-colors"
                    onClick={handlePenguinEyeClick}
                  />
                  <circle 
                    cx="112" 
                    cy="73" 
                    r="4" 
                    fill="#2c3e50" 
                    className="cursor-pointer hover:fill-blue-600 transition-colors"
                    onClick={handlePenguinEyeClick}
                  />
                  <ellipse cx="65" cy="120" rx="12" ry="25" fill="#2c3e50" transform="rotate(-20 65 120)" />
                  <ellipse cx="135" cy="120" rx="12" ry="25" fill="#2c3e50" transform="rotate(20 135 120)" />
                  <ellipse cx="85" cy="190" rx="8" ry="12" fill="#f39c12" />
                  <ellipse cx="115" cy="190" rx="8" ry="12" fill="#f39c12" />
                </svg>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-6 pb-16">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-md text-center">
                <Lock className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Secure Storage</h3>
                <p className="text-gray-600 text-sm">
                  Military-grade encryption keeps your secrets safe
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-md text-center">
                <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Hidden Access</h3>
                <p className="text-gray-600 text-sm">
                  Only you know the secret way to access your data
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-md text-center">
                <Eye className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Zero Knowledge</h3>
                <p className="text-gray-600 text-sm">
                  We never see your passwords or personal information
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <SecretsDashboard 
          secrets={secrets} 
          onAddSecret={addSecret}
          onShowSecrets={() => setShowSecrets(!showSecrets)}
          showSecrets={showSecrets}
        />
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🐧</div>
              <h2 className="text-2xl font-bold text-gray-800">Access Granted!</h2>
              <p className="text-gray-600 mt-2">Skipper needs the secret code</p>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="password"
                  value={masterKey}
                  onChange={(e) => setMasterKey(e.target.value)}
                  placeholder="Enter master key"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    if (modalTimerRef.current) {
                      clearTimeout(modalTimerRef.current);
                    }
                    setShowModal(false);
                    setMasterKey('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAuthentication}
                  className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Accessing...' : 'Access Vault'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SecretsDashboard({ secrets, onAddSecret, onShowSecrets, showSecrets }: {
  secrets: any[];
  onAddSecret: (email: string, password: string, description: string) => void;
  onShowSecrets: () => void;
  showSecrets: boolean;
}) {
  const [newSecret, setNewSecret] = useState({
    email: '',
    password: '',
    description: ''
  });
  const [showForm, setShowForm] = useState(false);

  const handleAddSecret = () => {
    if (newSecret.email && newSecret.password) {
      onAddSecret(newSecret.email, newSecret.password, newSecret.description);
      setNewSecret({ email: '', password: '', description: '' });
      setShowForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">🐧</div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">PenguinLock Vault</h2>
                <p className="text-gray-600 mt-1">Your secrets are secure with Skipper</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Secret</span>
              </button>
              <button
                onClick={onShowSecrets}
                className="flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{showSecrets ? 'Hide' : 'Show'} Secrets</span>
              </button>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Add New Secret</h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <input
                type="email"
                value={newSecret.email}
                onChange={(e) => setNewSecret(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              />
              <input
                type="password"
                value={newSecret.password}
                onChange={(e) => setNewSecret(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Password"
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              />
              <input
                type="text"
                value={newSecret.description}
                onChange={(e) => setNewSecret(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description (optional)"
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors md:col-span-2"
              />
            </div>
            <button
              onClick={handleAddSecret}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              Save Secret
            </button>
          </div>
        )}

        {showSecrets && (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Stored Secrets ({secrets.length})
            </h3>
            {secrets.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🐧</div>
                <p className="text-gray-500">No secrets stored yet. Add your first secret above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {secrets.map((secret, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                        <p className="text-gray-800 bg-white px-3 py-2 rounded border">
                          {secret.email}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                        <p className="text-gray-800 bg-white px-3 py-2 rounded border font-mono">
                          {secret.password}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                        <p className="text-gray-800 bg-white px-3 py-2 rounded border">
                          {secret.description || 'No description'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}