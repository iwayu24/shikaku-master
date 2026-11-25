import type { ExamPlugin, Question, ReferenceItem } from '@/types/exam';

const shindanshiPreviewQuestions: Question[] = [
  {
    id: 'shindanshi-fin-001',
    examId: 'shindanshi',
    trackId: 'finance',
    category: '財務指標分析',
    type: 'choice',
    difficulty: 2,
    estimatedSeconds: 90,
    title: 'デュポンシステムによるROE分解（プレビュー問題）',
    prompt:
      'ある中小企業の売上高当期純利益率が4%、総資本回転率が1.5回、財務レバレッジ（総資本÷自己資本）が2.5倍であるとき、この企業の自己資本利益率（ROE）として最も適切なものはどれか。',
    contextTable: {
      title: '対象企業の主要財務指標',
      headers: ['指標', '数値'],
      rows: [
        ['売上高当期純利益率', '4.0%'],
        ['総資本回転率', '1.5回'],
        ['財務レバレッジ（総資本／自己資本）', '2.5倍'],
      ],
    },
    choices: ['10.0%', '12.5%', '15.0%', '18.0%'],
    correctChoiceIndex: 2,
    explanation: {
      summary:
        'ROEは「売上高当期純利益率 × 総資本回転率 × 財務レバレッジ」の3要素に分解できます。4.0% × 1.5 × 2.5 = 15.0% です。',
      steps: [
        'デュポンシステムの公式：ROE ＝ 売上高当期純利益率 × 総資本回転率 × 財務レバレッジ',
        'まずROA（総資本純利益率）を求めると、4.0% × 1.5回 ＝ 6.0%',
        'ROAに財務レバレッジ2.5倍を掛けると、6.0% × 2.5 ＝ 15.0%',
      ],
      calculation: '4.0% × 1.5 × 2.5 = 15.0%',
      examTip:
        '「自己資本比率が40%」と与えられた場合は、財務レバレッジ＝1÷0.4＝2.5倍に換算して掛けます。',
      commonMistake:
        '財務レバレッジの代わりに自己資本比率（0.4）をそのまま掛けて小さくしてしまうミスに注意。',
      relatedTerms: ['ROE（自己資本利益率）', 'ROA（総資本利益率）', '財務レバレッジ'],
      extraBlocks: [
        {
          type: 'formula',
          title: 'デュポンシステム分解式',
          expression: 'ROE = (当期純利益 / 売上高) × (売上高 / 総資本) × (総資本 / 自己資本)',
          note: '収益性・効率性・安全性（レバレッジ）の3視点で経営改善の打ち手を特定できます。',
        },
      ],
    },
    tags: ['プレビュー', 'ROE', 'デュポン分析', '財務指標'],
  },
  {
    id: 'shindanshi-mgmt-001',
    examId: 'shindanshi',
    trackId: 'management',
    category: '経営戦略論',
    type: 'choice',
    difficulty: 1,
    estimatedSeconds: 60,
    title: 'アンゾフの成長マトリクス（プレビュー問題）',
    prompt:
      '既存の主力製品を、これまで取引のなかった新規の地域市場や顧客層へ展開して売上拡大を図る戦略は、アンゾフの成長マトリクスにおいて何と呼ばれるか。',
    choices: ['市場浸透戦略', '新市場開拓戦略', '新製品開発戦略', '多角化戦略'],
    correctChoiceIndex: 1,
    explanation: {
      summary:
        '「既存製品 × 新規市場」の組み合わせは「新市場開拓戦略（市場開拓戦略）」です。',
      steps: [
        'アンゾフの成長マトリクスは「製品（既存／新規）」と「市場（既存／新規）」の2軸で4象限に整理します。',
        '本問は「既存の主力製品」かつ「新規の地域市場・顧客層」なので、新市場開拓戦略が該当します。',
      ],
      examTip:
        '4象限は「既存×既存＝市場浸透」「既存製品×新市場＝新市場開拓」「新製品×既存市場＝新製品開発」「新×新＝多角化」と即答できるようにしましょう。',
      commonMistake:
        '「市場浸透」と「新市場開拓」を混同しやすいので、市場が既存か新規かを必ず確認します。',
      relatedTerms: ['アンゾフの成長マトリクス', '多角化戦略'],
      extraBlocks: [
        {
          type: 'table',
          table: {
            title: 'アンゾフの成長マトリクス（4象限）',
            headers: ['市場 \\ 製品', '既存製品', '新製品'],
            rows: [
              ['既存市場', '市場浸透戦略', '新製品開発戦略'],
              ['新規市場', '新市場開拓戦略', '多角化戦略'],
            ],
          },
        },
      ],
    },
    tags: ['プレビュー', '経営戦略', 'アンゾフ'],
  },
];

const shindanshiPreviewReferences: ReferenceItem[] = [
  {
    id: 'ref-shindanshi-roe',
    examId: 'shindanshi',
    name: 'ROE（自己資本利益率）',
    reading: 'あーるおーいー / じこしほんりえきりつ',
    group: 'finance',
    trackLabel: '財務・会計',
    shortDesc: '株主が投下した自己資本に対して、どれだけ当期純利益を生み出したかを示す収益性指標。',
    detail:
      '当期純利益を自己資本（期首・期末平均または期末値）で除して算出します。デュポンシステムにより「売上高当期純利益率 × 総資本回転率 × 財務レバレッジ」に分解して経営課題を分析できます。',
    formula: 'ROE(%) = 当期純利益 ÷ 自己資本 × 100',
    examTrap: '分子は営業利益や経常利益ではなく「当期純利益」を用います。',
    relatedTerms: ['ROA（総資本利益率）', '財務レバレッジ'],
  },
  {
    id: 'ref-shindanshi-ansoff',
    examId: 'shindanshi',
    name: 'アンゾフの成長マトリクス',
    reading: 'あんぞふのせいちょうまとりくす',
    group: 'management',
    trackLabel: '企業経営理論',
    shortDesc: '製品と市場の「既存・新規」の2軸で企業成長の方向性を4分類するフレームワーク。',
    detail:
      '市場浸透・新市場開拓・新製品開発・多角化の4戦略に分類されます。リスクが最も低いのは市場浸透、最も高いのは多角化です。',
    examTrap: '多角化戦略の4タイプ（水平型・垂直型・集中型・集成型）も頻出です。',
    relatedTerms: ['多角化戦略', 'SWOT分析'],
  },
  {
    id: 'ref-shindanshi-swot',
    examId: 'shindanshi',
    name: 'SWOT分析',
    reading: 'すうぉっとぶんせき',
    group: 'management',
    trackLabel: '企業経営理論',
    shortDesc: '内部環境（強み・弱み）と外部環境（機会・脅威）を整理する戦略策定フレームワーク。',
    detail:
      'Strengths（強み）、Weaknesses（弱み）、Opportunities（機会）、Threats（脅威）の4要素を掛け合わせるクロスSWOT分析により、具体的な経営戦略を導出します。2次試験の事例問題でも必須です。',
    examTrap: '自社のコントロール可能な要因が内部環境（S/W）、市場動向や法改正など外部要因が外部環境（O/T）です。',
    relatedTerms: ['クロスSWOT分析', '3C分析'],
  },
];

export const shindanshiExamPlugin: ExamPlugin = {
  id: 'shindanshi',
  name: '中小企業診断士（1次試験）',
  shortName: '中小企業診断士',
  tagline: '1次試験7科目を体系的に攻略（拡張ブループリント・近日公開）',
  description:
    '中小企業診断士 1次試験の全7科目に対応するためのプラグイン設計。サンプル問題と用語辞典をプレビュー体験できます。',
  status: 'coming-soon',
  accentColor: 'teal',
  tools: [],
  referenceTitle: '経営・財務用語辞典',
  referenceSubtitle: 'フレームワーク・財務指標・法律用語を科目別に検索（プレビュー）',
  tracks: [
    {
      id: 'economics',
      name: '経済学・経済政策',
      shortName: '経済学',
      description: 'ミクロ・マクロ経済学、IS-LM分析、市場均衡と政府介入',
      color: 'sky',
      hexColor: '#0284C7',
      categories: ['ミクロ経済学', 'マクロ経済学'],
    },
    {
      id: 'finance',
      name: '財務・会計',
      shortName: '財務・会計',
      description: '財務諸表分析、CVP、NPV/IRR、企業価値評価・資本コスト',
      color: 'indigo',
      hexColor: '#4F46E5',
      categories: ['財務指標分析', '投資の経済性計算', 'ファイナンス'],
    },
    {
      id: 'management',
      name: '企業経営理論',
      shortName: '企業経営理論',
      description: '経営戦略論、組織論、マーケティング論',
      color: 'emerald',
      hexColor: '#10B981',
      categories: ['経営戦略論', '組織論', 'マーケティング'],
    },
    {
      id: 'operations',
      name: '運営管理',
      shortName: '運営管理',
      description: '生産管理・品質管理・店舗・販売管理・物流',
      color: 'amber',
      hexColor: '#F59E0B',
      categories: ['生産管理', '店舗・販売管理'],
    },
    {
      id: 'law',
      name: '経営法務',
      shortName: '経営法務',
      description: '会社法、知的財産権、民法、契約・倒産法制',
      color: 'rose',
      hexColor: '#F43F5E',
      categories: ['会社法', '知的財産権', '民法・契約'],
    },
    {
      id: 'it',
      name: '経営情報システム',
      shortName: '経営情報',
      description: 'IT基盤、データベース、セキュリティ、システム開発・DX',
      color: 'violet',
      hexColor: '#8B5CF6',
      categories: ['情報技術基礎', 'システム開発・運用'],
    },
    {
      id: 'sme-policy',
      name: '中小企業経営・政策',
      shortName: '中小企業政策',
      description: '中小企業白書、補助金・金融支援、中小企業関連法規',
      color: 'teal',
      hexColor: '#14B8A6',
      categories: ['中小企業経営', '中小企業政策'],
    },
  ],
  questions: shindanshiPreviewQuestions,
  mockExams: [],
  references: shindanshiPreviewReferences,
};
