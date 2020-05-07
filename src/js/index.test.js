const doTest = (callback, message) => {
  try {
    callback();
  } catch (error) {
    console.log(`${message}: `, error);
  }
}

window.addEventListener('load', () => {
  doTest(() => getAd('#ad-all', 'ALL'), 'function: getAd(), ALL type render failed: ');
  doTest(() => getAd('#ad-banner', 'BANNER'), 'function: getAd(), BANNER type render failed: ');
  doTest(() => getAd('#ad-video', 'VIDEO'), 'function: getAd(), VIDEO type render failed: ');
});

window.addEventListener('ad-on-loaded', () => {
  console.log('廣告載入成功');
});
