import { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  Home, 
  FileText, 
  Gift, 
  Megaphone, 
  Award,
  Users,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  ChevronRight,
  Smartphone,
  Globe,
  TrendingUp
} from 'lucide-react';
import villageImg from "../assets/villageImg.png";

export default function HomePage() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: FileText,
      title: 'Online Complaints',
      description: 'Register and track your complaints easily with 21+ categories',
      color: 'from-blue-500 to-blue-600',
      link: '/complaint',
    },
    {
      icon: Gift,
      title: 'Government Schemes',
      description: 'Access all government schemes and apply online',
      color: 'from-green-500 to-green-600',
      link: '/schemes',
    },
    {
      icon: Award,
      title: 'Certificates',
      description: 'Apply for birth, death, income, and caste certificates',
      color: 'from-purple-500 to-purple-600',
      link: '/certificates',
    },
    {
      icon: Megaphone,
      title: 'Notice Board',
      description: 'Stay updated with latest village announcements',
      color: 'from-orange-500 to-orange-600',
      link: '/notices',
    },
    {
      icon: Users,
      title: 'User Management',
      description: 'Secure and easy registration for all villagers',
      color: 'from-pink-500 to-pink-600',
      link: '/register',
    },
    {
      icon: Shield,
      title: 'Secure Portal',
      description: 'Your data is safe with our encrypted platform',
      color: 'from-indigo-500 to-indigo-600',
      link: '/login',
    },
  ];

  const stats = [
    { number: '500+', label: 'Registered Users', icon: Users },
    { number: '1200+', label: 'Complaints Resolved', icon: CheckCircle },
    { number: '50+', label: 'Active Schemes', icon: Gift },
    { number: '24/7', label: 'Support Available', icon: Clock },
  ];

  const services = [
    { name: 'Birth Certificate', icon: Award, link: '/certificates' },
    { name: 'Death Certificate', icon: Award, link: '/certificates' },
    { name: 'Income Certificate', icon: Award, link: '/certificates' },
    { name: 'Caste Certificate', icon: Award, link: '/certificates' },
    { name: 'Water Supply Issues', icon: FileText, link: '/complaint' },
    { name: 'Road Maintenance', icon: FileText, link: '/complaint' },
    { name: 'Street Light', icon: FileText, link: '/complaint' },
    { name: 'Pension Schemes', icon: Gift, link: '/schemes' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-2 rounded-lg">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Smart Village</h1>
                <p className="text-xs text-gray-600">Digital Gram Panchayat</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-green-600 font-semibold transition-colors">
                Home
              </a>
              <a href="#features" className="text-gray-700 hover:text-green-600 font-semibold transition-colors">
                Features
              </a>
              <a href="#services" className="text-gray-700 hover:text-green-600 font-semibold transition-colors">
                Services
              </a>
              <a href="#about" className="text-gray-700 hover:text-green-600 font-semibold transition-colors">
                About
              </a>
              <a href="#contact" className="text-gray-700 hover:text-green-600 font-semibold transition-colors">
                Contact
              </a>
            </div>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => navigate('/register')}
                className="px-5 py-2 text-green-600 border-2 border-green-600 rounded-lg hover:bg-green-50 transition-all font-semibold"
              >
                Register
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/admin/login')}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                Admin
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-3">
              <a href="#home" className="block text-gray-700 hover:text-green-600 font-semibold py-2">
                Home
              </a>
              <a href="#features" className="block text-gray-700 hover:text-green-600 font-semibold py-2">
                Features
              </a>
              <a href="#services" className="block text-gray-700 hover:text-green-600 font-semibold py-2">
                Services
              </a>
              <a href="#about" className="block text-gray-700 hover:text-green-600 font-semibold py-2">
                About
              </a>
              <a href="#contact" className="block text-gray-700 hover:text-green-600 font-semibold py-2">
                Contact
              </a>
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => navigate('/register')}
                  className="w-full px-5 py-2 text-green-600 border-2 border-green-600 rounded-lg hover:bg-green-50 transition-all font-semibold"
                >
                  Register
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-5 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/admin/login')}
                  className="w-full px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  Admin
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <p className="text-sm font-semibold">🇮🇳 Digital India Initiative</p>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Welcome to<br />
                <span className="text-yellow-300">Smart Village</span><br />
                Digital Portal
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                Empowering rural communities through digital transformation. Access government services, file complaints, and stay connected with your village administration.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 bg-white text-green-600 rounded-lg hover:shadow-2xl transition-all font-bold text-lg flex items-center space-x-2"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white rounded-lg hover:bg-white/20 transition-all font-bold text-lg"
                >
                  Login Now
                </button>
              </div>
              <div className="flex items-center space-x-8 pt-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-6 w-6 text-green-300" />
                  <span className="font-semibold">100% Secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-6 w-6 text-green-300" />
                  <span className="font-semibold">24/7 Available</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <img
                  src={villageImg}
                  alt="Digital Village"
                  className="rounded-2xl shadow-2xl w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-white py-16 -mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all border border-gray-100">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">{stat.number}</h3>
                  <p className="text-gray-600 font-semibold">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-green-100 px-4 py-2 rounded-full mb-4">
              <p className="text-green-700 font-bold text-sm">OUR FEATURES</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Why Choose Smart Village?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive digital platform designed to make village administration transparent, efficient, and accessible to all.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all hover:transform hover:-translate-y-2 border border-gray-100"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl mb-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  <button 
                    onClick={() => navigate(feature.link)}
                    className="mt-4 text-green-600 font-semibold flex items-center space-x-1 hover:space-x-2 transition-all"
                  >
                    <span>Learn more</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-100 px-4 py-2 rounded-full mb-4">
              <p className="text-blue-700 font-bold text-sm">OUR SERVICES</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Popular Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access all essential village services from the comfort of your home.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  onClick={() => navigate(service.link)}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 text-center hover:shadow-lg transition-all border-2 border-gray-100 hover:border-green-500 cursor-pointer"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg mb-3">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800">{service.name}</h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Get started in just three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl font-bold text-green-600">1</span>
              </div>
              <div className="flex items-center space-x-3 mb-4">
                <Smartphone className="h-8 w-8 text-yellow-300" />
                <h3 className="text-2xl font-bold">Register</h3>
              </div>
              <p className="text-white/90 leading-relaxed">
                Create your account with basic details and verify your identity
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl font-bold text-blue-600">2</span>
              </div>
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="h-8 w-8 text-yellow-300" />
                <h3 className="text-2xl font-bold">Access Services</h3>
              </div>
              <p className="text-white/90 leading-relaxed">
                Browse and access all available village services and schemes
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl font-bold text-purple-600">3</span>
              </div>
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="h-8 w-8 text-yellow-300" />
                <h3 className="text-2xl font-bold">Track Progress</h3>
              </div>
              <p className="text-white/90 leading-relaxed">
                Monitor your applications and complaints in real-time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of villagers who are already using our platform to access government services.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-green-600 rounded-lg hover:shadow-2xl transition-all font-bold text-lg"
            >
              Register Now
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white rounded-lg hover:bg-white/20 transition-all font-bold text-lg"
            >
              Login
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* About */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-green-600 to-blue-600 p-2 rounded-lg">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Smart Village</h3>
                  <p className="text-xs text-gray-400">Digital Portal</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Empowering rural India through digital transformation and making government services accessible to all.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#home" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#services" className="text-gray-400 hover:text-white transition-colors">Services</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-bold mb-4">Services</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Complaints</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Certificates</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Schemes</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Notices</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-bold mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-green-500" />
                  <span className="text-gray-400 text-sm">Rampur, Uttar Pradesh</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-green-500" />
                  <span className="text-gray-400 text-sm">+91 98765 43210</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-green-500" />
                  <span className="text-gray-400 text-sm">info@smartvillage.in</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2026 Smart Village. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}