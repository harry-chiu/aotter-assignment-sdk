// 取得放置廣告的欄位
const ads = document.getElementsByClassName('ad');

// 廣告
const adElements = [];

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

// 檢查廣告是否停留一秒
const checkImpression = () => {
  adElements.forEach(adElement => {
    const { element } = adElement;
    if (adElement.impression) {
      return;
    }

    // 確認超過 50%
    if (getPercent(element) > 0.5) {
      adElement.impression = true;

      // 計時 1 秒
      setTimeout(() => {
        if (getPercent(element) > 0.5) {
          // 觸發 impression 事件
          const onImpression = new CustomEvent('ad-impression', {
            detail: { impression_url: adElement.impression_url },
          });

          element.dispatchEvent(onImpression)
        } else {
          adElement.impression = false;
        }
      }, 1000);
    }
  });
};

// 將 url 轉換為 domain name
const getDomain = url => {
  const pattern = /(\:\/\/)([a-z]|[0-9]|\.|\-)+/g;
  const result = url.match(pattern)[0].replace('://', '').toUpperCase();

  return result;
};

// 渲染廣告
const render = (element, ad) => {
  if (ad.success) {
    if (ad.type === 'BANNER') {
      const banner = `
        <a class="link" href="${ad.url}" target="_blank" title="${ad.description}">
          <div class="banner" style="background-image: url(${ad.image})"></div>
          <div class="content">
            <i class="info-icon">i</i>
            <h2 class="domain">${getDomain(ad.url)}</h2>
            <h1 class="title">${ad.title}</h1>
          </div>
        </a>
      `;
      element.innerHTML = banner;
    } else if (ad.type === 'VIDEO') {
      const video = `
        <iframe class="video" src="${ad.video_url}" alt="${ad.title}" allowFullScreen></iframe>
      `;
      element.innerHTML = video;
    }
  } else {
    element.parentElement.removeChild(element);
  }
};

const bindEvents = element => {
  element.addEventListener('ad-on-loaded', event => {
    const ad = event.detail;
    render(element, ad);
  });

  element.addEventListener('ad-on-failed', event => {
    const data = event.detail;
    const formData = new FormData();
    formData.append('data', data);

    fetch('http://localhost:3000/log', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => response.json())
      .then(response => response)
      .catch(error => console.log(error));
  });

  element.addEventListener('ad-impression', event => {
    const { impression_url } = event.detail;
    element.classList.add('impression');
    fetch(impression_url)
      .then(response => console.log(response.json()))
      .catch(error => console.log(error));
  });
};

// [GET] - 取得廣告
const fetchAd = (element) => {
  fetch('http://localhost:3000/ads')
    .then(response => response.json())
    .then(response => {
      const onLoaded = new CustomEvent('ad-on-loaded', {
        detail: response,
      });

      adElements.push({
        element,
        impression: false,
        impression_url: response.impression_url,
      });
      element.dispatchEvent(onLoaded);
    })
    .catch(error => {
      const onFailed = new CustomEvent('ad-on-failed', {
        detail: error,
      });

      element.dispatchEvent(onFailed);
    });
};

// 綁定滾動及載入事件
document.addEventListener('scroll', checkImpression);
window.onload = () => checkImpression();

Array.from(ads).forEach((ad) => {
  bindEvents(ad);
  fetchAd(ad);
});
