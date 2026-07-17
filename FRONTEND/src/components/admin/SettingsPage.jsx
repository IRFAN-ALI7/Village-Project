import { Settings, Building, Users, Bell, Shield, Database, X } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLoginHistoryModal, setShowLoginHistoryModal] = useState(false);
  
  const [panchayatData, setPanchayatData] = useState({
    name: 'Rampur Gram Panchayat',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    contact: '9876543210',
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const loginHistory = [
    { date: '2026-04-02 10:30 AM', ip: '192.168.1.1', device: 'Windows PC', status: 'success' },
    { date: '2026-04-01 03:15 PM', ip: '192.168.1.1', device: 'Windows PC', status: 'success' },
    { date: '2026-03-31 09:45 AM', ip: '192.168.1.2', device: 'Android Phone', status: 'success' },
    { date: '2026-03-30 11:20 AM', ip: '192.168.1.1', device: 'Windows PC', status: 'success' },
  ];

  const handleSaveSettings = () => {
    alert('Settings saved successfully!');
  };

  const handleChangePassword = () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      alert('Please fill all fields!');
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      alert('New passwords do not match!');
      return;
    }
    alert('Password changed successfully!');
    setShowPasswordModal(false);
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  const handleEnableTwoFactor = () => {
    alert('Two-Factor Authentication enabled successfully!');
    setShowTwoFactorModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>

        <div className="space-y-6">
          {/* Panchayat Settings */}
          <div className="border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Building className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-bold text-gray-800">Panchayat Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Panchayat Name</label>
                <input type="text" value={panchayatData.name} onChange={(e) => setPanchayatData({...panchayatData, name: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">District</label>
                <input type="text" value={panchayatData.district} onChange={(e) => setPanchayatData({...panchayatData, district: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                <input type="text" value={panchayatData.state} onChange={(e) => setPanchayatData({...panchayatData, state: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                <input type="text" value={panchayatData.contact} onChange={(e) => setPanchayatData({...panchayatData, contact: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg" />
              </div>
            </div>
          </div>

          {/* User Settings */}
          <div className="border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-800">User Management Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">Auto-approve new registrations</p>
                  <p className="text-sm text-gray-600">New users will be automatically verified</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">Allow user profile editing</p>
                  <p className="text-sm text-gray-600">Users can edit their own profiles</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="h-6 w-6 text-orange-600" />
              <h3 className="text-xl font-bold text-gray-800">Notification Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">Email notifications</p>
                  <p className="text-sm text-gray-600">Send email for important updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">SMS notifications</p>
                  <p className="text-sm text-gray-600">Send SMS for urgent matters</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-6 w-6 text-red-600" />
              <h3 className="text-xl font-bold text-gray-800">Security Settings</h3>
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => setShowTwoFactorModal(true)}
                className="w-full bg-blue-50 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-100 transition-all font-semibold text-left"
              >
                Enable Two-Factor Authentication
              </button>
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="w-full bg-orange-50 text-orange-600 px-6 py-3 rounded-lg hover:bg-orange-100 transition-all font-semibold text-left"
              >
                Change Admin Password
              </button>
              <button 
                onClick={() => setShowLoginHistoryModal(true)}
                className="w-full bg-red-50 text-red-600 px-6 py-3 rounded-lg hover:bg-red-100 transition-all font-semibold text-left"
              >
                View Login History
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-3">
            <button className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition-all font-semibold">
              Cancel
            </button>
            <button 
              onClick={handleSaveSettings}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication Modal */}
      {showTwoFactorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Enable Two-Factor Authentication</h2>
                <button onClick={() => setShowTwoFactorModal(false)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
                <p className="text-blue-800 font-semibold mb-2">Enhanced Security</p>
                <p className="text-blue-700 text-sm">
                  Two-factor authentication adds an extra layer of security to your account by requiring a verification code.
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number for OTP</label>
                  <input type="tel" placeholder="Enter phone number" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg" />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button onClick={handleEnableTwoFactor} className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold">
                  Enable
                </button>
                <button onClick={() => setShowTwoFactorModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Change Password</h2>
                <button onClick={() => setShowPasswordModal(false)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                <input 
                  type="password" 
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                  placeholder="Enter current password" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <input 
                  type="password" 
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                  placeholder="Enter new password" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                  placeholder="Confirm new password" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500" 
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button onClick={handleChangePassword} className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 font-semibold">
                  Change Password
                </button>
                <button onClick={() => setShowPasswordModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login History Modal */}
      {showLoginHistoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl sticky top-0">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Login History</h2>
                <button onClick={() => setShowLoginHistoryModal(false)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {loginHistory.map((login, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-800">{login.date}</p>
                        <p className="text-sm text-gray-600 mt-1">IP: {login.ip} • Device: {login.device}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                        {login.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <button onClick={() => setShowLoginHistoryModal(false)} className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 font-semibold">
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