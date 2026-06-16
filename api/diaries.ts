const APP_STORE_URL =
  "https://apps.apple.com/us/app/%ED%82%AC%EB%A7%81%ED%8C%8C%ED%8A%B8-killingpart/id6758883638";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.killingpart.killingpoint&hl=ko";

const DIARY_ID_PATTERN = /^[1-9]\d*$/;

function redirect(location: string) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      "Cache-Control": "no-store"
    }
  });
}

function renderFallbackPage() {
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>KillingPart</title>
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

      a {
        min-height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 14px;
        background: #ceff43;
        color: #090a0f;
        font-weight: 700;
        text-decoration: none;
      }

      a.secondary {
        border: 1px solid rgba(255, 255, 255, 0.16);
        background: #151720;
        color: #f5f7fb;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>킬링파트 앱에서 열기</h1>
      <p>모바일 기기에서 접속하면 스토어로 자동 이동합니다. 데스크톱에서는 아래 버튼으로 앱을 설치해 주세요.</p>
      <div class="buttons">
        <a href="${APP_STORE_URL}">App Store에서 열기</a>
        <a class="secondary" href="${PLAY_STORE_URL}">Google Play에서 열기</a>
      </div>
    </main>
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

  if (isIOS) {
    return redirect(APP_STORE_URL);
  }

  if (isAndroid) {
    return redirect(PLAY_STORE_URL);
  }

  return new Response(renderFallbackPage(), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
