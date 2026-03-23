import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { QrCode, Mail, Lock, User, Phone, Building, ArrowRight, Loader2, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ADMIN_EMAIL = 'bachu20288@gmail.com';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // 1: Auth, 2: Profile Info, 3: Phone Verification
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requireVerification, setRequireVerification] = useState(false);
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    // Fetch global settings
    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
        if (settingsDoc.exists()) {
          setRequireVerification(settingsDoc.data().requireVerification);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    // If user is already logged in but redirected here, they likely need to complete profile
    const checkUser = async () => {
      if (auth.currentUser && step === 1) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (!userDoc.exists()) {
          // If admin, skip verification and save profile immediately
          if (auth.currentUser.email === ADMIN_EMAIL) {
            await setDoc(doc(db, 'users', auth.currentUser.uid), {
              name: auth.currentUser.displayName || 'Admin',
              email: auth.currentUser.email,
              phone: 'N/A',
              company: 'EventCheck Admin',
              isEmailVerified: true,
              isPhoneVerified: true,
              createdAt: serverTimestamp()
            });
            navigate('/');
            return;
          }

          setName(auth.currentUser.displayName || '');
          setEmail(auth.currentUser.email || '');
          setStep(2);
        } else {
          navigate('/');
        }
      }
    };
    checkUser();
  }, [navigate, step]);

  useEffect(() => {
    // Initialize Recaptcha
    if (step === 3 && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  }, [step]);

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        navigate('/');
      } else {
        setName(user.displayName || '');
        setEmail(user.email || '');
        setStep(2);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        await sendEmailVerification(result.user);
        setStep(2);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requireVerification) {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (user) {
          await setDoc(doc(db, 'users', user.uid), {
            name,
            email,
            phone,
            company,
            isEmailVerified: user.emailVerified,
            isPhoneVerified: false,
            createdAt: serverTimestamp(),
            role: 'admin'
          });
          navigate('/');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setStep(3);
    }
  };

  const handleSendCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
    } catch (err: any) {
      setError(err.message);
      // Reset recaptcha if it fails
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setLoading(true);
    setError(null);
    try {
      // In a real app, we would link the phone number to the current user
      // For this demo, we'll just simulate success and save the profile
      await confirmationResult.confirm(verificationCode);
      
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          name,
          email,
          phone,
          company,
          isEmailVerified: user.emailVerified,
          isPhoneVerified: true,
          createdAt: serverTimestamp()
        });
        navigate('/');
      }
    } catch (err: any) {
      setError('Mã xác thực không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full">
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/landing" className="inline-flex items-center gap-2 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 bg-emerald-600 rounded-lg sm:rounded-xl">
              <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">EventCheck</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 uppercase tracking-tight">
            {step === 1 ? (isLogin ? 'Đăng nhập' : 'Đăng ký tài khoản') : 
             step === 2 ? 'Thông tin cá nhân' : 'Xác thực số điện thoại'}
          </h1>
          <p className="text-stone-500 text-sm sm:text-base font-medium mt-1 sm:mt-2 px-4">
            {step === 1 ? 'Bắt đầu hành trình tổ chức sự kiện của bạn' : 
             step === 2 ? 'Vui lòng cung cấp thêm thông tin để tiếp tục' : 'Chúng tôi đã gửi mã xác thực đến số điện thoại của bạn'}
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-stone-200 shadow-xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <button
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full py-4 bg-white border border-stone-200 text-stone-700 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-stone-50 transition-all shadow-sm disabled:opacity-50"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
                  {isLogin ? 'Đăng nhập với Google' : 'Đăng ký với Google'}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-100"></div></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-stone-400 font-bold tracking-widest">Hoặc</span></div>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-1">
                      <label className="text-xs font-black text-stone-500 uppercase tracking-widest ml-1">Họ và tên</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        <input
                          type="text"
                          required
                          placeholder="Nguyễn Văn A"
                          className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-widest ml-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                      <input
                        type="email"
                        required
                        placeholder="email@example.com"
                        className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-widest ml-1">Mật khẩu</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm font-medium">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black text-lg hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isLogin ? 'Đăng nhập' : 'Đăng ký ngay')}
                  </button>
                </form>

                <div className="text-center">
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm font-bold text-stone-500 hover:text-emerald-600 transition-colors"
                  >
                    {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-widest ml-1">Số điện thoại</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                      <input
                        type="tel"
                        required
                        placeholder="+84 123 456 789"
                        className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-widest ml-1">Tên công ty</label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                      <input
                        type="text"
                        required
                        placeholder="EventCheck Inc."
                        className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    Tiếp tục xác thực <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {!confirmationResult ? (
                  <div className="space-y-4">
                    <p className="text-stone-500 text-center font-medium">
                      Nhấn nút bên dưới để nhận mã xác thực qua SMS.
                    </p>
                    <div id="recaptcha-container"></div>
                    <button
                      onClick={handleSendCode}
                      disabled={loading}
                      className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black text-lg hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Gửi mã xác thực'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-stone-500 uppercase tracking-widest ml-1">Mã xác thực (6 chữ số)</label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="123456"
                          className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-center tracking-[0.5em] text-xl"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm font-medium">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p>{error}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Xác nhận & Hoàn tất'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setConfirmationResult(null)}
                      className="w-full text-sm font-bold text-stone-500 hover:text-stone-900 transition-colors"
                    >
                      Gửi lại mã
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 text-center">
          <p className="text-stone-400 text-xs font-medium">
            Bằng cách tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}
