const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, limit } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBB6wEYXCeu-IhgdkbD4zEaBmSJ9xkCXC0",
  authDomain: "nursingstudyvaultprep.firebaseapp.com",
  projectId: "nursingstudyvaultprep",
  storageBucket: "nursingstudyvaultprep.firebasestorage.app",
  messagingSenderId: "583546522601",
  appId: "1:583546522601:web:1165a7805c400b05235978"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkData() {
  console.log("Fetching Firebase collections...\n");
  
  // List all collections
  const collections = ['subjects', 'tests', 'mcqs', 'questions', 'users'];
  
  for (const colName of collections) {
    try {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(query(colRef, limit(2)));
      
      if (!snapshot.empty) {
        console.log(`\n📁 Collection: ${colName}`);
        console.log(`   Total docs (approx): ${snapshot.size}+`);
        
        snapshot.forEach(doc => {
          console.log(`   Document ID: ${doc.id}`);
          console.log(`   Data:`, JSON.stringify(doc.data(), null, 2).substring(0, 500));
          console.log(`   ---`);
        });
      } else {
        console.log(`\n📁 Collection: ${colName} - (empty or doesn't exist)`);
      }
    } catch(e) {
      console.log(`\n📁 Collection: ${colName} - Error: ${e.message}`);
    }
  }
}

checkData().catch(console.error);
