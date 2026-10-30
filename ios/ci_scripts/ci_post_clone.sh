#!/bin/zsh
# Xcode Cloud: a pasta ios/ não vai para o git (é gerada pelo Expo), então
# depois do clone instalamos as dependências e geramos o projeto nativo.
set -euo pipefail

export HOMEBREW_NO_AUTO_UPDATE=1
export HOMEBREW_NO_INSTALL_CLEANUP=1
brew install node cocoapods

cd "$CI_PRIMARY_REPOSITORY_PATH"
npm ci
npx expo prebuild --platform ios --no-install

cd ios
pod install
