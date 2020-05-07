// 廣告資料
let adInfo = null;

// 自訂義事件
const onLoaded = new CustomEvent('ad-on-loaded');
const onFailed = new CustomEvent('ad-on-failed');
const onImpression = new CustomEvent('ad-impression');

const getAd = (selector, requiredType) => {
  const fetchAd = new Promise((resolve, reject) => {
    fetch('http://localhost:3000/ads')
      .then(response => response.json())
      .then(json => {
        // 觸發 ad-on-loaded 事件
        window.dispatchEvent(onLoaded);
        adInfo = json;
        resolve(true);
      })
      .catch(error => {
        // 觸發 ad-on-failed 事件
        window.dispatchEvent(onFailed);

        // 紀錄 client 端的 error 到 Server
        const sendErrorToServer = error => {
          fetch('http://localhost:3000/log', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              error: error.toString(),
              time: new Date(),
            }),
          })
            .then(response => response.json())
            .then(json => console.log(json))
            .catch(error => console.log(error));
        };

        sendErrorToServer(error.toString());
        reject(false);
      });
  });

  fetchAd
    .then(() => renderAd(selector, requiredType))
    .catch(error => console.log(error));
};

const renderAd = (selector, requiredType) => {
  let impression = false;
  const element = document.querySelector(selector);

  if (!element) {
    console.log('未找到可放置廣告的 element');
    return;
  }

  // 檢查 adInfo 直到有值
  if (!adInfo) {
    setTimeout(() => renderAd(selector, requiredType), 100);
    return;
  }

  const {
    url,
    type,
    image,
    title,
    success,
    video_url,
    description,
    impression_url,
  } = adInfo;

  // 沒有廣告可以提供
  if (!success) {
    const noAd = `<div class="no-ad">目前沒有任何廣告</div>`;
    element.innerHTML = noAd;

    return;
  }

  // 檢查廣告類型是否符合
  if (requiredType !== type && requiredType !== 'ALL') {
    const noAd = `<div class="no-ad">目前沒有符合 ${requiredType} 類型的廣告</div>`;
    element.innerHTML = noAd;

    return;
  }

  // 取得 domain
  const getDomain = url => {
    const pattern = /(\:\/\/)([a-z]|[0-9]|\.|\-)+/g;
    const result = url.match(pattern)[0].replace('://', '').toUpperCase();

    return result;
  };

  if (type === 'BANNER') {
    const banner = `
        <a class="link" href="${url}" target="_blank" title="${description}">
          <div class="banner" style="background-image: url(${image})"></div>
          <div class="content">
            <i class="info-icon">i</i>
            <h2 class="domain">${getDomain(url)}</h2>
            <h1 class="title">${title}</h1>
          </div>
        </a>
      `;
    element.innerHTML = banner;

  } else if (type === 'VIDEO') {
    const video = `
        <iframe class="video" src="${video_url}" alt="${title}" allowFullScreen></iframe>
      `;
    element.innerHTML = video;
  }

  // 檢查可視範圍 50% 以上是否超過 1 秒
  const checkImpression = () => {
    if (impression) {
      return;
    }

    // 取得廣告可視比例
    const getPercent = element => {
      const getElementViewportWidth = rect => {
        // element 超出左邊界
        if (rect.left < 0) {
          return rect.right;
        }

        // element 超出右邊界
        if (rect.left + rect.width > window.innerWidth) {
          return window.innerWidth - rect.left;
        }

        return rect.width;
      };

      const getElementViewportHeight = rect => {
        // element 超出上邊界
        if (rect.top < 0) {
          return rect.bottom;
        }

        // element 超出下邊界
        if (rect.top + rect.height > window.innerHeight) {
          return window.innerHeight - rect.top;
        }

        return rect.height;
      }

      const rect = element.getBoundingClientRect();
      // 原始大小
      const elementOriginSize = rect.width * rect.height;
      // 可視大小
      const elementViewportSize = getElementViewportWidth(rect) * getElementViewportHeight(rect);
      // 所佔比例
      const percent = elementViewportSize / elementOriginSize;

      return percent;
    };

    // 確認超過 50%
    if (getPercent(element) > 0.5) {
      impression = true;

      // 計時 1 秒
      setTimeout(() => {
        if (getPercent(element) > 0.5) {
          // 觸發 ad-impression 事件
          element.dispatchEvent(onImpression);

          const fetchImpressionUrl = () => {
            // memorizedUrl 目的為判斷當前的 impression_url 是否呼叫過
            const memorizedUrl = JSON.parse(localStorage.getItem('memorizedUrl')) || [];

            // 如果 memorizedUrl 不是陣列 或 為空陣列
            // 將 impression_url 存入 memorizedUrl
            if (!Array.isArray(memorizedUrl) || !memorizedUrl.length) {
              localStorage.setItem('memorizedUrl', JSON.stringify([impression_url]));
            }

            // 如果 memorizedUrl 內有資料
            // 比對 impression_url 是否已經存在此陣列中
            if (memorizedUrl.length) {
              const isImpression = memorizedUrl.filter(url => impression_url === url);

              if (!isImpression.length) {
                // fetch(impression_url)
                //   .then(response => response.json)
                //   .then(json => console.log(json))
                //   .catch(error => console.log(error));

                console.log(`觸發呼叫 impression_url: ${impression_url}`);
              } else {
                console.log(`${impression_url} 已經呼叫過 1 次`);
              }
            }
          }

          fetchImpressionUrl();

          // 為方便 demo 新增此 class 來標示 impression
          element.classList.add('impression');
        } else {
          impression = false;
        }
      }, 1000);
    }
  };

  checkImpression();
  window.addEventListener('scroll', checkImpression);
};
