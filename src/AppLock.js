import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { Lock, Delete, Fingerprint, LogOut } from 'lucide-react';

export default function AppLock({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [savedPin, setSavedPin] = useState(null);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('rprep_pin');
    if (stored) {
      setSavedPin(stored);
    } else {
      setIsSettingPin(true);
    }
  }, []);

  const handleNumber = (num) => {
    setError('');
    if (isSettingPin) {
      if (pin.length < 4) {
        const newPin = pin + num;
        setPin(newPin);
        if (newPin.length === 4) {
          if (!confirmPin) {
            setConfirmPin(newPin);
            setPin('');
            setError('Confirm your PIN');
          } else if (newPin === confirmPin) {
            localStorage.setItem('rprep_pin', newPin);
            setSavedPin(newPin);
            setIsSettingPin(false);
            sessionStorage.setItem('rprep_unlocked', 'true');
            onUnlock?.();
          } else {
            setError('PINs do not match');
            setPin('');
            setConfirmPin('');
          }
        }
      }
    } else {
      if (pin.length < 4) {
        const newPin = pin + num;
        setPin(newPin);
        if (newPin.length === 4) {
          if (newPin === savedPin) {
            sessionStorage.setItem('rprep_unlocked', 'true');
            onUnlock?.();
          } else {
            setError('Wrong PIN!');
            setPin('');
            // Shake animation
            const input = document.getElementById('pinDots');
            if(input) {
              input.classList.add('animate-shake');
              setTimeout(() => input.classList.remove('animate-shake'), 500);
            }
          }
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('rprep_pin');
    sessionStorage.removeItem('rprep_unlocked');
    auth.signOut();
    window.location.reload();
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/30">
            <Lock size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isSettingPin ? 'Create Passcode' : 'Enter Passcode'}
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            {isSettingPin 
              ? (confirmPin ? 'Confirm your 4-digit PIN' : 'Secure your app with a PIN')
              : 'Enter PIN to continue'}
          </p>
        </div>

        {/* PIN Dots */}
        <div id="pinDots" className="flex justify-center gap-5 mb-8">
          {[0,1,2,3].map(i => (
            <div key={i} className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
              pin.length > i 
                ? 'bg-blue-500 border-blue-500 scale-110' 
                : 'border-gray-600'
            }`} />
          ))}
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mb-6 animate-fadeIn">{error}</p>
        )}

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3,4,5,6,7,8,9].map(num => (
            <button
              key={num}
              onClick={() => handleNumber(num.toString())}
              className="w-full aspect-square bg-gray-800/50 hover:bg-gray-700 active:bg-gray-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white transition-all border border-gray-700"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleNumber('0')}
            className="w-full aspect-square bg-gray-800/50 hover:bg-gray-700 active:bg-gray-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white transition-all border border-gray-700"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-full aspect-square bg-gray-800/50 hover:bg-gray-700 active:bg-gray-600 rounded-2xl flex items-center justify-center transition-all border border-gray-700"
          >
            <Delete size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 text-center space-y-3">
          {!isSettingPin && (
            <button className="text-gray-500 text-sm hover:text-gray-400">
              <Fingerprint size={20} className="inline mr-1" />
              Use Fingerprint
            </button>
          )}
          <button onClick={handleLogout} className="block w-full text-gray-600 text-sm hover:text-red-400 transition-colors">
            <LogOut size={14} className="inline mr-1" />
            Logout
          </button>
        </div>
      </div>

      <style>{`
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
