const clearCache = document.getElementById('clear-cache');
clearCache.addEventListener('click', () => {
  localStorage.removeItem('memorizedUrl');
  console.log('清除 memorizedUrl');
});