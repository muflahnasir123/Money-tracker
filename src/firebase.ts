import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs,
  onSnapshot, 
  writeBatch,
  deleteDoc
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Transaction, Category, SavingsGoal } from './types';
import { AppSettings, DEFAULT_SETTINGS } from './utils/storage';
import { SAMPLE_TRANSACTIONS, SAMPLE_GOALS } from './data/sampleData';
import { DEFAULT_CATEGORIES } from './data/categories';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

export function initAuth(onUserChanged: (user: User | null) => void) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      try {
        const cred = await signInAnonymously(auth);
        onUserChanged(cred.user);
      } catch (err) {
        console.error('Anonymous auth failed:', err);
        onUserChanged(null);
      }
    } else {
      onUserChanged(user);
    }
  });
}

export function subscribeUserData(
  userId: string,
  callbacks: {
    onTransactions: (txs: Transaction[]) => void;
    onCategories: (cats: Category[]) => void;
    onGoals: (goals: SavingsGoal[]) => void;
    onSettings: (settings: AppSettings) => void;
  }
) {
  const userRef = doc(db, 'users', userId);
  
  setDoc(userRef, { uid: userId, lastActive: new Date().toISOString() }, { merge: true }).catch(console.error);

  const txCol = collection(db, 'users', userId, 'transactions');
  const catCol = collection(db, 'users', userId, 'categories');
  const goalCol = collection(db, 'users', userId, 'goals');
  const settingsDoc = doc(db, 'users', userId, 'settings', 'config');

  const unsubTx = onSnapshot(txCol, async (snapshot) => {
    const txs = snapshot.docs.map(doc => doc.data() as Transaction);
    txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    callbacks.onTransactions(txs);
  }, (err) => console.error('Tx snapshot error:', err));

  const unsubCat = onSnapshot(catCol, async (snapshot) => {
    if (snapshot.empty) {
      const batch = writeBatch(db);
      DEFAULT_CATEGORIES.forEach((cat) => {
        batch.set(doc(catCol, cat.id), cat);
      });
      await batch.commit().catch(console.error);
    } else {
      const cats = snapshot.docs.map(doc => doc.data() as Category);
      callbacks.onCategories(cats);
    }
  }, (err) => console.error('Cat snapshot error:', err));

  const unsubGoal = onSnapshot(goalCol, async (snapshot) => {
    const goals = snapshot.docs.map(doc => doc.data() as SavingsGoal);
    callbacks.onGoals(goals);
  }, (err) => console.error('Goal snapshot error:', err));

  const unsubSettings = onSnapshot(settingsDoc, async (docSnap) => {
    if (!docSnap.exists()) {
      await setDoc(settingsDoc, DEFAULT_SETTINGS).catch(console.error);
    } else {
      callbacks.onSettings(docSnap.data() as AppSettings);
    }
  }, (err) => console.error('Settings snapshot error:', err));

  return () => {
    unsubTx();
    unsubCat();
    unsubGoal();
    unsubSettings();
  };
}

export async function syncTransactionToFirestore(userId: string, tx: Transaction) {
  try {
    const txRef = doc(db, 'users', userId, 'transactions', tx.id);
    await setDoc(txRef, { ...tx, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('Failed to sync transaction to Firestore:', err);
  }
}

export async function deleteTransactionFromFirestore(userId: string, txId: string) {
  try {
    const txRef = doc(db, 'users', userId, 'transactions', txId);
    await deleteDoc(txRef);
  } catch (err) {
    console.error('Failed to delete transaction from Firestore:', err);
  }
}

export async function syncCategoriesToFirestore(userId: string, categories: Category[]) {
  try {
    const batch = writeBatch(db);
    categories.forEach(cat => {
      const ref = doc(db, 'users', userId, 'categories', cat.id);
      batch.set(ref, cat);
    });
    await batch.commit();
  } catch (err) {
    console.error('Failed to sync categories to Firestore:', err);
  }
}

export async function syncGoalsToFirestore(userId: string, goals: SavingsGoal[]) {
  try {
    const batch = writeBatch(db);
    goals.forEach(goal => {
      const ref = doc(db, 'users', userId, 'goals', goal.id);
      batch.set(ref, goal);
    });
    await batch.commit();
  } catch (err) {
    console.error('Failed to sync goals to Firestore:', err);
  }
}

export async function syncSettingsToFirestore(userId: string, settings: AppSettings) {
  try {
    const ref = doc(db, 'users', userId, 'settings', 'config');
    await setDoc(ref, settings);
  } catch (err) {
    console.error('Failed to sync settings to Firestore:', err);
  }
}

export async function seedSampleFirestoreData(userId: string) {
  try {
    const batch = writeBatch(db);
    SAMPLE_TRANSACTIONS.forEach((tx) => {
      const ref = doc(db, 'users', userId, 'transactions', tx.id);
      batch.set(ref, tx);
    });
    SAMPLE_GOALS.forEach((goal) => {
      const ref = doc(db, 'users', userId, 'goals', goal.id);
      batch.set(ref, goal);
    });
    await batch.commit();
  } catch (err) {
    console.error('Failed to seed sample data in Firestore:', err);
  }
}

export async function clearAllFirestoreData(userId: string) {
  try {
    const batch = writeBatch(db);
    const txCol = collection(db, 'users', userId, 'transactions');
    const goalCol = collection(db, 'users', userId, 'goals');
    
    // Clear transactions
    const txSnap = await getDocs(txCol);
    txSnap.docs.forEach((docSnap) => batch.delete(docSnap.ref));

    // Clear goals
    const goalSnap = await getDocs(goalCol);
    goalSnap.docs.forEach((docSnap) => batch.delete(docSnap.ref));

    await batch.commit();
  } catch (err) {
    console.error('Failed to clear Firestore data:', err);
  }
}
