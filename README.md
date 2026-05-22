# 킬링파트 다운로드 QR 라우팅 페이지

이 프로젝트는 하나의 QR 코드로 `/download` 페이지에 먼저 접속시킨 뒤, 접속 기기에 따라 스토어로 자동 이동하도록 구성되어 있습니다.

- iPhone / iPad / iPod: App Store 자동 이동
- Android: Google Play 자동 이동
- PC / Mac / 기타: 자동 이동 없이 수동 버튼 2개 제공

## 1) 다운로드 페이지

- 파일: `/download/index.html`
- 실제 QR에는 스토어 링크가 아니라 반드시 `/download` URL만 넣어야 합니다.
  - 예: `https://내도메인.com/download`

### 기기 판별 로직

- iOS 판별:
  - `iPhone|iPad|iPod` User-Agent 매칭
  - 또는 `navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1` (iPadOS 위장 대응)
- Android 판별:
  - `/Android/i`
- 그 외:
  - 자동 이동하지 않고 버튼 안내

## 2) QR 생성 방법

### 설치

```bash
npm install
```

### 환경변수 설정 후 생성

```bash
DOWNLOAD_URL="https://내도메인.com/download" npm run generate:qr
```

생성 결과:

- `killingpart-download-qr.png`

`DOWNLOAD_URL`이 비어 있으면 스크립트가 에러를 내고 종료합니다.

## 3) 배포 시 주의사항

- 정적 호스팅에서 `/download/index.html`이 `https://내도메인.com/download`로 접근 가능해야 합니다.
- QR에는 반드시 `/download` 경로를 넣으세요.
- 스토어 링크는 다운로드 페이지 내부에서만 사용됩니다.

## 4) Vercel Analytics 적용

`/download/index.html`에 Vercel Analytics 스니펫이 포함되어 있습니다.

```html
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

대시보드에서 아래를 진행해야 실제 수집이 시작됩니다.

1. Vercel 프로젝트 접속
2. `Analytics` 탭으로 이동
3. `Enable Analytics` 클릭
4. 필요 시 재배포(또는 새 커밋 푸시) 후 반영 확인

QR 접속 사용자 확인 방법:

- QR URL을 `https://.../download`로 유지하면, Analytics에서 `/download` 페이지뷰로 집계됩니다.
- Vercel 대시보드의 Analytics 화면에서 시간대별 방문 추이를 확인하세요.

## 5) 테스트 방법

아래 시나리오를 각각 확인하세요.

1. iPhone Safari에서 `/download` 접속 시 App Store로 자동 이동
2. Android Chrome에서 `/download` 접속 시 Google Play로 자동 이동
3. PC Chrome에서 `/download` 접속 시 App Store/Google Play 버튼 2개 표시
4. iPadOS 위장 조건(`MacIntel` + `maxTouchPoints > 1`)에서 iOS로 분류되어 App Store 이동
5. 자동 이동 실패/차단 상황에서도 수동 버튼으로 설치 가능
6. 생성된 QR 스캔 시 URL이 반드시 `/download`인지 확인
