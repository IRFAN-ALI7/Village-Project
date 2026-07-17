import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ExternalLink } from 'lucide-react';

export default function DashboardFooter() {
  return (
    <footer className="bg-gradient-to-r from-slate-800 via-gray-800 to-slate-800 text-white border-t-4 border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">Smart Village</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Empowering rural India through digital transformation. Access government services, schemes, and file complaints online.
            </p>
            <div className="flex space-x-2">
              <a href="#" className="bg-teal-600 p-2 rounded-lg hover:bg-teal-500 transition-all shadow-md">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="bg-teal-600 p-2 rounded-lg hover:bg-teal-500 transition-all shadow-md">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="bg-teal-600 p-2 rounded-lg hover:bg-teal-500 transition-all shadow-md">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="bg-teal-600 p-2 rounded-lg hover:bg-teal-500 transition-all shadow-md">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1">
                  <ExternalLink className="h-3 w-3" />
                  <span>Government Schemes</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1">
                  <ExternalLink className="h-3 w-3" />
                  <span>Online Services</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1">
                  <ExternalLink className="h-3 w-3" />
                  <span>Grievance Portal</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1">
                  <ExternalLink className="h-3 w-3" />
                  <span>Certificates</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1">
                  <ExternalLink className="h-3 w-3" />
                  <span>Village News</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Important Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Important Info</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1">
                  <ExternalLink className="h-3 w-3" />
                  <span>Panchayat Office</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1">
                  <ExternalLink className="h-3 w-3" />
                  <span>Emergency Contacts</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1">
                  <ExternalLink className="h-3 w-3" />
                  <span>Healthcare Centers</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1">
                  <ExternalLink className="h-3 w-3" />
                  <span>Education & Schools</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1">
                  <ExternalLink className="h-3 w-3" />
                  <span>Help & Support</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">
                  Gram Panchayat Office,<br />
                  Village Road, District HQ
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-teal-400 flex-shrink-0" />
                <span className="text-gray-300">1800-XXX-XXXX (Toll Free)</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-teal-400 flex-shrink-0" />
                <span className="text-gray-300">support@smartvillage.gov.in</span>
              </li>
            </ul>
            <div className="mt-4 bg-teal-600/30 rounded-lg p-3">
              <p className="text-xs text-gray-300">
                <strong>Office Hours:</strong><br />
                Mon - Sat: 10:00 AM - 5:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-300">
            <p>© {new Date().getFullYear()} Smart Village - Digital Service Portal. All rights reserved.</p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <span>|</span>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <span>|</span>
              <a href="#" className="hover:text-white transition-colors">Accessibility</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}