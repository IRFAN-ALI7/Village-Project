import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Heart,
  Home,
  Trash2,
  Briefcase,
  Users,
  Zap,
  ShieldCheck,
  GraduationCap,
  Wheat,
  IndianRupee,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Calendar,
  X,
  FileText,
} from 'lucide-react';

import API_URL from '../../config/api';

export default function SchemesContent() {
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');

      const res = await fetch(`${API_URL}/user/schemes`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch schemes');
      }

      setSchemes(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error('Fetch schemes error:', err);
      setError(err.message || 'Failed to load schemes');
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      Agriculture: Wheat,
      Healthcare: Heart,
      Housing: Home,
      Energy: Zap,
      Sanitation: Trash2,
      'Social Security': Users,
      Business: Briefcase,
      Education: GraduationCap,
      Employment: TrendingUp,
      Insurance: ShieldCheck,
      Finance: IndianRupee,
      Health: Heart,
      'Social Welfare': Users,
      'Women Empowerment': Users,
    };

    return iconMap[category] || TrendingUp;
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      Agriculture: 'from-green-500 to-green-600',
      Healthcare: 'from-red-500 to-red-600',
      Housing: 'from-orange-500 to-orange-600',
      Energy: 'from-cyan-500 to-cyan-600',
      Sanitation: 'from-teal-500 to-teal-600',
      'Social Security': 'from-purple-500 to-purple-600',
      Business: 'from-yellow-500 to-yellow-600',
      Education: 'from-indigo-500 to-indigo-600',
      Employment: 'from-emerald-500 to-emerald-600',
      Insurance: 'from-lime-500 to-lime-600',
      Finance: 'from-rose-500 to-rose-600',
      Health: 'from-red-500 to-red-600',
      'Social Welfare': 'from-purple-500 to-purple-600',
      'Women Empowerment': 'from-pink-500 to-pink-600',
    };

    return colorMap[category] || 'from-blue-500 to-blue-600';
  };

  const formatDate = (date) => {
    if (!date) return '';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const applicationSteps = [
    {
      step: 1,
      title: 'Browse Schemes',
      description: 'Explore available government schemes',
      icon: TrendingUp,
    },
    {
      step: 2,
      title: 'Check Eligibility',
      description: 'Verify if you meet the eligibility criteria',
      icon: CheckCircle,
    },
    {
      step: 3,
      title: 'Visit Official Website',
      description: 'Click Apply to visit the official scheme portal',
      icon: ExternalLink,
    },
    {
      step: 4,
      title: 'Fill Application',
      description: 'Complete the application form on official website',
      icon: CheckCircle,
    },
    {
      step: 5,
      title: 'Submit & Track',
      description: 'Submit application and track status',
      icon: CheckCircle,
    },
  ];

  if (loading) {
    return (
      <div className="w-full">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
            <div className="animate-spin h-10 w-10 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">
              Loading government schemes...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="p-6 max-w-7xl mx-auto">

        {/* HOW TO APPLY */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 mb-10 shadow-xl border border-white/50">
          <h2 className="text-2xl font-bold text-gray-800 mb-7 text-center">
            How to Apply for Schemes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            {applicationSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.step} className="relative">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 text-center border-2 border-blue-200 hover:border-blue-400 hover:shadow-md transition-all h-full">

                    <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl shadow-lg">
                      {step.step}
                    </div>

                    <Icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />

                    <h3 className="font-bold text-gray-800 mb-2">
                      {step.title}
                    </h3>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {index < applicationSteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <ArrowRight className="h-6 w-6 text-blue-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* TITLE */}
        <div className="mb-7">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Available Government Schemes
          </h2>

          <p className="text-gray-600">
            Explore and apply for various village development schemes
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5 mb-6">
            <p className="font-semibold mb-1">
              Unable to load schemes
            </p>

            <p className="text-sm">
              {error}
            </p>

            <button
              onClick={fetchSchemes}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!error && schemes.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <TrendingUp className="h-14 w-14 text-gray-300 mx-auto mb-4" />

            <h3 className="text-xl font-bold text-gray-700 mb-2">
              No Schemes Available
            </h3>

            <p className="text-gray-500">
              There are currently no active government schemes available
              for your Panchayat.
            </p>
          </div>
        )}

        {/* SCHEME CARDS */}
        {schemes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            {schemes.map((scheme) => {
              const Icon = getCategoryIcon(scheme.category);
              const color = getCategoryColor(scheme.category);

              return (
                <div
                  key={scheme._id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 flex flex-col"
                >

                  {/* CARD IMAGE */}
                  <div className="relative h-52 bg-gray-100">

                    {scheme.image ? (
                      <img
                        src={scheme.image}
                        alt={scheme.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full bg-gradient-to-br ${color} flex items-center justify-center`}
                      >
                        <Icon className="h-20 w-20 text-white/80" />
                      </div>
                    )}

                    {/* CATEGORY BAR */}
                    <div
                      className={`absolute top-0 left-0 right-0 bg-gradient-to-r ${color} px-4 py-3`}
                    >
                      <div className="flex items-center justify-between text-white">

                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className="h-5 w-5 flex-shrink-0" />

                          <span className="text-xs font-semibold truncate">
                            {scheme.category || 'General'}
                          </span>
                        </div>

                        <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-bold">
                          Active
                        </span>

                      </div>
                    </div>
                  </div>

                  {/* CARD CONTENT */}
                  <div className="p-5 flex flex-col flex-1">

                    <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-1">
                      {scheme.name}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {scheme.description || 'No description available.'}
                    </p>

                    <div className="mb-5">
                      <p className="text-xs font-bold text-gray-500 mb-2">
                        ELIGIBILITY
                      </p>

                      <p className="text-sm text-gray-700 line-clamp-2">
                        {scheme.eligibility ||
                          'Please check the official website for eligibility details.'}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedScheme(scheme)}
                      className={`w-full mt-auto bg-gradient-to-r ${color} text-white py-3 px-4 rounded-lg hover:opacity-90 transition-all font-semibold shadow-md`}
                    >
                      View Details
                    </button>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DETAILS MODAL */}
      {selectedScheme && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedScheme(null)}
        >

          <div
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}
            <div
              className={`bg-gradient-to-r ${getCategoryColor(
                selectedScheme.category
              )} text-white px-6 py-5 flex-shrink-0`}
            >
              <div className="flex items-start justify-between gap-4">

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {(() => {
                      const Icon = getCategoryIcon(selectedScheme.category);

                      return <Icon className="h-5 w-5" />;
                    })()}

                    <span className="text-sm font-medium text-white/90">
                      {selectedScheme.category || 'General'}
                    </span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                    {selectedScheme.name}
                  </h2>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">

                  <span className="text-xs px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-bold">
                    Active
                  </span>

                  <button
                    onClick={() => setSelectedScheme(null)}
                    className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>

                </div>
              </div>
            </div>

            {/* MODAL BODY */}
            <div className="overflow-y-auto flex-1">

              {/* IMAGE */}
              {selectedScheme.image && (
                <div className="bg-gray-50 border-b border-gray-100 p-5">
                  <div className="w-full h-64 md:h-72 bg-white rounded-xl overflow-hidden flex items-center justify-center border border-gray-200">
                    <img
                      src={selectedScheme.image}
                      alt={selectedScheme.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              <div className="p-6 md:p-8">

                {/* DESCRIPTION */}
                <div className="mb-7">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">
                    Description
                  </h3>

                  <p className="text-gray-700 leading-relaxed">
                    {selectedScheme.description ||
                      'No description available.'}
                  </p>
                </div>

                {/* ELIGIBILITY */}
                <div className="mb-7">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">
                    Eligibility
                  </h3>

                  <p className="text-gray-700 leading-relaxed">
                    {selectedScheme.eligibility ||
                      'Please check the official website for eligibility details.'}
                  </p>
                </div>

                {/* DOCUMENTS */}
                {selectedScheme.documents && (
                  <div className="mb-7">
                    <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Required Documents
                    </h3>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <p className="text-gray-700 leading-relaxed">
                        {selectedScheme.documents}
                      </p>
                    </div>
                  </div>
                )}

                {/* DATES */}
                {(selectedScheme.startDate ||
                  selectedScheme.endDate) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">

                    {selectedScheme.startDate && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-5 w-5 text-blue-600" />

                          <span className="text-sm font-semibold text-gray-600">
                            Start Date
                          </span>
                        </div>

                        <p className="text-base font-bold text-gray-800">
                          {formatDate(selectedScheme.startDate)}
                        </p>
                      </div>
                    )}

                    {selectedScheme.endDate && (
                      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-5 w-5 text-orange-600" />

                          <span className="text-sm font-semibold text-gray-600">
                            End Date
                          </span>
                        </div>

                        <p className="text-base font-bold text-gray-800">
                          {formatDate(selectedScheme.endDate)}
                        </p>
                      </div>
                    )}

                  </div>
                )}

                {/* BUTTONS */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">

                  {selectedScheme.officialLink && (
                    <button
                      onClick={() =>
                        window.open(
                          selectedScheme.officialLink,
                          '_blank',
                          'noopener,noreferrer'
                        )
                      }
                      className={`flex-1 bg-gradient-to-r ${getCategoryColor(
                        selectedScheme.category
                      )} text-white py-3.5 px-5 rounded-xl hover:opacity-90 transition-all font-semibold shadow-md flex items-center justify-center gap-2`}
                    >
                      <span>Apply on Official Website</span>
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedScheme(null)}
                    className="sm:w-32 bg-gray-100 text-gray-700 py-3.5 px-5 rounded-xl hover:bg-gray-200 transition-all font-semibold border border-gray-200"
                  >
                    Close
                  </button>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}