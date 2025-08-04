// Development cache clearing script
console.log('🧹 Starting complete cache clearing...');

// 1. Clear all service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    console.log('🔍 Found', registrations.length, 'service workers');
    for(let registration of registrations) {
      registration.unregister().then(function(boolean) {
        console.log('🗑️ ServiceWorker unregistered:', boolean);
      });
    }
  });
}

// 2. Clear all caches
if ('caches' in window) {
  caches.keys().then(function(names) {
    console.log('🔍 Found caches:', names);
    for (let name of names) {
      caches.delete(name).then(function(deleted) {
        console.log('🗑️ Cache deleted:', name, deleted);
      });
    }
  });
}

// 3. Clear localStorage and sessionStorage
try {
  localStorage.clear();
  sessionStorage.clear();
  console.log('🗑️ Storage cleared');
} catch (e) {
  console.log('⚠️ Could not clear storage:', e);
}

// 4. Clear IndexedDB
if ('indexedDB' in window) {
  try {
    indexedDB.deleteDatabase('gift-tracker');
    console.log('🗑️ IndexedDB cleared');
  } catch (e) {
    console.log('⚠️ Could not clear IndexedDB:', e);
  }
}

console.log('✅ Cache clearing complete!');
console.log('🔄 Now do a hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)');

// Auto-reload after clearing
setTimeout(() => {
  console.log('🔄 Auto-reloading...');
  window.location.reload(true);
}, 2000);