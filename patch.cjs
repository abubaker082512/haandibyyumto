const fs = require('fs');
let code = fs.readFileSync('src/store/mockDb.ts', 'utf-8');

if (!code.includes('firestoreSync')) {
  // Add import
  code = code.replace(
    /import \{ useState, useEffect \} from 'react';/,
    "import { useState, useEffect } from 'react';\nimport { startFirestoreSync, pushToFirestore } from '../services/firestoreSync';"
  );

  // Instead of modifying init, we can just export a hooked version of localStorage inside mockDb?
  // No, let's just modify the notify function! 
  // Whenever data changes, they call this.notify(). But wait, they do localStorage.setItem BEFORE this.notify().
  // If we just intercept localStorage.setItem globally inside init().

  code = code.replace(
    /private init\(\) \{/,
    "private init() {\n    // Intercept localStorage to push to Firestore\n    const originalSet = localStorage.setItem;\n    localStorage.setItem = function(key, val) {\n      originalSet.apply(this, arguments);\n      try {\n        if (typeof pushToFirestore === 'function') pushToFirestore(key, JSON.parse(val));\n      } catch(e) {}\n    };\n    setTimeout(() => startFirestoreSync(this), 1000);\n"
  );
  
  // Make notify public so firestoreSync can call it
  code = code.replace(/private notify\(\)/, "public notify()");

  fs.writeFileSync('src/store/mockDb.ts', code);
  console.log("Patched successfully!");
} else {
  console.log("Already patched.");
}
