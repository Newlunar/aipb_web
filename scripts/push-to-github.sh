#!/bin/bash
# GitHub aipb_web 저장소 생성 후 푸시
# 사용법: ./scripts/push-to-github.sh YOUR_GITHUB_USERNAME
# 또는: GITHUB_USER=yourname ./scripts/push-to-github.sh

set -e
USER="${1:-$GITHUB_USER}"
REPO="aipb_web"
URL="https://github.com/${USER}/${REPO}.git"

if [ -z "$USER" ]; then
  echo "사용법: $0 GITHUB_USERNAME"
  echo "예: $0 myusername"
  exit 1
fi

# 저장소 생성 (토큰이 있으면 API로 생성)
if [ -n "$GITHUB_TOKEN" ]; then
  echo "GitHub API로 저장소 생성 중..."
  curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/user/repos -d "{\"name\":\"$REPO\",\"private\":false}" || true
fi

# 원격 설정 및 푸시
git remote remove origin 2>/dev/null || true
git remote add origin "$URL"
echo "원격: $URL"
git push -u origin master
