import { useState , useEffect} from 'react';
import {
  TrendingUp,
  Heart,
  Home,
  Flame,
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
  LogIn,
  UserPlus,
  ExternalLink,
  Calendar
} from 'lucide-react';
import API_URL from '../../config/api';

export default function SchemesContent() {
  const [selectedScheme, setSelectedScheme] = useState(null);
    const [schemes, setSchemes] = useState([]);
      
     useEffect(()=> {
      fetchSchemes();
     }, []);
  
     const fetchSchemes = async()=> {
      try{
        const res = await fetch(`${API_URL}/schemes/all`, {
          method: 'GET', 
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        const data = await res.json();
        setSchemes(data.data);
      }catch(err){
        console.log(err);
      }
     };

  // Icon mapping for categories
  const getCategoryIcon = (category) => {
    const iconMap = {
      'Agriculture': Wheat,
      'Healthcare': Heart,
      'Housing': Home,
      'Energy': Zap,
      'Sanitation': Trash2,
      'Social Security': Users,
      'Business': Briefcase,
      'Education': GraduationCap,
      'Employment': TrendingUp,
      'Insurance': ShieldCheck,
      'Finance': IndianRupee,
      'Health': Heart,
      'Social Welfare': Users,
      'Women Empowerment': Users,
    };
    return iconMap[category] || TrendingUp;
  };

  // Color mapping for categories
  const getCategoryColor = (category) => {
    const colorMap = {
      'Agriculture': 'from-green-500 to-green-600',
      'Healthcare': 'from-red-500 to-red-600',
      'Housing': 'from-orange-500 to-orange-600',
      'Energy': 'from-cyan-500 to-cyan-600',
      'Sanitation': 'from-teal-500 to-teal-600',
      'Social Security': 'from-purple-500 to-purple-600',
      'Business': 'from-yellow-500 to-yellow-600',
      'Education': 'from-indigo-500 to-indigo-600',
      'Employment': 'from-emerald-500 to-emerald-600',
      'Insurance': 'from-lime-500 to-lime-600',
      'Finance': 'from-rose-500 to-rose-600',
      'Health': 'from-red-500 to-red-600',
      'Social Welfare': 'from-purple-500 to-purple-600',
      'Women Empowerment': 'from-pink-500 to-pink-600',
    };
    return colorMap[category] || 'from-blue-500 to-blue-600';
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
      icon: UserPlus,
    },
    {
      step: 5,
      title: 'Submit & Track',
      description: 'Submit application and track status',
      icon: CheckCircle,
    },
  ];

  return (
    <div className="w-full">
      {/* Main Content Area */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* How to Apply Section */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 mb-8 shadow-xl border border-white/50">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            How to Apply for Schemes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {applicationSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="relative">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center border-2 border-blue-200 hover:border-blue-400 transition-all">
                    <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl shadow-lg">
                      {step.step}
                    </div>
                    <Icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-800 mb-2">{step.title}</h3>
                    <p className="text-xs text-gray-600">{step.description}</p>
                  </div>
                  {index < applicationSteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2">
                      <ArrowRight className="h-6 w-6 text-blue-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Schemes Grid */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Available Government Schemes</h2>
          <p className="text-gray-600 mb-6">Explore and apply for various village development schemes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {schemes.map((scheme) => {
            const Icon = getCategoryIcon(scheme.category);
            const color = getCategoryColor(scheme.category);
            const statusColor = scheme.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';

            return (
              <div
                key={scheme._id}
                className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className="relative h-48 overflow-hidden">
                  {scheme.image && (
                    <img
                      src={scheme.image}
                      alt={scheme.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className={`absolute top-0 left-0 right-0 bg-gradient-to-r ${color} p-3`}>
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-5 w-5" />
                        <span className="text-xs font-semibold">{scheme.category}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColor} font-semibold capitalize`}>
                        {scheme.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{scheme.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{scheme.description}</p>

                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">ELIGIBILITY</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{scheme.eligibility}</p>
                  </div>

                  <div className="flex space-x-2 mt-auto">
                    <button
                      onClick={() => setSelectedScheme(scheme)}
                      className={`flex-1 bg-gradient-to-r ${color} text-white py-3 px-4 rounded-lg hover:opacity-90 transition-all font-semibold shadow-lg`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scheme Details Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className={`bg-gradient-to-r ${getCategoryColor(selectedScheme.category)} text-white p-6 rounded-t-2xl`}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">{selectedScheme.name}</h2>
                <span className={`text-xs px-3 py-1 rounded-full ${selectedScheme.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} font-semibold capitalize`}>
                  {selectedScheme.status}
                </span>
              </div>
              <p className="text-white/90">{selectedScheme.category}</p>
            </div>
            <div className="p-6">
              {selectedScheme.image && (
                <img
                  src={selectedScheme.image}
                  alt={selectedScheme.name}
                  className="w-full h-64 object-cover rounded-xl mb-6"
                />
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Description</h3>
                  <p className="text-gray-700">{selectedScheme.description}</p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Eligibility</h3>
                  <p className="text-gray-700">{selectedScheme.eligibility}</p>
                </div>

                {selectedScheme.documents && (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">Required Documents</h3>
                    <p className="text-gray-700">{selectedScheme.documents}</p>
                  </div>
                )}

                {(selectedScheme.startDate || selectedScheme.endDate) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedScheme.startDate && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                          Start Date
                        </h3>
                        <p className="text-gray-700">{new Date(selectedScheme.startDate).toLocaleDateString('en-IN')}</p>
                      </div>
                    )}
                    {selectedScheme.endDate && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                          End Date
                        </h3>
                        <p className="text-gray-700">{new Date(selectedScheme.endDate).toLocaleDateString('en-IN')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => window.open(selectedScheme.officialLink, '_blank', 'noopener,noreferrer')}
                  className={`flex-1 bg-gradient-to-r ${getCategoryColor(selectedScheme.category)} text-white py-3 px-4 rounded-lg hover:opacity-90 transition-all font-semibold shadow-lg flex items-center justify-center space-x-2`}
                >
                  <span>Apply on Official Website</span>
                  <ExternalLink className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedScheme(null)}
                  className="bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
