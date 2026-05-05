// ============================================================
//  LuyenViet — app.js
//  Toàn bộ data + logic + AI feedback (Anthropic API)
// ============================================================

// ── STATE ────────────────────────────────────────────────────
const state = {
  level: null,       // 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  mode: null,        // 'topic' | 'free'
  topic: null,       // { name, emoji, prompts, vocab, grammar }
  promptIdx: 0,
  freeTopic: '',
};

// ── DATA ─────────────────────────────────────────────────────
const LEVELS = [
  { id: 'N5', jp: 'N五', name: 'N5', sub: 'Sơ cấp', color: '#10B981' },
  { id: 'N4', jp: 'N四', name: 'N4', sub: 'Tiền trung cấp', color: '#3B82F6' },
  { id: 'N3', jp: 'N三', name: 'N3', sub: 'Trung cấp', color: '#F59E0B' },
  { id: 'N2', jp: 'N二', name: 'N2', sub: 'Tiền cao cấp', color: '#EF4444' },
  { id: 'N1', jp: 'N一', name: 'N1', sub: 'Cao cấp', color: '#8B5CF6' },
];

const TOPICS = {
  N5: [
    {
      name: 'Gia đình', emoji: '👨‍👩‍👧',
      prompts: [
        { jp: '家族について紹介してください。', vn: 'Hãy giới thiệu về gia đình bạn.' },
        { jp: 'お父さん・お母さんはどんな人ですか？', vn: 'Bố mẹ bạn là người như thế nào?' },
        { jp: '家族と何をしますか？', vn: 'Bạn thường làm gì cùng gia đình?' },
      ],
      vocab: [
        { jp: '家族', r: 'かぞく', vn: 'gia đình' },
        { jp: 'お父さん', r: 'おとうさん', vn: 'bố' },
        { jp: 'お母さん', r: 'おかあさん', vn: 'mẹ' },
        { jp: '兄', r: 'あに', vn: 'anh trai' },
        { jp: '姉', r: 'あね', vn: 'chị gái' },
        { jp: '弟', r: 'おとうと', vn: 'em trai' },
        { jp: '妹', r: 'いもうと', vn: 'em gái' },
        { jp: '一緒に', r: 'いっしょに', vn: 'cùng nhau' },
        { jp: '優しい', r: 'やさしい', vn: 'tốt bụng' },
        { jp: '好き', r: 'すき', vn: 'thích' },
      ],
      grammar: [
        { pattern: '〜は〜です', meaning: 'A là B — câu khẳng định cơ bản' },
        { pattern: '〜と〜', meaning: 'Và ~ (liệt kê)' },
        { pattern: '〜が好きです', meaning: 'Thích ~' },
        { pattern: '〜がいます', meaning: 'Có ~ (người/động vật)' },
      ],
    },
    {
      name: 'Thức ăn', emoji: '🍱',
      prompts: [
        { jp: '好きな食べ物は何ですか？', vn: 'Món ăn yêu thích của bạn là gì?' },
        { jp: '毎日何を食べますか？', vn: 'Hằng ngày bạn ăn gì?' },
        { jp: '日本の食べ物を食べたことがありますか？', vn: 'Bạn đã ăn thức ăn Nhật chưa?' },
      ],
      vocab: [
        { jp: '食べ物', r: 'たべもの', vn: 'đồ ăn' },
        { jp: '飲み物', r: 'のみもの', vn: 'đồ uống' },
        { jp: 'ご飯', r: 'ごはん', vn: 'cơm' },
        { jp: 'おいしい', r: 'おいしい', vn: 'ngon' },
        { jp: '甘い', r: 'あまい', vn: 'ngọt' },
        { jp: '辛い', r: 'からい', vn: 'cay' },
        { jp: '毎日', r: 'まいにち', vn: 'mỗi ngày' },
        { jp: '朝ごはん', r: 'あさごはん', vn: 'bữa sáng' },
        { jp: '昼ごはん', r: 'ひるごはん', vn: 'bữa trưa' },
        { jp: '晩ごはん', r: 'ばんごはん', vn: 'bữa tối' },
      ],
      grammar: [
        { pattern: '〜を食べます', meaning: 'Ăn ~' },
        { pattern: '〜が一番好きです', meaning: 'Thích ~ nhất' },
        { pattern: '〜たことがあります', meaning: 'Đã từng ~ (kinh nghiệm)' },
        { pattern: '〜も〜も', meaning: 'Cả ~ lẫn ~' },
      ],
    },
    {
      name: 'Trường học', emoji: '🏫',
      prompts: [
        { jp: '学校はどうですか？', vn: 'Trường học của bạn như thế nào?' },
        { jp: '好きな科目は何ですか？', vn: 'Môn học yêu thích của bạn là gì?' },
        { jp: '学校で何をしますか？', vn: 'Bạn làm gì ở trường?' },
      ],
      vocab: [
        { jp: '学校', r: 'がっこう', vn: 'trường học' },
        { jp: '先生', r: 'せんせい', vn: 'giáo viên' },
        { jp: '友達', r: 'ともだち', vn: 'bạn bè' },
        { jp: '勉強する', r: 'べんきょうする', vn: 'học' },
        { jp: '科目', r: 'かもく', vn: 'môn học' },
        { jp: '数学', r: 'すうがく', vn: 'toán học' },
        { jp: '英語', r: 'えいご', vn: 'tiếng Anh' },
        { jp: '楽しい', r: 'たのしい', vn: 'vui' },
        { jp: '難しい', r: 'むずかしい', vn: 'khó' },
        { jp: '毎日', r: 'まいにち', vn: 'mỗi ngày' },
      ],
      grammar: [
        { pattern: '〜に行きます', meaning: 'Đi đến ~' },
        { pattern: '〜で〜をします', meaning: 'Làm ~ ở ~' },
        { pattern: '〜は〜より〜です', meaning: 'A ~ hơn B' },
        { pattern: 'どんな〜ですか', meaning: 'Là loại ~ gì?' },
      ],
    },
    {
      name: 'Sở thích', emoji: '🎮',
      prompts: [
        { jp: '趣味は何ですか？', vn: 'Sở thích của bạn là gì?' },
        { jp: '週末に何をしますか？', vn: 'Cuối tuần bạn làm gì?' },
        { jp: 'どんな音楽が好きですか？', vn: 'Bạn thích nhạc gì?' },
      ],
      vocab: [
        { jp: '趣味', r: 'しゅみ', vn: 'sở thích' },
        { jp: '音楽', r: 'おんがく', vn: 'âm nhạc' },
        { jp: '映画', r: 'えいが', vn: 'phim' },
        { jp: 'ゲーム', r: 'ゲーム', vn: 'trò chơi điện tử' },
        { jp: '読む', r: 'よむ', vn: 'đọc' },
        { jp: '聴く', r: 'きく', vn: 'nghe' },
        { jp: '週末', r: 'しゅうまつ', vn: 'cuối tuần' },
        { jp: 'よく', r: 'よく', vn: 'thường xuyên' },
        { jp: '時々', r: 'ときどき', vn: 'thỉnh thoảng' },
        { jp: '楽しむ', r: 'たのしむ', vn: 'tận hưởng' },
      ],
      grammar: [
        { pattern: '〜のが好きです', meaning: 'Thích làm ~' },
        { pattern: 'よく〜ます', meaning: 'Thường xuyên ~' },
        { pattern: '〜たり〜たりします', meaning: 'Làm các thứ như ~ và ~' },
        { pattern: '〜ことがあります', meaning: 'Thỉnh thoảng có ~' },
      ],
    },
    {
      name: 'Thời tiết', emoji: '⛅',
      prompts: [
        { jp: '今日の天気はどうですか？', vn: 'Thời tiết hôm nay như thế nào?' },
        { jp: '好きな季節はいつですか？', vn: 'Bạn thích mùa nào nhất?' },
        { jp: '今、外は寒いですか？', vn: 'Bây giờ bên ngoài có lạnh không?' },
      ],
      vocab: [
        { jp: '天気', r: 'てんき', vn: 'thời tiết' },
        { jp: '晴れ', r: 'はれ', vn: 'nắng' },
        { jp: '雨', r: 'あめ', vn: 'mưa' },
        { jp: '雪', r: 'ゆき', vn: 'tuyết' },
        { jp: '暑い', r: 'あつい', vn: 'nóng' },
        { jp: '寒い', r: 'さむい', vn: 'lạnh' },
        { jp: '春', r: 'はる', vn: 'mùa xuân' },
        { jp: '夏', r: 'なつ', vn: 'mùa hè' },
        { jp: '秋', r: 'あき', vn: 'mùa thu' },
        { jp: '冬', r: 'ふゆ', vn: 'mùa đông' },
      ],
      grammar: [
        { pattern: '〜です / ではありません', meaning: 'Là ~ / Không phải ~' },
        { pattern: '〜ですね', meaning: '~ nhỉ (xác nhận, đồng tình)' },
        { pattern: '〜が一番〜です', meaning: '~ là ~ nhất' },
        { pattern: 'どんな〜ですか', meaning: 'Như thế nào?' },
      ],
    },
    {
      name: 'Tự giới thiệu', emoji: '👋',
      prompts: [
        { jp: '自己紹介をしてください。', vn: 'Hãy tự giới thiệu bản thân.' },
        { jp: 'お名前は何ですか？どこから来ましたか？', vn: 'Tên bạn là gì? Bạn đến từ đâu?' },
        { jp: 'これからよろしくお願いします、と言ってください。', vn: 'Hãy nói lời chào hỏi khi gặp lần đầu.' },
      ],
      vocab: [
        { jp: '名前', r: 'なまえ', vn: 'tên' },
        { jp: '〜歳', r: '〜さい', vn: '~ tuổi' },
        { jp: '国', r: 'くに', vn: 'đất nước' },
        { jp: '学生', r: 'がくせい', vn: 'sinh viên' },
        { jp: '会社員', r: 'かいしゃいん', vn: 'nhân viên công ty' },
        { jp: 'はじめまして', r: 'はじめまして', vn: 'Rất vui được gặp bạn' },
        { jp: 'よろしく', r: 'よろしく', vn: 'mong nhận được sự giúp đỡ' },
        { jp: '住む', r: 'すむ', vn: 'sinh sống' },
      ],
      grammar: [
        { pattern: '私は〜です', meaning: 'Tôi là ~' },
        { pattern: '〜から来ました', meaning: 'Đến từ ~' },
        { pattern: '〜に住んでいます', meaning: 'Đang sống ở ~' },
        { pattern: 'どうぞよろしくお願いします', meaning: 'Mong nhận được sự giúp đỡ (trang trọng)' },
      ],
    },
  ],

  N4: [
    {
      name: 'Du lịch', emoji: '✈️',
      prompts: [
        { jp: '旅行した経験を教えてください。', vn: 'Hãy kể về chuyến du lịch của bạn.' },
        { jp: '行きたい国はどこですか？理由も教えてください。', vn: 'Bạn muốn đến nước nào? Hãy nói lý do.' },
        { jp: '旅行の準備として何をしますか？', vn: 'Bạn chuẩn bị gì trước khi đi du lịch?' },
      ],
      vocab: [
        { jp: '旅行', r: 'りょこう', vn: 'du lịch' },
        { jp: '予約する', r: 'よやくする', vn: 'đặt trước' },
        { jp: '観光地', r: 'かんこうち', vn: 'điểm du lịch' },
        { jp: 'お土産', r: 'おみやげ', vn: 'quà lưu niệm' },
        { jp: '宿泊する', r: 'しゅくはくする', vn: 'lưu trú' },
        { jp: '景色', r: 'けしき', vn: 'phong cảnh' },
        { jp: '経験', r: 'けいけん', vn: 'kinh nghiệm' },
        { jp: '思い出', r: 'おもいで', vn: 'kỷ niệm' },
        { jp: '楽しみにする', r: 'たのしみにする', vn: 'mong chờ' },
        { jp: '感動する', r: 'かんどうする', vn: 'xúc động' },
      ],
      grammar: [
        { pattern: '〜てみる', meaning: 'Thử làm ~ (lần đầu)' },
        { pattern: '〜たいと思っています', meaning: 'Đang nghĩ muốn ~' },
        { pattern: '〜ために', meaning: 'Để ~ (mục đích)' },
        { pattern: '〜たことがある', meaning: 'Đã từng ~ (kinh nghiệm)' },
        { pattern: '〜ながら', meaning: 'Vừa ~ vừa ~' },
      ],
    },
    {
      name: 'Công việc', emoji: '💼',
      prompts: [
        { jp: 'あなたの仕事や勉強について教えてください。', vn: 'Hãy kể về công việc / việc học của bạn.' },
        { jp: '将来どんな仕事をしたいですか？', vn: 'Tương lai bạn muốn làm công việc gì?' },
        { jp: '仕事の中で何が一番大変ですか？', vn: 'Điều gì khó nhất trong công việc của bạn?' },
      ],
      vocab: [
        { jp: '仕事', r: 'しごと', vn: 'công việc' },
        { jp: '会社', r: 'かいしゃ', vn: 'công ty' },
        { jp: '上司', r: 'じょうし', vn: 'sếp' },
        { jp: '同僚', r: 'どうりょう', vn: 'đồng nghiệp' },
        { jp: '給料', r: 'きゅうりょう', vn: 'lương' },
        { jp: '残業する', r: 'ざんぎょうする', vn: 'làm thêm giờ' },
        { jp: '将来', r: 'しょうらい', vn: 'tương lai' },
        { jp: '夢', r: 'ゆめ', vn: 'ước mơ' },
        { jp: '大変', r: 'たいへん', vn: 'vất vả, khó khăn' },
        { jp: '頑張る', r: 'がんばる', vn: 'cố gắng' },
      ],
      grammar: [
        { pattern: '〜ようになる', meaning: 'Trở nên có thể ~ / bắt đầu ~' },
        { pattern: '〜てしまう', meaning: 'Lỡ ~ / đã xong (nuối tiếc/hoàn thành)' },
        { pattern: '〜ばよかった', meaning: 'Giá mà đã ~ (hối tiếc)' },
        { pattern: '〜はずだ', meaning: 'Đáng lẽ phải ~ / chắc là ~' },
        { pattern: '〜なければならない', meaning: 'Phải ~ (bắt buộc)' },
      ],
    },
    {
      name: 'Sức khỏe', emoji: '🏃',
      prompts: [
        { jp: '健康のために何をしていますか？', vn: 'Bạn làm gì để giữ sức khỏe?' },
        { jp: '運動する習慣がありますか？', vn: 'Bạn có thói quen tập thể dục không?' },
        { jp: '病気になったとき、どうしますか？', vn: 'Khi bị bệnh bạn làm gì?' },
      ],
      vocab: [
        { jp: '健康', r: 'けんこう', vn: 'sức khỏe' },
        { jp: '運動する', r: 'うんどうする', vn: 'tập thể dục' },
        { jp: '病院', r: 'びょういん', vn: 'bệnh viện' },
        { jp: '薬', r: 'くすり', vn: 'thuốc' },
        { jp: '習慣', r: 'しゅうかん', vn: 'thói quen' },
        { jp: '体重', r: 'たいじゅう', vn: 'cân nặng' },
        { jp: '疲れる', r: 'つかれる', vn: 'mệt mỏi' },
        { jp: '休む', r: 'やすむ', vn: 'nghỉ ngơi' },
        { jp: '食生活', r: 'しょくせいかつ', vn: 'chế độ ăn uống' },
        { jp: '睡眠', r: 'すいみん', vn: 'giấc ngủ' },
      ],
      grammar: [
        { pattern: '〜ようにしている', meaning: 'Đang cố gắng để ~' },
        { pattern: '〜たほうがいい', meaning: 'Nên ~ (lời khuyên)' },
        { pattern: '〜すぎる', meaning: 'Quá ~ (mức độ)' },
        { pattern: '〜と、〜', meaning: 'Nếu ~ thì ~ (điều kiện tự nhiên)' },
        { pattern: '〜てから', meaning: 'Sau khi ~ thì ~' },
      ],
    },
    {
      name: 'Phim & Âm nhạc', emoji: '🎬',
      prompts: [
        { jp: '好きな映画や音楽を教えてください。', vn: 'Hãy nói về phim hoặc âm nhạc bạn thích.' },
        { jp: '最近見た映画はどんな映画でしたか？', vn: 'Bộ phim gần đây bạn xem là phim gì?' },
        { jp: 'おすすめの曲やアーティストは？', vn: 'Bài hát / nghệ sĩ bạn muốn giới thiệu là gì?' },
      ],
      vocab: [
        { jp: '映画', r: 'えいが', vn: 'phim' },
        { jp: '音楽', r: 'おんがく', vn: 'âm nhạc' },
        { jp: '歌手', r: 'かしゅ', vn: 'ca sĩ' },
        { jp: '感動的', r: 'かんどうてき', vn: 'cảm động' },
        { jp: '笑う', r: 'わらう', vn: 'cười' },
        { jp: '泣く', r: 'なく', vn: 'khóc' },
        { jp: 'ストーリー', r: 'ストーリー', vn: 'cốt truyện' },
        { jp: 'おすすめ', r: 'おすすめ', vn: 'gợi ý, giới thiệu' },
        { jp: '印象に残る', r: 'いんしょうにのこる', vn: 'đọng lại ấn tượng' },
        { jp: 'ジャンル', r: 'ジャンル', vn: 'thể loại' },
      ],
      grammar: [
        { pattern: '〜と思います', meaning: 'Tôi nghĩ rằng ~' },
        { pattern: '〜という〜', meaning: '~ tên là ~' },
        { pattern: '〜てよかった', meaning: 'May mà đã ~ / Vui vì đã ~' },
        { pattern: '〜ので', meaning: 'Vì ~ nên ~ (lý do)' },
        { pattern: '〜し、〜し', meaning: 'Vừa ~ vừa ~ (liệt kê lý do)' },
      ],
    },
    {
      name: 'Mua sắm', emoji: '🛍️',
      prompts: [
        { jp: '最近何かを買いましたか？', vn: 'Gần đây bạn có mua gì không?' },
        { jp: 'どこで買い物をすることが多いですか？', vn: 'Bạn thường mua sắm ở đâu?' },
        { jp: '欲しいものは何ですか？なぜですか？', vn: 'Bạn muốn mua gì? Tại sao?' },
      ],
      vocab: [
        { jp: '買い物', r: 'かいもの', vn: 'mua sắm' },
        { jp: '値段', r: 'ねだん', vn: 'giá cả' },
        { jp: '高い', r: 'たかい', vn: 'đắt' },
        { jp: '安い', r: 'やすい', vn: 'rẻ' },
        { jp: 'セール', r: 'セール', vn: 'giảm giá' },
        { jp: '試着する', r: 'しちゃくする', vn: 'thử đồ' },
        { jp: '財布', r: 'さいふ', vn: 'ví' },
        { jp: 'ブランド', r: 'ブランド', vn: 'thương hiệu' },
        { jp: 'クレジットカード', r: 'クレジットカード', vn: 'thẻ tín dụng' },
        { jp: '返品する', r: 'へんぴんする', vn: 'trả hàng' },
      ],
      grammar: [
        { pattern: '〜てみる', meaning: 'Thử ~ xem sao' },
        { pattern: '〜にする', meaning: 'Quyết định chọn ~' },
        { pattern: '〜かどうか', meaning: 'Có ~ hay không' },
        { pattern: '〜より〜のほうが', meaning: 'So với ~ thì ~ hơn' },
        { pattern: '〜くれる / もらう', meaning: 'Cho ~ / Nhận được ~' },
      ],
    },
    {
      name: 'Thói quen hằng ngày', emoji: '🌅',
      prompts: [
        { jp: '毎朝何時に起きますか？朝の習慣を教えてください。', vn: 'Buổi sáng bạn thức dậy lúc mấy giờ? Thói quen buổi sáng của bạn?' },
        { jp: '一日のスケジュールを説明してください。', vn: 'Hãy mô tả lịch trình một ngày của bạn.' },
        { jp: '夜、寝る前に何をしますか？', vn: 'Buổi tối trước khi ngủ bạn làm gì?' },
      ],
      vocab: [
        { jp: '起きる', r: 'おきる', vn: 'thức dậy' },
        { jp: '寝る', r: 'ねる', vn: 'đi ngủ' },
        { jp: '朝ごはん', r: 'あさごはん', vn: 'bữa sáng' },
        { jp: 'シャワーを浴びる', r: 'シャワーをあびる', vn: 'tắm' },
        { jp: '歯を磨く', r: 'はをみがく', vn: 'đánh răng' },
        { jp: '通勤する', r: 'つうきんする', vn: 'đi làm' },
        { jp: '〜時ごろ', r: '〜じごろ', vn: 'khoảng ~ giờ' },
        { jp: 'いつも', r: 'いつも', vn: 'luôn luôn' },
        { jp: 'たいてい', r: 'たいてい', vn: 'thường thường' },
        { jp: '準備する', r: 'じゅんびする', vn: 'chuẩn bị' },
      ],
      grammar: [
        { pattern: '〜てから〜', meaning: 'Sau khi ~ rồi ~' },
        { pattern: '〜ている', meaning: 'Đang ~ / Thói quen ~' },
        { pattern: '〜前に', meaning: 'Trước khi ~' },
        { pattern: '〜後で', meaning: 'Sau khi ~' },
        { pattern: 'まず〜、次に〜', meaning: 'Đầu tiên ~, tiếp theo ~' },
      ],
    },
  ],

  N3: [
    {
      name: 'Môi trường', emoji: '🌍',
      prompts: [
        { jp: '環境問題についてどう思いますか？', vn: 'Bạn nghĩ gì về vấn đề môi trường?' },
        { jp: '地球温暖化の原因と解決策について書いてください。', vn: 'Viết về nguyên nhân và giải pháp của biến đổi khí hậu.' },
        { jp: '日常生活でできる環境保護の取り組みを紹介してください。', vn: 'Giới thiệu những việc bảo vệ môi trường bạn có thể làm trong cuộc sống hằng ngày.' },
      ],
      vocab: [
        { jp: '環境', r: 'かんきょう', vn: 'môi trường' },
        { jp: '地球温暖化', r: 'ちきゅうおんだんか', vn: 'biến đổi khí hậu' },
        { jp: 'リサイクル', r: 'リサイクル', vn: 'tái chế' },
        { jp: '排気ガス', r: 'はいきガス', vn: 'khí thải' },
        { jp: '再生可能エネルギー', r: 'さいせいかのうエネルギー', vn: 'năng lượng tái tạo' },
        { jp: '自然破壊', r: 'しぜんはかい', vn: 'phá hoại thiên nhiên' },
        { jp: '取り組む', r: 'とりくむ', vn: 'nỗ lực giải quyết' },
        { jp: '削減する', r: 'さくげんする', vn: 'cắt giảm' },
        { jp: '影響', r: 'えいきょう', vn: 'ảnh hưởng' },
        { jp: '将来の世代', r: 'しょうらいのせだい', vn: 'thế hệ tương lai' },
      ],
      grammar: [
        { pattern: '〜によって', meaning: 'Tùy theo ~ / Do ~ gây ra' },
        { pattern: '〜だけでなく〜も', meaning: 'Không chỉ ~ mà còn ~' },
        { pattern: '〜ために', meaning: 'Để ~ (mục đích rõ ràng)' },
        { pattern: '〜に対して', meaning: 'Đối với ~ / Về ~' },
        { pattern: '〜べきだ', meaning: 'Nên ~ (trách nhiệm, đúng đắn)' },
      ],
    },
    {
      name: 'Giáo dục', emoji: '📚',
      prompts: [
        { jp: '日本の教育制度について知っていることを書いてください。', vn: 'Viết những gì bạn biết về hệ thống giáo dục Nhật Bản.' },
        { jp: '勉強する動機について説明してください。', vn: 'Hãy nói về động lực học tập của bạn.' },
        { jp: '良い先生の条件は何だと思いますか？', vn: 'Bạn nghĩ điều kiện để trở thành giáo viên tốt là gì?' },
      ],
      vocab: [
        { jp: '教育', r: 'きょういく', vn: 'giáo dục' },
        { jp: '受験', r: 'じゅけん', vn: 'thi cử' },
        { jp: '奨学金', r: 'しょうがくきん', vn: 'học bổng' },
        { jp: '意欲', r: 'いよく', vn: 'ý chí, động lực' },
        { jp: '自主学習', r: 'じしゅがくしゅう', vn: 'tự học' },
        { jp: '目標', r: 'もくひょう', vn: 'mục tiêu' },
        { jp: '能力', r: 'のうりょく', vn: 'năng lực' },
        { jp: '知識', r: 'ちしき', vn: 'kiến thức' },
        { jp: '成績', r: 'せいせき', vn: 'kết quả học tập' },
        { jp: '大学院', r: 'だいがくいん', vn: 'sau đại học' },
      ],
      grammar: [
        { pattern: '〜にとって', meaning: 'Đối với ~ (quan điểm cá nhân)' },
        { pattern: '〜ことによって', meaning: 'Bằng cách ~' },
        { pattern: '〜ようになる', meaning: 'Dần dần trở nên ~ / có thể ~' },
        { pattern: '〜かどうか', meaning: 'Có ~ hay không' },
        { pattern: '〜という点で', meaning: 'Về mặt ~' },
      ],
    },
    {
      name: 'Văn hóa Nhật', emoji: '⛩️',
      prompts: [
        { jp: '日本の文化で興味があるものを紹介してください。', vn: 'Giới thiệu điều gì đó về văn hóa Nhật khiến bạn thấy thú vị.' },
        { jp: '日本のマナーや習慣で、驚いたことはありますか？', vn: 'Bạn có ngạc nhiên về phong tục hay phép lịch sự nào của Nhật không?' },
        { jp: '伝統文化と現代文化の違いについて考えてみてください。', vn: 'Hãy suy nghĩ về sự khác biệt giữa văn hóa truyền thống và hiện đại.' },
      ],
      vocab: [
        { jp: '文化', r: 'ぶんか', vn: 'văn hóa' },
        { jp: '伝統', r: 'でんとう', vn: 'truyền thống' },
        { jp: 'マナー', r: 'マナー', vn: 'phép lịch sự' },
        { jp: '習慣', r: 'しゅうかん', vn: 'phong tục, thói quen' },
        { jp: '礼儀', r: 'れいぎ', vn: 'lễ nghĩa' },
        { jp: '着物', r: 'きもの', vn: 'kimono' },
        { jp: '祭り', r: 'まつり', vn: 'lễ hội' },
        { jp: '独特', r: 'どくとく', vn: 'độc đáo' },
        { jp: '尊重する', r: 'そんちょうする', vn: 'tôn trọng' },
        { jp: '影響を受ける', r: 'えいきょうをうける', vn: 'bị ảnh hưởng' },
      ],
      grammar: [
        { pattern: '〜として', meaning: 'Với tư cách là ~ / Được coi là ~' },
        { pattern: '〜に関して', meaning: 'Liên quan đến ~' },
        { pattern: '〜ながらも', meaning: 'Tuy ~ nhưng vẫn ~' },
        { pattern: '〜わけではない', meaning: 'Không có nghĩa là ~' },
        { pattern: '〜一方で', meaning: 'Trong khi đó ~ / Mặt khác ~' },
      ],
    },
    {
      name: 'Công nghệ & MXH', emoji: '📱',
      prompts: [
        { jp: 'SNSのメリットとデメリットについて書いてください。', vn: 'Viết về ưu và nhược điểm của mạng xã hội.' },
        { jp: '技術の進歩は生活をどう変えましたか？', vn: 'Sự tiến bộ công nghệ đã thay đổi cuộc sống như thế nào?' },
        { jp: 'スマートフォンなしで生活できますか？理由も教えてください。', vn: 'Bạn có thể sống mà không có smartphone không? Hãy nêu lý do.' },
      ],
      vocab: [
        { jp: '技術', r: 'ぎじゅつ', vn: 'công nghệ' },
        { jp: 'SNS', r: 'エスエヌエス', vn: 'mạng xã hội' },
        { jp: '情報', r: 'じょうほう', vn: 'thông tin' },
        { jp: 'コミュニケーション', r: 'コミュニケーション', vn: 'giao tiếp' },
        { jp: '便利', r: 'べんり', vn: 'tiện lợi' },
        { jp: '依存する', r: 'いぞんする', vn: 'phụ thuộc' },
        { jp: 'プライバシー', r: 'プライバシー', vn: 'quyền riêng tư' },
        { jp: '発展する', r: 'はってんする', vn: 'phát triển' },
        { jp: 'デジタル化', r: 'デジタルか', vn: 'số hóa' },
        { jp: '普及する', r: 'ふきゅうする', vn: 'phổ biến' },
      ],
      grammar: [
        { pattern: '〜に伴い', meaning: 'Cùng với ~ / Kéo theo ~' },
        { pattern: '〜反面', meaning: 'Trong khi ~ / Nhưng mặt khác ~' },
        { pattern: '〜ことで', meaning: 'Bằng việc ~ / Nhờ ~' },
        { pattern: '〜かねない', meaning: 'Có thể dẫn đến ~ (tiêu cực)' },
        { pattern: '〜だろうか', meaning: 'Liệu ~ có không? (nghi vấn)' },
      ],
    },
    {
      name: 'Cuộc sống đô thị', emoji: '🏙️',
      prompts: [
        { jp: '都市生活と田舎生活のどちらが好きですか？', vn: 'Bạn thích cuộc sống đô thị hay nông thôn?' },
        { jp: 'あなたの街のいいところと悪いところを書いてください。', vn: 'Viết về điểm tốt và điểm chưa tốt của thành phố bạn đang ở.' },
        { jp: '住みやすい街の条件は何ですか？', vn: 'Điều kiện để một thành phố đáng sống là gì?' },
      ],
      vocab: [
        { jp: '都市', r: 'とし', vn: 'đô thị' },
        { jp: '田舎', r: 'いなか', vn: 'nông thôn' },
        { jp: '交通', r: 'こうつう', vn: 'giao thông' },
        { jp: '渋滞', r: 'じゅうたい', vn: 'kẹt xe' },
        { jp: '治安', r: 'ちあん', vn: 'an ninh' },
        { jp: '騒音', r: 'そうおん', vn: 'tiếng ồn' },
        { jp: '利便性', r: 'りべんせい', vn: 'sự tiện lợi' },
        { jp: '自然', r: 'しぜん', vn: 'thiên nhiên' },
        { jp: '人口', r: 'じんこう', vn: 'dân số' },
        { jp: '格差', r: 'かくさ', vn: 'khoảng cách, bất bình đẳng' },
      ],
      grammar: [
        { pattern: '〜に比べて', meaning: 'So với ~' },
        { pattern: '〜とすれば', meaning: 'Nếu giả sử ~ thì' },
        { pattern: '〜ほど〜ない', meaning: 'Không ~ bằng ~' },
        { pattern: '〜点では', meaning: 'Về mặt ~ / Ở điểm ~' },
        { pattern: '〜からこそ', meaning: 'Chính vì ~ mà ~' },
      ],
    },
  ],

  N2: [
    {
      name: 'Kinh tế xã hội', emoji: '📊',
      prompts: [
        { jp: '少子高齢化問題と社会への影響について論じてください。', vn: 'Thảo luận về vấn đề già hóa dân số và tác động đến xã hội.' },
        { jp: '経済格差はなぜ生まれるのか、あなたの考えを述べてください。', vn: 'Hãy trình bày ý kiến về nguyên nhân của bất bình đẳng kinh tế.' },
        { jp: 'グローバル化のメリットとデメリットを分析してください。', vn: 'Phân tích ưu và nhược điểm của toàn cầu hóa.' },
      ],
      vocab: [
        { jp: '少子高齢化', r: 'しょうしこうれいか', vn: 'già hóa dân số' },
        { jp: '格差', r: 'かくさ', vn: 'bất bình đẳng' },
        { jp: 'グローバル化', r: 'グローバルか', vn: 'toàn cầu hóa' },
        { jp: '財政', r: 'ざいせい', vn: 'tài chính công' },
        { jp: '貧困', r: 'ひんこん', vn: 'nghèo đói' },
        { jp: '福祉', r: 'ふくし', vn: 'phúc lợi xã hội' },
        { jp: '構造的', r: 'こうぞうてき', vn: 'mang tính cấu trúc' },
        { jp: '是正する', r: 'ぜせいする', vn: 'khắc phục, chỉnh sửa' },
        { jp: '持続可能', r: 'じぞくかのう', vn: 'bền vững' },
        { jp: '政策', r: 'せいさく', vn: 'chính sách' },
      ],
      grammar: [
        { pattern: '〜にもかかわらず', meaning: 'Mặc dù ~ nhưng vẫn' },
        { pattern: '〜に伴って', meaning: 'Cùng với ~ / Do ~' },
        { pattern: '〜をめぐって', meaning: 'Xoay quanh vấn đề ~' },
        { pattern: '〜とともに', meaning: 'Cùng với ~ (đồng thời)' },
        { pattern: '〜を踏まえて', meaning: 'Dựa trên / Căn cứ vào ~' },
      ],
    },
    {
      name: 'Khoa học & Tương lai', emoji: '🔬',
      prompts: [
        { jp: 'AIの発展が社会に与える影響について考えてください。', vn: 'Hãy suy nghĩ về tác động của sự phát triển AI đến xã hội.' },
        { jp: '宇宙開発の意義と課題について述べてください。', vn: 'Trình bày ý nghĩa và thách thức của việc khám phá vũ trụ.' },
        { jp: '医療技術の進歩は倫理問題をどのように生むか論じてください。', vn: 'Thảo luận về cách tiến bộ y tế tạo ra các vấn đề đạo đức.' },
      ],
      vocab: [
        { jp: '人工知能', r: 'じんこうちのう', vn: 'trí tuệ nhân tạo' },
        { jp: '倫理', r: 'りんり', vn: 'đạo đức' },
        { jp: '革新', r: 'かくしん', vn: 'cách tân, đổi mới' },
        { jp: 'リスク', r: 'リスク', vn: 'rủi ro' },
        { jp: '自動化', r: 'じどうか', vn: 'tự động hóa' },
        { jp: '予測する', r: 'よそくする', vn: 'dự đoán' },
        { jp: '克服する', r: 'こくふくする', vn: 'khắc phục' },
        { jp: '普及率', r: 'ふきゅうりつ', vn: 'tỷ lệ phổ biến' },
        { jp: '規制', r: 'きせい', vn: 'quy định, kiểm soát' },
        { jp: '共存する', r: 'きょうぞんする', vn: 'cùng tồn tại' },
      ],
      grammar: [
        { pattern: '〜に際して', meaning: 'Khi ~ / Nhân dịp ~' },
        { pattern: '〜に基づいて', meaning: 'Dựa trên ~' },
        { pattern: '〜とは言えない', meaning: 'Không thể nói rằng ~' },
        { pattern: '〜ざるを得ない', meaning: 'Không thể không ~ / Buộc phải ~' },
        { pattern: '〜にすぎない', meaning: 'Chỉ là ~ mà thôi' },
      ],
    },
    {
      name: 'Quan hệ con người', emoji: '🤝',
      prompts: [
        { jp: '現代社会における人間関係の変化について論じてください。', vn: 'Thảo luận về sự thay đổi trong mối quan hệ con người ở xã hội hiện đại.' },
        { jp: '世代間の価値観の違いはなぜ生まれるのか述べてください。', vn: 'Hãy nói về lý do có sự khác biệt về giá trị giữa các thế hệ.' },
        { jp: 'コミュニケーション能力を高めるにはどうすればよいか。', vn: 'Làm thế nào để nâng cao kỹ năng giao tiếp?' },
      ],
      vocab: [
        { jp: '価値観', r: 'かちかん', vn: 'hệ giá trị' },
        { jp: '世代', r: 'せだい', vn: 'thế hệ' },
        { jp: '摩擦', r: 'まさつ', vn: 'xung đột, bất hòa' },
        { jp: '共感', r: 'きょうかん', vn: 'đồng cảm' },
        { jp: '対立', r: 'たいりつ', vn: 'đối lập, mâu thuẫn' },
        { jp: '相互理解', r: 'そうごりかい', vn: 'hiểu biết lẫn nhau' },
        { jp: '孤立', r: 'こりつ', vn: 'cô lập' },
        { jp: '信頼', r: 'しんらい', vn: 'niềm tin' },
        { jp: '多様性', r: 'たようせい', vn: 'sự đa dạng' },
        { jp: '協調性', r: 'きょうちょうせい', vn: 'tinh thần hợp tác' },
      ],
      grammar: [
        { pattern: '〜であるがゆえに', meaning: 'Chính vì là ~ mà' },
        { pattern: '〜に関わらず', meaning: 'Bất kể ~ / Không phân biệt ~' },
        { pattern: '〜においては', meaning: 'Trong bối cảnh ~ / Về ~' },
        { pattern: '〜とは限らない', meaning: 'Không nhất thiết là ~' },
        { pattern: '〜をよそに', meaning: 'Bất chấp ~ / Không đếm xỉa đến ~' },
      ],
    },
  ],

  N1: [
    {
      name: 'Triết học & Tư duy', emoji: '🧠',
      prompts: [
        { jp: '「幸福とは何か」について、哲学的視点から論じてください。', vn: 'Hãy thảo luận về "hạnh phúc là gì" từ góc độ triết học.' },
        { jp: '道徳と法律の相違点と関係性を分析してください。', vn: 'Phân tích điểm khác biệt và mối quan hệ giữa đạo đức và pháp luật.' },
        { jp: '「自由」と「責任」はどのような関係にあるか論じてください。', vn: 'Thảo luận về mối quan hệ giữa "tự do" và "trách nhiệm".' },
      ],
      vocab: [
        { jp: '概念', r: 'がいねん', vn: 'khái niệm' },
        { jp: '本質', r: 'ほんしつ', vn: 'bản chất' },
        { jp: '矛盾', r: 'むじゅん', vn: 'mâu thuẫn' },
        { jp: '見解', r: 'けんかい', vn: 'quan điểm' },
        { jp: '普遍性', r: 'ふへんせい', vn: 'tính phổ quát' },
        { jp: '相対的', r: 'そうたいてき', vn: 'tương đối' },
        { jp: '批判的', r: 'ひはんてき', vn: 'phê phán' },
        { jp: '論証', r: 'ろんしょう', vn: 'luận chứng' },
        { jp: '前提', r: 'ぜんてい', vn: 'tiền đề' },
        { jp: '帰結する', r: 'きけつする', vn: 'dẫn đến kết luận' },
      ],
      grammar: [
        { pattern: '〜ならではの', meaning: 'Chỉ ~ mới có / Đặc trưng của ~' },
        { pattern: '〜に至っては', meaning: 'Thậm chí đến mức ~ (cực đoan)' },
        { pattern: '〜ずにはおかない', meaning: 'Nhất định sẽ ~ / không thể không ~' },
        { pattern: '〜とも〜とも言えない', meaning: 'Không thể nói là ~ cũng chẳng phải ~' },
        { pattern: '〜がゆえに', meaning: 'Vì là ~ / Do ~' },
      ],
    },
    {
      name: 'Chính trị & Xã hội', emoji: '🏛️',
      prompts: [
        { jp: '民主主義の課題と可能性について論じてください。', vn: 'Thảo luận về thách thức và tiềm năng của nền dân chủ.' },
        { jp: '国際社会における日本の役割について考えてください。', vn: 'Suy nghĩ về vai trò của Nhật Bản trong cộng đồng quốc tế.' },
        { jp: '言論の自由と規制のバランスについてあなたの考えを述べてください。', vn: 'Trình bày ý kiến về sự cân bằng giữa tự do ngôn luận và kiểm duyệt.' },
      ],
      vocab: [
        { jp: '民主主義', r: 'みんしゅしゅぎ', vn: 'dân chủ' },
        { jp: '主権', r: 'しゅけん', vn: 'chủ quyền' },
        { jp: '言論の自由', r: 'げんろんのじゆう', vn: 'tự do ngôn luận' },
        { jp: '権利', r: 'けんり', vn: 'quyền lợi' },
        { jp: '義務', r: 'ぎむ', vn: 'nghĩa vụ' },
        { jp: '国際秩序', r: 'こくさいちつじょ', vn: 'trật tự quốc tế' },
        { jp: '透明性', r: 'とうめいせい', vn: 'tính minh bạch' },
        { jp: '批准する', r: 'ひじゅんする', vn: 'phê chuẩn' },
        { jp: '覇権', r: 'はけん', vn: 'bá quyền' },
        { jp: '合意形成', r: 'ごういけいせい', vn: 'hình thành đồng thuận' },
      ],
      grammar: [
        { pattern: '〜に照らして', meaning: 'Căn cứ vào ~ / Soi chiếu với ~' },
        { pattern: '〜を契機として', meaning: 'Lấy ~ làm cơ hội / Bắt đầu từ ~' },
        { pattern: '〜いかんによらず', meaning: 'Bất kể ~ như thế nào' },
        { pattern: '〜のもとで', meaning: 'Dưới ~ / Trong điều kiện ~' },
        { pattern: '〜にほかならない', meaning: 'Chính là ~ / Không gì khác là ~' },
      ],
    },
    {
      name: 'Văn học & Nghệ thuật', emoji: '🎨',
      prompts: [
        { jp: '芸術は社会にどのような役割を果たすか論じてください。', vn: 'Thảo luận về vai trò của nghệ thuật trong xã hội.' },
        { jp: '日本文学の特徴と世界文学への影響を述べてください。', vn: 'Trình bày đặc điểm của văn học Nhật và ảnh hưởng đến văn học thế giới.' },
        { jp: '現代アートの意義について批判的に考察してください。', vn: 'Suy ngẫm phê phán về ý nghĩa của nghệ thuật đương đại.' },
      ],
      vocab: [
        { jp: '芸術', r: 'げいじゅつ', vn: 'nghệ thuật' },
        { jp: '表現', r: 'ひょうげん', vn: 'biểu đạt, biểu hiện' },
        { jp: '審美眼', r: 'しんびがん', vn: 'thẩm mỹ' },
        { jp: '象徴', r: 'しょうちょう', vn: 'biểu tượng' },
        { jp: '解釈', r: 'かいしゃく', vn: 'diễn giải' },
        { jp: '普遍的', r: 'ふへんてき', vn: 'mang tính phổ quát' },
        { jp: '独創性', r: 'どくそうせい', vn: 'sự sáng tạo, độc đáo' },
        { jp: '批評', r: 'ひひょう', vn: 'phê bình' },
        { jp: '前衛的', r: 'ぜんえいてき', vn: 'tiền phong' },
        { jp: '文脈', r: 'ぶんみゃく', vn: 'ngữ cảnh, bối cảnh' },
      ],
      grammar: [
        { pattern: '〜すら〜ない', meaning: 'Thậm chí ~ cũng không' },
        { pattern: '〜というものだ', meaning: 'Đó chính là ~, bản chất của ~' },
        { pattern: '〜とあれば', meaning: 'Nếu là (trong trường hợp đặc biệt) ~' },
        { pattern: '〜んがために', meaning: 'Để đạt được ~ / Vì muốn ~' },
        { pattern: '〜に相違ない', meaning: 'Chắc chắn là ~ / Không nghi ngờ gì' },
      ],
    },
  ],
};

// ── PROMPTS GỢI Ý CHO VIẾT TỰ DO (AI sẽ generate thêm) ──────
const FREE_PROMPT_TEMPLATE = (topic, level) => `Bạn là giáo viên tiếng Nhật JLPT ${level}.

Người học muốn luyện viết về chủ đề: "${topic}"
Cấp độ: ${level}

Hãy tạo gợi ý theo format JSON sau (chỉ JSON, không giải thích thêm):
{
  "prompt_jp": "Câu đề bài bằng tiếng Nhật",
  "prompt_vn": "Câu đề bài bằng tiếng Việt",
  "vocab": [
    {"jp": "từ tiếng Nhật", "r": "furigana", "vn": "nghĩa tiếng Việt"},
    ... (8-10 từ phù hợp cấp độ)
  ],
  "grammar": [
    {"pattern": "〜パターン", "meaning": "ý nghĩa tiếng Việt"},
    ... (4-5 mẫu ngữ pháp phù hợp cấp độ)
  ]
}`;

const FEEDBACK_PROMPT = (level, prompt, answer) => `Bạn là giáo viên tiếng Nhật chấm bài JLPT ${level}.

Đề bài: ${prompt}
Bài viết của học sinh: 「${answer}」

Chấm điểm và cho feedback theo format JSON sau (chỉ JSON):
{
  "score": 85,
  "corrected": "câu đã sửa hoặc câu mẫu",
  "good_points": "điểm tốt trong bài (bằng tiếng Việt)",
  "issues": "lỗi cần sửa, nếu không có để trống (bằng tiếng Việt)",
  "explanation": "giải thích chi tiết ngắn gọn bằng tiếng Việt",
  "natural": "cách diễn đạt tự nhiên hơn nếu cần, bằng tiếng Nhật"
}`;

// ── API CALL ─────────────────────────────────────────────────
async function callClaude(prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content.map(i => i.text || '').join('');
}

function parseJSON(text) {
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return null;
  }
}

// ── RENDER HELPERS ────────────────────────────────────────────
function renderLevels() {
  const grid = document.getElementById('level-grid');
  grid.innerHTML = LEVELS.map(l => `
    <div class="level-card" id="lv-${l.id}" onclick="selectLevel('${l.id}')">
      <div class="level-jp" style="color:${l.color}">${l.jp}</div>
      <div class="level-name">${l.name}</div>
      <div class="level-sub">${l.sub}</div>
    </div>
  `).join('');
}

function renderTopics() {
  const topics = TOPICS[state.level] || [];
  document.getElementById('topic-level-badge').textContent = state.level;
  const grid = document.getElementById('topic-grid');
  grid.innerHTML = topics.map((t, i) => `
    <div class="topic-card" onclick="selectTopic(${i})">
      <div class="topic-emoji">${t.emoji}</div>
      <div class="topic-name">${t.name}</div>
      <div class="topic-count">${t.prompts.length} câu hỏi</div>
    </div>
  `).join('');
}

function renderSidebar() {
  const t = state.topic;
  document.getElementById('sidebar-topic').textContent = `${t.emoji} ${t.name}`;
  document.getElementById('sidebar-level').textContent = state.level;

  const vocabList = document.getElementById('vocab-list');
  vocabList.innerHTML = t.vocab.map(v => `
    <div class="vocab-item" title="Click để copy" onclick="copyText('${v.jp}')">
      <div>
        <div class="vocab-jp">${v.jp}</div>
        <div class="vocab-reading">${v.r}</div>
      </div>
      <div class="vocab-vn">${v.vn}</div>
    </div>
  `).join('');
  document.getElementById('vocab-count').textContent = t.vocab.length;

  const grammarList = document.getElementById('grammar-list');
  grammarList.innerHTML = t.grammar.map(g => `
    <div class="grammar-item" onclick="copyText('${g.pattern}')">
      <div class="grammar-pattern">${g.pattern}</div>
      <div class="grammar-meaning">${g.meaning}</div>
    </div>
  `).join('');
  document.getElementById('grammar-count').textContent = t.grammar.length;
}

function renderPrompt() {
  const p = state.topic.prompts[state.promptIdx % state.topic.prompts.length];
  document.getElementById('writing-prompt').innerHTML = `
    <div class="prompt-label">✏ Đề bài ${state.promptIdx + 1}</div>
    <div class="prompt-text">${p.jp}</div>
    <div class="prompt-vn">${p.vn}</div>
  `;
}

// ── ACTIONS ───────────────────────────────────────────────────
function selectLevel(id) {
  state.level = id;
  document.querySelectorAll('.level-card').forEach(c => c.classList.remove('active'));
  document.getElementById('lv-' + id).classList.add('active');
  showStep('step-mode');
  scrollToStep('step-mode');
}

function selectMode(mode) {
  state.mode = mode;
  document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('active'));
  document.getElementById('mode-' + mode).classList.add('active');

  if (mode === 'topic') {
    renderTopics();
    showStep('step-topics');
    scrollToStep('step-topics');
  } else {
    showStep('step-free-input');
    scrollToStep('step-free-input');
  }
}

function selectTopic(idx) {
  const topics = TOPICS[state.level];
  state.topic = topics[idx];
  state.promptIdx = 0;
  renderSidebar();
  renderPrompt();
  showStep('step-writing');
  scrollToStep('step-writing');
  clearFeedback();
}

function setFreeTopic(val) {
  document.getElementById('free-topic-input').value = val;
}

async function getSuggestions() {
  const input = document.getElementById('free-topic-input').value.trim();
  if (!input) {
    document.getElementById('free-topic-input').focus();
    return;
  }
  state.freeTopic = input;

  document.getElementById('free-loading').style.display = 'flex';

  try {
    const raw = await callClaude(FREE_PROMPT_TEMPLATE(input, state.level));
    const data = parseJSON(raw);

    if (!data) throw new Error('Parse failed');

    state.topic = {
      name: input,
      emoji: '✏️',
      prompts: [{ jp: data.prompt_jp, vn: data.prompt_vn }],
      vocab: data.vocab || [],
      grammar: data.grammar || [],
    };
    state.promptIdx = 0;

    renderSidebar();
    renderPrompt();
    showStep('step-writing');
    scrollToStep('step-writing');
    clearFeedback();
  } catch (e) {
    alert('Có lỗi kết nối. Vui lòng thử lại!');
  } finally {
    document.getElementById('free-loading').style.display = 'none';
  }
}

async function submitWriting() {
  const answer = document.getElementById('user-writing').value.trim();
  if (!answer) {
    document.getElementById('user-writing').focus();
    return;
  }

  const btn = document.querySelector('.btn-submit');
  btn.textContent = 'Đang chấm bài...';
  btn.disabled = true;

  const p = state.topic.prompts[state.promptIdx % state.topic.prompts.length];
  const fbArea = document.getElementById('feedback-area');
  fbArea.innerHTML = `
    <div class="feedback-box" style="padding:1.5rem;">
      <div class="loading-bar" style="padding:0;">
        <div class="loading-dots"><span></span><span></span><span></span></div>
        <span>AI đang phân tích bài viết của bạn...</span>
      </div>
    </div>`;

  try {
    const raw = await callClaude(FEEDBACK_PROMPT(state.level, p.jp, answer));
    const fb = parseJSON(raw);
    if (!fb) throw new Error();

    const scoreClass =
      fb.score >= 85 ? 'score-great' :
      fb.score >= 70 ? 'score-good' :
      fb.score >= 50 ? 'score-ok' : 'score-low';

    const scoreLabel =
      fb.score >= 85 ? 'Xuất sắc!' :
      fb.score >= 70 ? 'Tốt lắm!' :
      fb.score >= 50 ? 'Cần cải thiện' : 'Hãy cố gắng thêm!';

    fbArea.innerHTML = `
      <div class="feedback-box">
        <div class="feedback-top">
          <div class="score-circle ${scoreClass}">${fb.score ?? '✓'}</div>
          <div>
            <div class="score-label">${scoreLabel}</div>
            <div class="score-sublabel">Phân tích chi tiết bên dưới</div>
          </div>
        </div>
        <div class="feedback-body">
          ${fb.good_points ? `
            <div class="fb-section">
              <div class="fb-section-title">✅ Điểm tốt</div>
              <div class="fb-good">${fb.good_points}</div>
            </div>` : ''}
          ${fb.issues ? `
            <div class="fb-section">
              <div class="fb-section-title">⚠ Cần chú ý</div>
              <div class="fb-issue">${fb.issues}</div>
            </div>` : ''}
          ${fb.corrected ? `
            <div class="fb-section">
              <div class="fb-section-title">📝 Câu sửa / câu mẫu</div>
              <div class="fb-corrected">${fb.corrected}</div>
            </div>` : ''}
          ${fb.natural ? `
            <div class="fb-section">
              <div class="fb-section-title">💬 Diễn đạt tự nhiên hơn</div>
              <div class="fb-corrected">${fb.natural}</div>
            </div>` : ''}
          ${fb.explanation ? `
            <div class="fb-section">
              <div class="fb-section-title">📖 Giải thích</div>
              <div class="fb-section-body">${fb.explanation}</div>
            </div>` : ''}
        </div>
      </div>`;

    document.getElementById('next-actions').style.display = 'flex';
    fbArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  } catch {
    fbArea.innerHTML = `<div class="feedback-box" style="padding:1.25rem; color:#DC2626;">Không thể kết nối. Vui lòng thử lại.</div>`;
  } finally {
    btn.textContent = 'Nộp bài & nhận feedback ↗';
    btn.disabled = false;
  }
}

function nextPrompt() {
  state.promptIdx++;
  renderPrompt();
  clearFeedback();
  document.getElementById('writing-prompt').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function tryAgain() {
  document.getElementById('user-writing').value = '';
  clearFeedback();
  document.getElementById('user-writing').focus();
}

function clearFeedback() {
  document.getElementById('feedback-area').innerHTML = '';
  document.getElementById('next-actions').style.display = 'none';
}

function clearWriting() {
  document.getElementById('user-writing').value = '';
  document.getElementById('char-count').textContent = '0 ký tự';
}

function backToTopics() {
  if (state.mode === 'free') {
    showStep('step-free-input');
    scrollToStep('step-free-input');
  } else {
    showStep('step-topics');
    scrollToStep('step-topics');
  }
  document.getElementById('step-writing').classList.add('step-hidden');
  document.getElementById('next-actions').style.display = 'none';
}

function copyText(text) {
  navigator.clipboard?.writeText(text).catch(() => {});
}

// ── STEP DISPLAY ─────────────────────────────────────────────
function showStep(id) {
  const steps = ['step-mode','step-topics','step-free-input','step-writing'];
  steps.forEach(s => {
    const el = document.getElementById(s);
    if (el) el.classList.add('step-hidden');
  });
  const target = document.getElementById(id);
  if (target) target.classList.remove('step-hidden');
}

function scrollToStep(id) {
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

// ── CHAR COUNTER ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const ta = document.getElementById('user-writing');
  const cc = document.getElementById('char-count');
  if (ta) {
    ta.addEventListener('input', () => {
      cc.textContent = ta.value.length + ' ký tự';
    });
  }

  // Enter key for free input
  const fi = document.getElementById('free-topic-input');
  if (fi) {
    fi.addEventListener('keydown', e => {
      if (e.key === 'Enter') getSuggestions();
    });
  }

  renderLevels();
});


// ============================================================
// PATCH 2026-05 — 100 chủ đề/cấp, expand từ vựng/ngữ pháp, drill riêng
// ============================================================
const BUILTIN_TOPIC_NAMES_100 = {
  "N5": [
    "Tự giới thiệu",
    "Gia đình",
    "Bạn bè",
    "Trường học",
    "Lớp học",
    "Giáo viên",
    "Môn học yêu thích",
    "Một ngày của tôi",
    "Buổi sáng",
    "Buổi tối",
    "Cuối tuần",
    "Sở thích",
    "Âm nhạc",
    "Phim ảnh",
    "Anime",
    "Manga",
    "Thể thao",
    "Bóng đá",
    "Mua sắm",
    "Quần áo",
    "Thức ăn",
    "Đồ uống",
    "Bữa sáng",
    "Bữa trưa",
    "Bữa tối",
    "Nhà hàng",
    "Quán cà phê",
    "Nấu ăn đơn giản",
    "Trái cây",
    "Rau củ",
    "Thời tiết",
    "Mùa xuân",
    "Mùa hè",
    "Mùa thu",
    "Mùa đông",
    "Sinh nhật",
    "Ngày nghỉ",
    "Kỳ nghỉ hè",
    "Du lịch gần nhà",
    "Ga tàu",
    "Xe buýt",
    "Đi bộ",
    "Xe đạp",
    "Nhà của tôi",
    "Phòng của tôi",
    "Thành phố của tôi",
    "Công viên",
    "Siêu thị",
    "Hiệu sách",
    "Bệnh viện",
    "Ngân hàng",
    "Bưu điện",
    "Khách sạn",
    "Động vật",
    "Thú cưng",
    "Mèo",
    "Chó",
    "Hoa",
    "Màu sắc",
    "Số đếm",
    "Thời gian",
    "Lịch trình",
    "Đi học",
    "Đi làm",
    "Đi chơi",
    "Gặp bạn",
    "Gọi điện",
    "Nhắn tin",
    "Ảnh chụp",
    "Quà tặng",
    "Tiền bạc",
    "Sức khỏe",
    "Đau ốm",
    "Tập thể dục nhẹ",
    "Ngủ",
    "Dậy sớm",
    "Dọn phòng",
    "Giặt đồ",
    "Tắm rửa",
    "Đánh răng",
    "Đọc sách",
    "Viết nhật ký",
    "Học tiếng Nhật",
    "Kanji yêu thích",
    "Hiragana và Katakana",
    "Cửa hàng tiện lợi",
    "Món Nhật yêu thích",
    "Việt Nam",
    "Nhật Bản",
    "Ngôn ngữ",
    "Ước mơ nhỏ",
    "Người tôi thích",
    "Việc tôi ghét",
    "Kỷ niệm vui",
    "Ngày mưa",
    "Ngày nắng",
    "Đi biển",
    "Đi núi",
    "Lễ hội",
    "Tết"
  ],
  "N4": [
    "Du lịch",
    "Công việc",
    "Sức khỏe",
    "Phim và âm nhạc",
    "Mua sắm",
    "Thói quen hằng ngày",
    "Kế hoạch cuối tuần",
    "Kỳ nghỉ đáng nhớ",
    "Kinh nghiệm học tiếng Nhật",
    "Mục tiêu năm nay",
    "Việc làm thêm",
    "Công ty mơ ước",
    "Đồng nghiệp",
    "Sếp tốt",
    "Phỏng vấn xin việc",
    "Email đơn giản",
    "Cuộc hẹn",
    "Xin lỗi và cảm ơn",
    "Giúp đỡ người khác",
    "Sống một mình",
    "Thuê nhà",
    "Chuyển nhà",
    "Nội trợ",
    "Tiết kiệm tiền",
    "Mua hàng online",
    "So sánh sản phẩm",
    "Quà lưu niệm",
    "Nhà hàng yêu thích",
    "Công thức món ăn",
    "Ăn uống lành mạnh",
    "Tập thể dục",
    "Bị cảm",
    "Đi khám bệnh",
    "Giấc ngủ",
    "Stress nhẹ",
    "Đi tàu điện",
    "Lạc đường",
    "Hỏi đường",
    "Đặt phòng khách sạn",
    "Sân bay",
    "Kế hoạch du lịch Nhật",
    "Lễ hội Nhật",
    "Văn hóa tặng quà",
    "Phong tục chào hỏi",
    "Gia đình hiện đại",
    "Bạn thân",
    "Hàng xóm",
    "Nuôi thú cưng",
    "Mạng xã hội",
    "Điện thoại thông minh",
    "Ứng dụng hữu ích",
    "Học online",
    "Xem video",
    "Đọc tin tức",
    "Sở thích mới",
    "Học nhạc cụ",
    "Chơi thể thao",
    "Leo núi",
    "Cắm trại",
    "Đi biển",
    "Chụp ảnh",
    "Viết nhật ký",
    "Sách yêu thích",
    "Phim gần đây",
    "Bài hát yêu thích",
    "Anime đề xuất",
    "Manga đề xuất",
    "Thành phố đáng sống",
    "Nông thôn",
    "Giao thông công cộng",
    "Ô nhiễm nhẹ",
    "Tái chế",
    "Tiết kiệm điện",
    "Thời tiết xấu",
    "Mùa yêu thích",
    "Sự kiện ở trường",
    "Kỳ thi",
    "Học bổng",
    "Câu lạc bộ",
    "Giáo viên tốt",
    "Môn khó",
    "Tương lai",
    "Ước mơ nghề nghiệp",
    "Người truyền cảm hứng",
    "Kỷ niệm thời thơ ấu",
    "Lỗi từng mắc",
    "Điều muốn thử",
    "Thói quen muốn bỏ",
    "Thói quen tốt",
    "Ngày bận rộn",
    "Ngày thư giãn",
    "Tin nhắn cho bạn",
    "Mời bạn đi chơi",
    "Từ chối lịch hẹn",
    "Nhờ vả",
    "Cảm nhận về Nhật Bản",
    "So sánh Việt Nam và Nhật",
    "Mục tiêu JLPT",
    "Kế hoạch học tập",
    "Chủ đề luyện viết 100"
  ],
  "N3": [
    "Môi trường",
    "Giáo dục",
    "Văn hóa Nhật",
    "Công nghệ và mạng xã hội",
    "Cuộc sống đô thị",
    "Làm việc nhóm",
    "Kỹ năng giao tiếp",
    "Quản lý thời gian",
    "Áp lực học tập",
    "Áp lực công việc",
    "Cân bằng cuộc sống",
    "Lựa chọn nghề nghiệp",
    "Chuyển việc",
    "Làm việc từ xa",
    "Học ngoại ngữ",
    "Tự học",
    "Du học Nhật Bản",
    "Học bổng",
    "Thi cử",
    "Giáo viên lý tưởng",
    "Trường học tương lai",
    "Đọc sách",
    "Thói quen đọc tin",
    "Tin giả",
    "Bảo mật thông tin",
    "Phụ thuộc điện thoại",
    "Mua sắm online",
    "Thanh toán điện tử",
    "Dịch vụ khách hàng",
    "Văn hóa công ty",
    "Quan hệ cấp trên cấp dưới",
    "Bạn bè sau khi trưởng thành",
    "Gia đình và sự nghiệp",
    "Kết hôn muộn",
    "Nuôi con",
    "Sức khỏe tinh thần",
    "Tập thể dục và kỷ luật",
    "Ăn uống lành mạnh",
    "Ngủ đủ giấc",
    "Du lịch bền vững",
    "Du lịch một mình",
    "Kỷ niệm du lịch",
    "Văn hóa lễ hội",
    "Phép lịch sự nơi công cộng",
    "Tàu điện Nhật Bản",
    "Đúng giờ",
    "Làm thêm của sinh viên",
    "Tình nguyện",
    "Hoạt động cộng đồng",
    "Bảo vệ động vật",
    "Tái chế rác",
    "Biến đổi khí hậu",
    "Tiết kiệm năng lượng",
    "Không gian xanh",
    "Giao thông đô thị",
    "Kẹt xe",
    "Nhà ở đô thị",
    "Sống ở nông thôn",
    "Di cư lên thành phố",
    "Ẩm thực truyền thống",
    "Thức ăn nhanh",
    "Cà phê và làm việc",
    "Giải trí cuối tuần",
    "Anime và văn hóa đại chúng",
    "Âm nhạc chữa lành",
    "Phim tài liệu",
    "Thể thao và xã hội",
    "Olympic",
    "Mục tiêu dài hạn",
    "Thành công là gì",
    "Thất bại và bài học",
    "Sự tự tin",
    "Động lực cá nhân",
    "Kỷ luật bản thân",
    "Tiêu dùng thông minh",
    "Tiết kiệm và đầu tư nhỏ",
    "Khoảng cách thế hệ",
    "Vai trò của phụ nữ",
    "Bình đẳng giới",
    "Người cao tuổi",
    "Xã hội già hóa",
    "Robot chăm sóc",
    "AI trong đời sống",
    "Tương lai công việc",
    "Sáng tạo nội dung",
    "Học bằng video",
    "Làm việc quốc tế",
    "Khác biệt văn hóa",
    "Sốc văn hóa",
    "Ngôn ngữ và tư duy",
    "Dịch thuật",
    "Viết blog",
    "Thuyết trình",
    "Tranh luận",
    "Ý kiến cá nhân",
    "Tin tức xã hội",
    "Vấn đề địa phương",
    "Thành phố lý tưởng",
    "Cuộc sống tối giản",
    "Hạnh phúc hằng ngày"
  ],
  "N2": [
    "Kinh tế xã hội",
    "Khoa học và tương lai",
    "Quan hệ con người",
    "Toàn cầu hóa",
    "Già hóa dân số",
    "Thiếu lao động",
    "Bất bình đẳng kinh tế",
    "Phúc lợi xã hội",
    "Chính sách giáo dục",
    "Cải cách thi cử",
    "Đại học và việc làm",
    "Kỹ năng thế kỷ 21",
    "Làm việc từ xa",
    "Năng suất lao động",
    "Văn hóa làm thêm giờ",
    "Cân bằng công việc cuộc sống",
    "Lãnh đạo",
    "Đạo đức nghề nghiệp",
    "Quản trị rủi ro",
    "Khởi nghiệp",
    "Đổi mới sáng tạo",
    "AI và việc làm",
    "Tự động hóa",
    "Dữ liệu cá nhân",
    "Quyền riêng tư",
    "An ninh mạng",
    "Tin giả và truyền thông",
    "Tự do ngôn luận online",
    "Nền tảng mạng xã hội",
    "Nghiện kỹ thuật số",
    "Y tế từ xa",
    "Công nghệ y sinh",
    "Đạo đức trong y học",
    "Biến đổi khí hậu",
    "Năng lượng tái tạo",
    "Chính sách môi trường",
    "Kinh tế tuần hoàn",
    "Tiêu dùng bền vững",
    "Trách nhiệm doanh nghiệp",
    "Du lịch quá tải",
    "Bảo tồn văn hóa",
    "Văn hóa truyền thống",
    "Văn hóa đại chúng",
    "Sức mạnh mềm",
    "Giao lưu quốc tế",
    "Di cư lao động",
    "Đa văn hóa",
    "Rào cản ngôn ngữ",
    "Giáo dục ngoại ngữ",
    "Khoảng cách đô thị nông thôn",
    "Nhà ở và dân số",
    "Giao thông công cộng",
    "Quy hoạch đô thị",
    "Không gian công cộng",
    "Cô lập xã hội",
    "Sức khỏe tinh thần",
    "Stress xã hội",
    "Gia đình hiện đại",
    "Tỷ lệ sinh thấp",
    "Vai trò giới",
    "Bình đẳng cơ hội",
    "Giáo dục trẻ em",
    "Nuôi dạy con",
    "Người cao tuổi trong xã hội",
    "Chăm sóc dài hạn",
    "Tình nguyện cộng đồng",
    "Đạo đức công dân",
    "Dân chủ địa phương",
    "Tham gia xã hội",
    "Chính sách thuế",
    "Lương tối thiểu",
    "Việc làm phi chính thức",
    "Kinh tế chia sẻ",
    "Mua sắm trực tuyến",
    "Tiền điện tử",
    "Không tiền mặt",
    "Chuỗi cung ứng",
    "Khủng hoảng lương thực",
    "An toàn thực phẩm",
    "Nông nghiệp thông minh",
    "Thiên tai",
    "Quản lý khủng hoảng",
    "Truyền thông khi khẩn cấp",
    "Giáo dục phòng chống thiên tai",
    "Nghiên cứu vũ trụ",
    "Công nghệ xanh",
    "Xe điện",
    "Thành phố thông minh",
    "Robot trong dịch vụ",
    "Học tập suốt đời",
    "Năng lực phản biện",
    "Đọc hiểu truyền thông",
    "Viết học thuật",
    "Thuyết phục người đọc",
    "Tranh luận xã hội",
    "Đề xuất chính sách",
    "Phân tích nguyên nhân",
    "So sánh quan điểm",
    "Tương lai Nhật Bản",
    "Tương lai Việt Nam"
  ],
  "N1": [
    "Triết học và tư duy",
    "Chính trị và xã hội",
    "Văn học và nghệ thuật",
    "Bản chất của hạnh phúc",
    "Tự do và trách nhiệm",
    "Đạo đức và pháp luật",
    "Công lý xã hội",
    "Quyền lực và minh bạch",
    "Dân chủ hiện đại",
    "Chủ nghĩa cá nhân",
    "Chủ nghĩa cộng đồng",
    "Bản sắc dân tộc",
    "Ký ức lịch sử",
    "Di sản văn hóa",
    "Toàn cầu hóa văn hóa",
    "Ngôn ngữ và quyền lực",
    "Tư duy phản biện",
    "Tri thức và định kiến",
    "Sự thật trong truyền thông",
    "Hậu sự thật",
    "AI và nhân tính",
    "Đạo đức AI",
    "Tự động hóa và phẩm giá lao động",
    "Công nghệ giám sát",
    "Quyền riêng tư như nhân quyền",
    "Sinh mệnh và đạo đức",
    "Y học tái tạo",
    "Tuổi thọ và ý nghĩa sống",
    "Môi trường và trách nhiệm liên thế hệ",
    "Phát triển bền vững",
    "Công bằng khí hậu",
    "Chủ nghĩa tiêu dùng",
    "Tối giản và dư thừa",
    "Nghệ thuật trong khủng hoảng",
    "Văn học phản ánh xã hội",
    "Vai trò của phê bình",
    "Mỹ học truyền thống",
    "Nghệ thuật đương đại",
    "Tự do biểu đạt",
    "Kiểm duyệt và trách nhiệm",
    "Giáo dục khai phóng",
    "Đại học trong xã hội",
    "Tri thức chuyên môn",
    "Học thuật và ứng dụng",
    "Di cư và bản sắc",
    "Đa văn hóa và hòa nhập",
    "Quốc gia và biên giới",
    "Trật tự quốc tế",
    "Xung đột và hòa bình",
    "Ngoại giao văn hóa",
    "Kinh tế tri thức",
    "Chủ nghĩa tư bản nền tảng",
    "Bất bình đẳng cấu trúc",
    "Phúc lợi và tự lực",
    "Lao động cảm xúc",
    "Cô đơn hiện đại",
    "Quan hệ lỏng",
    "Gia đình hậu hiện đại",
    "Giới và quyền lực",
    "Cơ thể và xã hội",
    "Tôn giáo trong hiện đại",
    "Nghi lễ và cộng đồng",
    "Thành phố như không gian ký ức",
    "Kiến trúc và con người",
    "Thiên tai và ký ức tập thể",
    "Rủi ro xã hội",
    "Quản trị khủng hoảng",
    "Chính sách dựa trên bằng chứng",
    "Dữ liệu và đạo đức",
    "Thuật toán và thiên kiến",
    "Sáng tạo của con người",
    "Dịch thuật văn hóa",
    "Văn học so sánh",
    "Tiếng Nhật và tư duy",
    "Diễn ngôn xã hội",
    "Ẩn dụ trong đời sống",
    "Cái đẹp là gì",
    "Cái thiện là gì",
    "Ý chí tự do",
    "Trách nhiệm cá nhân",
    "Tha thứ và công lý",
    "Ký ức và quên lãng",
    "Hy vọng trong bất định",
    "Tương lai của giáo dục",
    "Tương lai của lao động",
    "Tương lai của quốc gia",
    "Tương lai của nghệ thuật",
    "Tương lai của ngôn ngữ",
    "Phê phán công nghệ",
    "Đời sống số",
    "Cộng đồng ảo",
    "Niềm tin xã hội",
    "Tính chính danh",
    "Hệ giá trị",
    "Thỏa hiệp và đối thoại",
    "Sự im lặng trong giao tiếp",
    "Tính phổ quát và tương đối",
    "Ý nghĩa của việc viết",
    "Chủ đề luyện viết 99",
    "Chủ đề luyện viết 100"
  ]
};
const FREE_TOPIC_TAGS_20 = ["Du lịch Nhật Bản", "Gia đình", "Công việc", "Phim anime", "Thời tiết", "Sức khỏe", "Mua sắm", "Học tiếng Nhật", "Mạng xã hội", "Môi trường", "Giáo dục", "Bạn bè", "Ẩm thực", "Âm nhạc", "Thể thao", "Công nghệ", "Văn hóa Nhật", "Ước mơ", "Cuộc sống đô thị", "Tương lai"];
const PATCH_EMOJIS = ['🌸','📚','✏️','🎧','🎬','🍱','🏫','💼','🌍','🧠','📱','🚆','🏙️','🤝','🎯','☕','🏃','🛍️','🗾','✨'];
const PATCH_BANK = {
  N5: { v:[['私','わたし','tôi','私の名前','tự giới thiệu','私は学生です。','私は毎日日本語を勉強します。'],['好き','すき','thích','〜が好き','sở thích','私は音楽が好きです。','母は甘い食べ物が好きです。'],['毎日','まいにち','mỗi ngày','毎日〜ます','thói quen','毎日七時に起きます。','毎日少し日本語を書きます。'],['友達','ともだち','bạn bè','友達と会う','quan hệ','週末、友達と映画を見ます。','友達はとても親切です。'],['楽しい','たのしい','vui','楽しい時間','cảm nhận','学校は楽しいです。','家族と旅行するのは楽しいです。'],['行く','いく','đi','学校へ行く','di chuyển','明日、学校へ行きます。','日曜日に公園へ行きました。']], g:[['〜は〜です','A là B','N1 は N2 です','Giới thiệu/miêu tả cơ bản','私は学生です。','これは日本の本です。'],['〜が好きです','thích ~','N が好きです','Nói sở thích','私は寿司が好きです。','弟はサッカーが好きです。'],['〜に行きます','đi đến ~','場所 に/へ 行きます','Nói địa điểm đi đến','学校に行きます。','週末、友達とカフェへ行きます。'],['〜を〜ます','làm gì với tân ngữ','N を Vます','Nói hành động thường ngày','日本語を勉強します。','朝ごはんを食べます。']] },
  N4: { v:[['経験','けいけん','kinh nghiệm','経験がある','kể trải nghiệm','日本へ行った経験があります。','この経験から多くのことを学びました。'],['準備する','じゅんびする','chuẩn bị','旅行の準備','lập kế hoạch','旅行の前に荷物を準備します。','試験のために毎日準備しています。'],['習慣','しゅうかん','thói quen','よい習慣','nếp sống','早く寝る習慣があります。','運動する習慣をつけたいです。'],['大切','たいせつ','quan trọng','大切にする','nhấn mạnh giá trị','家族は私にとって大切です。','時間を大切にしたいです。'],['比べる','くらべる','so sánh','AとBを比べる','so sánh ý kiến','都会と田舎を比べました。','去年と比べて日本語が上手になりました。'],['便利','べんり','tiện lợi','便利なアプリ','đánh giá tiện ích','スマホはとても便利です。','駅の近くに住むと便利です。']], g:[['〜たことがあります','đã từng ~','Vた + ことがあります','Nói kinh nghiệm','日本料理を食べたことがあります。','一人で旅行したことがあります。'],['〜ために','để ~','Vる/Nの + ために','Nêu mục đích','合格するために勉強します。','健康のために運動しています。'],['〜ようになる','trở nên/bắt đầu có thể ~','Vる/Vない + ようになる','Nói thay đổi','日本語で話せるようになりました。','早く起きるようになりました。'],['〜と思います','tôi nghĩ rằng ~','普通形 + と思います','Nêu ý kiến','この方法はいいと思います。','旅行は大切だと思います。']] },
  N3: { v:[['影響','えいきょう','ảnh hưởng','影響を与える','phân tích hệ quả','SNSは生活に大きな影響を与えます。','環境問題の影響は将来も続きます。'],['課題','かだい','vấn đề/thách thức','課題を解決する','nêu vấn đề','教育にはまだ多くの課題があります。','この課題を解決する必要があります。'],['取り組む','とりくむ','nỗ lực xử lý','問題に取り組む','giải pháp','社会全体で環境問題に取り組むべきです。','私は語彙力の向上に取り組んでいます。'],['意識','いしき','ý thức','意識が高い','thái độ xã hội','若者の環境意識が高まっています。','時間を意識して行動します。'],['改善する','かいぜんする','cải thiện','状況を改善する','đề xuất','生活習慣を改善したいです。','交通問題を改善する必要があります。'],['共通点','きょうつうてん','điểm chung','共通点がある','so sánh','日本とベトナムの文化には共通点があります。','二つの意見の共通点を考えます。']], g:[['〜によって','do/tùy theo/bằng cách','N + によって','Nguyên nhân/phương tiện/khác biệt','生活は技術によって便利になりました。','考え方は人によって違います。'],['〜だけでなく〜も','không chỉ ~ mà còn ~','A だけでなく B も','Bổ sung luận điểm','SNSは便利なだけでなく危険もあります。','彼は日本語だけでなく英語も話せます。'],['〜べきだ','nên/phải ~','Vる + べきだ','Nêu quan điểm mạnh','私たちは環境を守るべきです。','学生は自分で考えるべきです。'],['〜一方で','mặt khác/trong khi đó','普通形 + 一方で','Đối lập hai mặt','都会は便利な一方で、生活費が高いです。','SNSは情報が早い一方で、誤情報も多いです。']] },
  N2: { v:[['構造的','こうぞうてき','mang tính cấu trúc','構造的な問題','phân tích xã hội','これは個人ではなく構造的な問題です。','構造的な格差を是正する必要があります。'],['是正する','ぜせいする','khắc phục/chỉnh sửa','格差を是正する','đề xuất chính sách','政府は地域格差を是正すべきです。','制度の不公平を是正する必要があります。'],['持続可能','じぞくかのう','bền vững','持続可能な社会','môi trường/kinh tế','持続可能な社会を目指すべきです。','企業にも持続可能な経営が求められます。'],['規制','きせい','quy định/kiểm soát','規制を強化する','chính sách','AIの利用には適切な規制が必要です。','規制を強化しすぎると革新が止まります。'],['普及する','ふきゅうする','phổ biến','技術が普及する','xu hướng','スマートフォンは急速に普及しました。','再生可能エネルギーの普及が進んでいます。'],['深刻化する','しんこくかする','trở nên nghiêm trọng','問題が深刻化する','cảnh báo','少子高齢化が深刻化しています。','気候変動の影響が深刻化しています。']], g:[['〜にもかかわらず','mặc dù ~ nhưng','普通形/N + にもかかわらず','Nghịch lý/kết quả trái dự đoán','努力したにもかかわらず、結果は出ませんでした。','便利であるにもかかわらず、問題も多いです。'],['〜を踏まえて','dựa trên/căn cứ vào ~','N + を踏まえて','Đưa kết luận dựa trên dữ kiện','調査結果を踏まえて対策を考えます。','現状を踏まえて意見を述べます。'],['〜に伴って','cùng với/kéo theo','N/Vる + に伴って','Nói biến đổi song hành','技術の発展に伴って働き方が変わりました。','高齢化に伴って医療費が増えています。'],['〜ざるを得ない','buộc phải/không thể không','Vない bỏ ない + ざるを得ない','Kết luận bắt buộc','状況を考えると、計画を変えざるを得ません。','人手不足のため、外国人材に頼らざるを得ません。']] },
  N1: { v:[['本質','ほんしつ','bản chất','本質を問う','bàn luận trừu tượng','幸福の本質を考える必要があります。','この問題の本質は制度にあります。'],['普遍性','ふへんせい','tính phổ quát','普遍性を持つ','triết học/văn hóa','文学には時代を超えた普遍性があります。','その価値観に普遍性があるとは限りません。'],['相対的','そうたいてき','tương đối','相対的な価値','so sánh tư tưởng','幸福の基準は相対的です。','文化によって善悪の判断は相対的になり得ます。'],['論証','ろんしょう','luận chứng','論証を組み立てる','viết học thuật','主張には明確な論証が必要です。','彼の論証には説得力があります。'],['帰結する','きけつする','dẫn tới kết quả/kết luận','〜に帰結する','kết luận logic','無関心は社会の停滞に帰結します。','自由の議論は責任の問題に帰結します。'],['葛藤','かっとう','giằng co/xung đột nội tâm','葛藤を抱える','phân tích con người','現代人は自由と不安の間で葛藤しています。','主人公の葛藤が物語を深くしています。']], g:[['〜がゆえに','chính vì/do ~','普通形/N + がゆえに','Văn viết, nêu nguyên nhân sâu','自由であるがゆえに責任も生じます。','彼は真面目がゆえに悩みやすいです。'],['〜にほかならない','chính là/không gì khác ngoài','N + にほかならない','Kết luận nhấn mạnh','教育とは未来への投資にほかなりません。','この沈黙は抗議にほかなりません。'],['〜ならではの','chỉ riêng ~ mới có','N + ならではの + N','Đánh giá đặc trưng','日本ならではの美意識があります。','文学ならではの表現力があります。'],['〜とも〜とも言えない','khó nói là ~ hay ~','A とも B とも言えない','Nhận định tinh tế/không tuyệt đối','それは正しいとも間違いとも言えません。','現代社会は自由とも不自由とも言えません。']] }
};
function patchV(level,name,idx){ const b=PATCH_BANK[level].v[idx%PATCH_BANK[level].v.length]; return {jp:b[0],r:b[1],vn:b[2],collocation:b[3],context:b[4],examples:[b[5],b[6]]}; }
function patchG(level,name,idx){ const b=PATCH_BANK[level].g[idx%PATCH_BANK[level].g.length]; return {pattern:b[0],meaning:b[1],structure:b[2],context:b[3],examples:[b[4],b[5]]}; }
function patchPrompts(level,name){
 const jp={N5:[`${name}について書いてください。`,`${name}で好きなことを一つ紹介してください。`,`${name}について、毎日/週末にすることを書いてください。`],N4:[`${name}について、経験を交えて書いてください。`,`${name}で大切だと思うことと理由を書いてください。`,`${name}について、これからしたいことを書いてください。`],N3:[`${name}の良い点と問題点について書いてください。`,`${name}について、自分の意見と理由を述べてください。`,`${name}に関する具体例を挙げて考えを書いてください。`],N2:[`${name}をめぐる現状と課題について論じてください。`,`${name}が社会に与える影響を分析してください。`,`${name}について、解決策を一つ提案してください。`],N1:[`${name}の本質について、抽象的かつ具体的に論じてください。`,`${name}を現代社会の文脈から批判的に考察してください。`,`${name}に関して、対立する二つの観点を踏まえて論じてください。`]};
 const vn={N5:[`Hãy viết về chủ đề ${name}.`,`Hãy giới thiệu một điều bạn thích trong chủ đề ${name}.`,`Hãy viết việc hằng ngày/cuối tuần liên quan đến ${name}.`],N4:[`Hãy viết về ${name} kèm trải nghiệm của bạn.`,`Hãy viết điều quan trọng trong ${name} và nêu lý do.`,`Hãy viết điều bạn muốn làm sắp tới liên quan đến ${name}.`],N3:[`Hãy viết điểm tốt và vấn đề của ${name}.`,`Hãy nêu ý kiến cá nhân và lý do về ${name}.`,`Hãy đưa ví dụ cụ thể và viết suy nghĩ về ${name}.`],N2:[`Hãy bàn về hiện trạng và thách thức xoay quanh ${name}.`,`Hãy phân tích ảnh hưởng của ${name} đối với xã hội.`,`Hãy đề xuất một giải pháp liên quan đến ${name}.`],N1:[`Hãy luận về bản chất của ${name}, kết hợp ý trừu tượng và ví dụ cụ thể.`,`Hãy suy ngẫm phê phán về ${name} trong bối cảnh xã hội hiện đại.`,`Hãy bàn về ${name} dựa trên hai quan điểm đối lập.`]};
 return jp[level].map((p,i)=>({jp:p,vn:vn[level][i]}));
}
function patchBuildTopic(level,name,idx){ return {name,emoji:PATCH_EMOJIS[idx%PATCH_EMOJIS.length],prompts:patchPrompts(level,name),vocab:Array.from({length:8},(_,i)=>patchV(level,name,idx+i)),grammar:Array.from({length:4},(_,i)=>patchG(level,name,idx+i))}; }
function patchHydrateTopics(){ Object.keys(BUILTIN_TOPIC_NAMES_100).forEach(level=>{ const old=new Map((TOPICS[level]||[]).map((t,i)=>{ t.prompts=(t.prompts||[]).slice(0,3); while(t.prompts.length<3)t.prompts.push(patchPrompts(level,t.name)[t.prompts.length]); t.vocab=(t.vocab||[]).map((v,j)=>({...patchV(level,t.name,i+j),...v})); t.grammar=(t.grammar||[]).map((g,j)=>({...patchG(level,t.name,i+j),...g})); return [t.name,t]; })); TOPICS[level]=BUILTIN_TOPIC_NAMES_100[level].map((name,i)=>old.get(name)||patchBuildTopic(level,name,i)); }); }
patchHydrateTopics();
function escapeHTML(str=''){ return String(str).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function renderTopics(){ const topics=TOPICS[state.level]||[]; document.getElementById('topic-level-badge').textContent=`${state.level} · ${topics.length} chủ đề`; document.getElementById('topic-grid').innerHTML=topics.map((t,i)=>`<div class="topic-card" onclick="selectTopic(${i})"><div class="topic-emoji">${t.emoji}</div><div class="topic-name">${escapeHTML(t.name)}</div><div class="topic-count">3 đề bài · ${t.vocab.length} từ · ${t.grammar.length} mẫu</div></div>`).join(''); }
function patchVocabDetail(v){ return `<div class="expand-detail"><div><b>Cách đọc:</b> ${escapeHTML(v.r||'')}</div><div><b>Ý nghĩa:</b> ${escapeHTML(v.vn||'')}</div><div><b>Collocation:</b> ${escapeHTML(v.collocation||'よく使う表現')}</div><div><b>Bối cảnh:</b> ${escapeHTML(v.context||'Dùng trong đời sống hằng ngày.')}</div><div class="mini-examples"><b>2 ví dụ thực tế:</b><br>① ${escapeHTML((v.examples||[])[0]||'')}<br>② ${escapeHTML((v.examples||[])[1]||'')}</div></div>`; }
function patchGrammarDetail(g){ return `<div class="expand-detail grammar-expand"><div><b>Cấu trúc:</b> ${escapeHTML(g.structure||g.pattern||'')}</div><div><b>Nghĩa:</b> ${escapeHTML(g.meaning||'')}</div><div><b>Bối cảnh dùng:</b> ${escapeHTML(g.context||'Dùng khi muốn diễn đạt ý rõ ràng.')}</div><div class="mini-examples"><b>Ví dụ:</b><br>① ${escapeHTML((g.examples||[])[0]||'')}<br>② ${escapeHTML((g.examples||[])[1]||'')}</div></div>`; }
function renderSidebar(){ const t=state.topic; document.getElementById('sidebar-topic').textContent=`${t.emoji} ${t.name}`; document.getElementById('sidebar-level').textContent=state.level; document.getElementById('vocab-list').innerHTML=t.vocab.map(v=>`<div class="vocab-item expandable-item" onclick="toggleLearningItem(this)"><div class="learning-row"><div><div class="vocab-jp">${escapeHTML(v.jp)}</div><div class="vocab-reading">${escapeHTML(v.r)}</div></div><div class="vocab-vn">${escapeHTML(v.vn)}</div></div>${patchVocabDetail(v)}</div>`).join(''); document.getElementById('vocab-count').textContent=t.vocab.length; document.getElementById('grammar-list').innerHTML=t.grammar.map(g=>`<div class="grammar-item expandable-item" onclick="toggleLearningItem(this)"><div class="grammar-pattern">${escapeHTML(g.pattern)}</div><div class="grammar-meaning">${escapeHTML(g.meaning)}</div>${patchGrammarDetail(g)}</div>`).join(''); document.getElementById('grammar-count').textContent=t.grammar.length; }
function toggleLearningItem(el){ el.classList.toggle('expanded'); }
function renderPrompt(){ const p=state.topic.prompts[state.promptIdx%state.topic.prompts.length]; document.getElementById('writing-prompt').innerHTML=`<div class="prompt-label">✏ Đề bài ${state.promptIdx+1}/${state.topic.prompts.length}</div><div class="prompt-text">${escapeHTML(p.jp)}</div><div class="prompt-vn">${escapeHTML(p.vn)}</div><div class="prompt-switcher">${state.topic.prompts.map((_,i)=>`<button class="prompt-pill ${i===state.promptIdx?'active':''}" onclick="choosePrompt(${i})">Đề ${i+1}</button>`).join('')}</div>`; }
function choosePrompt(idx){ state.promptIdx=idx; renderPrompt(); clearFeedback(); }
function renderFreeTags(){ const wrap=document.querySelector('.free-examples'); if(!wrap)return; wrap.innerHTML='<span class="free-ex-label">20 tag gợi ý:</span>'+FREE_TOPIC_TAGS_20.map(tag=>`<button class="quick-chip" onclick="setFreeTopic('${tag.replace(/'/g,"\'")}')">${tag}</button>`).join(''); }
function getSuggestions(){ const input=document.getElementById('free-topic-input').value.trim(); if(!input)return document.getElementById('free-topic-input').focus(); state.freeTopic=input; state.topic=patchBuildTopic(state.level,input,FREE_TOPIC_TAGS_20.indexOf(input)+11); state.topic.emoji='✏️'; state.promptIdx=0; renderSidebar(); renderPrompt(); showStep('step-writing'); scrollToStep('step-writing'); clearFeedback(); }
function selectMode(mode){ state.mode=mode; document.querySelectorAll('.mode-card').forEach(c=>c.classList.remove('active')); document.getElementById('mode-'+mode)?.classList.add('active'); if(mode==='topic'){ renderTopics(); showStep('step-topics'); scrollToStep('step-topics'); } else if(mode==='free'){ renderFreeTags(); showStep('step-free-input'); scrollToStep('step-free-input'); } else if(mode==='drill'){ initDrill(); showStep('step-drill'); scrollToStep('step-drill'); } }
function showStep(id){ ['step-mode','step-topics','step-free-input','step-drill','step-writing'].forEach(s=>document.getElementById(s)?.classList.add('step-hidden')); document.getElementById(id)?.classList.remove('step-hidden'); }
function backToTopics(){ if(state.mode==='free'){showStep('step-free-input');scrollToStep('step-free-input');} else if(state.mode==='drill'){showStep('step-drill');scrollToStep('step-drill');} else {showStep('step-topics');scrollToStep('step-topics');} document.getElementById('step-writing')?.classList.add('step-hidden'); document.getElementById('next-actions').style.display='none'; }
function backToMode(){ showStep('step-mode'); scrollToStep('step-mode'); }
function goHome(){ ['step-mode','step-topics','step-free-input','step-drill','step-writing'].forEach(id=>document.getElementById(id)?.classList.add('step-hidden')); document.getElementById('hero-section')?.scrollIntoView({behavior:'smooth',block:'start'}); }
const DRILL_SENTENCES={N5:[['vn-jp','Tôi là học sinh.','私は学生です。','私は / 学生 / です'],['jp-vn','毎日、日本語を勉強します。','Mỗi ngày tôi học tiếng Nhật.','毎日・勉強します'],['vn-jp','Tôi thích sushi.','私は寿司が好きです。','〜が好きです'],['jp-vn','週末、友達と公園へ行きます。','Cuối tuần tôi đi công viên với bạn.','週末・友達と・公園へ'],['vn-jp','Hôm nay trời nóng.','今日は暑いです。','今日・暑い']],N4:[['vn-jp','Tôi đã từng đi Nhật.','私は日本へ行ったことがあります。','〜たことがあります'],['jp-vn','健康のために、毎朝走っています。','Vì sức khỏe, mỗi sáng tôi chạy bộ.','〜ために'],['vn-jp','Tôi nghĩ công việc này rất quan trọng.','この仕事はとても大切だと思います。','〜と思います'],['jp-vn','最近、早く起きるようになりました。','Gần đây tôi đã bắt đầu dậy sớm được.','〜ようになりました'],['vn-jp','Trước khi đi du lịch, tôi chuẩn bị hành lý.','旅行に行く前に、荷物を準備します。','〜前に']],N3:[['vn-jp','Mạng xã hội không chỉ tiện lợi mà còn có nguy hiểm.','SNSは便利なだけでなく、危険もあります。','〜だけでなく〜も'],['jp-vn','技術によって、生活は大きく変わりました。','Nhờ công nghệ, cuộc sống đã thay đổi lớn.','〜によって'],['vn-jp','Chúng ta nên bảo vệ môi trường.','私たちは環境を守るべきです。','〜べきだ'],['jp-vn','都会は便利な一方で、生活費が高いです。','Thành phố tiện lợi, mặt khác chi phí sinh hoạt cao.','〜一方で'],['vn-jp','Tôi muốn giải quyết vấn đề này bằng cách học thêm.','もっと勉強することで、この問題を解決したいです。','〜ことで']],N2:[['vn-jp','Dựa trên kết quả khảo sát, chúng ta cần nghĩ giải pháp.','調査結果を踏まえて、対策を考える必要があります。','〜を踏まえて'],['jp-vn','高齢化に伴って、医療費が増えています。','Cùng với già hóa dân số, chi phí y tế đang tăng.','〜に伴って'],['vn-jp','Mặc dù tiện lợi, công nghệ cũng có nhiều vấn đề.','便利であるにもかかわらず、技術には多くの問題もあります。','〜にもかかわらず'],['jp-vn','人手不足のため、外国人材に頼らざるを得ません。','Vì thiếu nhân lực, buộc phải dựa vào lao động nước ngoài.','〜ざるを得ない'],['vn-jp','Đây không phải vấn đề cá nhân mà là vấn đề cấu trúc.','これは個人の問題ではなく、構造的な問題です。','構造的']],N1:[['vn-jp','Chính vì tự do nên trách nhiệm cũng phát sinh.','自由であるがゆえに、責任も生じます。','〜がゆえに'],['jp-vn','教育とは未来への投資にほかなりません。','Giáo dục chính là sự đầu tư cho tương lai.','〜にほかならない'],['vn-jp','Không thể nói điều đó là đúng hay sai.','それは正しいとも間違いとも言えません。','〜とも〜とも言えない'],['jp-vn','日本ならではの美意識があります。','Có thẩm mỹ đặc trưng chỉ Nhật Bản mới có.','〜ならではの'],['vn-jp','Sự im lặng đó không gì khác ngoài một sự phản đối.','その沈黙は抗議にほかなりません。','〜にほかならない']]};
function expandDrills(level){ const base=DRILL_SENTENCES[level],out=[]; for(let i=0;i<120;i++){const b=base[i%base.length]; out.push({direction:b[0],source:b[1],answer:b[2],hint:b[3]});} return out; }
function initDrill(){ state.drill={idx:0,correct:0,unlockedNext:false,items:expandDrills(state.level)}; renderDrill(); }
function renderDrill(){ const d=state.drill,item=d.items[d.idx]; document.getElementById('drill-level-badge').textContent=state.level; document.getElementById('drill-progress-text').textContent=`Câu ${d.idx+1}/${d.items.length}`; document.getElementById('drill-streak').textContent=d.correct?`Đúng ${d.correct}`:''; document.getElementById('drill-progress-fill').style.width=`${((d.idx+1)/d.items.length)*100}%`; document.getElementById('drill-direction').textContent=item.direction==='vn-jp'?'🇻🇳 → 🇯🇵 Dịch sang tiếng Nhật':'🇯🇵 → 🇻🇳 Dịch sang tiếng Việt'; document.getElementById('drill-sentence').textContent=item.source; document.getElementById('drill-vocab-hint').textContent=`Gợi ý: ${item.hint}`; document.getElementById('drill-answer').value=''; document.getElementById('drill-char-count').textContent='0 ký tự'; document.getElementById('drill-feedback').innerHTML=''; document.getElementById('drill-next-btn').style.display='none'; d.unlockedNext=false; }
function normalizeAnswer(s){ return String(s||'').toLowerCase().replace(/[。、．.！!？?\s]/g,'').trim(); }
function submitDrill(){ const d=state.drill,item=d.items[d.idx],ans=document.getElementById('drill-answer').value.trim(); if(!ans)return document.getElementById('drill-answer').focus(); const ok=normalizeAnswer(ans)===normalizeAnswer(item.answer); if(ok)d.correct++; d.unlockedNext=ok; document.getElementById('drill-feedback').innerHTML=`<div class="drill-feedback-box ${ok?'correct':'wrong'}"><div class="drill-feedback-title">${ok?'✅ Chính xác!':'📝 Chưa đúng, xem đáp án mẫu rồi thử lại nhé'}</div><div><b>Đáp án:</b> <span class="jp-inline">${escapeHTML(item.answer)}</span></div><div class="drill-small">${ok?'Bạn có thể qua câu tiếp theo.':'Bạn cần nhập đúng đáp án để mở nút câu tiếp theo, hoặc dùng Bỏ qua.'}</div></div>`; document.getElementById('drill-next-btn').style.display=ok?'inline-block':'none'; }
function nextDrill(){ if(!state.drill.unlockedNext)return; state.drill.idx=Math.min(state.drill.idx+1,state.drill.items.length-1); renderDrill(); }
function skipDrill(){ state.drill.idx=Math.min(state.drill.idx+1,state.drill.items.length-1); renderDrill(); }
function prevDrill(){ state.drill.idx=Math.max(state.drill.idx-1,0); renderDrill(); }
function clearDrill(){ document.getElementById('drill-answer').value=''; document.getElementById('drill-char-count').textContent='0 ký tự'; document.getElementById('drill-answer').focus(); }
document.addEventListener('DOMContentLoaded',()=>{ renderFreeTags(); const da=document.getElementById('drill-answer'),dc=document.getElementById('drill-char-count'); if(da&&dc)da.addEventListener('input',()=>dc.textContent=da.value.length+' ký tự'); });
