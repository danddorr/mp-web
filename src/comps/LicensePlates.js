import React, { useState, useEffect } from 'react';
import { Car, Edit2, Trash2, Plus, AlertTriangle, Check, X, Loader, ChevronLeft, ChevronRight } from 'lucide-react';

const LicensePlates = ({ generalInfo }) => {
  const [licensePlates, setLicensePlates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPlate, setNewPlate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState({ active: false, id: null, value: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    page: 1
  });
  
  const isAdmin = generalInfo?.user?.is_admin;

  // Fetch license plates
  useEffect(() => {
    if (generalInfo?.authToken) {
      fetchLicensePlates(1);
    }
  }, [generalInfo?.authToken]);

  const fetchLicensePlates = (page = 1) => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_API_DOMAIN}/api/license-plates/?page=${page}`, {
      headers: {
        'Authorization': `JWT ${generalInfo.authToken}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch license plates');
        }
        return response.json();
      })
      .then(data => {
        // Handle both paginated and non-paginated responses
        if (data.results && Array.isArray(data.results)) {
          // Paginated response
          setLicensePlates(data.results);
          setPagination({
            count: data.count,
            next: data.next,
            previous: data.previous,
            page: page
          });
        } else if (Array.isArray(data)) {
          // Non-paginated response (array)
          setLicensePlates(data);
          setPagination({
            count: data.length,
            next: null,
            previous: null,
            page: 1
          });
        } else {
          // Unexpected response
          console.error('Unexpected API response format:', data);
          setLicensePlates([]);
          setPagination({
            count: 0,
            next: null,
            previous: null,
            page: 1
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching license plates:', err);
        setLoading(false);
        setError('Nepodarilo sa načítať EČV');
        // Initialize with empty array on error
        setLicensePlates([]);
        setPagination({
          count: 0,
          next: null,
          previous: null,
          page: 1
        });
      });
  };

  const handlePageChange = (newPage) => {
    fetchLicensePlates(newPage);
  };

  // Extract page number from URL
  const getPageFromUrl = (url) => {
    if (!url) return null;
    const match = url.match(/page=(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  };

  const handleAddPlate = (e) => {
    e.preventDefault();
    if (!newPlate.trim()) {
      setError('Zadajte číslo EČV');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    fetch(`${process.env.REACT_APP_API_DOMAIN}/api/license-plates/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${generalInfo.authToken}`
      },
      body: JSON.stringify({ ecv: newPlate.trim() })
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => Promise.reject(err));
        }
        return response.json();
      })
      .then(data => {
        setLicensePlates([...licensePlates, data]);
        setNewPlate('');
        setSuccess('EČV bola úspešne pridaná');
        setTimeout(() => setSuccess(''), 3000);
      })
      .catch(err => {
        console.error('Error adding license plate:', err);
        setError(err.detail || 'Nepodarilo sa pridať EČV');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleEditSave = () => {
    if (!editMode.value.trim()) {
      setError('EČV nemôže byť prázdna');
      return;
    }

    setIsSubmitting(true);
    setError('');

    fetch(`${process.env.REACT_APP_API_DOMAIN}/api/license-plates/${editMode.id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${generalInfo.authToken}`
      },
      body: JSON.stringify({ ecv: editMode.value.trim() })
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => Promise.reject(err));
        }
        return response.json();
      })
      .then(data => {
        setLicensePlates(licensePlates.map(plate => 
          plate.id === editMode.id ? data : plate
        ));
        setEditMode({ active: false, id: null, value: '' });
        setSuccess('EČV bola úspešne aktualizovaná');
        setTimeout(() => setSuccess(''), 3000);
      })
      .catch(err => {
        console.error('Error updating license plate:', err);
        setError(err.detail || 'Nepodarilo sa aktualizovať EČV');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleDelete = (id) => {
    setIsSubmitting(true);
    setError('');

    fetch(`${process.env.REACT_APP_API_DOMAIN}/api/license-plates/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `JWT ${generalInfo.authToken}`
      }
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => Promise.reject(err));
        }
        setLicensePlates(licensePlates.filter(plate => plate.id !== id));
        setDeleteConfirm(null);
        setSuccess('EČV bola úspešne odstránená');
        setTimeout(() => setSuccess(''), 3000);
      })
      .catch(err => {
        console.error('Error deleting license plate:', err);
        setError(err.detail || 'Nepodarilo sa odstrániť EČV');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const toggleAllowed = (id, currentStatus) => {
    setIsSubmitting(true);
    setError('');
    console.log('Toggling license plate:', id, JSON.stringify({ is_allowed: !currentStatus }));

    fetch(`${process.env.REACT_APP_API_DOMAIN}/api/license-plates/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${generalInfo.authToken}`
      },
      body: JSON.stringify({ is_allowed: !currentStatus })
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => Promise.reject(err));
        }
        return response.json();
      })
      .then(data => {
        setLicensePlates(licensePlates.map(plate => 
          plate.id === id ? data : plate
        ));
        setSuccess(`EČV ${data.is_allowed ? 'schválená' : 'neschválená'}`);
        setTimeout(() => setSuccess(''), 3000);
      })
      .catch(err => {
        console.error('Error toggling license plate approval:', err);
        setError(err.detail || 'Nepodarilo sa aktualizovať EČV');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('sk-SK', {
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Add a console.log to help debug the issue
  useEffect(() => {
    console.log('License plates data:', licensePlates);
  }, [licensePlates]);

  return (
    <div className="h-full flex-1 overflow-y-auto bg-gradient-to-b from-gray-800 via-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto mt-0 mb-0 md:mt-4 md:mb-4 bg-gray-800/30 backdrop-blur rounded-lg border border-transparent md:border-gray-700 shadow-xl p-4">
        <h1 className="text-3xl font-bold text-white text-center mb-2 mt-8">
          Správa EČV
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Zobraziť a spravovať vaše registrované EČV
        </p>
        
        {/* Add new license plate form */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-4 mb-8">
          <h2 className="text-lg font-semibold mb-4">Pridať novú EČV</h2>
          <form onSubmit={handleAddPlate} className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={newPlate}
                onChange={(e) => setNewPlate(e.target.value)}
                placeholder="Zadajte číslo EČV"
                className="w-full p-3 bg-gray-800/50 border border-gray-600 text-white rounded-lg 
                         focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 
                         hover:border-gray-500 transition-colors placeholder-gray-400"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              {isSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Pridať
            </button>
          </form>
        </div>
        
        {/* Status messages */}
        {error && (
          <div className="mb-4 bg-red-600/20 border border-red-700/50 text-red-400 px-4 py-3 rounded-lg flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-4 bg-green-600/20 border border-green-700/50 text-green-400 px-4 py-3 rounded-lg flex items-center">
            <Check className="w-5 h-5 mr-2" />
            <span>{success}</span>
          </div>
        )}
        
        {/* License plates list */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
              <tr>
                <th className="px-6 py-3">EČV</th>
                <th className="px-6 py-3">Stav</th>
                <th className="px-6 py-3">Vytvorené</th>
                <th className="px-6 py-3 text-right">Akcie</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <Loader className="w-6 h-6 animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : licensePlates.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center">Neboli nájdené žiadne EČV</td>
                </tr>
              ) : (
                Array.isArray(licensePlates) && licensePlates.map((plate) => (
                  <tr key={plate.id} className="border-b border-gray-700/30 bg-gray-800/20 hover:bg-gray-700/20">
                    <td className="px-6 py-4">
                      {editMode.active && editMode.id === plate.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editMode.value}
                            onChange={(e) => setEditMode({...editMode, value: e.target.value})}
                            className="bg-gray-700 border border-gray-600 text-white rounded p-1 text-sm"
                          />
                          <div className="flex gap-1">
                            <button 
                              onClick={handleEditSave}
                              disabled={isSubmitting}
                              className="text-green-400 hover:bg-green-600/20 p-2 rounded-lg"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setEditMode({active: false, id: null, value: ''})}
                              className="text-red-400 hover:bg-red-600/20 p-2 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Car className="w-4 h-4 mr-2 text-blue-400" />
                          <span className="font-mono text-lg font-bold">{plate.ecv}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {isAdmin ? (
                          <button 
                            onClick={() => toggleAllowed(plate.id, plate.is_allowed)}
                            className={`px-3 py-1 rounded-full text-xs font-medium 
                              ${plate.is_allowed 
                                ? 'bg-green-600/20 text-green-400 hover:bg-green-600/40' 
                                : 'bg-red-600/20 text-red-400 hover:bg-red-600/40'
                              } transition-colors`}
                          >
                            {plate.is_allowed ? 'Schválené' : 'Neschválené'}
                          </button>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium 
                            ${plate.is_allowed 
                              ? 'bg-green-600/20 text-green-400' 
                              : 'bg-red-600/20 text-red-400'
                            }`}>
                            {plate.is_allowed ? 'Schválené' : 'Neschválené'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {formatDate(plate.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {deleteConfirm === plate.id ? (
                          <>
                            <span className="text-xs text-gray-400 mr-2">Potvrdiť odstránenie?</span>
                            <button 
                              onClick={() => handleDelete(plate.id)}
                              className="text-green-400 hover:bg-green-600/20 p-2 rounded-lg"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setDeleteConfirm(null)}
                              className="text-red-400 hover:bg-red-600/20 p-2 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => setEditMode({active: true, id: plate.id, value: plate.ecv})}
                              className="text-blue-400 hover:bg-blue-600/20 p-2 rounded-lg"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setDeleteConfirm(plate.id)}
                              className="text-red-400 hover:bg-red-600/20 p-2 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-400">
            {pagination.count > 0 ? (
              <span>
                Zobrazujem {(pagination.page - 1) * 10 + 1} - {Math.min(pagination.page * 10, pagination.count)} z {pagination.count} záznamov
              </span>
            ) : (
              <span>Žiadne záznamy</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.previous && handlePageChange(getPageFromUrl(pagination.previous))}
              disabled={!pagination.previous}
              className={`p-2 rounded-lg ${
                pagination.previous 
                  ? 'hover:bg-gray-700 text-white' 
                  : 'text-gray-500 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-3 py-1 bg-gray-800 rounded-lg text-sm">
              Strana {pagination.page}
            </span>
            <button
              onClick={() => pagination.next && handlePageChange(getPageFromUrl(pagination.next))}
              disabled={!pagination.next}
              className={`p-2 rounded-lg ${
                pagination.next 
                  ? 'hover:bg-gray-700 text-white' 
                  : 'text-gray-500 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicensePlates;
