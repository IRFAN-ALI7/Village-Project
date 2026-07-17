import { useState } from 'react';
import { FileText, MapPin, Upload, AlertCircle, X } from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import API_URL from '../../config/api';

export default function ComplaintForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    complaintType: '',
    otherComplaint: '',
    description: '',
    wardNo: '',
    landmark: '',
    priority: 'medium',
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const complaintTypes = [
    { value: 'street-light', label: '💡 Street Light Problem' },
    { value: 'water-supply', label: '💧 Water Supply Issue' },
    { value: 'road-damage', label: '🛣️ Road Damage/Potholes' },
    { value: 'electricity', label: '⚡ Electricity Problem' },
    { value: 'drainage', label: '🚰 Drainage/Sewage Issue' },
    { value: 'garbage', label: '🗑️ Garbage Collection' },
    { value: 'public-toilet', label: '🚻 Public Toilet Issue' },
    { value: 'government-service', label: '🏛️ Government Service Issue' },
    { value: 'health-center', label: '🏥 Health Center/Hospital' },
    { value: 'school-education', label: '🎓 School/Education' },
    { value: 'agriculture', label: '🌾 Agriculture Related' },
    { value: 'animal-issue', label: '🐄 Stray Animals' },
    { value: 'public-safety', label: '👮 Public Safety/Security' },
    { value: 'tree-cutting', label: '🌳 Tree Cutting/Environment' },
    { value: 'noise-pollution', label: '🔊 Noise Pollution' },
    { value: 'construction', label: '🏗️ Illegal Construction' },
    { value: 'ration-shop', label: '🏪 Ration Shop/PDS' },
    { value: 'pension', label: '💰 Pension Related' },
    { value: 'birth-death-cert', label: '📄 Birth/Death Certificate' },
    { value: 'land-records', label: '📋 Land Records' },
    { value: 'other', label: '📝 Other (Please Specify)' },
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    
    // Check max 5 images
    if (files.length + selectedFiles.length > 5) {
      alert('Maximum 5 images allowed!');
      return;
    }

    // Check file size (2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024; // 2MB
    const invalidFiles = files.filter(file => file.size > maxSize);
    
    if (invalidFiles.length > 0) {
      alert(`Some files exceed 2MB limit:\n${invalidFiles.map(f => f.name).join('\n')}`);
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);
    
    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = async(e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("complaintType", formData.complaintType);
    form.append("otherComplaint", formData.otherComplaint);
    form.append("priority", formData.priority);
    form.append("description", formData.description);
    form.append("wardNo",formData.wardNo);
    form.append("landmark", formData.landmark);

    //photos add
    selectedFiles.forEach((file)=> {
      form.append("photos", file);
    });
    try{
          const token = localStorage.getItem("token");
     const res = await fetch(`${API_URL}/complaints`, {
      method: "post",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: form
     });
     const data = await res.json();

     if(res.ok){
         console.log(data);
    alert(`Complaint submitted successfully! ID: ${data.complaintId}`);
    navigate("/dashboard");
    // Reset form
    setFormData({
      complaintType: '',
      otherComplaint: '',
      description: '',
      wardNo: '',
      landmark: '',
      priority: 'medium',
    });
    setSelectedFiles([]);
    setPreviewUrls([]);
     }else{
      alert(data.message);
     }
    } catch(error){
      console.log(error);
      alert("Error submitting complaint");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        {/* Header Section - Small and Clean */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-4 md:p-5">
          <div className="flex items-center justify-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <FileText className="h-6 w-6" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold">
              Register Your Complaint
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {/* Complaint Type Section */}
          <div className="space-y-5">
            <div className="flex items-center space-x-3 pb-3 border-b-2 border-teal-200">
              <div className="bg-teal-100 p-2 rounded-lg">
                <AlertCircle className="h-5 w-5 text-teal-700" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Complaint Details</h2>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div>
                <label htmlFor="complaintType" className="block text-sm font-semibold text-gray-700 mb-2">
                  Type of Complaint <span className="text-red-600">*</span>
                </label>
                <select
                  id="complaintType"
                  name="complaintType"
                  required
                  value={formData.complaintType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                >
                  <option value="">-- Select Complaint Type --</option>
                  {complaintTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {formData.complaintType === 'other' && (
                <div>
                  <label htmlFor="otherComplaint" className="block text-sm font-semibold text-gray-700 mb-2">
                    Please Specify <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="otherComplaint"
                    name="otherComplaint"
                    required
                    value={formData.otherComplaint}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Please specify your complaint"
                  />
                </div>
              )}

              <div>
                <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2">
                  Priority Level <span className="text-red-600">*</span>
                </label>
                <select
                  id="priority"
                  name="priority"
                  required
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                >
                  {priorityLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Detailed Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                  placeholder="Please provide detailed information about your complaint..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Please be as specific as possible. Include dates, times, and any other relevant information.
                </p>
              </div>
            </div>
          </div>

          {/* Location Information Section */}
          <div className="space-y-5">
            <div className="flex items-center space-x-3 pb-3 border-b-2 border-blue-200">
              <div className="bg-blue-100 p-2 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-700" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Location Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="wardNo" className="block text-sm font-semibold text-gray-700 mb-2">
                  Ward Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="wardNo"
                  name="wardNo"
                  required
                  value={formData.wardNo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="Enter ward number"
                />
              </div>

              <div>
                <label htmlFor="landmark" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nearby Landmark <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="landmark"
                  name="landmark"
                  required
                  value={formData.landmark}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="e.g., Near Post Office, Ram Mandir, etc."
                />
              </div>
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className="space-y-5">
            <div className="flex items-center space-x-3 pb-3 border-b-2 border-blue-200">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Upload className="h-5 w-5 text-blue-700" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Upload Photos (Optional)</h2>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Upload Related Photos (Max 5 images, 2MB each)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-all bg-gray-50">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mb-4">PNG, JPG up to 2MB each (Max 5 images)</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-indigo-700 transition-all"
                >
                  Choose Files
                </label>
              </div>

              {/* Image Previews */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="mt-1">
                        <p className="text-xs text-gray-600 truncate">
                          {selectedFiles[index]?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(selectedFiles[index]?.size || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-1">Important Information</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• You will receive a complaint ID via SMS after submission</li>
                  <li>• Expected resolution time: 3-7 working days</li>
                  <li>• For urgent issues, please contact: 1800-XXX-XXXX</li>
                  <li>• Track your complaint status in "My Complaints" section</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 px-6 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Submit Complaint
            </button>
            <p className="text-center text-sm text-gray-500 mt-4">
              By submitting, you agree to our <a href="#" className="text-indigo-600 font-semibold hover:text-indigo-700">Terms & Conditions</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}