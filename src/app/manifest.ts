import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'シカクマスター / ShikakuMaster',
    short_name: 'シカクマスター',
    description:
      '日商簿記2級・3級をはじめとする資格合格のためのモバイルファースト学習＆模擬テストアプリ',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#4F46E5',
    lang: 'ja',
  };
}
