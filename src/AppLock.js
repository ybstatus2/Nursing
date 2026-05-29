import { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { Lock, Delete, LogOut } from 'lucide-react';

export default function AppLock({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [savedPin, setSavedPin] = useState(null); // null=loading, undefined=no pin
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserPin();
  }, []);

  const fetchUserPin = async () => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists() && userDoc.data().pin) {
        setSavedPin(userDoc.data().pin);
      } else {
        setIsSettingPin(true); // No PIN set -> create mode
      }
    } catch (e) {
      console.log('Error fetching PIN:', e);
    }
    setLoading(false);
  };

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
            savePinToFirestore(newPin);
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
          }
        }
      }
    }
  };

  const savePinToFirestore = async (newPin) => {
    try {
      // Merge the pin into the user's document
      await setDoc(doc(db, 'users', auth.currentUser.uid), { pin: newPin }, { merge: true });
      setSavedPin(newPin);
      setIsSettingPin(false);
      sessionStorage.setItem('rprep_unlocked', 'true');
      onUnlock?.();
    } catch (e) {
      setError('Failed to save PIN. Try again.');
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const handleForgotPasscode = async () => {
    try {
      // Remove pin from Firestore
      await updateDoc(doc(db, 'users', auth.currentUser.uid), { pin: null });
    } catch (e) {}
    // Clear session and sign out
    sessionStorage.removeItem('rprep_unlocked');
    auth.signOut().then(() => window.location.reload());
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-950">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

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
              ? (confirmPin ? 'Confirm your 4-digit PIN' : 'Set a 4-digit PIN')
              : 'Enter your PIN to continue'}
          </p>
        </div>

        <div className="flex justify-center gap-5 mb-8">
          {[0,1,2,3].map(i => (
            <div key={i} className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
              pin.length > i 
                ? 'bg-blue-500 border-blue-500 scale-110' 
                : 'border-gray-600'
            }`} />
          ))}
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mb-6">{error}</p>
        )}

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

        <div className="mt-8 space-y-4 text-center">
          {!isSettingPin && (
            <button onClick={handleForgotPasscode} className="text-sm text-gray-400 hover:text-white">
              Forgot Passcode?
            </button>
          )}
          <button onClick={() => { auth.signOut(); window.location.reload(); }} className="block w-full text-sm text-gray-600 hover:text-red-400 transition-colors">
            <LogOut size={14} className="inline mr-1" /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
