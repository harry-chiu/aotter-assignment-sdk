# Aotter Assignment SDK
一個 javascript sdk，開發者可以在自己的網站頁面中顯示廣告

## DEMO
第一步--啟動 server.js
```
node server.js
```
第二步--開啟 index.html
```
// 現在你可以瀏覽範例網頁了
// 廣告欄位在最下方，包含 RWD
// 以方便測試 on-impression 功能
```

## Usage

### HTML
為了在您的網站中加入廣告，
首先必須在您的 `html` 加入 `sdk.js`。

#### Example
```html
...
<!-- sdk.js -->
<script src="./sdk.js"></script>
...
```

接著在 `html` 加入放置廣告的容器
```javascript
<!-- 您要放置廣告容器 -->
<div id="my-ad"></div>

<!-- sdk.js -->
<script src="./sdk.js"></script>
```

### JavaScript
接著在您的 JavaScript 中呼叫 `getAd(selector, requiredType)`
```javascript
// 在網站加載完成時呼叫
window.onload = function() {
    // 第一個參數 '#my-ad'，為放置廣告的容器的 css selector
    // 第二個參數 'ALL'，為廣告的類型，可接受 'ALL', 'BANNER', 'VIDEO'
    getAd('#my-ad', 'ALL');
    
    // Your code ...
}

// Your code ...
```

現在，
您可以在網站中看到您所放置的廣告了。

## API

### getAd(selector, requiredType) -- 載入廣告
arguments    | type       | required  | description
-------------|------------|-----------|------------
selector     | String     | required  | 指定廣告的容器，必須為合法的 CSS Selector
requiredType | String     | required  | 指定廣告類型，可為 `ALL`、`BANNER`、`VIDEO`

#### Example
```javascript
    window.onload = function() {
        getAd('ad', 'BANNER');
        
        // Your code ...
    }
```

### Custom Event 自訂義事件
也許您會希望在廣告載入或失敗等時機，
呼叫您自己撰寫的函式，
此 sdk 提供了以下幾種事件可供您使用。

Event         |  required  | description
--------------|------------|------------
on-ad-loaded  |  optional  | 廣告載入成功時呼叫
on-ad-failed  |  optional  | 廣告載入失敗時呼叫
on-impression |  optional  | 廣告的 50% 以上在畫面上超過 1 秒時呼叫

#### Example
```javascript
    window.addEventListener('ad-on-loaded', function() {
        // 當廣告載入完成後，就會呼叫此函式 
        // Your code ...
    });
```

```javascript
    window.addEventListener('ad-on-failed', function() {
        // 當廣告載入失敗後，就會呼叫此函式 
        // Your code ...
    });
```

```javascript
    window.addEventListener('ad-impression', function() {
        // 當廣告的 50% 以上在畫面上超過 1 秒後，就會呼叫此函式
        // Your code ...
    });
```