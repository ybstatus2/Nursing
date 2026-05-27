import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { Lock, ArrowLeft, Fingerprint, Delete } from 'lucide-react';

export default function AppLock() {
  const [pin, setPin] = useState('');
  const [savedPin, setSavedPin] = useState(null);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('rprep_pin');
    if (stored) {
      setSavedPin(stored);
    } else {
      setIsSettingPin(true);
    }
  }, []);

  const handleNumber = (num) => {
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
            setError('');
            navigate('/dashboard');
          } else {
            setError('PINs don\'t match! Try again');
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
            setError('');
            navigate('/dashboard');
          } else {
            setError('Wrong PIN! Try again');
            setPin('');
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
    auth.signOut();
    navigate('/');
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {isSettingPin ? 'Create Passcode' : 'Enter Passcode'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {isSettingPin 
              ? (confirmPin ? 'Confirm your 4-digit PIN' : 'Set a 4-digit PIN')
              : 'Enter your PIN to continue'}
          </p>
        </div>

        {/* PIN Dots */}
        <div className="flex justify-center gap-4 mb-8">
          {[0,1,2,3].map(i => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 ${
              pin.length > i 
                ? 'bg-blue-500 border-blue-500' 
                : 'border-gray-600'
            }`} />
          ))}
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4">{error}</p>
        )}

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3,4,5,6,7,8,9].map(num => (
            <button
              key={num}
              onClick={() => handleNumber(num.toString())}
              className="w-full aspect-square bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white transition-all"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleNumber('0')}
            className="w-full aspect-square bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white transition-all"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-full aspect-square bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-2xl flex items-center justify-center transition-all"
          >
            <Delete size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 text-center">
          <button onClick={handleLogout} className="text-gray-500 text-sm">
            Logout & Reset
          </button>
        </div>
      </div>
    </div>
  );
}
