export interface Artwork {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  year: number;
  createdAt: string;
}

export const sampleArtworks: Artwork[] = [
  {
    id: "1",
    title: "푸른 풍경",
    description: "평화로운 자연의 풍경을 담은 작품입니다.",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    year: 2026,
    createdAt: "2026-03-15",
  },
  {
    id: "2",
    title: "도시의 밤",
    description: "화려한 도시의 야경을 그린 작품입니다.",
    imageUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785",
    year: 2026,
    createdAt: "2026-02-20",
  },
  {
    id: "3",
    title: "꽃과 봄",
    description: "봄의 시작을 알리는 아름다운 꽃들입니다.",
    imageUrl: "https://images.unsplash.com/photo-1490750967868-88aa4486c946",
    year: 2025,
    createdAt: "2025-04-10",
  },
  {
    id: "4",
    title: "추상적 사고",
    description: "자유로운 상상력을 표현한 추상화입니다.",
    imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262",
    year: 2025,
    createdAt: "2025-09-05",
  },
  {
    id: "5",
    title: "바다의 고요",
    description: "잔잔한 파도와 넓은 수평선을 담았습니다.",
    imageUrl: "https://images.unsplash.com/photo-1505142468610-359e7d316be0",
    year: 2024,
    createdAt: "2024-07-22",
  },
  {
    id: "6",
    title: "산의 장엄함",
    description: "웅장한 산맥의 모습을 그린 작품입니다.",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    year: 2024,
    createdAt: "2024-11-30",
  },
];
