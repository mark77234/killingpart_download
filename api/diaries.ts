const APP_STORE_URL =
  "https://apps.apple.com/us/app/%ED%82%AC%EB%A7%81%ED%8C%8C%ED%8A%B8-killingpart/id6758883638";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.killingpart.killingpoint&hl=ko";
const ANDROID_PACKAGE_NAME = "com.killingpart.killingpoint";
const APP_SCHEME = "killingpart";
const STORE_FALLBACK_DELAY_MS = 1500;

const DIARY_ID_PATTERN = /^[1-9]\d*$/;

type DevicePlatform = "ios" | "android" | "other";
type InAppBrowser = "kakao" | "instagram";

const IN_APP_BROWSER_LABELS: Record<InAppBrowser, string> = {
  kakao: "카카오톡",
  instagram: "인스타그램"
};

function detectInAppBrowser(userAgent: string): InAppBrowser | null {
  if (/KAKAOTALK/i.test(userAgent)) {
    return "kakao";
  }

  if (/Instagram|FBAN\/Instagram/i.test(userAgent)) {
    return "instagram";
  }

  return null;
}

function redirect(location: string) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      "Cache-Control": "no-store"
    }
  });
}

function renderFallbackPage({
  diaryId,
  platform,
  inAppBrowser
}: {
  diaryId: string;
  platform: DevicePlatform;
  inAppBrowser: InAppBrowser | null;
}) {
  const showOpenAppButton = inAppBrowser !== null && platform !== "other";
  const customSchemeUrl = `${APP_SCHEME}://diaries/${diaryId}`;
  const androidIntentUrl = `intent://diaries/${diaryId}#Intent;scheme=${APP_SCHEME};package=${ANDROID_PACKAGE_NAME};S.browser_fallback_url=${encodeURIComponent(
    PLAY_STORE_URL
  )};end`;
  const appOpenUrl = platform === "android" ? androidIntentUrl : customSchemeUrl;
  const storeUrl = platform === "android" ? PLAY_STORE_URL : APP_STORE_URL;
  const description = showOpenAppButton
    ? `${IN_APP_BROWSER_LABELS[inAppBrowser]} 안에서는 앱이 바로 열리지 않을 수 있습니다. 아래 버튼을 눌러 킬링파트 앱에서 이어서 확인해 주세요.`
    : "모바일 기기에서 접속하면 스토어로 자동 이동합니다. 데스크톱에서는 아래 버튼으로 앱을 설치해 주세요.";
  const openAppButton = showOpenAppButton
    ? `<button id="openAppButton" type="button">앱에서 열기</button>
        <p id="openAppStatus" class="status" aria-live="polite"></p>`
    : "";
  const openAppScript = showOpenAppButton
    ? `<script>
      (function () {
        var openAppButton = document.getElementById("openAppButton");
        var statusEl = document.getElementById("openAppStatus");
        if (!openAppButton || !statusEl) return;

        var appOpenUrl = ${JSON.stringify(appOpenUrl)};
        var storeUrl = ${JSON.stringify(storeUrl)};
        var fallbackDelay = ${STORE_FALLBACK_DELAY_MS};
        var fallbackTimer = null;

        function clearFallbackTimer() {
          if (!fallbackTimer) return;
          clearTimeout(fallbackTimer);
          fallbackTimer = null;
        }

        function cancelFallbackIfAppOpened() {
          clearFallbackTimer();
        }

        document.addEventListener("visibilitychange", function () {
          if (document.hidden) {
            cancelFallbackIfAppOpened();
          }
        });
        window.addEventListener("pagehide", cancelFallbackIfAppOpened);

        openAppButton.addEventListener("click", function () {
          clearFallbackTimer();
          statusEl.textContent =
            "앱을 여는 중입니다. 앱이 열리지 않으면 스토어로 이동합니다.";

          window.location.href = appOpenUrl;

          fallbackTimer = setTimeout(function () {
            window.location.href = storeUrl;
          }, fallbackDelay);
        });
      })();
    </script>`
    : "";

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>KillingPart</title>
    <link rel="icon" type="image/png" href="/resources/icon/ic_KillingPart.png" />
    <link rel="icon" type="image/png" href="/resources/icon/ic_dark_KillingPart.png" media="(prefers-color-scheme: dark)" />
    <link rel="apple-touch-icon" href="/resources/icon/ic_alpha_KillingPart.png" />
    <style>
      * {
        box-sizing: border-box;
      }

      body {
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
        padding: 32px 20px;
        font-family:
          -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo",
          "Noto Sans KR", "Malgun Gothic", sans-serif;
        color: #f5f7fb;
        background: #090a0f;
      }

      main {
        width: min(480px, 100%);
      }

      h1 {
        margin: 0;
        font-size: 2rem;
        line-height: 1.25;
      }

      p {
        margin: 14px 0 24px;
        color: #a2a8b6;
        line-height: 1.6;
      }

      .buttons {
        display: grid;
        gap: 12px;
      }

      a,
      button {
        min-height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        border: 0;
        border-radius: 14px;
        background: #ceff43;
        color: #090a0f;
        font: inherit;
        font-weight: 700;
        text-decoration: none;
        cursor: pointer;
      }

      a.secondary,
      button.secondary {
        border: 1px solid rgba(255, 255, 255, 0.16);
        background: #151720;
        color: #f5f7fb;
      }

      .status {
        min-height: 1.4em;
        margin: 12px 0 0;
        font-size: 0.94rem;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>킬링파트 앱에서 열기</h1>
      <p>${description}</p>
      <div class="buttons">
        ${openAppButton}
        <a href="${APP_STORE_URL}">App Store에서 열기</a>
        <a class="secondary" href="${PLAY_STORE_URL}">Google Play에서 열기</a>
      </div>
    </main>
    ${openAppScript}
  </body>
</html>`;
}

export function GET(request: Request) {
  const url = new URL(request.url);
  const diaryId = url.searchParams.get("diaryId") || "";

  if (!DIARY_ID_PATTERN.test(diaryId)) {
    return new Response("Not Found", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
  }

  const userAgent = request.headers.get("user-agent") || "";
  const isIOS =
    /iPhone|iPad|iPod/i.test(userAgent) ||
    (/Macintosh/i.test(userAgent) && /Mobile/i.test(userAgent));
  const isAndroid = /Android/i.test(userAgent);
  const inAppBrowser = detectInAppBrowser(userAgent);
  const platform: DevicePlatform = isIOS
    ? "ios"
    : isAndroid
      ? "android"
      : "other";

  if (inAppBrowser) {
    return new Response(
      renderFallbackPage({
        diaryId,
        platform,
        inAppBrowser
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store"
        }
      }
    );
  }

  if (isIOS) {
    return redirect(APP_STORE_URL);
  }

  if (isAndroid) {
    return redirect(PLAY_STORE_URL);
  }

  return new Response(
    renderFallbackPage({
      diaryId,
      platform,
      inAppBrowser: null
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store"
      }
    }
  );
}
