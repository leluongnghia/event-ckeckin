import React, { useState } from 'react';
import { QrCode, LayoutDashboard, Menu, X as CloseIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../firebase';

export default function PublicNavbar() {
  const user = auth.currentUser;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  const anchorPrefix = isHome ? '' : '/';

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-stone-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-stone-900 tracking-tight">EventCheck</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href={`${anchorPrefix}#features`} className="text-sm font-semibold text-stone-500 hover:text-emerald-600 transition-colors">Tính năng</a>
            <a href={`${anchorPrefix}#how-it-works`} className="text-sm font-semibold text-stone-500 hover:text-emerald-600 transition-colors">Quy trình</a>
            <Link to="/checkin/demo" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1.5 border border-emerald-200 bg-emerald-50 px-4 py-2 rounded-xl">
              <QrCode className="w-4 h-4" /> Demo Quét QR
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard" className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
            ) : (
              <>
                <Link to="/auth" className="hidden md:block text-sm font-bold text-stone-600 hover:text-stone-900 transition-colors">Đăng nhập</Link>
                <Link to="/auth" className="hidden md:block px-5 py-2.5 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20">
                  Bắt đầu miễn phí →
                </Link>
              </>
            )}
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative ml-auto w-[280px] bg-white h-full shadow-2xl flex flex-col p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-600 rounded-xl"><QrCode className="w-5 h-5 text-white" /></div>
                <span className="text-lg font-black text-stone-900">EventCheck</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100">
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              <a href={`${anchorPrefix}#features`} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-stone-700 font-semibold hover:bg-stone-100 transition-colors">Tính năng</a>
              <a href={`${anchorPrefix}#how-it-works`} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-stone-700 font-semibold hover:bg-stone-100 transition-colors">Quy trình</a>
              <div className="my-2 border-t border-stone-100" />
              <Link
                to="/checkin/demo"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors border border-emerald-200"
              >
                <QrCode className="w-5 h-5 shrink-0" />
                <div>
                  <div className="text-sm">Demo Quét QR</div>
                  <div className="text-xs font-medium text-emerald-600 mt-0.5">Không cần đăng nhập</div>
                </div>
              </Link>
            </nav>
            <div className="mt-auto pt-6 border-t border-stone-100 space-y-3">
              {user ? (
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold text-center block hover:bg-emerald-700 transition-all">
                  Vào Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="w-full py-3.5 bg-stone-900 text-white rounded-xl font-bold text-center block hover:bg-stone-800 transition-all">
                    Bắt đầu miễn phí
                  </Link>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="w-full py-3.5 bg-stone-100 text-stone-700 rounded-xl font-bold text-center block hover:bg-stone-200 transition-all">
                    Đăng nhập
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
