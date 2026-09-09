import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { jwtDecode } from 'jwt-decode';
import {
  Home,
  FileText,
  Gift,
  Megaphone,
  Award,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Send,
  Bot,
  User,
  Phone,
  Mail,
  ChevronRight,
  Sparkles,
  Layers,
  HeadphonesIcon,
  LayoutDashboard,
} from 'lucide-react';

import homePageImg from "../assets/homePageImg.jpeg";

/* ── AI Chat ── */

const BOT_REPLIES = [
  {
    keywords: ['complaint', 'shikayat', 'problem', 'issue', 'report'],
    reply:
      'To file a complaint, register or login and go to "Online Complaint". You can track status from "My Complaints".',
  },
  {
    keywords: ['scheme', 'yojana', 'benefit', 'pension', 'subsidy'],
    reply:
      'All government schemes are under "Government Schemes". Filter by category and apply directly online after logging in.',
  },
  {
    keywords: ['certificate', 'birth', 'death', 'income', 'caste'],
    reply:
      'Apply for certificates (Birth, Death, Income, Caste) from the "Certificates" section. Upload documents and track your application.',
  },
  {
    keywords: ['notice', 'announcement', 'news', 'update'],
    reply:
      'All village announcements and official notices are on the "Notice Board". No login required to view them.',
  },
  {
    keywords: ['register', 'signup', 'account', 'new user'],
    reply:
      'Click "Register" in the navbar. Fill your name, Aadhaar, mobile, and panchayat details. Verification is instant.',
  },
  {
    keywords: ['login', 'password', 'forgot', 'sign in'],
    reply:
      'Click "Login" in the menu. Use your registered mobile and password. Use the reset link if you forgot your password.',
  },
  {
    keywords: ['admin', 'officer', 'panchayat'],
    reply:
      'For admin access, click "Admin" in the navbar. Credentials are provided by the Super Administrator.',
  },
  {
    keywords: ['jharkhand', 'district', 'block', 'gram'],
    reply:
      'This portal serves all Gram Panchayats of Jharkhand. Select your district and panchayat during registration.',
  },
];

function getBotReply(msg) {
  const l = msg.toLowerCase();

  for (const { keywords, reply } of BOT_REPLIES) {
    if (keywords.some((k) => l.includes(k))) {
      return reply;
    }
  }

  return "I'm here to help! Ask me about complaints, certificates, schemes, notices, registration, or login.";
}

function HelpChat({ onClose }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [msgs]);

  const send = () => {
    const text = input.trim();

    if (!text) return;

    setMsgs((p) => [
      ...p,
      {
        role: 'user',
        text,
      },
    ]);

    setInput('');

    setTimeout(() => {
      setMsgs((p) => [
        ...p,
        {
          role: 'bot',
          text: getBotReply(text),
        },
      ]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xs flex flex-col overflow-hidden"
        style={{ height: 380 }}
      >
        {/* Header */}

        <div className="bg-gradient-to-r from-green-700 to-emerald-600 px-4 py-3 flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>

          <div className="flex-1">
            <p className="text-white font-bold text-sm leading-none">
              Smart Village AI
            </p>

            <p className="text-white/60 text-xs mt-0.5">
              Ask me anything
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 bg-gray-50">
          {msgs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5 text-green-600" />
              </div>

              <p className="text-gray-400 text-xs">
                Ask about complaints, certificates,
                <br />
                schemes, notices, or registration.
              </p>
            </div>
          )}

          {msgs.map((m, i) => (
            <div
              key={i}
              className={`flex gap-2 ${
                m.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  m.role === 'bot'
                    ? 'bg-green-100'
                    : 'bg-blue-100'
                }`}
              >
                {m.role === 'bot' ? (
                  <Bot className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <User className="h-3.5 w-3.5 text-blue-600" />
                )}
              </div>

              <div
                className={`max-w-[78%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-line ${
                  m.role === 'bot'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'bg-green-600 text-white'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>

        {/* Input */}

        <div className="px-3 py-3 bg-white border-t border-gray-100 flex gap-2 shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && send()
            }
            placeholder="Type your question..."
            className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-400"
          />

          <button
            onClick={send}
            disabled={!input.trim()}
            className="w-9 h-9 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white rounded-lg flex items-center justify-center transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
MAIN PAGE
══════════════════════════════════════════════════ */

export default function HomePage() {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // =========================
  // AUTH STATE
  // =========================

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardPath, setDashboardPath] = useState('/dashboard');

  // =========================
  // CHECK LOGIN STATUS
  // =========================

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');

      // No login
      if (!token) {
        setIsLoggedIn(false);
        setDashboardPath('/dashboard');
        return;
      }

      try {
        const decoded = jwtDecode(token);

        // Admin logged in
        if (decoded.role === 'admin') {
          setIsLoggedIn(true);
          setDashboardPath('/admin/dashboard');
          return;
        }

        // User logged in
        if (decoded.role === 'user') {
          setIsLoggedIn(true);
          setDashboardPath('/dashboard');
          return;
        }

        // Unknown role
        setIsLoggedIn(false);
        setDashboardPath('/dashboard');
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        localStorage.removeItem('adminName');

        setIsLoggedIn(false);
        setDashboardPath('/dashboard');
      }
    };

    checkAuth();

    // Detect localStorage changes from other tabs
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    localStorage.removeItem('adminName');

    setIsLoggedIn(false);
    setDashboardPath('/dashboard');
    setMobileOpen(false);

    navigate('/');
  };

  const scrollTo = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: 'smooth',
      });

    setMobileOpen(false);
  };

  const services = [
    {
      icon: FileText,
      title: 'Online Complaint',
      desc: 'File & track complaints across 21+ categories.',
      color: 'bg-blue-500',
      light: 'bg-blue-50',
      text: 'text-blue-600',
      link: '/complaint',
    },
    {
      icon: Gift,
      title: 'Govt. Schemes',
      desc: 'Browse and apply for all eligible government schemes.',
      color: 'bg-green-500',
      light: 'bg-green-50',
      text: 'text-green-700',
      link: '/schemes',
    },
    {
      icon: Award,
      title: 'Certificates',
      desc: 'Apply for birth, death, income & caste certificates.',
      color: 'bg-purple-500',
      light: 'bg-purple-50',
      text: 'text-purple-600',
      link: '/certificates',
    },
    {
      icon: Megaphone,
      title: 'Notice Board',
      desc: 'Official village announcements and panchayat notices.',
      color: 'bg-orange-500',
      light: 'bg-orange-50',
      text: 'text-orange-600',
      link: '/notices',
    },
  ];

  const whyUs = [
    {
      icon: Shield,
      title: 'Secure & Private',
      desc: 'Your data is encrypted and shared only with authorised officials.',
    },
    {
      icon: Clock,
      title: '24/7 Available',
      desc: 'Access all services anytime, anywhere from your device.',
    },
    {
      icon: CheckCircle,
      title: 'Fast Processing',
      desc: 'Digital applications processed faster than offline methods.',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Help',
      desc: 'Get instant answers through our built-in AI assistant.',
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ══ NAVBAR ══ */}

      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}

            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <Home className="h-5 w-5 text-white" />
              </div>

              <div>
                <p className="text-base font-bold text-gray-800 leading-none">
                  Smart Village
                </p>

                <p className="text-xs text-gray-500 mt-0.5">
                  Digital Gram Panchayat
                </p>
              </div>
            </div>

            {/* Desktop center links */}

            <div className="hidden md:flex items-center gap-7">
              <a
                href="#home"
                className="text-base font-semibold text-green-700 border-b-2 border-green-600 pb-0.5 transition-colors"
              >
                Home
              </a>

              <button
                onClick={() => scrollTo('services')}
                className="text-base font-semibold text-gray-600 hover:text-green-700 transition-colors flex items-center gap-1.5"
              >
                <Layers className="h-4 w-4" />
                Services
              </button>

              <button
                onClick={() => scrollTo('contact')}
                className="text-base font-semibold text-gray-600 hover:text-green-700 transition-colors flex items-center gap-1.5"
              >
                <HeadphonesIcon className="h-4 w-4" />
                Contact
              </button>

              <button
                onClick={() => setChatOpen(true)}
                className="flex items-center gap-1.5 text-base font-semibold text-white bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                <Sparkles className="h-4 w-4" />
                Chat with AI
              </button>
            </div>

            {/* Desktop auth buttons */}

            <div className="hidden md:flex items-center gap-2.5">

              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => navigate(dashboardPath)}
                    className="flex items-center gap-2 px-5 py-2 text-base font-bold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </button>

                  <button
                    onClick={handleLogout}
                    className="px-5 py-2 text-base font-bold text-red-600 border-2 border-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-5 py-2 text-base font-bold text-green-700 border-2 border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    Login
                  </button>

                  <button
                    onClick={() => navigate('/register')}
                    className="px-5 py-2 text-base font-bold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
                  >
                    Register
                  </button>

                  <button
                    onClick={() => navigate('/admin/login')}
                    className="px-5 py-2 text-base font-bold bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors shadow-sm"
                  >
                    Admin
                  </button>
                </>
              )}

            </div>

            {/* Mobile hamburger */}

            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>

          </div>
        </div>
      </nav>

      {/* ══ MOBILE MENU — full-screen overlay ══ */}

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">

          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>

              <div>
                <p className="text-base font-bold text-gray-800 leading-none">
                  Smart Village
                </p>

                <p className="text-xs text-gray-500">
                  Digital Gram Panchayat
                </p>
              </div>
            </div>

            <button
              onClick={() => setMobileOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>

          </div>

          <div className="flex-1 flex flex-col px-5 py-6 gap-2 overflow-y-auto">

            <button
              onClick={() => {
                scrollTo('home');
                setMobileOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-4 rounded-xl text-lg font-bold text-green-700 bg-green-50 border border-green-100 w-full text-left"
            >
              <Home className="h-5 w-5" />
              Home
            </button>

            <button
              onClick={() => scrollTo('services')}
              className="flex items-center gap-3 px-4 py-4 rounded-xl text-lg font-bold text-gray-700 hover:bg-gray-50 border border-gray-100 w-full text-left"
            >
              <Layers className="h-5 w-5 text-green-600" />
              Services
            </button>

            <button
              onClick={() => scrollTo('contact')}
              className="flex items-center gap-3 px-4 py-4 rounded-xl text-lg font-bold text-gray-700 hover:bg-gray-50 border border-gray-100 w-full text-left"
            >
              <HeadphonesIcon className="h-5 w-5 text-green-600" />
              Contact
            </button>

            <button
              onClick={() => {
                setChatOpen(true);
                setMobileOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-4 rounded-xl text-lg font-bold text-white bg-green-600 border border-green-600 w-full text-left"
            >
              <Sparkles className="h-5 w-5" />
              Chat with AI
            </button>

          </div>

          {/* Mobile auth buttons */}

          <div className="px-5 pb-8 space-y-3">

            {isLoggedIn ? (
              <>
                <button
                  onClick={() => {
                    navigate(dashboardPath);
                    setMobileOpen(false);
                  }}
                  className="w-full py-4 flex items-center justify-center gap-2 text-base font-bold bg-green-600 hover:bg-green-700 text-white rounded-2xl transition-colors shadow-md"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full py-4 text-base font-bold text-red-600 border-2 border-red-500 rounded-2xl hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate('/login');
                    setMobileOpen(false);
                  }}
                  className="w-full py-4 text-base font-bold text-green-700 border-2 border-green-600 rounded-2xl hover:bg-green-50 transition-colors"
                >
                  Login
                </button>

                <button
                  onClick={() => {
                    navigate('/register');
                    setMobileOpen(false);
                  }}
                  className="w-full py-4 text-base font-bold bg-green-600 hover:bg-green-700 text-white rounded-2xl transition-colors shadow-md"
                >
                  Register
                </button>

                <button
                  onClick={() => {
                    navigate('/admin/login');
                    setMobileOpen(false);
                  }}
                  className="w-full py-4 text-base font-bold bg-gray-900 hover:bg-gray-800 text-white rounded-2xl transition-colors shadow-md"
                >
                  Admin Login
                </button>
              </>
            )}

          </div>
        </div>
      )}

      {/* ══ HERO ══ */}

      <section
        id="home"
        className="relative overflow-hidden"
        style={{ minHeight: 580 }}
      >
        <div className="absolute inset-0">

          <img
            src={homePageImg}
            alt="Jharkhand village landscape"
            className="w-full h-full object-cover"
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(5,35,15,0.80) 0%, rgba(10,45,20,0.60) 50%, rgba(5,25,10,0.70) 100%)',
            }}
          />

        </div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-20 md:py-28">

          {/* Badge — Jharkhand specific */}

          <div className="inline-flex items-center gap-2 bg-green-800/70 backdrop-blur-sm border border-green-500/40 text-white text-base font-bold px-5 py-2 rounded-full mb-8 tracking-wide">
            🌿 झारखंड डिजिटल ग्राम पोर्टल — Sashakt Gaon, Samarth Jharkhand
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-5">
            Welcome to{' '}
            <span className="text-yellow-400">
              Smart Village
            </span>
            <br />
            Digital Portal
          </h1>

          <p className="text-white/80 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Access government services, file complaints, and stay connected with your Gram Panchayat administration — all from one place.
          </p>

          <div className="flex flex-wrap justify-center gap-4">

            <button
              onClick={() => navigate('/register')}
              className="flex items-center gap-2 px-8 py-3.5 bg-white text-green-700 rounded-xl font-bold text-base shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </button>

            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3.5 bg-gray-900/80 border border-white/25 text-white rounded-xl font-bold text-base shadow-xl hover:bg-gray-900 transition-all hover:-translate-y-0.5"
            >
              Login Now
            </button>

          </div>
        </div>
      </section>

      {/* ══ OUR SERVICES ══ */}

      <section
        id="services"
        className="py-16 md:py-20 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12">

            <div className="w-10 h-1 bg-green-600 rounded-full mx-auto mb-4" />

            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">
              Our Services
            </h2>

            <p className="text-gray-500 text-base mt-2">
              Everything you need, in one place
            </p>

          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

            {services.map((s) => {
              const Icon = s.icon;

              return (
                <div
                  key={s.title}
                  onClick={() => navigate(s.link)}
                  className="bg-white rounded-2xl p-5 md:p-7 shadow-sm hover:shadow-lg border border-gray-100 cursor-pointer transition-all hover:-translate-y-1 group"
                >
                  <div
                    className={`w-12 h-12 md:w-14 md:h-14 ${s.light} rounded-xl flex items-center justify-center mb-4`}
                  >
                    <Icon
                      className={`h-6 w-6 md:h-7 md:w-7 ${s.text}`}
                    />
                  </div>

                  <h3 className="font-bold text-gray-800 text-lg mb-2">
                    {s.title}
                  </h3>

                  <p className="text-gray-500 text-base leading-relaxed mb-4 hidden sm:block">
                    {s.desc}
                  </p>

                  <span
                    className={`flex items-center gap-1 text-base font-semibold ${s.text}`}
                  >
                    Go to service
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* ══ WHY CHOOSE ══ */}

      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12">

            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">
              Why Choose Smart Village?
            </h2>

            <p className="text-gray-500 text-base mt-3 max-w-lg mx-auto">
              A trusted digital platform built for every villager — simple, secure, and always online.
            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {whyUs.map((w) => {
              const Icon = w.icon;

              return (
                <div
                  key={w.title}
                  className="flex gap-4 p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-green-200 transition-colors"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="h-6 w-6 text-green-700" />
                  </div>

                  <div>
                    <p className="font-bold text-gray-800 text-lg">
                      {w.title}
                    </p>

                    <p className="text-gray-500 text-base mt-1 leading-relaxed">
                      {w.desc}
                    </p>
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}

      <footer
        id="contact"
        className="bg-gray-950 text-white"
      >

        {/* Top band */}

        <div className="border-b border-white/5 py-14">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Brand col */}

            <div className="lg:col-span-1">

              <div className="flex items-center gap-3 mb-5">

                <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-900/40">
                  <Home className="h-5 w-5 text-white" />
                </div>

                <div>
                  <p className="text-base font-extrabold leading-none">
                    Smart Village
                  </p>

                  <p className="text-gray-500 text-sm mt-0.5">
                    Digital Gram Panchayat
                  </p>
                </div>

              </div>

              <p className="text-gray-400 text-base leading-relaxed mb-6">
                Bringing government services closer to every citizen of Jharkhand — anytime, anywhere.
              </p>

              <div className="inline-flex items-center gap-2 bg-green-900/40 border border-green-700/40 text-green-400 text-sm font-semibold px-3 py-1.5 rounded-full">
                🌿 Sashakt Gaon, Samarth Jharkhand
              </div>

            </div>

            {/* Services col */}

            <div>

              <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-5">
                Services
              </p>

              <ul className="space-y-3">

                {[
                  {
                    label: 'Online Complaint',
                    href: '/complaint',
                  },
                  {
                    label: 'Govt. Schemes',
                    href: '/schemes',
                  },
                  {
                    label: 'Certificates',
                    href: '/certificates',
                  },
                  {
                    label: 'Notice Board',
                    href: '/notices',
                  },
                  {
                    label: 'My Dashboard',
                    href: '/dashboard',
                  },
                ].map((l) => (
                  <li key={l.label}>

                    <button
                      onClick={() => navigate(l.href)}
                      className="flex items-center gap-2 text-gray-400 hover:text-green-400 text-base transition-colors group"
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-gray-600 group-hover:text-green-400 group-hover:translate-x-0.5 transition-transform" />
                      {l.label}
                    </button>

                  </li>
                ))}

              </ul>
            </div>

            {/* Quick links col */}

            <div>

              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-5">
                Quick Links
              </p>

              <ul className="space-y-3">

                {[
                  {
                    label: 'Login',
                    href: '/login',
                  },
                  {
                    label: 'Register',
                    href: '/register',
                  },
                  {
                    label: 'Admin Login',
                    href: '/admin/login',
                  },
                  {
                    label: 'My Complaints',
                    href: '/my-complaints',
                  },
                  {
                    label: 'Notifications',
                    href: '/notifications',
                  },
                ].map((l) => (
                  <li key={l.label}>

                    <button
                      onClick={() => navigate(l.href)}
                      className="flex items-center gap-2 text-gray-400 hover:text-green-400 text-base transition-colors group"
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-gray-600 group-hover:text-green-400 group-hover:translate-x-0.5 transition-transform" />
                      {l.label}
                    </button>

                  </li>
                ))}

              </ul>
            </div>

            {/* Contact col */}

            <div>

              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-5">
                Contact Us
              </p>

              <ul className="space-y-4">

                <li className="flex items-start gap-3">

                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="h-3.5 w-3.5 text-green-400" />
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-0.5">
                      Email
                    </p>

                    <p className="text-base text-gray-300">
                      info@smartvillage.in
                    </p>
                  </div>

                </li>

                <li className="flex items-start gap-3">

                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="h-3.5 w-3.5 text-green-400" />
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-0.5">
                      Helpline
                    </p>

                    <p className="text-base text-gray-300">
                      +91 98765 43210
                    </p>
                  </div>

                </li>

                <li className="flex items-start gap-3">

                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <HeadphonesIcon className="h-3.5 w-3.5 text-green-400" />
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-0.5">
                      Support Hours
                    </p>

                    <p className="text-base text-gray-300">
                      Mon – Sat, 9 AM – 6 PM
                    </p>
                  </div>

                </li>

              </ul>

              <button
                onClick={() => setChatOpen(true)}
                className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-700/30 border border-green-600/40 text-green-400 rounded-xl text-base font-semibold hover:bg-green-700/50 transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Chat with AI Assistant
              </button>

            </div>

          </div>
        </div>

        {/* Bottom bar */}

        <div className="py-5">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">

            <p className="text-gray-600 text-sm text-center sm:text-left">
              © 2026 Smart Village Jharkhand — Gram Panchayat Digital Services. All rights reserved.
            </p>

            <div className="flex items-center gap-4">

              <span className="text-gray-700 text-sm hover:text-gray-400 cursor-pointer transition-colors">
                Privacy Policy
              </span>

              <span className="text-gray-700 text-sm hover:text-gray-400 cursor-pointer transition-colors">
                Terms of Use
              </span>

              <span className="text-gray-700 text-sm hover:text-gray-400 cursor-pointer transition-colors">
                RTI
              </span>

            </div>
          </div>
        </div>

      </footer>

      {/* ══ AI CHAT ══ */}

      {chatOpen && (
        <HelpChat
          onClose={() => setChatOpen(false)}
        />
      )}

    </div>
  );
}