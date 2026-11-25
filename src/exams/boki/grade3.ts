import type { Question } from '@/types/exam';

export const grade3Questions: Question[] = [
  // =========================================================================
  // 1. 商品売買 (boki-3k-001 .. boki-3k-006): 5 journal + 1 choice
  // =========================================================================
  {
    id: 'boki-3k-001',
    examId: 'boki',
    trackId: '3kyu',
    category: '商品売買',
    type: 'journal',
    difficulty: 1,
    estimatedSeconds: 60,
    title: '三分法による掛け仕入と仕入諸掛（引取運賃）',
    prompt:
      '商品¥120,000を掛けで仕入れた。なお、当社負担の引取運賃¥4,000は現金で支払った。三分法による仕訳を行いなさい。',
    journalSpec: {
      debitSlots: 1,
      creditSlots: 2,
      accountChoices: ['仕入', '繰越商品', '発送費', '買掛金', '現金', '未払金'],
      amountChoices: [4000, 116000, 120000, 124000, 128000],
      correctDebit: [{ account: '仕入', amount: 124000 }],
      correctCredit: [
        { account: '買掛金', amount: 120000 },
        { account: '現金', amount: 4000 },
      ],
    },
    explanation: {
      summary:
        '商品仕入時に当社が負担する引取運賃（仕入諸掛）は、独立した費用にせず「仕入」勘定の取得原価に含めます。',
      steps: [
        '商品本体代価¥120,000と当社負担の引取運賃¥4,000を合算し、借方に「仕入 ¥124,000」を計上します。',
        '商品本体は掛け取引なので、貸方に負債の増加として「買掛金 ¥120,000」を記入します。',
        '引取運賃は現金で支払ったため、貸方に資産の減少として「現金 ¥4,000」を記入します。',
      ],
      calculation: '仕入原価 = 商品代価 ¥120,000 + 引取運賃 ¥4,000 = ¥124,000',
      journalBreakdown: {
        debit: [{ account: '仕入', amount: 124000, element: 'expense', direction: 'increase' }],
        credit: [
          { account: '買掛金', amount: 120000, element: 'liability', direction: 'increase' },
          { account: '現金', amount: 4000, element: 'asset', direction: 'decrease' },
        ],
      },
      examTip:
        '「仕入時の当社負担運賃＝仕入に含める」「売上時の当社負担運賃＝発送費にする」をセットで記憶しましょう。',
      commonMistake:
        '引取運賃¥4,000を「発送費」として別建て計上してしまうミスが非常に多いので要注意です。',
      relatedTerms: ['仕入', '買掛金', '現金', '発送費'],
    },
    tags: ['三分法', '掛け仕入', '仕入諸掛', '引取運賃'],
  },
  {
    id: 'boki-3k-002',
    examId: 'boki',
    trackId: '3kyu',
    category: '商品売買',
    type: 'journal',
    difficulty: 1,
    estimatedSeconds: 45,
    title: '掛け販売した商品の返品（売上戻り）',
    prompt:
      '先日、得意先へ掛けで販売した商品¥200,000のうち、品違いのため¥35,000分が返品された。このときの仕訳を行いなさい。',
    journalSpec: {
      debitSlots: 1,
      creditSlots: 1,
      accountChoices: ['売上', '売掛金', '仕入', '買掛金', '現金'],
      amountChoices: [35000, 165000, 200000, 235000],
      correctDebit: [{ account: '売上', amount: 35000 }],
      correctCredit: [{ account: '売掛金', amount: 35000 }],
    },
    explanation: {
      summary:
        '商品の返品（売上戻り）があったときは、売上時の仕訳（売掛金／売上）とちょうど逆の仕訳を返品額で行います。',
      steps: [
        '販売時の仕訳は「借方：売掛金 ／ 貸方：売上」でした。',
        '¥35,000分が返品されたため、収益を取り消すために借方に「売上 ¥35,000」を記入します。',
        '得意先への請求権も同額減るため、貸方に「売掛金 ¥35,000」を記入します。',
      ],
      journalBreakdown: {
        debit: [{ account: '売上', amount: 35000, element: 'revenue', direction: 'decrease' }],
        credit: [{ account: '売掛金', amount: 35000, element: 'asset', direction: 'decrease' }],
      },
      examTip:
        '返品（仕入戻し・売上戻り）は迷わず「元の仕訳の逆仕訳」を返品金額だけで切ればOKです！',
      commonMistake:
        '元の売上金額¥200,000から返品額を引いた残額（¥165,000）で仕訳してしまう誤りに注意。',
      relatedTerms: ['売上', '売掛金', '仕入'],
    },
    tags: ['三分法', '売上戻り', '返品'],
  },
  {
    id: 'boki-3k-003',
    examId: 'boki',
    trackId: '3kyu',
    category: '商品売買',
    type: 'journal',
    difficulty: 2,
    estimatedSeconds: 60,
    title: '商品の掛け販売と当社負担の発送費',
    prompt:
      '商品¥280,000を掛けで販売し、当社負担の発送費¥4,500を現金で支払った。このときの仕訳を行いなさい。',
    journalSpec: {
      debitSlots: 2,
      creditSlots: 2,
      accountChoices: ['売掛金', '発送費', '立替金', '売上', '現金', '仕入'],
      amountChoices: [4500, 275500, 280000, 284500],
      correctDebit: [
        { account: '売掛金', amount: 280000 },
        { account: '発送費', amount: 4500 },
      ],
      correctCredit: [
        { account: '売上', amount: 280000 },
        { account: '現金', amount: 4500 },
      ],
    },
    explanation: {
      summary:
        '商品販売時に当社が負担する発送運賃（売上諸掛）は、売上から控除せず借方に「発送費」として費用計上します。',
      steps: [
        '商品¥280,000の掛け販売について「借方：売掛金 ¥280,000 ／ 貸方：売上 ¥280,000」を記録します。',
        '当社負担の発送費¥4,500は販売に伴う費用なので、借方に「発送費 ¥4,500」を計上します。',
        '発送費は現金で支払ったため、貸方に「現金 ¥4,500」を記入します。',
      ],
      journalBreakdown: {
        debit: [
          { account: '売掛金', amount: 280000, element: 'asset', direction: 'increase' },
          { account: '発送費', amount: 4500, element: 'expense', direction: 'increase' },
        ],
        credit: [
          { account: '売上', amount: 280000, element: 'revenue', direction: 'increase' },
          { account: '現金', amount: 4500, element: 'asset', direction: 'decrease' },
        ],
      },
      examTip:
        'もし「先方負担」だった場合は、発送費ではなく「立替金」（または指示により「売掛金」）で処理します。',
      commonMistake:
        '発送費を売掛金に含めて¥284,500にしてしまうのは「先方負担」の処理と混同した典型的なミスです。',
      relatedTerms: ['発送費', '売掛金', '売上', '立替金'],
    },
    tags: ['売上諸掛', '発送費', '当社負担'],
  },
  {
    id: 'boki-3k-004',
    examId: 'boki',
    trackId: '3kyu',
    category: '商品売買',
    type: 'journal',
    difficulty: 2,
    estimatedSeconds: 70,
    title: 'クレジット売掛金と支払手数料の計上',
    prompt:
      '商品¥150,000をクレジット払いの条件で販売した。なお、信販会社への決済手数料（販売代金の4%）は販売時に認識する。',
    journalSpec: {
      debitSlots: 2,
      creditSlots: 1,
      accountChoices: [
        'クレジット売掛金',
        '売掛金',
        '支払手数料',
        '売上',
        '現金',
        '未収入金',
      ],
      amountChoices: [6000, 144000, 150000, 156000],
      correctDebit: [
        { account: 'クレジット売掛金', amount: 144000 },
        { account: '支払手数料', amount: 6000 },
      ],
      correctCredit: [{ account: '売上', amount: 150000 }],
    },
    explanation: {
      summary:
        'クレジット販売では総額を「売上」とし、信販会社手数料を「支払手数料」、差額を「クレジット売掛金」として計上します。',
      steps: [
        '信販会社への決済手数料を計算します：¥150,000 × 4% ＝ ¥6,000。',
        '後日信販会社から入金される金額は手数料差引後の¥144,000なので、借方に「クレジット売掛金 ¥144,000」を計上します。',
        '手数料¥6,000は借方に「支払手数料」、販売代金総額¥150,000は貸方に「売上」を計上します。',
      ],
      calculation:
        '支払手数料 = ¥150,000 × 4% = ¥6,000 ／ クレジット売掛金 = ¥150,000 − ¥6,000 = ¥144,000',
      journalBreakdown: {
        debit: [
          { account: 'クレジット売掛金', amount: 144000, element: 'asset', direction: 'increase' },
          { account: '支払手数料', amount: 6000, element: 'expense', direction: 'increase' },
        ],
        credit: [{ account: '売上', amount: 150000, element: 'revenue', direction: 'increase' }],
      },
      examTip:
        '売上は必ず「手数料を引く前の総額」で計上します。通常の「売掛金」と「クレジット売掛金」を区別しましょう。',
      commonMistake:
        '手数料を引いた¥144,000だけを「クレジット売掛金／売上」にしてしまい、支払手数料を計上し忘れるミスに注意。',
      relatedTerms: ['クレジット売掛金', '支払手数料', '売上', '売掛金'],
    },
    tags: ['クレジット売掛金', '支払手数料', '商品売買'],
  },
  {
    id: 'boki-3k-005',
    examId: 'boki',
    trackId: '3kyu',
    category: '商品売買',
    type: 'journal',
    difficulty: 2,
    estimatedSeconds: 60,
    title: '前受金を受け取っていた商品の引渡し',
    prompt:
      '得意先に商品¥220,000を引き渡し、代金のうち注文時に受け取っていた手付金¥50,000を充当し、残額は掛けとした。',
    journalSpec: {
      debitSlots: 2,
      creditSlots: 1,
      accountChoices: ['前受金', '前払金', '売掛金', '売上', '現金', '買掛金'],
      amountChoices: [50000, 170000, 220000, 270000],
      correctDebit: [
        { account: '前受金', amount: 50000 },
        { account: '売掛金', amount: 170000 },
      ],
      correctCredit: [{ account: '売上', amount: 220000 }],
    },
    explanation: {
      summary:
        '商品を引き渡した時点で総額を「売上」とし、先に受け取っていた「前受金（負債）」を借方で取り崩します。',
      steps: [
        '商品¥220,000を引き渡したため、貸方に収益の増加として「売上 ¥220,000」を計上します。',
        '手付金受領時に貸方に計上していた「前受金 ¥50,000」を、引渡しにより消滅させるため借方に記入します。',
        '差額の¥170,000（¥220,000 − ¥50,000）は掛けとしたため、借方に「売掛金 ¥170,000」を計上します。',
      ],
      calculation: '売掛金 = 売上総額 ¥220,000 − 前受金充当額 ¥50,000 = ¥170,000',
      journalBreakdown: {
        debit: [
          { account: '前受金', amount: 50000, element: 'liability', direction: 'decrease' },
          { account: '売掛金', amount: 170000, element: 'asset', direction: 'increase' },
        ],
        credit: [{ account: '売上', amount: 220000, element: 'revenue', direction: 'increase' }],
      },
      examTip:
        '「前払金＝仕入側（資産）」「前受金＝売上側（負債）」と立場を即座に整理するのがコツです。',
      commonMistake:
        '前受金と前払金を取り違えたり、残額¥170,000だけを売上にしてしまう誤りがよくあります。',
      relatedTerms: ['前受金', '前払金', '売掛金', '売上'],
    },
    tags: ['前受金', '手付金', '商品売買'],
  },
  {
    id: 'boki-3k-006',
    examId: 'boki',
    trackId: '3kyu',
    category: '商品売買',
    type: 'choice',
    difficulty: 2,
    estimatedSeconds: 75,
    title: '仕入諸掛・売上諸掛（当社負担／先方負担）の処理',
    prompt:
      '商品売買に伴う運賃（諸掛）の会計処理に関する記述として、最も適切なものはどれか。',
    choices: [
      '商品を仕入れた際の当社負担の引取運賃は、「発送費」勘定で費用処理する。',
      '商品を販売した際の先方負担の発送運賃を当社が現金で立て替えた場合は、「発送費」勘定の借方に記入する。',
      '商品を販売した際の先方負担の発送運賃を当社が現金で立て替えた場合は、「立替金」勘定（または指示により「売掛金」勘定）の借方に記入する。',
      '商品を仕入れた際の先方負担の引取運賃を当社が現金で立て替えた場合は、「仕入」勘定に加算する。',
    ],
    correctChoiceIndex: 2,
    explanation: {
      summary:
        '先方負担の運賃を立て替えた場合は当社の費用にならないため、売上時は「立替金（または売掛金）」、仕入時は「立替金（または買掛金からの控除）」で処理します。',
      steps: [
        '仕入時・当社負担の引取運賃 → 「仕入」に含める（選択肢1は誤り）。',
        '売上時・当社負担の発送運賃 → 「発送費」で費用処理する。',
        '売上時・先方負担の発送運賃を立替払い → 「立替金」または指示により「売掛金」の借方に計上する（選択肢3が正解）。',
        '仕入時・先方負担の引取運賃を立替払い → 当社負担ではないので仕入には含めず「立替金」または「買掛金」の減少とする（選択肢4は誤り）。',
      ],
      examTip:
        '「誰が負担するのか（当社 or 先方）」と「仕入か売上か」の2×2マトリクスで整理すれば100%迷いません！',
      commonMistake:
        '現金を支払った事実だけに引っ張られて、先方負担の運賃まで「発送費」や「仕入」にしてしまうミスに注意。',
      relatedTerms: ['仕入', '発送費', '立替金', '売掛金'],
      extraBlocks: [
        {
          type: 'table',
          table: {
            title: '運賃（諸掛）の処理パターン一覧',
            headers: ['取引', '当社負担', '先方負担（立替払い時）'],
            rows: [
              ['商品仕入時', '仕入に含める', '立替金（または買掛金の減少）'],
              ['商品販売時', '発送費（費用）', '立替金（または売掛金の増加）'],
            ],
          },
        },
      ],
    },
    tags: ['仕入諸掛', '売上諸掛', '発送費', '立替金'],
  },

  // =========================================================================
  // 2. 現金・預金 (boki-3k-007 .. boki-3k-012): 5 journal + 1 choice
  // =========================================================================
  {
    id: 'boki-3k-007',
    examId: 'boki',
    trackId: '3kyu',
    category: '現金・預金',
    type: 'journal',
    difficulty: 1,
    estimatedSeconds: 50,
    title: '現金過不足の計上（期中での不足発見）',
    prompt:
      '期中において現金の実際有高を数えたところ¥81,500であったが、現金出納帳の帳簿残高は¥85,000であった。原因は不明である。このときの仕訳を行いなさい。',
    journalSpec: {
      debitSlots: 1,
      creditSlots: 1,
      accountChoices: ['現金過不足', '現金', '雑損', '雑益', '仮払金'],
      amountChoices: [3500, 81500, 85000, 166500],
      correctDebit: [{ account: '現金過不足', amount: 3500 }],
      correctCredit: [{ account: '現金', amount: 3500 }],
    },
    explanation: {
      summary:
        '期中に現金の帳簿残高と実際有高にズレが生じたら、帳簿残高を実際有高に合わせ、差額を「現金過不足」勘定に記録します。',
      steps: [
        '帳簿残高¥85,000に対して実際有高¥81,500なので、手元の現金が¥3,500少ない（不足）状態です。',
        '帳簿残高を実際有高¥81,500へ減らすため、貸方に「現金 ¥3,500」を記入します。',
        '期中であり原因がまだ不明なので、相手勘定は借方に「現金過不足 ¥3,500」とします。',
      ],
      calculation: '現金不足額 = 帳簿残高 ¥85,000 − 実際有高 ¥81,500 = ¥3,500',
      journalBreakdown: {
        debit: [{ account: '現金過不足', amount: 3500, element: 'asset', direction: 'increase' }],
        credit: [{ account: '現金', amount: 3500, element: 'asset', direction: 'decrease' }],
      },
      examTip:
        '「まず現金（帳簿）を実際に合わせる！」と決めれば、貸借の向きを絶対に間違えません。期中なら現金過不足、決算日なら直接「雑損／雑益」です。',
      commonMistake:
        '期中発見なのにいきなり「雑損」を使ってしまうミス、および不足なのに現金を借方に増やしてしまうミスに注意。',
      relatedTerms: ['現金過不足', '現金', '雑損', '雑益'],
    },
    tags: ['現金過不足', '現金', '期中処理'],
  },
  {
    id: 'boki-3k-008',
    examId: 'boki',
    trackId: '3kyu',
    category: '現金・預金',
    type: 'journal',
    difficulty: 2,
    estimatedSeconds: 60,
    title: '当座預金と当座借越（決算時の振替）',
    prompt:
      '銀行と当座借越契約（限度額¥300,000）を結んでおり、期中は当座預金勘定のみで処理している。決算において当座預金勘定の残高が貸方残高¥70,000となっていたため、適切な勘定に振り替えた。',
    journalSpec: {
      debitSlots: 1,
      creditSlots: 1,
      accountChoices: ['当座預金', '当座借越', '借入金', '普通預金', '現金'],
      amountChoices: [70000, 230000, 300000, 370000],
      correctDebit: [{ account: '当座預金', amount: 70000 }],
      correctCredit: [{ account: '当座借越', amount: 70000 }],
    },
    explanation: {
      summary:
        '当座預金勘定の貸方残高（マイナス残高）は実質的に銀行からの借入であるため、決算時に負債の「当座借越」勘定へ振り替えます。',
      steps: [
        '当座預金勘定に貸方残高¥70,000があるということは、預金残高を超えて¥70,000引き出している（借越）状態です。',
        '当座預金勘定の貸方残高をゼロにするため、借方に「当座預金 ¥70,000」を記入します。',
        '負債としての実態を示すため、貸方に「当座借越 ¥70,000」を計上します（なお貸借対照表上は「短期借入金」等として表示されます）。',
      ],
      journalBreakdown: {
        debit: [{ account: '当座預金', amount: 70000, element: 'asset', direction: 'increase' }],
        credit: [
          { account: '当座借越', amount: 70000, element: 'liability', direction: 'increase' },
        ],
      },
      examTip:
        '契約限度額（¥300,000）は仕訳金額には使わないダミー情報です。実際に借り越した金額（¥70,000）だけを振り替えます！',
      commonMistake:
        '限度額から差し引いた¥230,000を使ってしまったり、借方と貸方を逆にしてしまうミスに注意。',
      relatedTerms: ['当座預金', '当座借越', '借入金'],
    },
    tags: ['当座預金', '当座借越', '決算振替'],
  },
  {
    id: 'boki-3k-009',
    examId: 'boki',
    trackId: '3kyu',
    category: '現金・預金',
    type: 'journal',
    difficulty: 2,
    estimatedSeconds: 65,
    title: '小口現金の支払報告と即時補給（インプレスト・システム）',
    prompt:
      '定額資金前渡制度（インプレスト・システム）を採用している。月末に小口現金係から、旅費交通費¥12,000および消耗品費¥8,000の支払報告を受け、直ちに小切手を振り出して同額を補給した。',
    journalSpec: {
      debitSlots: 2,
      creditSlots: 1,
      accountChoices: ['旅費交通費', '消耗品費', '小口現金', '当座預金', '現金', '普通預金'],
      amountChoices: [8000, 12000, 20000, 30000],
      correctDebit: [
        { account: '旅費交通費', amount: 12000 },
        { account: '消耗品費', amount: 8000 },
      ],
      correctCredit: [{ account: '当座預金', amount: 20000 }],
    },
    explanation: {
      summary:
        '小口現金の支払報告と小切手による補給が同時に行われた場合、小口現金の増減が相殺されるため、貸方は直接「当座預金」となります。',
      steps: [
        '本来、報告時は「旅費交通費 12,000・消耗品費 8,000 ／ 小口現金 20,000」となります。',
        '同時に補給時は「小口現金 20,000 ／ 当座預金 20,000」となります。',
        '両者の「小口現金 ¥20,000」が借方・貸方で相殺されるため、合算すると借方「旅費交通費 12,000」「消耗品費 8,000」、貸方「当座預金 20,000」となります。',
      ],
      calculation: '補給合計額 = 旅費交通費 ¥12,000 + 消耗品費 ¥8,000 = ¥20,000',
      journalBreakdown: {
        debit: [
          { account: '旅費交通費', amount: 12000, element: 'expense', direction: 'increase' },
          { account: '消耗品費', amount: 8000, element: 'expense', direction: 'increase' },
        ],
        credit: [{ account: '当座預金', amount: 20000, element: 'asset', direction: 'decrease' }],
      },
      examTip:
        '「報告のみ（補給は後日）」なら貸方は「小口現金」、「直ちに小切手で補給」なら貸方は「当座預金」と文末を必ずチェック！',
      commonMistake:
        '小切手を振り出したのに貸方を「小口現金」や「現金」にしてしまうミスが非常に多いです。',
      relatedTerms: ['小口現金', '当座預金', '消耗品費'],
    },
    tags: ['小口現金', 'インプレストシステム', '当座預金'],
  },
  {
    id: 'boki-3k-010',
    examId: 'boki',
    trackId: '3kyu',
    category: '現金・預金',
    type: 'journal',
    difficulty: 1,
    estimatedSeconds: 50,
    title: '普通預金からの買掛金振込と振込手数料',
    prompt:
      '仕入先に対する買掛金¥160,000を普通預金口座から振り込んで支払った。なお、振込手数料¥660は当社負担として同時に普通預金口座から引き落とされた。',
    journalSpec: {
      debitSlots: 2,
      creditSlots: 1,
      accountChoices: ['買掛金', '支払手数料', '普通預金', '当座預金', '現金', '仕入'],
      amountChoices: [660, 159340, 160000, 160660],
      correctDebit: [
        { account: '買掛金', amount: 160000 },
        { account: '支払手数料', amount: 660 },
      ],
      correctCredit: [{ account: '普通預金', amount: 160660 }],
    },
    explanation: {
      summary:
        '振込手数料を当社が負担した場合、「支払手数料」を借方に計上し、買掛金との合計額を普通預金から減少させます。',
      steps: [
        '買掛金¥160,000を支払ったため、負債の減少として借方に「買掛金 ¥160,000」を記入します。',
        '当社負担の振込手数料¥660は、費用の発生として借方に「支払手数料 ¥660」を記入します。',
        '普通預金口座からは合計¥160,660が引き落とされるため、貸方に「普通預金 ¥160,660」を計上します。',
      ],
      calculation: '普通預金減少額 = 買掛金 ¥160,000 + 振込手数料 ¥660 = ¥160,660',
      journalBreakdown: {
        debit: [
          { account: '買掛金', amount: 160000, element: 'liability', direction: 'decrease' },
          { account: '支払手数料', amount: 660, element: 'expense', direction: 'increase' },
        ],
        credit: [{ account: '普通預金', amount: 160660, element: 'asset', direction: 'decrease' }],
      },
      examTip:
        'もし「先方負担の振込手数料を買掛金から差し引いて振り込んだ」場合は、手数料の仕訳は不要で「買掛金 160,000 ／ 普通預金 159,340・（差引）なし」ではなく実際振込額＋先方負担分が買掛金消滅になります（問題文の負担者を要確認）。',
      commonMistake:
        '普通預金の減少額を¥160,000のままにして貸借が合わなくなったり、振込手数料を「仕入」に含めてしまうミスに注意。',
      relatedTerms: ['普通預金', '買掛金', '支払手数料'],
    },
    tags: ['普通預金', '振込手数料', '支払手数料'],
  },
  {
    id: 'boki-3k-011',
    examId: 'boki',
    trackId: '3kyu',
    category: '現金・預金',
    type: 'journal',
    difficulty: 2,
    estimatedSeconds: 55,
    title: '定期預金の満期到来と受取利息',
    prompt:
      '銀行に預け入れていた定期預金¥1,000,000が満期となり、元本と利息¥4,000（税金は無視する）が普通預金口座に預け入れられた。',
    journalSpec: {
      debitSlots: 1,
      creditSlots: 2,
      accountChoices: ['普通預金', '定期預金', '受取利息', '当座預金', '現金', '支払利息'],
      amountChoices: [4000, 996000, 1000000, 1004000],
      correctDebit: [{ account: '普通預金', amount: 1004000 }],
      correctCredit: [
        { account: '定期預金', amount: 1000000 },
        { account: '受取利息', amount: 4000 },
      ],
    },
    explanation: {
      summary:
        '定期預金の満期払戻しでは、普通預金が元利合計額だけ増加し、定期預金（元本）の減少と受取利息（収益）の発生を記録します。',
      steps: [
        '普通預金口座に元本¥1,000,000＋利息¥4,000＝¥1,004,000が入金されたため、借方に「普通預金 ¥1,004,000」を計上します。',
        '満期により定期預金が解約されるため、貸方に資産の減少として「定期預金 ¥1,000,000」を記入します。',
        '受け取った利息は収益の発生なので、貸方に「受取利息 ¥4,000」を計上します。',
      ],
      calculation: '普通預金入金額 = 元本 ¥1,000,000 + 利息 ¥4,000 = ¥1,004,000',
      journalBreakdown: {
        debit: [{ account: '普通預金', amount: 1004000, element: 'asset', direction: 'increase' }],
        credit: [
          { account: '定期預金', amount: 1000000, element: 'asset', direction: 'decrease' },
          { account: '受取利息', amount: 4000, element: 'revenue', direction: 'increase' },
        ],
      },
      examTip:
        '預金口座間の移動は「増えた口座が借方、減った口座が貸方」とシンプルに考えましょう。',
      commonMistake:
        '元本だけ振り替えて利息を忘れたり、「支払利息」と誤って選択してしまうケアレスミスに注意。',
      relatedTerms: ['定期預金', '普通預金', '受取利息'],
    },
    tags: ['定期預金', '普通預金', '受取利息'],
  },
  {
    id: 'boki-3k-012',
    examId: 'boki',
    trackId: '3kyu',
    category: '現金・預金',
    type: 'choice',
    difficulty: 2,
    estimatedSeconds: 75,
    title: '簿記上の「現金」（通貨代用証券）の範囲判定',
    prompt:
      '決算日に当社の金庫内を確認したところ、下表のものが保管されていた。簿記上の「現金」として計上すべき金額の合計はいくらか。',
    contextTable: {
      title: '金庫内の保有資産一覧',
      headers: ['項目', '金額'],
      rows: [
        ['紙幣および硬貨', '¥45,000'],
        ['得意先振出の小切手（他人振出小切手）', '¥30,000'],
        ['郵便為替証書', '¥15,000'],
        ['未使用の郵便切手', '¥2,000'],
        ['未使用の収入印紙', '¥5,000'],
        ['得意先振出の約束手形', '¥100,000'],
      ],
    },
    choices: ['¥75,000', '¥90,000', '¥97,000', '¥190,000'],
    correctChoiceIndex: 1,
    explanation: {
      summary:
        '簿記上の「現金」は通貨（紙幣・硬貨）＋通貨代用証券（他人振出小切手・郵便為替証書など）の合計¥90,000です。切手・印紙・約束手形は含まれません。',
      steps: [
        '紙幣・硬貨（¥45,000）は当然「現金」に含まれます。',
        '他人振出小切手（¥30,000）と郵便為替証書（¥15,000）は金融機関ですぐ現金化できる「通貨代用証券」なので現金に含めます。',
        '未使用の郵便切手（通信費→貯蔵品）や収入印紙（租税公課→貯蔵品）、約束手形（受取手形）は現金ではありません。',
        '合計：¥45,000 ＋ ¥30,000 ＋ ¥15,000 ＝ ¥90,000 となります。',
      ],
      calculation: '現金合計 = ¥45,000 + ¥30,000 + ¥15,000 = ¥90,000',
      examTip:
        '現金になる通貨代用証券の代表は「他人振出小切手・送金小切手・郵便為替証書・配当金領収証・期限到来の公社債利札」の5つ！',
      commonMistake:
        '切手や収入印紙を現金に含めて¥97,000と答えてしまうのが定番のひっかけです。切手と印紙は現金ではありません！',
      relatedTerms: ['現金', '受取手形', '当座預金'],
    },
    tags: ['現金の範囲', '通貨代用証券', '切手・印紙'],
  },

  // =========================================================================
  // 3. 手形・債権債務 (boki-3k-013 .. boki-3k-018): 5 journal + 1 choice
  // =========================================================================
  {
    id: 'boki-3k-013',
    examId: 'boki',
    trackId: '3kyu',
    category: '手形・債権債務',
    type: 'journal',
    difficulty: 1,
    estimatedSeconds: 45,
    title: '買掛金決済のための約束手形振出し',
    prompt:
      '仕入先に対する買掛金¥320,000の支払いのため、約束手形を振り出して渡した。このときの仕訳を行いなさい。',
    journalSpec: {
      debitSlots: 1,
      creditSlots: 1,
      accountChoices: ['買掛金', '支払手形', '受取手形', '当座預金', '電子記録債務'],
      amountChoices: [160000, 320000, 640000, 300000],
      correctDebit: [{ account: '買掛金', amount: 320000 }],
      correctCredit: [{ account: '支払手形', amount: 320000 }],
    },
    explanation: {
      summary:
        '約束手形を振り出して買掛金を決済すると、買掛金（負債）が減少し、代わりに「支払手形（負債）」が増加します。',
      steps: [
        '買掛金という債務が消滅するため、借方に「買掛金 ¥320,000」を記入します。',
        '約束手形を振り出した時点ではまだ当座預金から引き落とされず、将来の支払義務が生じるため、貸方に「支払手形 ¥320,000」を計上します。',
      ],
      journalBreakdown: {
        debit: [{ account: '買掛金', amount: 320000, element: 'liability', direction: 'decrease' }],
        credit: [
          { account: '支払手形', amount: 320000, element: 'liability', direction: 'increase' },
        ],
      },
      examTip:
        '「小切手の振出し＝当座預金の減少」「約束手形の振出し＝支払手形の増加」の違いを即答できるようにしましょう。',
      commonMistake:
        '「振り出した」という言葉に反応して貸方を「当座預金」にしてしまうミスに要注意です。',
      relatedTerms: ['支払手形', '受取手形', '買掛金', '当座預金'],
    },
    tags: ['約束手形', '支払手形', '買掛金'],
  },
  {
    id: 'boki-3k-014',
    examId: 'boki',
    trackId: '3kyu',
    category: '手形・債権債務',
    type: 'journal',
    difficulty: 2,
    estimatedSeconds: 50,
    title: '電子記録債権の発生記録',
    prompt:
      '得意先に対する売掛金¥450,000の決済として、取引銀行を通じて電子債権記録機関から電子記録債権の発生記録が行われた旨の通知を受けた。',
    journalSpec: {
      debitSlots: 1,
      creditSlots: 1,
      accountChoices: ['電子記録債権', '電子記録債務', '売掛金', '受取手形', '当座預金'],
      amountChoices: [45000, 405000, 450000, 500000],
      correctDebit: [{ account: '電子記録債権', amount: 450000 }],
      correctCredit: [{ account: '売掛金', amount: 450000 }],
    },
    explanation: {
      summary:
        '売掛金の決済として電子記録債権が発生したときは、借方に「電子記録債権（資産の増加）」、貸方に「売掛金（資産の減少）」を計上します。',
      steps: [
        '得意先に対する売掛金を回収する権利が、紙の約束手形に相当する電子的な債権へ置き換わりました。',
        '新たな資産の増加として借方に「電子記録債権 ¥450,000」を記入します。',
        '元の売掛金は消滅するため、貸方に「売掛金 ¥450,000」を記入します。',
      ],
      journalBreakdown: {
        debit: [
          { account: '電子記録債権', amount: 450000, element: 'asset', direction: 'increase' },
        ],
        credit: [{ account: '売掛金', amount: 450000, element: 'asset', direction: 'decrease' }],
      },
      examTip:
        '電子記録「債権」は資産（売掛金の相手）、電子記録「債務」は負債（買掛金の相手）と対応づけて覚えましょう。',
      commonMistake:
        '急いで読んで「電子記録債務」を選んでしまうミスが非常に多いので、債権か債務かを一文字ずつ確認しましょう。',
      relatedTerms: ['電子記録債権', '電子記録債務', '売掛金', '受取手形'],
    },
    tags: ['電子記録債権', '売掛金', '債権債務'],
  },
  {
    id: 'boki-3k-015',
    examId: 'boki',
    trackId: '3kyu',
    category: '手形・債権債務',
    type: 'journal',
    difficulty: 2,
    estimatedSeconds: 75,
    title: '貸付金の回収と月割りの受取利息計算',
    prompt:
      '4ヶ月前に取引先へ貸し付けていた¥600,000（年利率3%）の返済期日が到来し、元本と4ヶ月分の利息が当社の普通預金口座に振り込まれた。なお、利息は月割りで計算する。',
    journalSpec: {
      debitSlots: 1,
      creditSlots: 2,
      accountChoices: ['普通預金', '貸付金', '受取利息', '借入金', '支払利息', '当座預金'],
      amountChoices: [6000, 18000, 600000, 606000, 618000],
      correctDebit: [{ account: '普通預金', amount: 606000 }],
      correctCredit: [
        { account: '貸付金', amount: 600000 },
        { account: '受取利息', amount: 6000 },
      ],
    },
    explanation: {
      summary:
        '貸付金利息は「元本 × 年利率 × 月数 ÷ 12」で計算し、元本は「貸付金」の減少、利息は「受取利息」の増加として仕訳します。',
      steps: [
        '4ヶ月分の利息を計算します：¥600,000 × 3% × 4ヶ月 ÷ 12ヶ月 ＝ ¥6,000。',
        '普通預金に入金される合計額は、元本¥600,000 ＋ 利息¥6,000 ＝ ¥606,000 なので借方に「普通預金 ¥606,000」を計上します。',
        '貸方には元本返済分「貸付金 ¥600,000」と収益の増加「受取利息 ¥6,000」を分けて記入します。',
      ],
      calculation: '受取利息 = ¥600,000 × 3% × 4ヶ月 ÷ 12ヶ月 = ¥6,000',
      journalBreakdown: {
        debit: [{ account: '普通預金', amount: 606000, element: 'asset', direction: 'increase' }],
        credit: [
          { account: '貸付金', amount: 600000, element: 'asset', direction: 'decrease' },
          { account: '受取利息', amount: 6000, element: 'revenue', direction: 'increase' },
        ],
      },
      examTip:
        '「年利率」と書いてあるときは1年（12ヶ月）分の利率です。必ず「× 期間月数 ÷ 12」の月割りを忘れずに！',
      commonMistake:
        '月割りを忘れて1年分の利息¥18,000（600,000×3%）をそのまま計上してしまうミスが最頻出です。',
      relatedTerms: ['貸付金', '受取利息', '借入金', '支払利息'],
    },
    tags: ['貸付金', '受取利息', '月割り計算'],
  },
  {
    id: 'boki-3k-016',
    examId: 'boki',
    trackId: '3kyu',
    category: '手形・債権債務',
    type: 'journal',
    difficulty: 2,
    estimatedSeconds: 55,
    title: '仮払金の出張旅費精算',
    prompt:
      '出張から戻った従業員より、出発前に概算渡ししていた仮払金¥50,000について、旅費交通費¥42,000の領収書の提出と残額の現金返還を受けた。',
    journalSpec: {
      debitSlots: 2,
      creditSlots: 1,
      accountChoices: ['旅費交通費', '現金', '仮払金', '立替金', '仮受金', '預り金'],
      amountChoices: [8000, 42000, 50000, 92000],
      correctDebit: [
        { account: '旅費交通費', amount: 42000 },
        { account: '現金', amount: 8000 },
      ],
      correctCredit: [{ account: '仮払金', amount: 50000 }],
    },
    explanation: {
      summary:
        '仮払金の精算時は、当初渡した「仮払金」の全額を貸方で消去し、確定した費用と返金された現金を借方に計上します。',
      steps: [
        '出発時の仕訳は「借方：仮払金 ¥50,000 ／ 貸方：現金 ¥50,000」でした。',
        '精算により仮払金は全額役割を終えるため、貸方に「仮払金 ¥50,000」を記入してゼロにします。',
        '確定した費用「旅費交通費 ¥42,000」と、戻ってきた現金「現金 ¥8,000（¥50,000 − ¥42,000）」を借方に記入します。',
      ],
      calculation: '返還された現金 = 仮払金 ¥50,000 − 旅費交通費 ¥42,000 = ¥8,000',
      journalBreakdown: {
        debit: [
          { account: '旅費交通費', amount: 42000, element: 'expense', direction: 'increase' },
          { account: '現金', amount: 8000, element: 'asset', direction: 'increase' },
        ],
        credit: [{ account: '仮払金', amount: 50000, element: 'asset', direction: 'decrease' }],
      },
      examTip:
        'もし旅費が仮払金を上回った場合（例：¥55,000）は、不足分¥5,000を現金で追加支給するため貸方に「現金 ¥5,000」が来ます。',
      commonMistake:
        '仮払金の消去額を¥42,000だけにしてしまい、¥8,000が仮払金勘定に残り続けてしまうミスに注意。',
      relatedTerms: ['仮払金', '仮受金', '現金', '立替金'],
    },
    tags: ['仮払金', '出張精算', '旅費交通費'],
  },
  {
    id: 'boki-3k-017',
    examId: 'boki',
    trackId: '3kyu',
    category: '手形・債権債務',
    type: 'journal',
    difficulty: 2,
    estimatedSeconds: 70,
    title: '給料の支払いと源泉徴収・社会保険料（預り金）',
    prompt:
      '従業員に対する当月分の給料¥320,000から、所得税の源泉徴収額¥14,000および社会保険料の従業員負担分¥46,000を差し引き、手取額を普通預金から振り込んだ。',
    journalSpec: {
      debitSlots: 1,
      creditSlots: 3,
      accountChoices: [
        '給料',
        '所得税預り金',
        '社会保険料預り金',
        '普通預金',
        '法定福利費',
        '立替金',
      ],
      amountChoices: [14000, 46000, 60000, 260000, 320000],
      correctDebit: [{ account: '給料', amount: 320000 }],
      correctCredit: [
        { account: '所得税預り金', amount: 14000 },
        { account: '社会保険料預り金', amount: 46000 },
        { account: '普通預金', amount: 260000 },
      ],
    },
    explanation: {
      summary:
        '給料は天引き前の支給総額で費用計上し、天引きした税金・社会保険料は後日納付する負債（預り金）として貸方に計上します。',
      steps: [
        '従業員への支給総額¥320,000を、費用の発生として借方に「給料 ¥320,000」と計上します。',
        '天引きした所得税¥14,000と社会保険料¥46,000は一時的に預かるお金（負債）なので、貸方に「所得税預り金 ¥14,000」「社会保険料預り金 ¥46,000」を計上します。',
        '差し引きの手取額¥260,000（¥320,000 − ¥14,000 − ¥46,000）を貸方に「普通預金 ¥260,000」と記入します。',
      ],
      calculation: '普通預金振込額 = 給料総額 ¥320,000 − 所得税 ¥14,000 − 社会保険料 ¥46,000 = ¥260,000',
      journalBreakdown: {
        debit: [{ account: '給料', amount: 320000, element: 'expense', direction: 'increase' }],
        credit: [
          { account: '所得税預り金', amount: 14000, element: 'liability', direction: 'increase' },
          { account: '社会保険料預り金', amount: 46000, element: 'liability', direction: 'increase' },
          { account: '普通預金', amount: 260000, element: 'asset', direction: 'decrease' },
        ],
      },
      examTip:
        '社会保険料の「会社負担分」が登場するのは原則として納付時（法定福利費）です。給料支給時に法定福利費を入れないよう注意！',
      commonMistake:
        '手取額の¥260,000を「給料」として計上してしまうミスや、社会保険料の従業員負担分を「法定福利費」にしてしまう誤りがよくあります。',
      relatedTerms: ['給料', '預り金', '法定福利費', '普通預金'],
    },
    tags: ['給料', '預り金', '源泉徴収', '社会保険料'],
  },
  {
    id: 'boki-3k-018',
    examId: 'boki',
    trackId: '3kyu',
    category: '手形・債権債務',
    type: 'choice',
    difficulty: 2,
    estimatedSeconds: 75,
    title: '未収入金・未払金・立替金・法定福利費の使い分け',
    prompt:
      '次の4つの取引と使用する勘定科目の組み合わせのうち、日商簿記3級の会計処理として正しいものはどれか。',
    choices: [
      '不要になった社用パソコンを売却し、代金は翌月末に受け取ることにした → 「売掛金」を使用する。',
      '事務用デスクを購入し、代金は翌月末に支払うことにした → 「買掛金」を使用する。',
      '社会保険料の納付に際し、会社負担分と従業員からの預り分を普通預金から納付した → 会社負担分は「法定福利費」を使用する。',
      '従業員の私用立替分を給料から天引きして回収した → 貸方に「預り金」を使用する。',
    ],
    correctChoiceIndex: 2,
    explanation: {
      summary:
        '社会保険料の納付時、会社が負担する半額は「法定福利費（費用）」として借方に計上します。商品以外の未収・未払は「未収入金」「未払金」を使います。',
      steps: [
        '選択肢1：パソコン（固定資産）など商品以外の売却代金の未収は「売掛金」ではなく「未収入金」です。',
        '選択肢2：事務用デスク（備品）など商品以外の購入代金の未払いは「買掛金」ではなく「未払金」です。',
        '選択肢3：社会保険料納付時は「借方：社会保険料預り金・法定福利費 ／ 貸方：普通預金」となるため、正しい記述です！',
        '選択肢4：従業員のために立て替えていたお金を給料から差し引いて回収するときは、資産である「立替金」を貸方で減少させます。',
      ],
      journalBreakdown: {
        debit: [
          { account: '社会保険料預り金', amount: 46000, element: 'liability', direction: 'decrease' },
          { account: '法定福利費', amount: 46000, element: 'expense', direction: 'increase' },
        ],
        credit: [{ account: '普通預金', amount: 92000, element: 'asset', direction: 'decrease' }],
      },
      examTip:
        '「商品なら売掛金・買掛金」「商品以外なら未収入金・未払金」「社会保険料の会社負担は法定福利費」の3点セットは超頻出です！',
      commonMistake:
        '備品購入の後日払いをうっかり「買掛金」と選んでしまうミスに気をつけましょう。',
      relatedTerms: ['未収入金', '未払金', '立替金', '法定福利費'],
    },
    tags: ['未収入金', '未払金', '法定福利費', '立替金'],
  },

  // =========================================================================
  // 4. 固定資産・純資産 (boki-3k-019 .. boki-3k-023): 4 journal + 1 choice
  // =========================================================================
  {
    id: 'boki-3k-019',
    examId: 'boki',
    trackId: '3kyu',
    category: '固定資産・純資産',
    type: 'journal',
    difficulty: 1,
    estimatedSeconds: 50,
    title: '備品の購入（付随費用込み・後日払い）',
    prompt:
      '営業用のパソコン¥280,000を購入し、設定および搬入費用¥20,000とあわせて代金は翌月末に支払うこととした。このときの仕訳を行いなさい。',
    journalSpec: {
      debitSlots: 1,
      creditSlots: 1,
      accountChoices: ['備品', '未払金', '買掛金', '支払手数料', '消耗品費', '現金'],
      amountChoices: [20000, 260000, 280000, 300000],
      correctDebit: [{ account: '備品', amount: 300000 }],
      correctCredit: [{ account: '未払金', amount: 300000 }],
    },
    explanation: {
      summary:
        '固定資産の購入に伴う付随費用（搬入費・設定費・仲介手数料など）は取得原価に含め、商品以外の未払代金は「未払金」で処理します。',
      steps: [
        'パソコン本体¥280,000に、業務で使用できる状態にするための設定・搬入費¥20,000を加算し、取得原価は¥300,000となります。',
        '資産の増加として借方に「備品 ¥300,000」を計上します。',
        '商品以外の購入代金が後日払いであるため、貸方に「未払金 ¥300,000」を記入します。',
      ],
      calculation: '取得原価 = 購入代価 ¥280,000 + 付随費用 ¥20,000 = ¥300,000',
      journalBreakdown: {
        debit: [{ account: '備品', amount: 300000, element: 'asset', direction: 'increase' }],
        credit: [{ account: '未払金', amount: 300000, element: 'liability', direction: 'increase' }],
      },
      examTip:
        '「付随費用は取得原価に含める」＋「固定資産の後日払いは未払金」は第1問仕訳の鉄板コンビです！',
      commonMistake:
        '設定・搬入費¥20,000を「支払手数料」に分けたり、貸方を「買掛金」にしてしまうミスに注意しましょう。',
      relatedTerms: ['備品', '未払金', '支払手数料'],
    },
    tags: ['固定資産', '備品', '付随費用', '未払金'],
  },
  {
    id: 'boki-3k-020',
    examId: 'boki',
    trackId: '3kyu',
    category: '固定資産・純資産',
    type: 'journal',
    difficulty: 2,
    estimatedSeconds: 70,
    title: '期中取得した備品の定額法による減価償却（間接法）',
    prompt:
      '当期の10月1日に取得した備品（取得原価¥600,000、耐用年数5年、残存価額ゼロ）について、決算日（3月31日）に定額法・間接法による減価償却費を月割りで計上した。',
    journalSpec: {
      debitSlots: 1,
      creditSlots: 1,
      accountChoices: [
        '減価償却費',
        '備品減価償却累計額',
        '備品',
        '固定資産売却損',
        '消耗品費',
      ],
      amountChoices: [50000, 60000, 100000, 120000, 600000],
      correctDebit: [{ account: '減価償却費', amount: 60000 }],
      correctCredit: [{ account: '備品減価償却累計額', amount: 60000 }],
    },
    explanation: {
      summary:
        '期中に取得した固定資産の減価償却費は、使用開始月から決算月までの月数で月割り計算し、間接法では貸方に「備品減価償却累計額」を計上します。',
      steps: [
        'まず1年分の減価償却費を計算します：¥600,000 ÷ 5年 ＝ ¥120,000／年。',
        '10月1日から3月31日までの使用月数を数えます：10・11・12・1・2・3月の6ヶ月間。',
        '当期の減価償却費 ＝ ¥120,000 × 6ヶ月 ÷ 12ヶ月 ＝ ¥60,000。',
        '間接法なので、借方「減価償却費 ¥60,000」／貸方「備品減価償却累計額 ¥60,000」とします。',
      ],
      calculation: '取得原価 ¥600,000 ÷ 耐用年数 5年 × 6ヶ月 ÷ 12ヶ月 = ¥60,000',
      journalBreakdown: {
        debit: [{ account: '減価償却費', amount: 60000, element: 'expense', direction: 'increase' }],
        credit: [
          {
            account: '備品減価償却累計額',
            amount: 60000,
            element: 'asset',
            direction: 'decrease',
          },
        ],
      },
      boxDiagram: {
        title: '当期の減価償却タイムライン（会計期間：4/1〜3/31）',
        leftTop: { label: '未使用期間（4/1〜9/30）', value: '6ヶ月（償却なし）' },
        leftBottom: { label: '使用期間（10/1〜3/31）', value: '6ヶ月（当期償却対象）' },
        rightTop: { label: '年間償却額', value: '¥120,000 / 年' },
        rightBottom: { label: '当期計上額（6/12）', value: '¥60,000' },
        note: '指を折って「10, 11, 12, 1, 2, 3」と数えると月数の数え間違いを防げます。',
      },
      examTip:
        '「間接法＝減価償却累計額」「直接法＝備品など資産勘定から直接減額」の区別を問題文の冒頭で必ずマークしましょう。',
      commonMistake:
        '月割り計算を忘れて1年分の¥120,000を計上してしまったり、10月〜3月を「3−10」で誤って5ヶ月にしてしまうミスに注意。',
      relatedTerms: ['減価償却費', '減価償却累計額', '備品'],
    },
    tags: ['減価償却', '定額法', '間接法', '月割り計算'],
  },
  {
    id: 'boki-3k-021',
    examId: 'boki',
    trackId: '3kyu',
    category: '固定資産・純資産',
    type: 'journal',
    difficulty: 3,
    estimatedSeconds: 100,
    title: '固定資産の期中売却と月割り減価償却・売却損益',
    prompt:
      '当期の9月30日に、備品（取得原価¥480,000、期首の備品減価償却累計額¥240,000、耐用年数4年、残存価額ゼロ、定額法・間接法）を¥150,000で売却し、代金は翌月末に受け取ることにした。なお、会計期間は4月1日〜3月31日であり、当期首から売却日までの減価償却費を月割りで計上する。',
    journalSpec: {
      debitSlots: 4,
      creditSlots: 1,
      accountChoices: [
        '未収入金',
        '備品減価償却累計額',
        '減価償却費',
        '固定資産売却損',
        '固定資産売却益',
        '備品',
        '売掛金',
      ],
      amountChoices: [30000, 60000, 90000, 150000, 240000, 480000],
      correctDebit: [
        { account: '未収入金', amount: 150000 },
        { account: '備品減価償却累計額', amount: 240000 },
        { account: '減価償却費', amount: 60000 },
        { account: '固定資産売却損', amount: 30000 },
      ],
      correctCredit: [{ account: '備品', amount: 480000 }],
    },
    explanation: {
      summary:
        '期中売却では「①取得原価と期首累計額を消す → ②当期の月割り減価償却費を計上 → ③売却代金を計上 → ④貸借差額で売却損益を出す」の4ステップで解きます。',
      steps: [
        '備品を売却したので、貸方に取得原価「備品 ¥480,000」、借方に期首累計額「備品減価償却累計額 ¥240,000」を記入して消去します。',
        '期首4月1日〜9月30日の6ヶ月分の減価償却費を計算します：¥480,000 ÷ 4年 × 6ヶ月 ÷ 12ヶ月 ＝ ¥60,000（借方「減価償却費」）。',
        '売却代金は後日受取なので借方に「未収入金 ¥150,000」を記入します。',
        '売却時点の帳簿価額は ¥480,000 − ¥240,000 − ¥60,000 ＝ ¥180,000。売却価額¥150,000との差額¥30,000が損なので借方に「固定資産売却損 ¥30,000」を計上します。',
      ],
      calculation:
        '当期償却費 = ¥480,000 ÷ 4年 × 6/12 = ¥60,000 ／ 売却時簿価 = ¥480,000 − ¥240,000 − ¥60,000 = ¥180,000 ／ 売却損 = ¥180,000 − ¥150,000 = ¥30,000',
      journalBreakdown: {
        debit: [
          { account: '未収入金', amount: 150000, element: 'asset', direction: 'increase' },
          {
            account: '備品減価償却累計額',
            amount: 240000,
            element: 'asset',
            direction: 'increase',
          },
          { account: '減価償却費', amount: 60000, element: 'expense', direction: 'increase' },
          { account: '固定資産売却損', amount: 30000, element: 'expense', direction: 'increase' },
        ],
        credit: [{ account: '備品', amount: 480000, element: 'asset', direction: 'decrease' }],
      },
      boxDiagram: {
        title: '備品売却時の帳簿価額と売却損益の内訳',
        leftTop: { label: '取得原価（貸方消去）', value: '¥480,000' },
        leftBottom: { label: '期首累計額＋当期償却費', value: '¥240,000 + ¥60,000 = ¥300,000' },
        rightTop: { label: '売却時帳簿価額', value: '¥180,000' },
        rightBottom: { label: '売却価額 ¥150,000 → 売却損', value: '¥30,000' },
        note: '借方合計 ¥480,000 ＝ 貸方合計 ¥480,000 となることを必ず検算しましょう！',
      },
      examTip:
        '仕訳の最後に「借方合計と貸方合計の差額」で売却損益を求めるとミスが激減します。借方が足りなければ売却損、貸方が足りなければ売却益！',
      commonMistake:
        '当期の月割り減価償却費¥60,000を計上し忘れ、売却損を¥90,000としてしまうミスが3級で最も差がつくポイントです。',
      relatedTerms: ['備品', '減価償却累計額', '減価償却費', '固定資産売却損', '未収入金'],
    },
    tags: ['固定資産売却', '期中売却', '月割り計算', '固定資産売却損'],
  },
  {
    id: 'boki-3k-022',
    examId: 'boki',
    trackId: '3kyu',
    category: '固定資産・純資産',
    type: 'journal',
    difficulty: 2,
    estimatedSeconds: 60,
    title: '法人税等の確定と仮払法人税等の精算',
    prompt:
      '決算において、当期の法人税、住民税及び事業税が¥420,000と確定した。なお、期中に中間納付した仮払法人税等¥180,000が計上されている。決算整理仕訳を行いなさい。',
    journalSpec: {
      debitSlots: 1,
      creditSlots: 2,
      accountChoices: [
        '法人税、住民税及び事業税',
        '仮払法人税等',
        '未払法人税等',
        '当座預金',
        '未払金',
      ],
      amountChoices: [180000, 240000, 420000, 600000],
      correctDebit: [{ account: '法人税、住民税及び事業税', amount: 420000 }],
      correctCredit: [
        { account: '仮払法人税等', amount: 180000 },
        { account: '未払法人税等', amount: 240000 },
      ],
    },
    explanation: {
      summary:
        '決算で確定した年間税額を「法人税、住民税及び事業税」に全額計上し、中間納付済みの「仮払法人税等」を差し引いた残額を「未払法人税等」とします。',
      steps: [
        '当期の年間確定税額¥420,000を、費用の発生として借方に「法人税、住民税及び事業税 ¥420,000」と計上します。',
        'すでに中間納付して資産計上していた「仮払法人税等 ¥180,000」を貸方で全額取り崩します。',
        'まだ納めていない差額¥240,000（¥420,000 − ¥180,000）を負債として貸方に「未払法人税等 ¥240,000」と計上します。',
      ],
      calculation: '未払法人税等 = 年間確定額 ¥420,000 − 仮払法人税等 ¥180,000 = ¥240,000',
      journalBreakdown: {
        debit: [
          {
            account: '法人税、住民税及び事業税',
            amount: 420000,
            element: 'expense',
            direction: 'increase',
          },
        ],
        credit: [
          { account: '仮払法人税等', amount: 180000, element: 'asset', direction: 'decrease' },
          { account: '未払法人税等', amount: 240000, element: 'liability', direction: 'increase' },
        ],
      },
      examTip:
        '「中間納付時：仮払法人税等／当座預金」「決算確定時：法人税等／仮払法人税等・未払法人税等」「翌期納付時：未払法人税等／当座預金」の3ステージをセットで押さえましょう！',
      commonMistake:
        '借方の「法人税、住民税及び事業税」を差額の¥240,000だけにしてしまうミスに要注意です。',
      relatedTerms: ['法人税、住民税及び事業税', '仮払法人税等', '未払法人税等'],
    },
    tags: ['法人税等', '仮払法人税等', '未払法人税等'],
  },
  {
    id: 'boki-3k-023',
    examId: 'boki',
    trackId: '3kyu',
    category: '固定資産・純資産',
    type: 'choice',
    difficulty: 2,
    estimatedSeconds: 75,
    title: '株式会社の設立・増資（資本金）と繰越利益剰余金',
    prompt:
      '当社は会社設立にあたり、株式150株を1株につき¥40,000で発行し、全額が当座預金に払い込まれた（全額を資本金とする）。第1期に当期純利益¥1,200,000を計上し、さらに増資として株式50株を1株¥40,000で発行して全額当座預金に払い込まれた場合、純資産合計（資本金と繰越利益剰余金の合計）はいくらか。',
    contextTable: {
      title: '純資産の変動履歴',
      headers: ['タイミング', '内容'],
      rows: [
        ['設立時', '150株 × ¥40,000 を発行（全額を資本金）'],
        ['第1期決算', '当期純利益 ¥1,200,000 を繰越利益剰余金へ振替'],
        ['増資時', '50株 × ¥40,000 を追加発行（全額を資本金）'],
      ],
    },
    choices: ['¥6,000,000', '¥7,200,000', '¥8,000,000', '¥9,200,000'],
    correctChoiceIndex: 3,
    explanation: {
      summary:
        '設立時の資本金¥6,000,000、増資による資本金増加¥2,000,000、当期純利益の振替による繰越利益剰余金¥1,200,000を合算すると、純資産合計は¥9,200,000です。',
      steps: [
        '設立時の資本金：150株 × ¥40,000 ＝ ¥6,000,000（借方：当座預金 ／ 貸方：資本金）。',
        '当期純利益の振替：繰越利益剰余金 ＋¥1,200,000（借方：損益 ／ 貸方：繰越利益剰余金）。',
        '増資時の資本金増加：50株 × ¥40,000 ＝ ¥2,000,000（借方：当座預金 ／ 貸方：資本金）。',
        '純資産合計 ＝ 資本金 ¥8,000,000 ＋ 繰越利益剰余金 ¥1,200,000 ＝ ¥9,200,000。',
      ],
      calculation:
        '資本金 = (150株 + 50株) × ¥40,000 = ¥8,000,000 ／ 純資産合計 = ¥8,000,000 + ¥1,200,000 = ¥9,200,000',
      journalBreakdown: {
        debit: [{ account: '当座預金', amount: 2000000, element: 'asset', direction: 'increase' }],
        credit: [{ account: '資本金', amount: 2000000, element: 'equity', direction: 'increase' }],
      },
      examTip:
        '3級では株式発行による払込金額は原則として「全額を資本金」とします。純資産は「資本金＋繰越利益剰余金」など株主の持ち分合計です。',
      commonMistake:
        '当期純利益を純資産に含め忘れる（¥8,000,000）か、増資分を足し忘れる（¥7,200,000）ミスに注意しましょう。',
      relatedTerms: ['資本金', '繰越利益剰余金', '当座預金'],
    },
    tags: ['株式会社', '設立', '増資', '資本金', '繰越利益剰余金'],
  },

  // =========================================================================
  // 5. 決算整理 (boki-3k-024 .. boki-3k-030): 5 journal + 2 choice
  // =========================================================================
  {
    id: 'boki-3k-024',
    examId: 'boki',
    trackId: '3kyu',
    category: '決算整理',
    type: 'journal',
    difficulty: 2,
    estimatedSeconds: 75,
    title: '売上原価の算定（しーくり・くりしー）',
    prompt:
      '決算整理にあたり、仕入勘定で売上原価を算定する。期首商品棚卸高は¥140,000、当期商品仕入高は¥820,000、期末商品棚卸高は¥180,000であった。必要な決算整理仕訳（2行分）をまとめて行いなさい。',
    journalSpec: {
      debitSlots: 2,
      creditSlots: 2,
      accountChoices: ['仕入', '繰越商品', '売上', '売上原価', '買掛金'],
      amountChoices: [140000, 180000, 780000, 820000, 960000],
      correctDebit: [
        { account: '仕入', amount: 140000 },
        { account: '繰越商品', amount: 180000 },
      ],
      correctCredit: [
        { account: '繰越商品', amount: 140000 },
        { account: '仕入', amount: 180000 },
      ],
    },
    explanation: {
      summary:
        '仕入勘定で売上原価を算定する決算整理仕訳は、期首分を「仕入／繰越商品」、期末分を「繰越商品／仕入」と記録します（通称：しーくり・くりしー）。',
      steps: [
        '【しーくり】期首に持ち越した在庫¥140,000を当期の仕入原価に加えるため「借方：仕入 ¥140,000 ／ 貸方：繰越商品 ¥140,000」とします。',
        '【くりしー】期末に売れ残った在庫¥180,000を当期の仕入から除いて資産へ移すため「借方：繰越商品 ¥180,000 ／ 貸方：仕入 ¥180,000」とします。',
        'この結果、仕入勘定の残高は ¥140,000 ＋ ¥820,000 − ¥180,000 ＝ ¥780,000 となり、正しい売上原価が算定されます！',
      ],
      calculation: '売上原価 = 期首 ¥140,000 + 当期仕入 ¥820,000 − 期末 ¥180,000 = ¥780,000',
      journalBreakdown: {
        debit: [
          { account: '仕入', amount: 140000, element: 'expense', direction: 'increase' },
          { account: '繰越商品', amount: 180000, element: 'asset', direction: 'increase' },
        ],
        credit: [
          { account: '繰越商品', amount: 140000, element: 'asset', direction: 'decrease' },
          { account: '仕入', amount: 180000, element: 'expense', direction: 'decrease' },
        ],
      },
      boxDiagram: {
        title: '売上原価算定ボックス図（三分法）',
        leftTop: { label: '期首商品棚卸高（しーくり）', value: '¥140,000' },
        leftBottom: { label: '当期商品仕入高', value: '¥820,000' },
        rightTop: { label: '売上原価（仕入勘定残高）', value: '¥780,000' },
        rightBottom: { label: '期末商品棚卸高（くりしー）', value: '¥180,000' },
        note: '左右の合計はどちらも ¥960,000 で必ず一致します！',
      },
      examTip:
        '合言葉は「しーくり（期首）・くりしー（期末）」！金額の順番も必ず「期首→期末」の順で当てはめましょう。',
      commonMistake:
        '期首¥140,000と期末¥180,000の金額を逆に入れてしまうミス、および当期仕入高¥820,000を仕訳に入れてしまうミスに要注意！',
      relatedTerms: ['繰越商品', '仕入', '売上'],
    },
    tags: ['決算整理', '売上原価', 'しーくりくりしー', '繰越商品'],
  },
  {
    id: 'boki-3k-025',
    examId: 'boki',
    trackId: '3kyu',
    category: '決算整理',
    type: 'journal',
    difficulty: 2,
    estimatedSeconds: 65,
    title: '貸倒引当金の設定（差額補充法）',
    prompt:
      '決算において、売掛金の期末残高¥500,000および受取手形の期末残高¥300,000に対して、2%の貸倒引当金を差額補充法により設定する。なお、決算整理前残高試算表における貸倒引当金の残高は¥5,000である。',
    journalSpec: {
      debitSlots: 1,
      creditSlots: 1,
      accountChoices: [
        '貸倒引当金繰入',
        '貸倒引当金',
        '貸倒損失',
        '貸倒引当金戻入',
        '売掛金',
      ],
      amountChoices: [5000, 10000, 11000, 16000, 21000],
      correctDebit: [{ account: '貸倒引当金繰入', amount: 11000 }],
      correctCredit: [{ account: '貸倒引当金', amount: 11000 }],
    },
    explanation: {
      summary:
        '差額補充法では「対象債権合計 × 設定率 − 決算前引当金残高」で不足額を求め、その差額だけを「貸倒引当金繰入／貸倒引当金」として繰り入れます。',
      steps: [
        '貸倒引当金の設定対象となる期末債権の合計を求めます：売掛金¥500,000 ＋ 受取手形¥300,000 ＝ ¥800,000。',
        '期末に必要な貸倒引当金の設定額を計算します：¥800,000 × 2% ＝ ¥16,000。',
        'すでに残高が¥5,000あるため、補充すべき差額は ¥16,000 − ¥5,000 ＝ ¥11,000 となります。',
        '借方「貸倒引当金繰入 ¥11,000」／貸方「貸倒引当金 ¥11,000」を計上します。',
      ],
      calculation:
        '必要額 = (¥500,000 + ¥300,000) × 2% = ¥16,000 ／ 繰入額 = ¥16,000 − 残高 ¥5,000 = ¥11,000',
      journalBreakdown: {
        debit: [
          { account: '貸倒引当金繰入', amount: 11000, element: 'expense', direction: 'increase' },
        ],
        credit: [
          { account: '貸倒引当金', amount: 11000, element: 'asset', direction: 'decrease' },
        ],
      },
      examTip:
        '設定対象に「受取手形」や「電子記録債権」が含まれていないか、問題文を最後まで確認するのが高得点の秘訣です！',
      commonMistake:
        '決算前残高¥5,000を差し引き忘れて¥16,000を全額繰り入れてしまったり、受取手形¥300,000を合算し忘れるミスに注意。',
      relatedTerms: ['貸倒引当金', '貸倒引当金繰入', '売掛金', '受取手形'],
    },
    tags: ['決算整理', '貸倒引当金', '差額補充法'],
  },
  {
    id: 'boki-3k-026',
    examId: 'boki',
    trackId: '3kyu',
    category: '決算整理',
    type: 'journal',
    difficulty: 2,
    estimatedSeconds: 80,
    title: '売掛金の貸倒れ（前期発生と当期発生の違い）',
    prompt:
      '得意先が倒産し、前期に売り上げた売掛金¥70,000と当期に売り上げた売掛金¥30,000が回収不能（貸倒れ）となった。なお、貸倒引当金の残高は¥50,000である。このときの仕訳を行いなさい。',
    journalSpec: {
      debitSlots: 2,
      creditSlots: 1,
      accountChoices: ['貸倒引当金', '貸倒損失', '貸倒引当金繰入', '売掛金', '雑損'],
      amountChoices: [20000, 30000, 50000, 70000, 100000],
      correctDebit: [
        { account: '貸倒引当金', amount: 50000 },
        { account: '貸倒損失', amount: 50000 },
      ],
      correctCredit: [{ account: '売掛金', amount: 100000 }],
    },
    explanation: {
      summary:
        '前期発生の債権には貸倒引当金を取り崩して不足分を貸倒損失としますが、当期発生の債権には前期設定の引当金を使えず全額「貸倒損失」とします。',
      steps: [
        '貸し倒れた売掛金の合計は ¥70,000 ＋ ¥30,000 ＝ ¥100,000 なので、貸方に「売掛金 ¥100,000」を記入します。',
        '前期発生分¥70,000に対しては貸倒引当金残高¥50,000を全額取り崩し（借方「貸倒引当金 ¥50,000」）、カバーできない¥20,000を貸倒損失とします。',
        '当期発生分¥30,000は前期末に設定した引当金の対象外なので、全額¥30,000を貸倒損失とします。',
        '貸倒損失の合計 ＝ ¥20,000 ＋ ¥30,000 ＝ ¥50,000 となります。',
      ],
      calculation:
        '前期分不足 ¥20,000 (¥70,000 − ¥50,000) + 当期分全額 ¥30,000 = 貸倒損失 ¥50,000',
      journalBreakdown: {
        debit: [
          { account: '貸倒引当金', amount: 50000, element: 'asset', direction: 'increase' },
          { account: '貸倒損失', amount: 50000, element: 'expense', direction: 'increase' },
        ],
        credit: [{ account: '売掛金', amount: 100000, element: 'asset', direction: 'decrease' }],
      },
      examTip:
        'もし前期発生分が¥40,000で引当金残高が¥50,000だった場合でも、余った¥10,000を当期発生分¥30,000に充当してはいけません！',
      commonMistake:
        '前期発生か当期発生かを区別せず、単純に引当金残高から引いてしまう癖があると、引当金に余裕がある問題で失点します。',
      relatedTerms: ['貸倒損失', '貸倒引当金', '売掛金'],
    },
    tags: ['貸倒損失', '貸倒引当金', '前期発生・当期発生'],
  },
  {
    id: 'boki-3k-027',
    examId: 'boki',
    trackId: '3kyu',
    category: '決算整理',
    type: 'journal',
    difficulty: 2,
    estimatedSeconds: 75,
    title: '費用の繰延べ（前払費用の計上）',
    prompt:
      '当期の11月1日に、向こう1年分の店舗家賃¥360,000を支払い、全額を支払家賃として処理していた。決算日（3月31日）における経過勘定の決算整理仕訳を行いなさい（会計期間は4月1日〜3月31日）。',
    journalSpec: {
      debitSlots: 1,
      creditSlots: 1,
      accountChoices: ['前払費用', '未払費用', '前受収益', '未収収益', '支払家賃', '前払金'],
      amountChoices: [150000, 180000, 210000, 360000],
      correctDebit: [{ account: '前払費用', amount: 210000 }],
      correctCredit: [{ account: '支払家賃', amount: 210000 }],
    },
    explanation: {
      summary:
        'すでに支払った1年分の家賃のうち、翌期に対応する7ヶ月分（4月〜10月）を「前払費用／支払家賃」として翌期へ繰り延べます。',
      steps: [
        '1年分（12ヶ月）の家賃¥360,000は、1ヶ月あたり ¥360,000 ÷ 12ヶ月 ＝ ¥30,000 です。',
        '当期分は11月1日〜3月31日の5ヶ月間（¥150,000）、翌期分は4月1日〜10月31日の7ヶ月間（¥210,000）です。',
        '繰延べ（前払費用）は「翌期分」を当期の費用から除く処理なので、¥210,000で仕訳します。',
        '借方に資産の増加「前払費用 ¥210,000」、貸方に費用の減少「支払家賃 ¥210,000」を計上します。',
      ],
      calculation: '翌期分（4/1〜10/31：7ヶ月）= ¥360,000 × 7ヶ月 ÷ 12ヶ月 = ¥210,000',
      journalBreakdown: {
        debit: [{ account: '前払費用', amount: 210000, element: 'asset', direction: 'increase' }],
        credit: [{ account: '支払家賃', amount: 210000, element: 'expense', direction: 'decrease' }],
      },
      boxDiagram: {
        title: '家賃1年分（11/1〜翌10/31）の期間按分',
        leftTop: { label: '当期分（11/1〜3/31）', value: '5ヶ月：¥150,000' },
        leftBottom: { label: '翌期分（4/1〜10/31）', value: '7ヶ月：¥210,000' },
        rightTop: { label: '当期P/Lの支払家賃', value: '¥150,000' },
        rightBottom: { label: '期末B/Sの前払費用', value: '¥210,000' },
        note: '繰延べ（前払・前受）は「翌期分」、見越し（未払・未収）は「当期分」を仕訳します！',
      },
      examTip:
        '「前払（資産）・前受（負債）＝翌期分」「未払（負債）・未収（資産）＝当期分」をタイムラインとセットで定着させましょう。',
      commonMistake:
        '当期分の5ヶ月（¥150,000）で仕訳してしまうのが最も多いミスです。支払済みの金額から「翌期分」を抜き出すのが繰延べです！',
      relatedTerms: ['前払費用', '支払家賃', '未払費用', '前受収益'],
    },
    tags: ['決算整理', '経過勘定', '前払費用', '繰延べ'],
  },
  {
    id: 'boki-3k-028',
    examId: 'boki',
    trackId: '3kyu',
    category: '決算整理',
    type: 'journal',
    difficulty: 2,
    estimatedSeconds: 55,
    title: '消耗品と消耗品費の決算整理（購入時・資産処理）',
    prompt:
      '期中に購入した事務用消耗品¥25,000は、すべて購入時に「消耗品」勘定（資産）で処理していた。決算において実地棚卸を行ったところ、期末の未使用高は¥7,000であった。決算整理仕訳を行いなさい。',
    journalSpec: {
      debitSlots: 1,
      creditSlots: 1,
      accountChoices: ['消耗品費', '消耗品', '備品', '繰越商品', '雑損'],
      amountChoices: [7000, 18000, 25000, 32000],
      correctDebit: [{ account: '消耗品費', amount: 18000 }],
      correctCredit: [{ account: '消耗品', amount: 18000 }],
    },
    explanation: {
      summary:
        '購入時に「消耗品（資産）」として処理していた場合は、決算時に「使用した分（購入額 − 未使用高）」を「消耗品費／消耗品」へ振り替えます。',
      steps: [
        '購入時に全額¥25,000が資産（消耗品）として計上されています。',
        '期末に残っている未使用高は¥7,000なので、当期中に使った金額は ¥25,000 − ¥7,000 ＝ ¥18,000 です。',
        '使った分を費用にするため借方に「消耗品費 ¥18,000」、資産を減らすため貸方に「消耗品 ¥18,000」を計上します。',
        'この結果、期末の「消耗品」残高が未使用高の¥7,000に一致します！',
      ],
      calculation: '当期使用高 = 購入額 ¥25,000 − 期末未使用高 ¥7,000 = ¥18,000',
      journalBreakdown: {
        debit: [{ account: '消耗品費', amount: 18000, element: 'expense', direction: 'increase' }],
        credit: [{ account: '消耗品', amount: 18000, element: 'asset', direction: 'decrease' }],
      },
      examTip:
        '「購入時に費用（消耗品費）なら、期末に未使用分を資産へ」「購入時に資産（消耗品）なら、期末に使用分を費用へ」と逆の動きになります。',
      commonMistake:
        '問題文の未使用高¥7,000をそのまま使って「消耗品 7,000 ／ 消耗品費 7,000」としてしまうミスが頻出です！購入時の処理方法を必ず確認しましょう。',
      relatedTerms: ['消耗品', '消耗品費'],
    },
    tags: ['決算整理', '消耗品', '消耗品費'],
  },
  {
    id: 'boki-3k-029',
    examId: 'boki',
    trackId: '3kyu',
    category: '決算整理',
    type: 'choice',
    difficulty: 3,
    estimatedSeconds: 90,
    title: '誤った記帳を修正する「訂正仕訳」',
    prompt:
      '買掛金¥65,000を現金で支払った際、誤って「借方：売掛金 ¥65,000 ／ 貸方：当座預金 ¥65,000」と仕訳していたことが判明した。この誤りを修正するための正しい訂正仕訳はどれか。',
    choices: [
      '（借）買掛金 65,000 ／ （貸）現金 65,000',
      '（借）当座預金 65,000 ／ （貸）売掛金 65,000',
      '（借）買掛金 65,000・当座預金 65,000 ／ （貸）売掛金 65,000・現金 65,000',
      '（借）売掛金 65,000・現金 65,000 ／ （貸）買掛金 65,000・当座預金 65,000',
    ],
    correctChoiceIndex: 2,
    explanation: {
      summary:
        '訂正仕訳は「①誤仕訳の逆仕訳（取り消し）」と「②本来の正しい仕訳」を合算して作成します。',
      steps: [
        '【誤仕訳】（借）売掛金 65,000 ／（貸）当座預金 65,000',
        '【①逆仕訳（取消）】（借）当座預金 65,000 ／（貸）売掛金 65,000',
        '【②正しい仕訳】（借）買掛金 65,000 ／（貸）現金 65,000',
        '【①＋②を合算】（借）買掛金 65,000・当座預金 65,000 ／（貸）売掛金 65,000・現金 65,000。これが正解です！',
      ],
      journalBreakdown: {
        debit: [
          { account: '買掛金', amount: 65000, element: 'liability', direction: 'decrease' },
          { account: '当座預金', amount: 65000, element: 'asset', direction: 'increase' },
        ],
        credit: [
          { account: '売掛金', amount: 65000, element: 'asset', direction: 'decrease' },
          { account: '現金', amount: 65000, element: 'asset', direction: 'decrease' },
        ],
      },
      examTip:
        '訂正仕訳は暗算せず、必ずメモに「誤→逆→正→合算」の3行を書くのが満点への最短ルートです（同じ科目が両側にあれば相殺します）。',
      commonMistake:
        '取り消しだけ（選択肢2）や正しい仕訳だけ（選択肢1）を選んでしまうと、誤記帳が残ったままになります。',
      relatedTerms: ['買掛金', '売掛金', '当座預金', '現金'],
    },
    tags: ['決算整理', '訂正仕訳', '逆仕訳'],
  },
  {
    id: 'boki-3k-030',
    examId: 'boki',
    trackId: '3kyu',
    category: '決算整理',
    type: 'choice',
    difficulty: 2,
    estimatedSeconds: 70,
    title: '現金過不足の決算整理（一部原因判明・残額不明）',
    prompt:
      '期中に現金の実際有高が帳簿残高より¥9,000多かったため、現金過不足勘定で処理していた。決算までに受取手数料¥6,500の記帳漏れが判明したが、残額の原因は不明である。決算整理仕訳として正しいものはどれか。',
    choices: [
      '（借）現金過不足 9,000 ／ （貸）受取手数料 6,500・雑益 2,500',
      '（借）現金過不足 9,000 ／ （貸）受取手数料 6,500・雑損 2,500',
      '（借）受取手数料 6,500・雑損 2,500 ／ （貸）現金過不足 9,000',
      '（借）現金 9,000 ／ （貸）受取手数料 6,500・雑益 2,500',
    ],
    correctChoiceIndex: 0,
    explanation: {
      summary:
        '期中の現金過剰は「現金過不足」の貸方に計上されているため、決算時は借方で全額取り崩し、判明分は正しい科目、原因不明の過剰分は「雑益」とします。',
      steps: [
        '期中に実際有高が¥9,000多かったときの仕訳は「借方：現金 ¥9,000 ／ 貸方：現金過不足 ¥9,000」でした。',
        '決算時に現金過不足勘定をゼロにするため、借方に「現金過不足 ¥9,000」を記入します。',
        '原因が判明した受取手数料¥6,500は、収益の増加として貸方に「受取手数料 ¥6,500」を計上します。',
        '残額¥2,500（¥9,000 − ¥6,500）は原因不明のまま現金が多かった（儲かった）ことになるため、貸方に「雑益 ¥2,500」を計上します。',
      ],
      calculation: '雑益 = 現金過剰額 ¥9,000 − 受取手数料記帳漏れ ¥6,500 = ¥2,500',
      journalBreakdown: {
        debit: [{ account: '現金過不足', amount: 9000, element: 'asset', direction: 'decrease' }],
        credit: [
          { account: '受取手数料', amount: 6500, element: 'revenue', direction: 'increase' },
          { account: '雑益', amount: 2500, element: 'revenue', direction: 'increase' },
        ],
      },
      examTip:
        '「過剰（実際＞帳簿）→ 雑益（貸方）」「不足（実際＜帳簿）→ 雑損（借方）」と感情（多いと得＝益、少ないと損）で直感的に覚えましょう！',
      commonMistake:
        '期中にすでに現金を合わせているのに、決算時にまた「現金」を使ってしまう（選択肢4）ミスに要注意です。',
      relatedTerms: ['現金過不足', '雑益', '雑損', '受取手数料'],
    },
    tags: ['決算整理', '現金過不足', '雑益'],
  },

  // =========================================================================
  // 6. 帳簿・財務諸表 (boki-3k-031 .. boki-3k-035): 5 choice with contextTable
  // =========================================================================
  {
    id: 'boki-3k-031',
    examId: 'boki',
    trackId: '3kyu',
    category: '帳簿・財務諸表',
    type: 'choice',
    difficulty: 2,
    estimatedSeconds: 70,
    title: '取引に対応する補助簿の選択（主要簿と補助簿）',
    prompt:
      '下表の取引を行った場合、主要簿（仕訳帳・総勘定元帳）のほかに記入が必要となる「補助簿」の組み合わせとして正しいものはどれか。',
    contextTable: {
      title: '対象取引と備え付けている補助簿',
      headers: ['項目', '内容'],
      rows: [
        ['取引内容', '商品¥200,000を掛けで仕入れ、当社負担の引取運賃¥3,000を現金で支払った。'],
        [
          '補助簿候補',
          '現金出納帳 / 当座預金出納帳 / 仕入帳 / 売上帳 / 買掛金元帳 / 売掛金元帳 / 商品有高帳',
        ],
      ],
    },
    choices: [
      '現金出納帳・仕入帳・買掛金元帳',
      '現金出納帳・仕入帳・買掛金元帳・商品有高帳',
      '当座預金出納帳・仕入帳・買掛金元帳・商品有高帳',
      '現金出納帳・仕入帳・売掛金元帳・商品有高帳',
    ],
    correctChoiceIndex: 1,
    explanation: {
      summary:
        'まず取引の仕訳をイメージすると「仕入／買掛金・現金」となるため、現金出納帳・仕入帳・買掛金元帳に加え、商品の入庫を記録する「商品有高帳」の4冊に記入します。',
      steps: [
        'この取引の仕訳は「借方：仕入 ¥203,000 ／ 貸方：買掛金 ¥200,000・現金 ¥3,000」です。',
        '「現金」が動く → 現金出納帳に記入。',
        '「仕入」が発生 → 仕入帳に記入、さらに商品の在庫が増えるため「商品有高帳」にも記入！',
        '「買掛金」が増加 → 買掛金元帳（仕入先元帳）に記入。以上4冊がすべて揃う選択肢2が正解です。',
      ],
      journalBreakdown: {
        debit: [{ account: '仕入', amount: 203000, element: 'expense', direction: 'increase' }],
        credit: [
          { account: '買掛金', amount: 200000, element: 'liability', direction: 'increase' },
          { account: '現金', amount: 3000, element: 'asset', direction: 'decrease' },
        ],
      },
      examTip:
        '補助簿選択問題は「①まず頭の中で仕訳を切る → ②登場した科目に対応する補助簿をチェック → ③商品が動いたら商品有高帳を忘れない！」の3ステップで完答できます。',
      commonMistake:
        '「商品有高帳」のチェックをうっかり落として選択肢1を選んでしまうミスが第2問で超頻出です！',
      relatedTerms: ['仕入', '買掛金', '現金'],
    },
    tags: ['帳簿', '補助簿の選択', '商品有高帳', '第2問対策'],
  },
  {
    id: 'boki-3k-032',
    examId: 'boki',
    trackId: '3kyu',
    category: '帳簿・財務諸表',
    type: 'choice',
    difficulty: 2,
    estimatedSeconds: 85,
    title: '残高試算表の穴埋め（貸借平均の原理）',
    prompt:
      '下記の残高試算表において、空欄「？」に入る「資本金」の金額として正しいものはどれか。',
    contextTable: {
      title: '残高試算表（単位：円）',
      headers: ['借方残高', '勘定科目', '貸方残高'],
      rows: [
        ['180,000', '現金', ''],
        ['320,000', '売掛金', ''],
        ['150,000', '繰越商品', ''],
        ['400,000', '備品', ''],
        ['', '買掛金', '260,000'],
        ['', '借入金', '300,000'],
        ['', '資本金', '？'],
        ['', '売上', '1,040,000'],
        ['650,000', '仕入', ''],
        ['220,000', '給料', ''],
        ['80,000', '支払家賃', ''],
      ],
    },
    choices: ['¥320,000', '¥400,000', '¥480,000', '¥560,000'],
    correctChoiceIndex: 1,
    explanation: {
      summary:
        '複式簿記では残高試算表の借方合計と貸方合計が必ず一致します（貸借平均の原理）。借方合計¥2,000,000から他の貸方項目を引くと資本金は¥400,000です。',
      steps: [
        '借方残高をすべて合計します：180,000 ＋ 320,000 ＋ 150,000 ＋ 400,000 ＋ 650,000 ＋ 220,000 ＋ 80,000 ＝ ¥2,000,000。',
        '貸方残高の既知項目を合計します：買掛金 260,000 ＋ 借入金 300,000 ＋ 売上 1,040,000 ＝ ¥1,600,000。',
        '貸借合計は必ず一致するため、資本金 ＝ ¥2,000,000 − ¥1,600,000 ＝ ¥400,000 となります。',
      ],
      calculation: '資本金 = 借方合計 ¥2,000,000 − 貸方既知合計 ¥1,600,000 = ¥400,000',
      examTip:
        '電卓を打つときは「資産（現金〜備品）の小計」と「費用（仕入〜支払家賃）の小計」に分けてメモすると検算が速くなります！',
      commonMistake:
        '借方合計を足し間違えたり、売上（収益）を借方に入れてしまう初歩ミスに注意しましょう。',
      relatedTerms: ['資本金', '売上', '仕入', '買掛金'],
    },
    tags: ['残高試算表', '貸借平均の原理', '資本金'],
  },
  {
    id: 'boki-3k-033',
    examId: 'boki',
    trackId: '3kyu',
    category: '帳簿・財務諸表',
    type: 'choice',
    difficulty: 3,
    estimatedSeconds: 95,
    title: '精算表の損益計算書欄と当期純利益の算定',
    prompt:
      '下表は決算整理後の精算表における「損益計算書」欄に記入された各勘定科目の金額である。このときの当期純利益の金額および精算表での記入位置の組み合わせとして正しいものはどれか。',
    contextTable: {
      title: '精算表・損益計算書欄の抜粋（単位：円）',
      headers: ['勘定科目', '借方（費用）', '貸方（収益）'],
      rows: [
        ['売上', '', '1,850,000'],
        ['受取利息', '', '15,000'],
        ['受取手数料', '', '35,000'],
        ['仕入（売上原価）', '1,120,000', ''],
        ['給料', '340,000', ''],
        ['支払家賃', '120,000', ''],
        ['減価償却費', '60,000', ''],
        ['貸倒引当金繰入', '12,000', ''],
        ['消耗品費', '18,000', ''],
        ['法人税、住民税及び事業税', '70,000', ''],
      ],
    },
    choices: [
      '当期純利益 ¥160,000（損益計算書の借方・貸借対照表の貸方に記入）',
      '当期純利益 ¥160,000（損益計算書の貸方・貸借対照表の借方に記入）',
      '当期純利益 ¥230,000（損益計算書の借方・貸借対照表の貸方に記入）',
      '当期純利益 ¥110,000（損益計算書の借方・貸借対照表の貸方に記入）',
    ],
    correctChoiceIndex: 0,
    explanation: {
      summary:
        '収益合計¥1,900,000から費用合計¥1,740,000を差し引いた当期純利益は¥160,000となり、精算表では損益計算書の借方（内側）と貸借対照表の貸方（外側）に記入します。',
      steps: [
        '収益（貸方）合計を計算します：1,850,000 ＋ 15,000 ＋ 35,000 ＝ ¥1,900,000。',
        '費用（借方）合計を計算します：1,120,000 ＋ 340,000 ＋ 120,000 ＋ 60,000 ＋ 12,000 ＋ 18,000 ＋ 70,000 ＝ ¥1,740,000。',
        '当期純利益 ＝ 収益 ¥1,900,000 − 費用 ¥1,740,000 ＝ ¥160,000。',
        '当期純利益は、損益計算書欄の少ない側である「借方」と、純資産の増加を表す貸借対照表欄の「貸方」に記入して両表を締め切ります。',
      ],
      calculation: '当期純利益 = 収益合計 ¥1,900,000 − 費用合計 ¥1,740,000 = ¥160,000',
      examTip:
        '精算表の当期純利益は「損益計算書の左（借方）・貸借対照表の右（貸方）」＝『ハの字（外側どうし）』と視覚で覚えましょう！当期純損失なら逆になります。',
      commonMistake:
        '法人税等¥70,000を費用から引き忘れて税引前利益¥230,000（選択肢3）を選んでしまうミスに注意！',
      relatedTerms: ['売上', '仕入', '法人税、住民税及び事業税', '繰越利益剰余金'],
    },
    tags: ['精算表', '当期純利益', '損益計算書', '第3問対策'],
  },
  {
    id: 'boki-3k-034',
    examId: 'boki',
    trackId: '3kyu',
    category: '帳簿・財務諸表',
    type: 'choice',
    difficulty: 2,
    estimatedSeconds: 85,
    title: '貸借対照表の表示区分と資産の部合計（評価勘定の控除）',
    prompt:
      '下表は決算整理後残高試算表の一部である。これらのみから作成される貸借対照表の「資産の部」合計額として正しいものはどれか。',
    contextTable: {
      title: '決算整理後残高試算表（抜粋）',
      headers: ['勘定科目', '残高（貸借）'],
      rows: [
        ['繰越商品', '¥160,000（借方）'],
        ['売掛金', '¥400,000（借方）'],
        ['貸倒引当金', '¥8,000（貸方）'],
        ['備品', '¥500,000（借方）'],
        ['備品減価償却累計額', '¥150,000（貸方）'],
        ['前払費用', '¥30,000（借方）'],
        ['買掛金', '¥210,000（貸方）'],
      ],
    },
    choices: ['¥722,000', '¥932,000', '¥1,090,000', '¥1,248,000'],
    correctChoiceIndex: 1,
    explanation: {
      summary:
        '貸倒引当金と減価償却累計額は「資産のマイナス（評価勘定）」として資産の部から控除します。買掛金は負債の部なので含めず、資産合計は¥932,000です。',
      steps: [
        '資産のプラス項目を合計します：繰越商品（B/S表示名は「商品」）160,000 ＋ 売掛金 400,000 ＋ 備品 500,000 ＋ 前払費用 30,000 ＝ ¥1,090,000。',
        '資産のマイナス項目（評価勘定）を差し引きます：貸倒引当金 ▲¥8,000、備品減価償却累計額 ▲¥150,000（控除計 ¥158,000）。',
        '買掛金¥210,000は「負債の部」に表示されるため、資産の部には含めません。',
        '資産の部合計 ＝ ¥1,090,000 − ¥158,000 ＝ ¥932,000 となります。',
      ],
      calculation:
        '資産の部合計 = (¥160,000 + ¥400,000 + ¥500,000 + ¥30,000) − (¥8,000 + ¥150,000) = ¥932,000',
      examTip:
        '貸借対照表では「繰越商品 → 商品」「貸倒引当金・減価償却累計額 → 資産の部でマイナス表示」という表示ルールが第3問の頻出ポイントです！',
      commonMistake:
        '貸倒引当金や減価償却累計額を負債だと思って控除し忘れる（¥1,090,000）ミスが非常に多いので要注意。',
      relatedTerms: ['貸倒引当金', '減価償却累計額', '繰越商品', '前払費用'],
    },
    tags: ['貸借対照表', '評価勘定', '表示区分', '第3問対策'],
  },
  {
    id: 'boki-3k-035',
    examId: 'boki',
    trackId: '3kyu',
    category: '帳簿・財務諸表',
    type: 'choice',
    difficulty: 2,
    estimatedSeconds: 80,
    title: '3伝票制における一部現金取引の起票（擬制法）',
    prompt:
      '3伝票制（入金伝票・出金伝票・振替伝票）を採用している当社において、下表の一部現金取引を「取引をいったん全額掛けとしたものとみなす方法（擬制法）」で起票した。正しい伝票の組み合わせはどれか。',
    contextTable: {
      title: '一部現金取引の内容',
      headers: ['項目', '内容'],
      rows: [
        ['取引内容', '商品¥300,000を売り上げ、¥100,000は現金で受け取り、残額¥200,000は掛けとした。'],
        ['本来の仕訳', '（借）現金 100,000・売掛金 200,000 ／ （貸）売上 300,000'],
        ['起票方法', '全額を掛け売上とみなし、同時に一部を現金回収したとみなす方法（擬制法）'],
      ],
    },
    choices: [
      '入金伝票：（貸）売上 ¥100,000 ／ 振替伝票：（借）売掛金 ¥200,000・（貸）売上 ¥200,000',
      '入金伝票：（貸）売掛金 ¥100,000 ／ 振替伝票：（借）売掛金 ¥300,000・（貸）売上 ¥300,000',
      '出金伝票：（借）売掛金 ¥100,000 ／ 振替伝票：（借）売掛金 ¥300,000・（貸）売上 ¥300,000',
      '入金伝票：（貸）売掛金 ¥200,000 ／ 振替伝票：（借）現金 ¥100,000・（貸）売上 ¥100,000',
    ],
    correctChoiceIndex: 1,
    explanation: {
      summary:
        '擬制法では「①全額を掛け売上（振替伝票：売掛金300,000／売上300,000）」と「②現金部分を売掛金回収（入金伝票：貸方・売掛金100,000）」の2枚に起票します。',
      steps: [
        'まず取引全体をいったん掛け売上とみなし、振替伝票に「（借）売掛金 ¥300,000 ／（貸）売上 ¥300,000」と起票します。',
        '次に、受け取った現金¥100,000を売掛金の回収とみなし、入金伝票に「（貸）売掛金 ¥100,000」と起票します（借方の現金¥100,000は入金伝票自体が意味します）。',
        '2枚の伝票を合算すると、売掛金が ¥300,000 − ¥100,000 ＝ ¥200,000 となり、本来の仕訳と完全に一致します！',
        'なお、選択肢1はもう一つの起票法である「分解法（取引を現金分と掛け分に分ける方法）」の記述です。',
      ],
      journalBreakdown: {
        debit: [
          { account: '現金', amount: 100000, element: 'asset', direction: 'increase' },
          { account: '売掛金', amount: 200000, element: 'asset', direction: 'increase' },
        ],
        credit: [{ account: '売上', amount: 300000, element: 'revenue', direction: 'increase' }],
      },
      examTip:
        '「分解法（現金100＋掛け200）」と「擬制法（全額掛け300 → 現金100回収）」の2パターンは、問題文の指示または振替伝票の金額（200か300か）で瞬時に判別できます！',
      commonMistake:
        '分解法（選択肢1）と擬制法（選択肢2）を取り違えるのが定番ミスです。問題文の「全額掛けとみなす」という表現を見逃さないようにしましょう。',
      relatedTerms: ['現金', '売掛金', '売上'],
    },
    tags: ['伝票会計', '3伝票制', '一部現金取引', '擬制法'],
  },
];
