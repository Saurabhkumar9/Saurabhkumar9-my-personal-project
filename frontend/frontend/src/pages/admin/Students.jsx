// --- FINAL UI OPTIMIZED VERSION (NO FEATURE REMOVED) ---
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStudent } from '../../context/StudentContext';
import { toast } from 'react-toastify';

const Students = () => {
  const { students, loading, error, deleteStudent, getAllStudents } = useStudent();

  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedStudentFee, setSelectedStudentFee] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('all');

  const batchNames = [...new Set(students.map(s => s.batchName).filter(b => b))].sort();

  useEffect(() => {
    setFilteredStudents(students);
  }, [students]);

  useEffect(() => {
    let filtered = [...students];

    if (searchTerm.trim() !== '') {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.name?.toLowerCase().includes(lower) ||
        s.fatherName?.toLowerCase().includes(lower) ||
        s.phone?.includes(searchTerm) ||
        s.aadharNumber?.includes(searchTerm) ||
        s.batchName?.toLowerCase().includes(lower)
      );
    }

    if (selectedBatch !== 'all') {
      filtered = filtered.filter(s => s.batchName === selectedBatch);
    }

    filtered.sort((a, b) => {
      const x = a.name?.toLowerCase() || '';
      const y = b.name?.toLowerCase() || '';
      return sortOrder === 'asc' ? x.localeCompare(y) : y.localeCompare(x);
    });

    setFilteredStudents(filtered);
  }, [students, searchTerm, sortOrder, selectedBatch, activeFilter]);


  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      const result = await deleteStudent(id);
      result.success ? toast.success(`${name} deleted`) : toast.error(result.error);
    }
  };

  const showFeeHistory = (s) => setSelectedStudentFee(s);
  const closeFeeHistory = () => setSelectedStudentFee(null);

  const getLastFeeStatus = (student) => {
    if (!student.fee?.length) {
      return { lastFeeMonth: 'None', status: 'unpaid', amount: 0 };
    }
    const order = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const sorted = [...student.fee].sort((a, b) => order.indexOf(b.month.split(" ")[0]) - order.indexOf(a.month.split(" ")[0]));
    return sorted[0];
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedBatch('all');
    setActiveFilter('all');
    setSortOrder('asc');
  };

  if (loading && students.length === 0)
    return <div className="h-screen flex items-center justify-center text-lg">Loading...</div>;

  if (error && students.length === 0)
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-3">
        <div className="text-red-500 text-lg">Error: {error}</div>
        <button onClick={getAllStudents} className="px-4 py-2 bg-blue-600 text-white rounded">
          Retry
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 md:px-6">

      {/* 🔵 Fee History Modal */}
      {selectedStudentFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white w-full max-w-sm rounded-lg shadow max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-3 border-b">
              <h2 className="font-semibold text-lg">Fee History - {selectedStudentFee.name}</h2>
              <button onClick={closeFeeHistory} className="text-xl text-gray-600">×</button>
            </div>
            <div className="p-3 space-y-2">
              {selectedStudentFee.fee?.map((f, i) => (
                <div key={i} className={`p-2 rounded border text-sm ${
                  f.status === 'paid' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex justify-between">
                    <span>{f.month}</span>
                    <span className={`px-2 rounded text-xs ${f.status === 'paid' ? 'text-green-700 bg-green-100' : 'bg-red-100 text-red-700'}`}>
                      {f.status}
                    </span>
                  </div>
                  <div className="text-gray-600 mt-1">₹{f.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Students</h1>
          <p className="text-gray-600 text-sm">Manage all student records</p>
        </div>

        {(searchTerm || selectedBatch !== 'all') && (
          <button
            onClick={clearAllFilters}
            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-sm rounded"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* 🔎 Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e)=>setSearchTerm(e.target.value)}
            placeholder="Search by name, phone, aadhaar..."
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>

       
      </div>

      {/* Batch Filter */}
      {batchNames.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-2 text-sm font-medium">Filter by Batch:</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedBatch('all')}
              className={`px-3 py-1.5 text-sm rounded ${selectedBatch === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              All
            </button>
            {batchNames.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBatch(b)}
                className={`px-3 py-1.5 text-sm rounded ${selectedBatch === b ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Students Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Batch</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Aadhaar</th>
              <th className="p-2">Fee</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map((s) => {
              const last = getLastFeeStatus(s);
              return (
                <tr key={s._id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{s.name}</td>
                  <td className="p-2">{s.batchName || '-'}</td>
                  <td className="p-2">{s.phone}</td>
                  <td className="p-2">{s.aadharNumber}</td>

                  <td className="p-2">
                    <span
                      onClick={() => showFeeHistory(s)}
                      className={`px-2 py-1 text-xs rounded cursor-pointer ${
                        last.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {last.month} - {last.status}
                    </span>
                  </td>

                  <td className="p-2 flex gap-2">
                    <button className="text-blue-600 text-xs" onClick={() => showFeeHistory(s)}>
                      Fee History
                    </button>
                    <button className="text-red-600 text-xs" onClick={() => handleDelete(s._id, s.name)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
      </div>

      <p className="mt-3 text-sm text-gray-600">
        Showing {filteredStudents.length} of {students.length} students
      </p>
    </div>
  );
};

export default Students;
